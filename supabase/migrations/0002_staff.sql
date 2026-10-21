-- PointEarner — collaboratori del negozio
-- Il titolare aggiunge un collaboratore con la sua email. Il collaboratore deve aver già
-- fatto almeno un accesso all'app con quella email.
-- Un collaboratore (staff) può scansionare, assegnare punti e riscattare premi.
-- Solo il titolare modifica premi, punti per visita, storni e collaboratori.

create or replace function public.list_staff(p_merchant uuid)
returns table (user_id uuid, role public.staff_role, display_name text, email text, is_me boolean)
language plpgsql stable security definer set search_path = public, auth
as $$
begin
  if not public.is_merchant_staff(p_merchant, true) then raise exception 'NON_AUTORIZZATO'; end if;
  return query
    select s.user_id, s.role, p.display_name, u.email::text, s.user_id = auth.uid()
    from public.merchant_staff s
    join auth.users u on u.id = s.user_id
    left join public.profiles p on p.id = s.user_id
    where s.merchant_id = p_merchant
    order by s.role, s.created_at;
end;
$$;

create or replace function public.add_staff(p_merchant uuid, p_email text)
returns jsonb
language plpgsql volatile security definer set search_path = public, auth
as $$
declare v_user uuid;
begin
  if not public.is_merchant_staff(p_merchant, true) then raise exception 'NON_AUTORIZZATO'; end if;
  if (select count(*) from public.merchant_staff where merchant_id = p_merchant) >= 20 then
    raise exception 'TROPPI_COLLABORATORI';
  end if;
  select id into v_user from auth.users where lower(email) = lower(trim(p_email)) limit 1;
  if v_user is null then
    raise exception 'UTENTE_NON_TROVATO' using hint = 'Il collaboratore deve prima accedere all’app con questa email';
  end if;
  if exists (select 1 from public.merchant_staff where merchant_id = p_merchant and user_id = v_user) then
    raise exception 'GIA_COLLABORATORE';
  end if;
  insert into public.merchant_staff (merchant_id, user_id, role) values (p_merchant, v_user, 'staff');
  return jsonb_build_object('added', true);
end;
$$;

create or replace function public.remove_staff(p_merchant uuid, p_user uuid)
returns void
language plpgsql volatile security definer set search_path = public
as $$
begin
  if not public.is_merchant_staff(p_merchant, true) then raise exception 'NON_AUTORIZZATO'; end if;
  if exists (select 1 from public.merchant_staff where merchant_id = p_merchant and user_id = p_user and role = 'owner') then
    raise exception 'TITOLARE_NON_RIMOVIBILE';
  end if;
  delete from public.merchant_staff where merchant_id = p_merchant and user_id = p_user;
end;
$$;

revoke execute on function public.list_staff(uuid), public.add_staff(uuid, text), public.remove_staff(uuid, uuid) from public, anon;
grant execute on function public.list_staff(uuid), public.add_staff(uuid, text), public.remove_staff(uuid, uuid) to authenticated;
