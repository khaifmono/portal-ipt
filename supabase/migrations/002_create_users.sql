-- Custom users table extending Supabase auth.users
-- ic_number is used as the login identifier (stored in auth.users email as ic_number@ipt_slug.local)
create table if not exists public.users (
  id            uuid primary key references auth.users(id) on delete cascade,
  ipt_id        uuid not null references public.ipts(id) on delete cascade,
  ic_number     text not null,
  nama          text not null,
  role          text not null check (role in ('super_admin', 'admin', 'tenaga_pengajar', 'ahli')),
  kelas_latihan text,
  created_at    timestamptz not null default now(),
  unique (ipt_id, ic_number)
);

-- RLS
alter table public.users enable row level security;

-- Users can read members in their own IPT
create policy "Users read same-ipt users"
  on public.users for select
  using (ipt_id = (auth.jwt() ->> 'ipt_id')::uuid);

-- Super admin reads all
create policy "Super admin reads all users"
  on public.users for select
  using (auth.jwt() ->> 'role' = 'super_admin');

-- Admin manages users in their own IPT
create policy "Admin manages ipt users"
  on public.users for all
  using (
    ipt_id = (auth.jwt() ->> 'ipt_id')::uuid
    and auth.jwt() ->> 'role' in ('admin', 'super_admin')
  )
  with check (
    ipt_id = (auth.jwt() ->> 'ipt_id')::uuid
    and auth.jwt() ->> 'role' in ('admin', 'super_admin')
  );
