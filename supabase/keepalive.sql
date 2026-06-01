-- CatetIn Supabase keep-alive helper.
--
-- Run this once in Supabase SQL Editor, then configure the GitHub Actions
-- workflow in .github/workflows/keep-supabase-awake.yml.

create table if not exists public.keepalive_heartbeats (
  id text primary key,
  ping_count bigint not null default 0,
  last_ping_at timestamptz not null default now()
);

create or replace function public.keepalive_ping()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.keepalive_heartbeats;
begin
  insert into public.keepalive_heartbeats (id, ping_count, last_ping_at)
  values ('supabase-keepalive', 1, now())
  on conflict (id) do update set
    ping_count = public.keepalive_heartbeats.ping_count + 1,
    last_ping_at = now()
  returning * into result;

  return jsonb_build_object(
    'ok', true,
    'last_ping_at', result.last_ping_at,
    'ping_count', result.ping_count
  );
end;
$$;

revoke all on function public.keepalive_ping() from public;
grant execute on function public.keepalive_ping() to anon, authenticated;

select public.keepalive_ping();
