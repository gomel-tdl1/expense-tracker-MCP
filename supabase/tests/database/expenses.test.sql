begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions, pg_temp;
select plan(11);

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
values
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'a@example.test', '', now(), now(), now()),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'b@example.test', '', now(), now(), now());

set local role authenticated;
set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';

select is(
  (create_expense_receipt(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2026-10-01', 'Market', 2000,
    '[{"name":"Bread","quantity":1,"amount_grosz":800,"category":"groceries"},{"name":"Milk","quantity":2,"amount_grosz":1200,"category":"groceries"}]'::jsonb,
    'fingerprint-one', false
  )->>'status'), 'created', 'creates a two-item receipt'
);

select is((select count(*)::integer from expense_items), 2, 'saves both line items');
select is(
  (create_expense_receipt(
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '2026-10-02', 'Market', 1200,
    '[{"name":"Piwo","quantity":2,"amount_grosz":1200,"category":"alcohol"}]'::jsonb,
    'fingerprint-beer', false
  )->>'status'), 'created', 'accepts alcohol category'
);
do $$ begin
  perform set_config('test.receipt_id', (select id::text from expense_receipts where submission_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'), true);
end $$;

select throws_ok(
  $$select create_expense_receipt('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2026-10-01', 'Market', 1999, '[{"name":"Bread","quantity":1,"amount_grosz":800,"category":"groceries"},{"name":"Milk","quantity":2,"amount_grosz":1200,"category":"groceries"}]'::jsonb, 'fingerprint-bad', false)$$,
  '22023', 'receipt total differs from item sum', 'rejects a declared total that differs from the item sum'
);

select is((select count(*)::integer from expense_receipts), 2, 'a failed insert leaves no receipt');

select is(
  (create_expense_receipt(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2026-10-01', 'Market', 2000,
    '[{"name":"Bread","quantity":1,"amount_grosz":800,"category":"groceries"},{"name":"Milk","quantity":2,"amount_grosz":1200,"category":"groceries"}]'::jsonb,
    'fingerprint-one', false
  )->>'status'), 'replayed', 'repeating a submission id is idempotent'
);

select is(
  (create_expense_receipt(
    'cccccccc-cccc-cccc-cccc-cccccccccccc', '2026-10-01', 'Market', 2000,
    '[{"name":"Bread","quantity":1,"amount_grosz":800,"category":"groceries"},{"name":"Milk","quantity":2,"amount_grosz":1200,"category":"groceries"}]'::jsonb,
    'fingerprint-one', false
  )->>'status'), 'duplicate_candidate', 'matching content asks before insertion'
);

select is(
  (create_expense_receipt(
    'dddddddd-dddd-dddd-dddd-dddddddddddd', '2026-10-01', 'Market', 2000,
    '[{"name":"Bread","quantity":1,"amount_grosz":800,"category":"groceries"},{"name":"Milk","quantity":2,"amount_grosz":1200,"category":"groceries"}]'::jsonb,
    'fingerprint-one', true
  )->>'status'), 'created', 'explicit override permits a real repeat purchase'
);

set local request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';

select is((select count(*)::integer from expense_receipts), 0, 'user B cannot read user A receipts');

select throws_ok(
  $$select replace_expense_receipt(current_setting('test.receipt_id')::uuid, '2026-10-02', 'Other', 500, '[{"name":"Item","quantity":1,"amount_grosz":500,"category":"other"}]'::jsonb, 'other-fingerprint')$$,
  '42501', 'receipt not accessible', 'user B cannot replace user A receipt'
);

select throws_ok(
  $$select delete_expense_receipt(current_setting('test.receipt_id')::uuid)$$,
  '42501', 'receipt not accessible', 'user B cannot delete user A receipt'
);

select * from finish();
rollback;
