-- attendance_sessions
create table if not exists public.attendance_sessions (
  id           uuid primary key default gen_random_uuid(),
  course_id    uuid not null references public.courses(id) on delete cascade,
  ipt_id       uuid not null references public.ipts(id) on delete cascade,
  session_date date not null,
  title        text not null,
  created_by   uuid not null references public.users(id),
  created_at   timestamptz not null default now()
);

-- attendance_records
create table if not exists public.attendance_records (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.attendance_sessions(id) on delete cascade,
  user_id    uuid not null references public.users(id) on delete cascade,
  ipt_id     uuid not null references public.ipts(id) on delete cascade,
  status     text not null check (status in ('present', 'absent')),
  marked_at  timestamptz not null default now(),
  unique (session_id, user_id)
);

-- schedules
create table if not exists public.schedules (
  id          uuid primary key default gen_random_uuid(),
  course_id   uuid not null references public.courses(id) on delete cascade,
  ipt_id      uuid not null references public.ipts(id) on delete cascade,
  title       text not null,
  start_time  timestamptz not null,
  end_time    timestamptz not null,
  location    text,
  recurring   boolean not null default false,
  created_by  uuid not null references public.users(id),
  created_at  timestamptz not null default now(),
  check (end_time > start_time)
);

-- RLS: attendance_sessions
alter table public.attendance_sessions enable row level security;

create policy "IPT members read own attendance sessions"
  on public.attendance_sessions for select
  using (ipt_id = (auth.jwt() ->> 'ipt_id')::uuid);

create policy "Tenaga pengajar and admin manage attendance sessions"
  on public.attendance_sessions for all
  using (
    ipt_id = (auth.jwt() ->> 'ipt_id')::uuid
    and auth.jwt() ->> 'role' in ('admin', 'super_admin', 'tenaga_pengajar')
  )
  with check (
    ipt_id = (auth.jwt() ->> 'ipt_id')::uuid
    and auth.jwt() ->> 'role' in ('admin', 'super_admin', 'tenaga_pengajar')
  );

-- RLS: attendance_records
alter table public.attendance_records enable row level security;

create policy "IPT members read own ipt attendance records"
  on public.attendance_records for select
  using (ipt_id = (auth.jwt() ->> 'ipt_id')::uuid);

create policy "Ahli reads only own attendance records"
  on public.attendance_records for select
  using (
    ipt_id = (auth.jwt() ->> 'ipt_id')::uuid
    and (
      auth.jwt() ->> 'role' in ('admin', 'super_admin', 'tenaga_pengajar')
      or user_id = auth.uid()
    )
  );

create policy "Tenaga pengajar and admin manage attendance records"
  on public.attendance_records for all
  using (
    ipt_id = (auth.jwt() ->> 'ipt_id')::uuid
    and auth.jwt() ->> 'role' in ('admin', 'super_admin', 'tenaga_pengajar')
  )
  with check (
    ipt_id = (auth.jwt() ->> 'ipt_id')::uuid
    and auth.jwt() ->> 'role' in ('admin', 'super_admin', 'tenaga_pengajar')
  );

-- RLS: schedules
alter table public.schedules enable row level security;

create policy "IPT members read own schedules"
  on public.schedules for select
  using (ipt_id = (auth.jwt() ->> 'ipt_id')::uuid);

create policy "Admin manages schedules"
  on public.schedules for all
  using (
    ipt_id = (auth.jwt() ->> 'ipt_id')::uuid
    and auth.jwt() ->> 'role' in ('admin', 'super_admin')
  )
  with check (
    ipt_id = (auth.jwt() ->> 'ipt_id')::uuid
    and auth.jwt() ->> 'role' in ('admin', 'super_admin')
  );
