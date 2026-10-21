-- PointEarner — conservazione dei dati (informativa privacy, sezione "Per quanto tempo")
-- Regole:
--   1. tessera senza movimenti da 24 mesi  -> cancellata con storico e punti
--   2. negozio chiuso (CANCELED) da 30 giorni -> cancellato con tessere, premi e collaboratori
--   3. account senza accessi da 24 mesi, senza tessere né negozi -> cancellato
-- La pulizia gira ogni notte alle 03:15 UTC con pg_cron.

alter table public.merchants add column if not exists canceled_at timestamptz;

create or replace function public.merchants_track_cancel()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.subscription_status = 'CANCELED' and old.subscription_status is distinct from 'CANCELED' then
    new.canceled_at := now();
  elsif new.subscription_status <> 'CANCELED' then
    new.canceled_at := null;
  end if;
  return new;
end;
$$;

drop trigger if exists merchants_track_cancel on public.merchants;
create trigger merchants_track_cancel
  before update of subscription_status on public.merchants
  for each row execute function public.merchants_track_cancel();

create or replace function public.purge_expired_data()
returns table (cards_deleted integer, merchants_deleted integer, accounts_deleted integer)
language plpgsql volatile security definer set search_path = public, auth
as $$
declare
  v_cards integer := 0;
  v_merchants integer := 0;
  v_accounts integer := 0;
begin
  -- 1. tessere dormienti
  with dormant as (
    select l.customer_id, l.merchant_id
    from public.ledger l
    group by l.customer_id, l.merchant_id
    having max(l.created_at) < now() - interval '24 months'
  ), gone as (
    delete from public.ledger l
    using dormant d
    where l.customer_id = d.customer_id and l.merchant_id = d.merchant_id
    returning l.customer_id, l.merchant_id
  )
  select count(distinct (customer_id, merchant_id)) into v_cards from gone;

  -- 2. negozi chiusi da più di 30 giorni
  with gone as (
    delete from public.merchants m
    where m.subscription_status = 'CANCELED'
      and m.canceled_at is not null
      and m.canceled_at < now() - interval '30 days'
    returning m.id
  )
  select count(*) into v_merchants from gone;

  -- 3. account inattivi senza tessere né ruoli in un negozio
  with gone as (
    delete from auth.users u
    where coalesce(u.last_sign_in_at, u.created_at) < now() - interval '24 months'
      and not exists (select 1 from public.ledger l where l.customer_id = u.id)
      and not exists (select 1 from public.merchant_staff s where s.user_id = u.id)
    returning u.id
  )
  select count(*) into v_accounts from gone;

  return query select v_cards, v_merchants, v_accounts;
end;
$$;

revoke execute on function public.purge_expired_data() from public, anon, authenticated;
revoke execute on function public.merchants_track_cancel() from public, anon, authenticated;
