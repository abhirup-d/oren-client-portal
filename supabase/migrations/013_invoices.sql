create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  zoho_invoice_id text unique,
  invoice_number text not null,
  amount decimal(12,2) not null,
  currency text not null default 'INR',
  status text not null default 'pending' check (status in ('pending', 'paid', 'overdue', 'partially_paid')),
  due_date date,
  payment_url text,
  synced_at timestamptz,
  created_at timestamptz not null default now()
);
create index idx_invoices_org_id on public.invoices(org_id);
create index idx_invoices_status on public.invoices(status);
