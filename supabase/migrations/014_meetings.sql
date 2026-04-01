create table public.meetings (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  title text not null,
  scheduled_at timestamptz not null,
  duration_minutes integer not null default 30,
  booked_by uuid not null references public.users(id),
  pm_id uuid not null references public.admin_users(id),
  status text not null default 'scheduled' check (status in ('scheduled', 'completed', 'cancelled')),
  notes text,
  google_calendar_event_id text,
  created_at timestamptz not null default now()
);
create index idx_meetings_org_id on public.meetings(org_id);
create index idx_meetings_pm_id on public.meetings(pm_id);
create index idx_meetings_scheduled on public.meetings(scheduled_at);
