create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.categories (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('income', 'expense', 'both')),
  icon text not null,
  color text not null,
  description text,
  favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.wallets (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  initial_balance numeric not null default 0,
  icon text not null,
  color text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.transactions (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  amount numeric not null check (amount >= 0),
  type text not null check (type in ('income', 'expense')),
  category_id uuid references public.categories(id),
  date date not null,
  notes text,
  wallet_id uuid references public.wallets(id),
  receipt_url text,
  is_pinned boolean not null default false,
  recurring_interval text not null default 'none',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.budgets (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid references public.categories(id),
  amount numeric not null check (amount >= 0),
  month text not null,
  alert_threshold numeric not null default 80,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.goals (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  target_amount numeric not null check (target_amount >= 0),
  current_amount numeric not null default 0,
  deadline date not null,
  icon text not null,
  color text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.keepalive_heartbeats (
  id text primary key,
  ping_count bigint not null default 0,
  last_ping_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.wallets enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;
alter table public.goals enable row level security;

drop policy if exists "profiles own rows" on public.profiles;
drop policy if exists "categories own rows" on public.categories;
drop policy if exists "wallets own rows" on public.wallets;
drop policy if exists "transactions own rows" on public.transactions;
drop policy if exists "budgets own rows" on public.budgets;
drop policy if exists "goals own rows" on public.goals;

create policy "profiles own rows" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "categories own rows" on public.categories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "wallets own rows" on public.wallets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "transactions own rows" on public.transactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "budgets own rows" on public.budgets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "goals own rows" on public.goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1), 'Teman CatetIn'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update set
    email = excluded.email,
    name = coalesce(excluded.name, public.profiles.name),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    updated_at = now(),
    deleted_at = null;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

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

drop trigger if exists set_profiles_updated_at on public.profiles;
drop trigger if exists set_categories_updated_at on public.categories;
drop trigger if exists set_wallets_updated_at on public.wallets;
drop trigger if exists set_transactions_updated_at on public.transactions;
drop trigger if exists set_budgets_updated_at on public.budgets;
drop trigger if exists set_goals_updated_at on public.goals;

create trigger set_profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger set_categories_updated_at before update on public.categories
  for each row execute function public.set_updated_at();
create trigger set_wallets_updated_at before update on public.wallets
  for each row execute function public.set_updated_at();
create trigger set_transactions_updated_at before update on public.transactions
  for each row execute function public.set_updated_at();
create trigger set_budgets_updated_at before update on public.budgets
  for each row execute function public.set_updated_at();
create trigger set_goals_updated_at before update on public.goals
  for each row execute function public.set_updated_at();
