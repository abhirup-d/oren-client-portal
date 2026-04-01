create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  actor_id uuid not null,
  actor_type text not null check (actor_type in ('client', 'admin')),
  action text not null,
  details jsonb,
  created_at timestamptz not null default now()
);

create index idx_activity_log_org_id on public.activity_log(org_id);
create index idx_activity_log_created_at on public.activity_log(created_at desc);
