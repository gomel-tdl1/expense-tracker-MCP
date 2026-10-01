create table public.expense_receipts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  spent_on date not null,
  merchant text check (merchant is null or char_length(merchant) between 1 and 200),
  currency text not null default 'PLN' check (currency = 'PLN'),
  total_grosz integer not null,
  submission_id uuid not null,
  fingerprint text not null check (char_length(fingerprint) between 1 and 128),
  created_at timestamptz not null default now(),
  unique (user_id, submission_id)
);

create index expense_receipts_user_date_idx on public.expense_receipts (user_id, spent_on desc);
create index expense_receipts_user_fingerprint_idx on public.expense_receipts (user_id, fingerprint);

create table public.expense_items (
  id uuid primary key default gen_random_uuid(),
  receipt_id uuid not null references public.expense_receipts(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 200),
  quantity numeric(12, 3) not null check (quantity > 0),
  amount_grosz integer not null check (amount_grosz <> 0),
  category text not null check (category in ('groceries', 'dining', 'home', 'transport', 'health', 'clothing', 'other')),
  position integer not null check (position > 0),
  unique (receipt_id, position)
);

create index expense_items_receipt_idx on public.expense_items (receipt_id);

alter table public.expense_receipts enable row level security;
alter table public.expense_items enable row level security;

revoke all on public.expense_receipts from anon, authenticated;
revoke all on public.expense_items from anon, authenticated;
grant select on public.expense_receipts, public.expense_items to authenticated;

create policy "read own receipts" on public.expense_receipts
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "read own items" on public.expense_items
  for select to authenticated using (
    exists (
      select 1 from public.expense_receipts r
      where r.id = receipt_id and r.user_id = (select auth.uid())
    )
  );

create function public.validate_expense_items(p_items jsonb, p_total_grosz integer)
returns void
language plpgsql
set search_path = public, pg_temp
as $$
declare
  v_item jsonb;
  v_name text;
  v_quantity numeric;
  v_amount integer;
  v_category text;
  v_sum bigint := 0;
begin
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) not between 1 and 200 then
    raise exception 'items must be a non-empty array of at most 200 positions' using errcode = '22023';
  end if;

  for v_item in select value from jsonb_array_elements(p_items) loop
    if jsonb_typeof(v_item) <> 'object' then
      raise exception 'each item must be an object' using errcode = '22023';
    end if;

    begin
      v_name := btrim(v_item->>'name');
      v_quantity := (v_item->>'quantity')::numeric;
      v_amount := (v_item->>'amount_grosz')::integer;
      v_category := v_item->>'category';
    exception when invalid_text_representation or numeric_value_out_of_range then
      raise exception 'invalid item value' using errcode = '22023';
    end;

    if v_name is null or char_length(v_name) not between 1 and 200
       or v_quantity is null or v_quantity <= 0 or v_quantity > 999999999 or v_quantity <> round(v_quantity, 3)
       or v_amount is null or v_amount = 0
       or v_category is null or v_category not in ('groceries', 'dining', 'home', 'transport', 'health', 'clothing', 'other') then
      raise exception 'invalid item value' using errcode = '22023';
    end if;

    v_sum := v_sum + v_amount;
  end loop;

  if v_sum <> p_total_grosz then
    raise exception 'receipt total differs from item sum' using errcode = '22023';
  end if;
end;
$$;

revoke all on function public.validate_expense_items(jsonb, integer) from public, anon, authenticated;

create function public.create_expense_receipt(
  p_submission_id uuid,
  p_spent_on date,
  p_merchant text,
  p_total_grosz integer,
  p_items jsonb,
  p_fingerprint text,
  p_allow_duplicate boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_receipt_id uuid;
  v_candidate_id uuid;
  v_merchant text := nullif(btrim(p_merchant), '');
begin
  if v_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  if p_submission_id is null or p_spent_on is null or p_fingerprint is null
     or char_length(p_fingerprint) not between 1 and 128
     or (p_merchant is not null and char_length(btrim(p_merchant)) > 200) then
    raise exception 'invalid receipt metadata' using errcode = '22023';
  end if;

  perform public.validate_expense_items(p_items, p_total_grosz);
  perform pg_advisory_xact_lock(hashtextextended(v_user_id::text || ':' || p_fingerprint, 0));

  select id into v_receipt_id from public.expense_receipts
    where user_id = v_user_id and submission_id = p_submission_id;
  if v_receipt_id is not null then
    return jsonb_build_object('status', 'replayed', 'receipt_id', v_receipt_id);
  end if;

  select id into v_candidate_id from public.expense_receipts
    where user_id = v_user_id and fingerprint = p_fingerprint
    order by created_at desc limit 1;
  if v_candidate_id is not null and not coalesce(p_allow_duplicate, false) then
    return jsonb_build_object('status', 'duplicate_candidate', 'receipt_id', v_candidate_id);
  end if;

  insert into public.expense_receipts (user_id, spent_on, merchant, total_grosz, submission_id, fingerprint)
  values (v_user_id, p_spent_on, v_merchant, p_total_grosz, p_submission_id, p_fingerprint)
  returning id into v_receipt_id;

  insert into public.expense_items (receipt_id, name, quantity, amount_grosz, category, position)
  select v_receipt_id, btrim(value->>'name'), (value->>'quantity')::numeric,
    (value->>'amount_grosz')::integer, value->>'category', ordinality::integer
  from jsonb_array_elements(p_items) with ordinality;

  return jsonb_build_object('status', 'created', 'receipt_id', v_receipt_id);
end;
$$;

create function public.replace_expense_receipt(
  p_receipt_id uuid,
  p_spent_on date,
  p_merchant text,
  p_total_grosz integer,
  p_items jsonb,
  p_fingerprint text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null or not exists (
    select 1 from public.expense_receipts where id = p_receipt_id and user_id = v_user_id
  ) then
    raise exception 'receipt not accessible' using errcode = '42501';
  end if;
  if p_spent_on is null or p_fingerprint is null or char_length(p_fingerprint) not between 1 and 128
     or (p_merchant is not null and char_length(btrim(p_merchant)) > 200) then
    raise exception 'invalid receipt metadata' using errcode = '22023';
  end if;
  perform public.validate_expense_items(p_items, p_total_grosz);

  update public.expense_receipts
  set spent_on = p_spent_on, merchant = nullif(btrim(p_merchant), ''), total_grosz = p_total_grosz, fingerprint = p_fingerprint
  where id = p_receipt_id;
  delete from public.expense_items where receipt_id = p_receipt_id;
  insert into public.expense_items (receipt_id, name, quantity, amount_grosz, category, position)
  select p_receipt_id, btrim(value->>'name'), (value->>'quantity')::numeric,
    (value->>'amount_grosz')::integer, value->>'category', ordinality::integer
  from jsonb_array_elements(p_items) with ordinality;
  return jsonb_build_object('status', 'updated', 'receipt_id', p_receipt_id);
end;
$$;

create function public.delete_expense_receipt(p_receipt_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null or not exists (
    select 1 from public.expense_receipts where id = p_receipt_id and user_id = v_user_id
  ) then
    raise exception 'receipt not accessible' using errcode = '42501';
  end if;
  delete from public.expense_receipts where id = p_receipt_id;
  return true;
end;
$$;

revoke all on function public.create_expense_receipt(uuid, date, text, integer, jsonb, text, boolean) from public, anon;
revoke all on function public.replace_expense_receipt(uuid, date, text, integer, jsonb, text) from public, anon;
revoke all on function public.delete_expense_receipt(uuid) from public, anon;
grant execute on function public.create_expense_receipt(uuid, date, text, integer, jsonb, text, boolean) to authenticated;
grant execute on function public.replace_expense_receipt(uuid, date, text, integer, jsonb, text) to authenticated;
grant execute on function public.delete_expense_receipt(uuid) to authenticated;
