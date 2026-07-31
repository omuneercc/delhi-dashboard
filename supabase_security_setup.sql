-- Run this in Supabase: Project → SQL Editor → New query → paste all → Run
-- (Run this AFTER supabase_setup.sql)

-- ── Profiles: tracks who's allowed in ────────────────────────────────
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  role text not null default 'staff', -- 'admin' (super admin) or 'staff'
  approved boolean not null default false,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

drop policy if exists "Users can view own profile" on profiles;
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

drop policy if exists "Super admin can view all profiles" on profiles;
create policy "Super admin can view all profiles"
  on profiles for select
  using (auth.email() = 'omuneercc@gmail.com');

drop policy if exists "Super admin can update all profiles" on profiles;
create policy "Super admin can update all profiles"
  on profiles for update
  using (auth.email() = 'omuneercc@gmail.com');

drop policy if exists "Super admin can delete profiles" on profiles;
create policy "Super admin can delete profiles"
  on profiles for delete
  using (auth.email() = 'omuneercc@gmail.com');

-- ── Auto-create a profile row on signup ──────────────────────────────
-- omuneercc@gmail.com is auto-approved as admin; everyone else starts
-- as an unapproved 'staff' request until the super admin approves them.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role, approved)
  values (
    new.id,
    new.email,
    case when new.email = 'omuneercc@gmail.com' then 'admin' else 'staff' end,
    case when new.email = 'omuneercc@gmail.com' then true else false end
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Lock app data behind approval, not just login ────────────────────
create or replace function public.is_approved()
returns boolean as $$
  select coalesce((select approved from public.profiles where id = auth.uid()), false);
$$ language sql security definer stable;

drop policy if exists "Users manage their own data" on app_data;
create policy "Approved users manage their own data"
  on app_data for all
  using (auth.uid() = user_id and public.is_approved())
  with check (auth.uid() = user_id and public.is_approved());

drop policy if exists "Users manage their own shared data" on app_data_shared;
create policy "Approved users manage their own shared data"
  on app_data_shared for all
  using (auth.uid() = user_id and public.is_approved())
  with check (auth.uid() = user_id and public.is_approved());
