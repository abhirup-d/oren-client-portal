create table public.esg_metrics (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  metric_name text not null,
  value decimal(12,2) not null,
  unit text,
  recorded_at timestamptz not null default now(),
  period text not null,
  source text not null default 'manual' check (source in ('manual', 'computed')),
  created_at timestamptz not null default now()
);
create index idx_esg_metrics_project on public.esg_metrics(project_id);
create index idx_esg_metrics_period on public.esg_metrics(project_id, period);
