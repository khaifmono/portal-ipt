create table if not exists public.courses (
  id          uuid primary key default gen_random_uuid(),
  ipt_id      uuid not null references public.ipts(id) on delete cascade,
  title       text not null,
  description text,
  created_by  uuid not null references public.users(id),
  created_at  timestamptz not null default now()
);

create table if not exists public.course_weeks (
  id          uuid primary key default gen_random_uuid(),
  course_id   uuid not null references public.courses(id) on delete cascade,
  ipt_id      uuid not null references public.ipts(id) on delete cascade,
  week_number integer not null,
  title       text not null,
  description text,
  created_at  timestamptz not null default now(),
  unique (course_id, week_number)
);

create table if not exists public.enrollments (
  id          uuid primary key default gen_random_uuid(),
  course_id   uuid not null references public.courses(id) on delete cascade,
  user_id     uuid not null references public.users(id) on delete cascade,
  ipt_id      uuid not null references public.ipts(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  unique (course_id, user_id)
);

-- RLS: courses
alter table public.courses enable row level security;

create policy "IPT members read own courses"
  on public.courses for select
  using (ipt_id = (auth.jwt() ->> 'ipt_id')::uuid);

create policy "Super admin reads all courses"
  on public.courses for select
  using (auth.jwt() ->> 'role' = 'super_admin');

create policy "Admin manages ipt courses"
  on public.courses for all
  using (
    ipt_id = (auth.jwt() ->> 'ipt_id')::uuid
    and auth.jwt() ->> 'role' in ('admin', 'super_admin')
  )
  with check (
    ipt_id = (auth.jwt() ->> 'ipt_id')::uuid
    and auth.jwt() ->> 'role' in ('admin', 'super_admin')
  );

-- RLS: course_weeks
alter table public.course_weeks enable row level security;

create policy "IPT members read own weeks"
  on public.course_weeks for select
  using (ipt_id = (auth.jwt() ->> 'ipt_id')::uuid);

create policy "Admin manages weeks"
  on public.course_weeks for all
  using (
    ipt_id = (auth.jwt() ->> 'ipt_id')::uuid
    and auth.jwt() ->> 'role' in ('admin', 'super_admin', 'tenaga_pengajar')
  )
  with check (
    ipt_id = (auth.jwt() ->> 'ipt_id')::uuid
    and auth.jwt() ->> 'role' in ('admin', 'super_admin', 'tenaga_pengajar')
  );

-- RLS: enrollments
alter table public.enrollments enable row level security;

create policy "IPT members read own enrollments"
  on public.enrollments for select
  using (ipt_id = (auth.jwt() ->> 'ipt_id')::uuid);

create policy "Admin manages enrollments"
  on public.enrollments for all
  using (
    ipt_id = (auth.jwt() ->> 'ipt_id')::uuid
    and auth.jwt() ->> 'role' in ('admin', 'super_admin')
  )
  with check (
    ipt_id = (auth.jwt() ->> 'ipt_id')::uuid
    and auth.jwt() ->> 'role' in ('admin', 'super_admin')
  );
