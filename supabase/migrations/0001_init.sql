-- PointEarner — schema iniziale (modello mono-merchant)
-- I punti valgono solo nel negozio dove sono stati guadagnati.
-- Ogni movimento punti è una riga del ledger: EARN (+), REDEEM (-), REVERSAL (storno).
-- Il client non scrive mai direttamente sul ledger: passa solo dalle funzioni qui sotto.

-- ─────────────────────────────────────────────
-- Tipi
-- ─────────────────────────────────────────────
create type public.subscription_status as enum ('TRIAL', 'ACTIVE', 'PAST_DUE', 'CANCELED');
create type public.ledger_kind as enum ('EARN', 'REDEEM', 'REVERSAL');
create type public.staff_role as enum ('owner', 'staff');

-- ─────────────────────────────────────────────
-- Tabelle
-- ─────────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (display_name is null or char_length(display_name) between 1 and 60),
  created_at timestamptz not null default now()
);

create table public.merchants (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  category text not null check (category in ('Bar', 'Pasticceria', 'Ristorante', 'Pizzeria', 'Gelateria', 'Altro')),
  address text check (address is null or char_length(address) <= 160),
  points_per_visit integer not null default 10 check (points_per_visit between 1 and 1000),
  subscription_status public.subscription_status not null default 'TRIAL',
  trial_ends_at timestamptz not null default (now() + interval '90 days'),
  pilot boolean not null default true,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.merchant_staff (
  merchant_id uuid not null references public.merchants (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.staff_role not null default 'staff',
  created_at timestamptz not null default now(),
  primary key (merchant_id, user_id)
);
create index merchant_staff_user_idx on public.merchant_staff (user_id);

create table public.rewards (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants (id) on delete cascade,
  title text not null check (char_length(title) between 2 and 60),
  cost_points integer not null check (cost_points between 1 and 100000),
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index rewards_merchant_idx on public.rewards (merchant_id);

create table public.ledger (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants (id) on delete cascade,
  customer_id uuid not null references auth.users (id) on delete cascade,
  kind public.ledger_kind not null,
  points integer not null check (points <> 0),
  reward_id uuid references public.rewards (id) on delete set null,
  reverses uuid references public.ledger (id) on delete cascade,
  note text check (note is null or char_length(note) <= 140),
  staff_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint ledger_sign check (
    (kind = 'EARN' and points > 0) or
    (kind = 'REDEEM' and points < 0) or
    (kind = 'REVERSAL' and reverses is not null)
  )
);
create index ledger_customer_merchant_idx on public.ledger (customer_id, merchant_id, created_at desc);
create index ledger_merchant_time_idx on public.ledger (merchant_id, created_at desc);
create unique index ledger_one_reversal_idx on public.ledger (reverses) where reverses is not null;

-- QR personale del cliente: token monouso a scadenza breve
create table public.qr_tokens (
  token text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  expires_at timestamptz not null
);
create index qr_tokens_user_idx on public.qr_tokens (user_id);

-- ─────────────────────────────────────────────
-- Funzioni di supporto
-- ─────────────────────────────────────────────
create or replace function public.is_merchant_staff(p_merchant uuid, p_owner_only boolean default false)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.merchant_staff s
    where s.merchant_id = p_merchant
      and s.user_id = auth.uid()
      and (not p_owner_only or s.role = 'owner')
  );
$$;

-- Il negozio può assegnare punti? (gating abbonamento)
create or replace function public.merchant_can_operate(p_merchant uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.merchants m
    where m.id = p_merchant
      and (
        m.pilot
        or m.subscription_status = 'ACTIVE'
        or (m.subscription_status = 'TRIAL' and m.trial_ends_at > now())
      )
  );
$$;

-- Saldo di un cliente presso un negozio
create or replace function public.balance_of(p_customer uuid, p_merchant uuid)
returns integer
language sql stable security definer set search_path = public
as $$
  select coalesce(sum(points), 0)::integer
  from public.ledger
  where customer_id = p_customer and merchant_id = p_merchant;
$$;

-- Risolve un token QR in un cliente; errore se scaduto o sconosciuto
create or replace function public.customer_from_token(p_token text)
returns uuid
language plpgsql stable security definer set search_path = public
as $$
declare v_user uuid;
begin
  select user_id into v_user from public.qr_tokens
  where token = p_token and expires_at > now();
  if v_user is null then
    raise exception 'QR_SCADUTO' using hint = 'Chiedi al cliente di riaprire la sua tessera';
  end if;
  return v_user;
end;
$$;

-- Profilo creato in automatico alla registrazione
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────
-- Funzioni chiamate dall'app (RPC)
-- ─────────────────────────────────────────────

-- Cliente: genera il QR della propria tessera (valido 2 minuti)
create or replace function public.issue_qr_token()
returns table (token text, expires_at timestamptz)
language plpgsql volatile security definer set search_path = public
as $$
declare v_token text;
begin
  if auth.uid() is null then raise exception 'NON_AUTENTICATO'; end if;
  delete from public.qr_tokens q where q.user_id = auth.uid();
  v_token := 'PE1.' || replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');
  insert into public.qr_tokens (token, user_id, expires_at)
  values (v_token, auth.uid(), now() + interval '2 minutes');
  return query select v_token, now() + interval '2 minutes';
end;
$$;

-- Cliente: le proprie tessere con saldo e prossimo premio
create or replace function public.my_cards()
returns table (
  merchant_id uuid, merchant_name text, category text, address text,
  balance integer, last_activity timestamptz,
  next_reward_title text, next_reward_cost integer, reward_available boolean
)
language sql stable security definer set search_path = public
as $$
  with b as (
    select l.merchant_id, sum(l.points)::integer as balance, max(l.created_at) as last_activity
    from public.ledger l
    where l.customer_id = auth.uid()
    group by l.merchant_id
  )
  select m.id, m.name, m.category, m.address, b.balance, b.last_activity,
         r.title, r.cost_points,
         exists (select 1 from public.rewards a where a.merchant_id = m.id and a.active and a.cost_points <= b.balance)
  from b
  join public.merchants m on m.id = b.merchant_id
  left join lateral (
    select rw.title, rw.cost_points from public.rewards rw
    where rw.merchant_id = m.id and rw.active and rw.cost_points > b.balance
    order by rw.cost_points asc limit 1
  ) r on true
  order by b.last_activity desc;
$$;

-- Cliente: movimenti presso un negozio
create or replace function public.my_history(p_merchant uuid)
returns table (id uuid, kind public.ledger_kind, points integer, reward_title text, created_at timestamptz)
language sql stable security definer set search_path = public
as $$
  select l.id, l.kind, l.points, rw.title, l.created_at
  from public.ledger l
  left join public.rewards rw on rw.id = l.reward_id
  where l.customer_id = auth.uid() and l.merchant_id = p_merchant
  order by l.created_at desc
  limit 100;
$$;

-- Negozio: registra una nuova attività; chi la crea ne è titolare
create or replace function public.create_merchant(p_name text, p_category text, p_address text default null)
returns uuid
language plpgsql volatile security definer set search_path = public
as $$
declare v_id uuid;
begin
  if auth.uid() is null then raise exception 'NON_AUTENTICATO'; end if;
  if (select count(*) from public.merchant_staff where user_id = auth.uid() and role = 'owner') >= 5 then
    raise exception 'TROPPI_NEGOZI';
  end if;
  insert into public.merchants (name, category, address, created_by)
  values (trim(p_name), p_category, nullif(trim(coalesce(p_address, '')), ''), auth.uid())
  returning id into v_id;
  insert into public.merchant_staff (merchant_id, user_id, role) values (v_id, auth.uid(), 'owner');
  return v_id;
end;
$$;

-- Negozio: legge il cliente dal QR (nome visualizzato e saldo)
create or replace function public.lookup_customer(p_merchant uuid, p_token text)
returns jsonb
language plpgsql stable security definer set search_path = public
as $$
declare v_customer uuid; v_name text;
begin
  if not public.is_merchant_staff(p_merchant) then raise exception 'NON_AUTORIZZATO'; end if;
  v_customer := public.customer_from_token(p_token);
  select display_name into v_name from public.profiles where id = v_customer;
  return jsonb_build_object(
    'display_name', coalesce(v_name, 'Cliente'),
    'balance', public.balance_of(v_customer, p_merchant),
    'visits', (select count(*) from public.ledger where customer_id = v_customer and merchant_id = p_merchant and kind = 'EARN'),
    'can_operate', public.merchant_can_operate(p_merchant)
  );
end;
$$;

-- Negozio: assegna punti per una visita
create or replace function public.earn_points(p_merchant uuid, p_token text, p_points integer default null)
returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
declare v_customer uuid; v_points integer;
begin
  if not public.is_merchant_staff(p_merchant) then raise exception 'NON_AUTORIZZATO'; end if;
  if not public.merchant_can_operate(p_merchant) then raise exception 'ABBONAMENTO_NON_ATTIVO'; end if;
  v_customer := public.customer_from_token(p_token);
  if v_customer = auth.uid() then raise exception 'AUTOASSEGNAZIONE'; end if;

  perform pg_advisory_xact_lock(hashtext(v_customer::text || p_merchant::text));
  if exists (
    select 1 from public.ledger
    where customer_id = v_customer and merchant_id = p_merchant and kind = 'EARN'
      and created_at > now() - interval '5 minutes'
  ) then
    raise exception 'GIA_ASSEGNATO';
  end if;

  select coalesce(p_points, points_per_visit) into v_points from public.merchants where id = p_merchant;
  if v_points < 1 or v_points > 1000 then raise exception 'PUNTI_NON_VALIDI'; end if;

  insert into public.ledger (merchant_id, customer_id, kind, points, staff_id)
  values (p_merchant, v_customer, 'EARN', v_points, auth.uid());

  return jsonb_build_object('points', v_points, 'balance', public.balance_of(v_customer, p_merchant));
end;
$$;

-- Negozio: riscatta un premio
create or replace function public.redeem_reward(p_merchant uuid, p_token text, p_reward uuid)
returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
declare v_customer uuid; v_cost integer; v_title text; v_balance integer;
begin
  if not public.is_merchant_staff(p_merchant) then raise exception 'NON_AUTORIZZATO'; end if;
  v_customer := public.customer_from_token(p_token);

  select cost_points, title into v_cost, v_title from public.rewards
  where id = p_reward and merchant_id = p_merchant and active;
  if v_cost is null then raise exception 'PREMIO_NON_DISPONIBILE'; end if;

  perform pg_advisory_xact_lock(hashtext(v_customer::text || p_merchant::text));
  v_balance := public.balance_of(v_customer, p_merchant);
  if v_balance < v_cost then raise exception 'PUNTI_INSUFFICIENTI'; end if;

  insert into public.ledger (merchant_id, customer_id, kind, points, reward_id, staff_id)
  values (p_merchant, v_customer, 'REDEEM', -v_cost, p_reward, auth.uid());

  -- il QR usato per un riscatto non vale più
  delete from public.qr_tokens where token = p_token;

  return jsonb_build_object('reward', v_title, 'balance', v_balance - v_cost);
end;
$$;

-- Titolare: storna un movimento delle ultime 24 ore
create or replace function public.reverse_entry(p_entry uuid, p_note text default null)
returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
declare v_row public.ledger;
begin
  select * into v_row from public.ledger where id = p_entry;
  if v_row.id is null then raise exception 'MOVIMENTO_NON_TROVATO'; end if;
  if not public.is_merchant_staff(v_row.merchant_id, true) then raise exception 'NON_AUTORIZZATO'; end if;
  if v_row.kind = 'REVERSAL' then raise exception 'GIA_STORNO'; end if;
  if v_row.created_at < now() - interval '24 hours' then raise exception 'TROPPO_VECCHIO'; end if;
  if exists (select 1 from public.ledger where reverses = p_entry) then raise exception 'GIA_STORNATO'; end if;

  perform pg_advisory_xact_lock(hashtext(v_row.customer_id::text || v_row.merchant_id::text));
  if public.balance_of(v_row.customer_id, v_row.merchant_id) - v_row.points < 0 then
    raise exception 'SALDO_NEGATIVO' using hint = 'I punti di questa visita sono già stati spesi';
  end if;

  insert into public.ledger (merchant_id, customer_id, kind, points, reverses, note, staff_id)
  values (v_row.merchant_id, v_row.customer_id, 'REVERSAL', -v_row.points, v_row.id, p_note, auth.uid());

  return jsonb_build_object('balance', public.balance_of(v_row.customer_id, v_row.merchant_id));
end;
$$;

-- Negozio: movimenti recenti (per storni e controllo cassa)
create or replace function public.merchant_activity(p_merchant uuid)
returns table (id uuid, kind public.ledger_kind, points integer, customer_name text, reward_title text, reversed boolean, created_at timestamptz)
language plpgsql stable security definer set search_path = public
as $$
begin
  if not public.is_merchant_staff(p_merchant) then raise exception 'NON_AUTORIZZATO'; end if;
  return query
    select l.id, l.kind, l.points, coalesce(p.display_name, 'Cliente'), rw.title,
           exists (select 1 from public.ledger x where x.reverses = l.id), l.created_at
    from public.ledger l
    left join public.profiles p on p.id = l.customer_id
    left join public.rewards rw on rw.id = l.reward_id
    where l.merchant_id = p_merchant
    order by l.created_at desc
    limit 50;
end;
$$;

-- Negozio: numeri della settimana (North Star del pilota)
create or replace function public.merchant_stats(p_merchant uuid)
returns jsonb
language plpgsql stable security definer set search_path = public
as $$
begin
  if not public.is_merchant_staff(p_merchant) then raise exception 'NON_AUTORIZZATO'; end if;
  return jsonb_build_object(
    'scans_7d', (select count(*) from public.ledger where merchant_id = p_merchant and kind = 'EARN' and created_at > now() - interval '7 days'),
    'customers_7d', (select count(distinct customer_id) from public.ledger where merchant_id = p_merchant and created_at > now() - interval '7 days'),
    'redemptions_7d', (select count(*) from public.ledger where merchant_id = p_merchant and kind = 'REDEEM' and created_at > now() - interval '7 days'),
    'customers_total', (select count(distinct customer_id) from public.ledger where merchant_id = p_merchant),
    'returning_customers', (
      select count(*) from (
        select customer_id from public.ledger
        where merchant_id = p_merchant and kind = 'EARN'
        group by customer_id having count(*) >= 2
      ) t
    )
  );
end;
$$;

-- Account: cancellazione completa richiesta dall'utente (obbligatoria per App Store)
create or replace function public.delete_my_account()
returns void
language plpgsql volatile security definer set search_path = public, auth
as $$
begin
  if auth.uid() is null then raise exception 'NON_AUTENTICATO'; end if;
  -- i negozi di cui è unico titolare vengono chiusi
  delete from public.merchants m
  where m.id in (
    select s.merchant_id from public.merchant_staff s
    where s.user_id = auth.uid() and s.role = 'owner'
  )
  and not exists (
    select 1 from public.merchant_staff o
    where o.merchant_id = m.id and o.role = 'owner' and o.user_id <> auth.uid()
  );
  delete from auth.users where id = auth.uid();
end;
$$;

-- ─────────────────────────────────────────────
-- Sicurezza per riga (RLS) e permessi
-- ─────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.merchants enable row level security;
alter table public.merchant_staff enable row level security;
alter table public.rewards enable row level security;
alter table public.ledger enable row level security;
alter table public.qr_tokens enable row level security;

create policy profiles_read_own on public.profiles for select to authenticated using (id = auth.uid());
create policy profiles_update_own on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy merchants_read on public.merchants for select to authenticated using (true);
create policy merchants_owner_update on public.merchants for update to authenticated
  using (public.is_merchant_staff(id, true)) with check (public.is_merchant_staff(id, true));

create policy staff_read on public.merchant_staff for select to authenticated
  using (user_id = auth.uid() or public.is_merchant_staff(merchant_id));

create policy rewards_read on public.rewards for select to authenticated using (true);
create policy rewards_owner_insert on public.rewards for insert to authenticated with check (public.is_merchant_staff(merchant_id, true));
create policy rewards_owner_update on public.rewards for update to authenticated
  using (public.is_merchant_staff(merchant_id, true)) with check (public.is_merchant_staff(merchant_id, true));

create policy ledger_read on public.ledger for select to authenticated
  using (customer_id = auth.uid() or public.is_merchant_staff(merchant_id));
-- nessuna policy di insert/update/delete sul ledger e su qr_tokens: si passa solo dalle funzioni

revoke all on public.profiles, public.merchants, public.merchant_staff, public.rewards, public.ledger, public.qr_tokens from anon;
revoke insert, update, delete on public.ledger, public.qr_tokens, public.merchant_staff from authenticated;
revoke update on public.merchants from authenticated;
grant update (name, category, address, points_per_visit) on public.merchants to authenticated;
revoke update on public.profiles from authenticated;
grant update (display_name) on public.profiles to authenticated;

revoke execute on all functions in schema public from public, anon;
grant execute on function
  public.issue_qr_token(), public.my_cards(), public.my_history(uuid),
  public.create_merchant(text, text, text), public.lookup_customer(uuid, text),
  public.earn_points(uuid, text, integer), public.redeem_reward(uuid, text, uuid),
  public.reverse_entry(uuid, text), public.merchant_activity(uuid),
  public.merchant_stats(uuid), public.delete_my_account(),
  public.is_merchant_staff(uuid, boolean), public.merchant_can_operate(uuid)
to authenticated;
