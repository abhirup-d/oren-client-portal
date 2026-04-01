create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  org_id uuid not null references public.organizations(id) on delete cascade,
  email text not null unique,
  name text not null,
  role text not null default 'member' check (role in ('owner', 'member')),
  last_login_at timestamptz,
  notification_prefs jsonb default '{"email": true, "whatsapp": false, "in_app": true}'::jsonb,
  whatsapp_number text,
  created_at timestamptz not null default now()
);

create index idx_users_org_id on public.users(org_id);
