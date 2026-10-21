-- PointEarner — RIPRISTINO A ZERO
-- Cancella tabelle, funzioni e tipi di PointEarner (e tutti i loro dati).
-- Non tocca gli utenti registrati in Authentication.
-- Uso: SQL Editor → Run, poi esegui di nuovo 0001_init.sql e 0002_staff.sql.
drop trigger if exists on_auth_user_created on auth.users;

drop table if exists public.ledger, public.qr_tokens, public.rewards, public.merchant_staff, public.merchants, public.profiles cascade;

drop function if exists
  public.handle_new_user(),
  public.is_merchant_staff(uuid, boolean),
  public.merchant_can_operate(uuid),
  public.balance_of(uuid, uuid),
  public.customer_from_token(text),
  public.issue_qr_token(),
  public.my_cards(),
  public.my_history(uuid),
  public.create_merchant(text, text, text),
  public.lookup_customer(uuid, text),
  public.earn_points(uuid, text, integer),
  public.redeem_reward(uuid, text, uuid),
  public.reverse_entry(uuid, text),
  public.merchant_activity(uuid),
  public.merchant_stats(uuid),
  public.delete_my_account(),
  public.list_staff(uuid),
  public.add_staff(uuid, text),
  public.remove_staff(uuid, uuid)
cascade;

drop type if exists public.subscription_status, public.ledger_kind, public.staff_role cascade;
