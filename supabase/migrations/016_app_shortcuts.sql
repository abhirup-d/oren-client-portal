create table public.app_shortcuts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  label text not null,
  url text not null,
  icon text not null default 'link',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index idx_app_shortcuts_org on public.app_shortcuts(org_id);
