create table public.comments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null,
  user_type text not null check (user_type in ('client', 'admin')),
  body text not null,
  target_type text not null check (target_type in ('document', 'approval', 'milestone')),
  target_id uuid not null,
  created_at timestamptz not null default now()
);

create index idx_comments_target on public.comments(target_type, target_id);
create index idx_comments_project_id on public.comments(project_id);
