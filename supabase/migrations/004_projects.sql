create table public.projects (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  type text not null check (type in ('dma', 'ecovadis', 'brsr', 'sustainability_report', 'custom')),
  status text not null default 'active' check (status in ('active', 'completed', 'on_hold', 'cancelled')),
  current_phase text,
  phases jsonb not null default '[]'::jsonb,
  start_date date,
  target_end_date date,
  assigned_pm_id uuid references public.admin_users(id),
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_projects_org_id on public.projects(org_id);
create index idx_projects_assigned_pm on public.projects(assigned_pm_id);

create trigger projects_updated_at
  before update on public.projects
  for each row execute function public.update_updated_at();
