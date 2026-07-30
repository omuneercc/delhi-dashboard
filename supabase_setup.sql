-- Run this once in Supabase: Project → SQL Editor → New query → paste all → Run

create table if not exists app_data (
  user_id uuid references auth.users(id) on delete cascade not null,
  key text not null,
  value jsonb not null,
  updated_at timestamptz default now(),
  primary key (user_id, key)
);

create table if not exists app_data_shared (
  user_id uuid references auth.users(id) on delete cascade not null,
  key text not null,
  value jsonb not null,
  updated_at timestamptz default now(),
  primary key (user_id, key)
);

alter table app_data enable row level security;
alter table app_data_shared enable row level security;

create policy "Users manage their own data"
  on app_data for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage their own shared data"
  on app_data_shared for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
