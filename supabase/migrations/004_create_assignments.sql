-- assignments table
create table if not exists public.assignments (
  id          uuid primary key default gen_random_uuid(),
  course_id   uuid not null references public.courses(id) on delete cascade,
  week_id     uuid not null references public.course_weeks(id) on delete cascade,
  ipt_id      uuid not null references public.ipts(id) on delete cascade,
  title       text not null,
  description text,
  type        text not null check (type in ('file_upload', 'text')),
  due_date    timestamptz,
  max_score   integer not null default 100,
  created_by  uuid not null references public.users(id),
  created_at  timestamptz not null default now()
);

-- submissions table
create table if not exists public.submissions (
  id             uuid primary key default gen_random_uuid(),
  assignment_id  uuid not null references public.assignments(id) on delete cascade,
  user_id        uuid not null references public.users(id) on delete cascade,
  ipt_id         uuid not null references public.ipts(id) on delete cascade,
  content_text   text,
  file_path      text,
  submitted_at   timestamptz not null default now(),
  grade          numeric check (grade >= 0 and grade <= 100),
  feedback       text,
  graded_by      uuid references public.users(id),
  graded_at      timestamptz,
  unique (assignment_id, user_id)
);

-- RLS: assignments
alter table public.assignments enable row level security;

create policy "IPT members read own assignments"
  on public.assignments for select
  using (ipt_id = (auth.jwt() ->> 'ipt_id')::uuid);

create policy "Tenaga pengajar and admin insert assignments"
  on public.assignments for insert
  with check (
    ipt_id = (auth.jwt() ->> 'ipt_id')::uuid
    and auth.jwt() ->> 'role' in ('admin', 'super_admin', 'tenaga_pengajar')
  );

create policy "Tenaga pengajar and admin update assignments"
  on public.assignments for update
  using (
    ipt_id = (auth.jwt() ->> 'ipt_id')::uuid
    and auth.jwt() ->> 'role' in ('admin', 'super_admin', 'tenaga_pengajar')
  )
  with check (
    ipt_id = (auth.jwt() ->> 'ipt_id')::uuid
    and auth.jwt() ->> 'role' in ('admin', 'super_admin', 'tenaga_pengajar')
  );

create policy "Tenaga pengajar and admin delete assignments"
  on public.assignments for delete
  using (
    ipt_id = (auth.jwt() ->> 'ipt_id')::uuid
    and auth.jwt() ->> 'role' in ('admin', 'super_admin', 'tenaga_pengajar')
  );

-- RLS: submissions
alter table public.submissions enable row level security;

create policy "IPT members read own submissions"
  on public.submissions for select
  using (ipt_id = (auth.jwt() ->> 'ipt_id')::uuid);

create policy "Ahli submits own submission"
  on public.submissions for insert
  with check (
    user_id = auth.uid()
    and ipt_id = (auth.jwt() ->> 'ipt_id')::uuid
  );

create policy "Ahli updates own submission"
  on public.submissions for update
  using (
    user_id = auth.uid()
    and ipt_id = (auth.jwt() ->> 'ipt_id')::uuid
  )
  with check (
    user_id = auth.uid()
    and ipt_id = (auth.jwt() ->> 'ipt_id')::uuid
  );

create policy "Tenaga pengajar and admin grade submissions"
  on public.submissions for update
  using (
    ipt_id = (auth.jwt() ->> 'ipt_id')::uuid
    and auth.jwt() ->> 'role' in ('admin', 'super_admin', 'tenaga_pengajar')
  )
  with check (
    ipt_id = (auth.jwt() ->> 'ipt_id')::uuid
    and auth.jwt() ->> 'role' in ('admin', 'super_admin', 'tenaga_pengajar')
  );
