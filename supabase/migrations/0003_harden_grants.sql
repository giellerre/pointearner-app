-- PointEarner — chiusura delle funzioni interne
-- Supabase concede di default EXECUTE al ruolo authenticated su tutte le funzioni dello schema public.
-- Queste quattro servono solo dentro le altre funzioni (che girano come proprietario) e non devono
-- essere chiamabili dall'app. is_merchant_staff resta concessa: la usano le regole di accesso per riga.
revoke execute on function
  public.balance_of(uuid, uuid),
  public.customer_from_token(text),
  public.handle_new_user(),
  public.merchant_can_operate(uuid)
from authenticated, anon, public;

-- Le funzioni create in futuro non sono più eseguibili di default da anon e authenticated:
-- ogni nuova funzione chiamabile dall'app va concessa esplicitamente.
alter default privileges in schema public revoke execute on functions from anon, authenticated, public;
