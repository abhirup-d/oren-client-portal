create table public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text not null,
  role text not null check (role in ('admin', 'pm')),
  calendar_availability jsonb,
  created_at timestamptz not null default now()
);
