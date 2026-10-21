-- PointEarner — controllo installazione
-- Incolla in Supabase → SQL Editor → Run. Ogni riga deve avere ok = true.
with t as (
  select tablename, rowsecurity from pg_tables
  where schemaname = 'public'
    and tablename in ('profiles', 'merchants', 'merchant_staff', 'rewards', 'ledger', 'qr_tokens')
), f as (
  select distinct p.proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
)
select '1. Tabelle presenti (6)' as controllo, (select count(*) from t) = 6 as ok
union all
select '2. Sicurezza per riga attiva su tutte', (select count(*) from t where rowsecurity) = 6
union all
select '3. Funzioni schema base (16)', (select count(*) from f where proname in (
  'is_merchant_staff', 'merchant_can_operate', 'balance_of', 'customer_from_token', 'handle_new_user',
  'issue_qr_token', 'my_cards', 'my_history', 'create_merchant', 'lookup_customer', 'earn_points',
  'redeem_reward', 'reverse_entry', 'merchant_activity', 'merchant_stats', 'delete_my_account')) = 16
union all
select '4. Funzioni collaboratori (3, file 0002)', (select count(*) from f where proname in ('list_staff', 'add_staff', 'remove_staff')) = 3
union all
select '5. Profilo creato a ogni registrazione', exists (select 1 from pg_trigger where tgname = 'on_auth_user_created')
union all
select '6. Ledger non scrivibile dall''app',
  case when to_regclass('public.ledger') is null then false
       else not has_table_privilege('authenticated', 'public.ledger', 'INSERT') end
union all
select '7. QR non leggibili dall''app', to_regclass('public.qr_tokens') is not null and not exists (
  select 1 from pg_policies where schemaname = 'public' and tablename = 'qr_tokens');
