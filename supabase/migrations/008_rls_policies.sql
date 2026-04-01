-- Enable RLS on all tables
alter table public.organizations enable row level security;
alter table public.admin_users enable row level security;
alter table public.users enable row level security;
alter table public.projects enable row level security;
alter table public.documents enable row level security;
alter table public.activity_log enable row level security;
alter table public.notifications enable row level security;

-- Organizations: clients see their own org, admins see all
create policy "clients_view_own_org" on public.organizations
  for select using (
    id in (select org_id from public.users where id = auth.uid())
  );

create policy "admins_full_access_orgs" on public.organizations
  for all using (
    auth.uid() in (select id from public.admin_users)
  );

-- Admin users: admins can see all admin users
create policy "admins_view_admins" on public.admin_users
  for select using (
    auth.uid() in (select id from public.admin_users)
  );

create policy "clients_view_admin_names" on public.admin_users
  for select using (
    auth.uid() in (select id from public.users)
  );

-- Users: clients see users in their org, admins see all
create policy "clients_view_own_org_users" on public.users
  for select using (
    org_id in (select org_id from public.users where id = auth.uid())
  );

create policy "admins_full_access_users" on public.users
  for all using (
    auth.uid() in (select id from public.admin_users)
  );

-- Projects: clients see their org's projects, admins see all
create policy "clients_view_own_projects" on public.projects
  for select using (
    org_id in (select org_id from public.users where id = auth.uid())
  );

create policy "admins_full_access_projects" on public.projects
  for all using (
    auth.uid() in (select id from public.admin_users)
  );

-- Documents: clients see docs for their org's projects, admins see all
create policy "clients_view_own_documents" on public.documents
  for select using (
    project_id in (
      select p.id from public.projects p
      join public.users u on u.org_id = p.org_id
      where u.id = auth.uid()
    )
  );

create policy "admins_full_access_documents" on public.documents
  for all using (
    auth.uid() in (select id from public.admin_users)
  );

-- Activity log: clients see their org's activity, admins see all
create policy "clients_view_own_activity" on public.activity_log
  for select using (
    org_id in (select org_id from public.users where id = auth.uid())
  );

create policy "admins_full_access_activity" on public.activity_log
  for all using (
    auth.uid() in (select id from public.admin_users)
  );

-- Notifications: users see only their own
create policy "users_view_own_notifications" on public.notifications
  for select using (user_id = auth.uid());

create policy "users_update_own_notifications" on public.notifications
  for update using (user_id = auth.uid());

create policy "admins_insert_notifications" on public.notifications
  for insert with check (
    auth.uid() in (select id from public.admin_users)
  );

-- Storage bucket for documents
insert into storage.buckets (id, name, public) values ('documents', 'documents', false);

create policy "clients_read_own_docs" on storage.objects
  for select using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] in (
      select o.id::text from public.organizations o
      join public.users u on u.org_id = o.id
      where u.id = auth.uid()
    )
  );

create policy "admins_full_access_storage" on storage.objects
  for all using (
    bucket_id = 'documents'
    and auth.uid() in (select id from public.admin_users)
  );
