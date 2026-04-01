alter table public.invoices enable row level security;
alter table public.meetings enable row level security;
alter table public.esg_metrics enable row level security;
alter table public.app_shortcuts enable row level security;

create policy "clients_view_own_invoices" on public.invoices
  for select using (org_id in (select org_id from public.users where id = auth.uid()));
create policy "admins_full_access_invoices" on public.invoices
  for all using (auth.uid() in (select id from public.admin_users));

create policy "clients_view_own_meetings" on public.meetings
  for select using (org_id in (select org_id from public.users where id = auth.uid()));
create policy "clients_insert_own_meetings" on public.meetings
  for insert with check (org_id in (select org_id from public.users where id = auth.uid()) and booked_by = auth.uid());
create policy "admins_full_access_meetings" on public.meetings
  for all using (auth.uid() in (select id from public.admin_users));

create policy "clients_view_own_metrics" on public.esg_metrics
  for select using (project_id in (select p.id from public.projects p join public.users u on u.org_id = p.org_id where u.id = auth.uid()));
create policy "admins_full_access_metrics" on public.esg_metrics
  for all using (auth.uid() in (select id from public.admin_users));

create policy "clients_view_own_shortcuts" on public.app_shortcuts
  for select using (org_id in (select org_id from public.users where id = auth.uid()));
create policy "admins_full_access_shortcuts" on public.app_shortcuts
  for all using (auth.uid() in (select id from public.admin_users));
