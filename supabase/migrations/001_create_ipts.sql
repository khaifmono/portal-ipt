-- IPT (Institut Pengajian Tinggi) table — system-level, no ipt_id FK
create table if not exists public.ipts (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text not null unique,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.ipts enable row level security;

-- Anyone can read active IPTs (for the portal listing)
create policy "Public can view active ipts"
  on public.ipts for select
  using (is_active = true);

-- Only super_admin can insert/update/delete
create policy "Super admin manages ipts"
  on public.ipts for all
  using (auth.jwt() ->> 'role' = 'super_admin')
  with check (auth.jwt() ->> 'role' = 'super_admin');
