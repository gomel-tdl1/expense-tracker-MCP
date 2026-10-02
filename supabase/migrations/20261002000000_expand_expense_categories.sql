alter table public.expense_items drop constraint expense_items_category_check;
alter table public.expense_items add constraint expense_items_category_check check (
  category in (
    'groceries', 'dining', 'cafes', 'delivery', 'alcohol', 'tobacco',
    'household', 'home', 'furniture', 'appliances', 'electronics', 'software',
    'subscriptions', 'rent', 'utilities', 'internet', 'transport',
    'public_transport', 'taxi', 'fuel', 'parking', 'car', 'travel',
    'accommodation', 'health', 'pharmacy', 'beauty', 'clothing', 'shoes',
    'children', 'pets', 'entertainment', 'sports', 'education', 'books',
    'gifts', 'charity', 'banking', 'taxes', 'services', 'office', 'other'
  )
);

create or replace function public.validate_expense_items(p_items jsonb, p_total_grosz integer)
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
       or v_category is null or v_category not in (
         'groceries', 'dining', 'cafes', 'delivery', 'alcohol', 'tobacco',
         'household', 'home', 'furniture', 'appliances', 'electronics', 'software',
         'subscriptions', 'rent', 'utilities', 'internet', 'transport',
         'public_transport', 'taxi', 'fuel', 'parking', 'car', 'travel',
         'accommodation', 'health', 'pharmacy', 'beauty', 'clothing', 'shoes',
         'children', 'pets', 'entertainment', 'sports', 'education', 'books',
         'gifts', 'charity', 'banking', 'taxes', 'services', 'office', 'other'
       ) then
      raise exception 'invalid item value' using errcode = '22023';
    end if;

    v_sum := v_sum + v_amount;
  end loop;

  if v_sum <> p_total_grosz then
    raise exception 'receipt total differs from item sum' using errcode = '22023';
  end if;
end;
$$;
