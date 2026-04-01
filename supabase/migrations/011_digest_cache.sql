create table public.digest_cache (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  period_start timestamptz not null,
  period_end timestamptz not null,
  summary text not null,
  created_at timestamptz not null default now()
);

create index idx_digest_cache_user on public.digest_cache(user_id, period_end desc);
