alter table public.approvals enable row level security;
alter table public.comments enable row level security;
alter table public.digest_cache enable row level security;

create policy "clients_view_own_approvals" on public.approvals
  for select using (
    project_id in (
      select p.id from public.projects p
      join public.users u on u.org_id = p.org_id
      where u.id = auth.uid()
    )
  );

create policy "clients_update_own_approvals" on public.approvals
  for update using (
    project_id in (
      select p.id from public.projects p
      join public.users u on u.org_id = p.org_id
      where u.id = auth.uid()
    )
  );

create policy "admins_full_access_approvals" on public.approvals
  for all using (
    auth.uid() in (select id from public.admin_users)
  );

create policy "clients_view_own_comments" on public.comments
  for select using (
    project_id in (
      select p.id from public.projects p
      join public.users u on u.org_id = p.org_id
      where u.id = auth.uid()
    )
  );

create policy "clients_insert_own_comments" on public.comments
  for insert with check (
    user_id = auth.uid()
    and user_type = 'client'
    and project_id in (
      select p.id from public.projects p
      join public.users u on u.org_id = p.org_id
      where u.id = auth.uid()
    )
  );

create policy "admins_full_access_comments" on public.comments
  for all using (
    auth.uid() in (select id from public.admin_users)
  );

create policy "users_view_own_digest" on public.digest_cache
  for select using (user_id = auth.uid());

create policy "system_insert_digest" on public.digest_cache
  for insert with check (
    auth.uid() in (select id from public.admin_users)
    or user_id = auth.uid()
  );
