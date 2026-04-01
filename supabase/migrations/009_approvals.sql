create table public.approvals (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  type text not null check (type in ('deliverable', 'scope_change', 'budget', 'timeline', 'data_submission')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  requested_by uuid not null references public.admin_users(id),
  decided_by uuid references public.users(id),
  decided_at timestamptz,
  linked_document_id uuid references public.documents(id) on delete set null,
  created_at timestamptz not null default now()
);

create index idx_approvals_project_id on public.approvals(project_id);
create index idx_approvals_status on public.approvals(status) where status = 'pending';
