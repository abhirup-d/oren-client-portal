create table public.documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  file_path text not null,
  file_size bigint not null default 0,
  mime_type text not null default 'application/octet-stream',
  type text not null check (type in ('deliverable', 'working_doc')),
  version integer not null default 1,
  status text not null default 'draft' check (status in ('draft', 'review', 'approved', 'final')),
  uploaded_by uuid not null,
  uploaded_by_type text not null check (uploaded_by_type in ('client', 'admin')),
  created_at timestamptz not null default now()
);

create index idx_documents_project_id on public.documents(project_id);
