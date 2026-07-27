-- Execute este arquivo no SQL Editor do projeto Supabase do QG CBM-RR Estudos.

create table if not exists public.user_app_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  device_id text,
  updated_at timestamptz not null default now()
);

alter table public.user_app_state enable row level security;

drop policy if exists "Users can read their own study state" on public.user_app_state;
create policy "Users can read their own study state"
on public.user_app_state
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own study state" on public.user_app_state;
create policy "Users can insert their own study state"
on public.user_app_state
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own study state" on public.user_app_state;
create policy "Users can update their own study state"
on public.user_app_state
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

revoke all on table public.user_app_state from anon;
grant select, insert, update on table public.user_app_state to authenticated;

-- Módulo TAF: usa a mesma conta, mas mantém os treinos separados dos estudos.
create table if not exists public.taf_user_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  app_data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.taf_user_data enable row level security;

drop policy if exists "Users can read their own TAF state" on public.taf_user_data;
create policy "Users can read their own TAF state"
on public.taf_user_data
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own TAF state" on public.taf_user_data;
create policy "Users can insert their own TAF state"
on public.taf_user_data
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own TAF state" on public.taf_user_data;
create policy "Users can update their own TAF state"
on public.taf_user_data
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own TAF state" on public.taf_user_data;
create policy "Users can delete their own TAF state"
on public.taf_user_data
for delete
to authenticated
using ((select auth.uid()) = user_id);

create or replace function public.set_taf_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_taf_user_data_updated_at on public.taf_user_data;
create trigger set_taf_user_data_updated_at
before update on public.taf_user_data
for each row execute function public.set_taf_updated_at();

revoke all on table public.taf_user_data from anon;
grant select, insert, update, delete on table public.taf_user_data to authenticated;
