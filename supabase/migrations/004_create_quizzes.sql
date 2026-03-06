-- Table: quizzes
create table if not exists public.quizzes (
  id                   uuid primary key default gen_random_uuid(),
  course_id            uuid not null references public.courses(id) on delete cascade,
  week_id              uuid not null references public.course_weeks(id) on delete cascade,
  ipt_id               uuid not null references public.ipts(id) on delete cascade,
  title                text not null,
  description          text,
  timer_minutes        integer,
  randomize_questions  boolean not null default false,
  created_by           uuid not null references public.users(id),
  created_at           timestamptz not null default now()
);

-- Table: quiz_questions
create table if not exists public.quiz_questions (
  id             uuid primary key default gen_random_uuid(),
  quiz_id        uuid not null references public.quizzes(id) on delete cascade,
  ipt_id         uuid not null references public.ipts(id) on delete cascade,
  question_text  text not null,
  question_type  text not null check (question_type in ('multiple_choice', 'true_false', 'short_answer')),
  options        jsonb,
  correct_answer text,
  marks          integer not null default 1,
  order_index    integer not null
);

-- Table: quiz_attempts
create table if not exists public.quiz_attempts (
  id           uuid primary key default gen_random_uuid(),
  quiz_id      uuid not null references public.quizzes(id) on delete cascade,
  user_id      uuid not null references public.users(id) on delete cascade,
  ipt_id       uuid not null references public.ipts(id) on delete cascade,
  started_at   timestamptz not null default now(),
  submitted_at timestamptz,
  answers      jsonb,
  score        numeric,
  status       text not null default 'in_progress' check (status in ('in_progress', 'submitted')),
  unique (quiz_id, user_id)
);

-- RLS: quizzes
alter table public.quizzes enable row level security;

create policy "IPT members read own quizzes"
  on public.quizzes for select
  using (ipt_id = (auth.jwt() ->> 'ipt_id')::uuid);

create policy "Super admin reads all quizzes"
  on public.quizzes for select
  using (auth.jwt() ->> 'role' = 'super_admin');

create policy "Tenaga pengajar and admin manage quizzes"
  on public.quizzes for all
  using (
    ipt_id = (auth.jwt() ->> 'ipt_id')::uuid
    and auth.jwt() ->> 'role' in ('admin', 'super_admin', 'tenaga_pengajar')
  )
  with check (
    ipt_id = (auth.jwt() ->> 'ipt_id')::uuid
    and auth.jwt() ->> 'role' in ('admin', 'super_admin', 'tenaga_pengajar')
  );

-- RLS: quiz_questions
alter table public.quiz_questions enable row level security;

create policy "IPT members read own quiz questions"
  on public.quiz_questions for select
  using (ipt_id = (auth.jwt() ->> 'ipt_id')::uuid);

create policy "Tenaga pengajar and admin manage quiz questions"
  on public.quiz_questions for all
  using (
    ipt_id = (auth.jwt() ->> 'ipt_id')::uuid
    and auth.jwt() ->> 'role' in ('admin', 'super_admin', 'tenaga_pengajar')
  )
  with check (
    ipt_id = (auth.jwt() ->> 'ipt_id')::uuid
    and auth.jwt() ->> 'role' in ('admin', 'super_admin', 'tenaga_pengajar')
  );

-- RLS: quiz_attempts
alter table public.quiz_attempts enable row level security;

create policy "Ahli reads own attempts"
  on public.quiz_attempts for select
  using (
    ipt_id = (auth.jwt() ->> 'ipt_id')::uuid
    and (
      user_id = (auth.jwt() ->> 'sub')::uuid
      or auth.jwt() ->> 'role' in ('admin', 'super_admin', 'tenaga_pengajar')
    )
  );

create policy "Ahli creates own attempt"
  on public.quiz_attempts for insert
  with check (
    ipt_id = (auth.jwt() ->> 'ipt_id')::uuid
    and user_id = (auth.jwt() ->> 'sub')::uuid
  );

create policy "Ahli updates own in_progress attempt"
  on public.quiz_attempts for update
  using (
    ipt_id = (auth.jwt() ->> 'ipt_id')::uuid
    and user_id = (auth.jwt() ->> 'sub')::uuid
    and status = 'in_progress'
  )
  with check (
    ipt_id = (auth.jwt() ->> 'ipt_id')::uuid
    and user_id = (auth.jwt() ->> 'sub')::uuid
  );

create policy "Admin updates attempt score"
  on public.quiz_attempts for update
  using (
    ipt_id = (auth.jwt() ->> 'ipt_id')::uuid
    and auth.jwt() ->> 'role' in ('admin', 'super_admin', 'tenaga_pengajar')
  )
  with check (
    ipt_id = (auth.jwt() ->> 'ipt_id')::uuid
    and auth.jwt() ->> 'role' in ('admin', 'super_admin', 'tenaga_pengajar')
  );
