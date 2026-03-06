# Development Phases — TDD Plan

Multi-tenant LMS for PSSCM (portal-ipt). Each phase follows Red → Green → Refactor.

---

## Phase 0 — Test Infrastructure Setup

### Install

```bash
pnpm add -D vitest @vitejs/plugin-react @testing-library/react @testing-library/user-event jsdom
pnpm add -D @playwright/test
```

### Vitest Config

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
```

### Test Utilities

- `tests/utils/supabase-mock.ts` — mock Supabase client for unit tests
- `tests/utils/render.tsx` — custom render wrapper with providers (e.g. Next.js router context)
- `tests/setup.ts` — global setup (e.g. `@testing-library/jest-dom` matchers)

### Sanity Tests (Red → Green)

- `tests/setup.test.ts` — confirms Vitest runs and imports resolve
- `tests/e2e/smoke.spec.ts` — Playwright loads `localhost:3000` and returns HTTP 200

### Verification

```bash
pnpm vitest run
pnpm playwright test
```

---

## Phase 1 — Auth, IPT Routing, User Management, Course Creation

### 1.1 Database Schema

**Tables:** `ipts`, `users`, `courses`, `course_weeks`, `enrollments`

All non-system tables include `ipt_id`. RLS policies enforced at the Supabase level.

**Tests to write FIRST (Red):** `tests/db/rls.test.ts`

- User can only read rows where `ipt_id` matches their own
- Super Admin bypasses RLS and reads rows from any tenant
- Unauthenticated request is rejected (returns empty result or error)

**Implementation (Green):**

- Supabase migrations: create tables with `ipt_id NOT NULL` FK on all non-system tables
- RLS policies: `USING (ipt_id = auth.jwt()->>'ipt_id')` or equivalent
- Super Admin policy: `USING (auth.jwt()->>'role' = 'super_admin')`

---

### 1.2 IPT Routing — `app/[ipt_slug]/`

**Tests to write FIRST (Red):**

`tests/unit/ipt-slug.test.ts`
- `getIptBySlug('psscmuiam')` returns the correct IPT record
- `getIptBySlug('unknown')` returns `null`

`tests/e2e/routing.spec.ts`
- `/psscmuiam` renders the IPT portal home page
- `/unknown-ipt` shows the 404 page
- `/` renders a list of all active IPT portals

**Implementation (Green):**

- `lib/ipt.ts` — `getIptBySlug(slug)`, `getAllIpts()` Supabase helpers
- `app/page.tsx` — lists all active IPTs
- `app/[ipt_slug]/page.tsx` — IPT portal home; calls `notFound()` if slug is invalid

---

### 1.3 Authentication — `app/[ipt_slug]/login/`

Login is via **IC Number + Password** (not email). Users are created by Admin.

**Tests to write FIRST (Red):**

`tests/unit/auth.test.ts`
- Zod schema rejects empty IC number
- Zod schema rejects password shorter than 6 characters
- IC number must be exactly 12 digits (no dashes)

`tests/e2e/auth.spec.ts`
- Login form renders at `/{ipt_slug}/login`
- Invalid IC/password combination shows an error message
- Valid credentials redirect to `/{ipt_slug}/dashboard`
- Unauthenticated user accessing `/dashboard` is redirected to `/login`

**Implementation (Green):**

- `app/[ipt_slug]/login/page.tsx` — login page
- `components/auth/LoginForm.tsx` — React Hook Form + Zod validation
- `lib/auth.ts` — Supabase Auth helpers: `login()`, `logout()`, `getSession()`
- `middleware.ts` — protect routes by role; redirect unauthenticated users

---

### 1.4 User Management (Admin only)

**Tests to write FIRST (Red):**

`tests/unit/user-management.test.ts`
- CSV parser correctly maps `ic_number`, `nama`, `kelas_latihan` columns
- CSV parser rejects rows with a missing IC number
- `createUser()` assigns the correct `ipt_id` derived from the Admin's session

`tests/e2e/user-management.spec.ts`
- Admin can create a user via the form
- Admin can upload a CSV and see a preview before saving
- Non-admin cannot access the `/users` route (receives 403 or redirect)

**Implementation (Green):**

- `app/[ipt_slug]/admin/users/page.tsx` — user list
- `app/[ipt_slug]/admin/users/new/page.tsx` — create user form
- `lib/users.ts` — CRUD helpers (`createUser`, `getUsersByIpt`, etc.)
- `lib/csv-parser.ts` — CSV → user array with validation

---

### 1.5 Course Creation (Admin only)

**Tests to write FIRST (Red):**

`tests/unit/courses.test.ts`
- `createCourse()` requires `ipt_id` (throws if missing)
- `addWeekToCourse()` increments `week_number` correctly based on existing weeks

`tests/e2e/courses.spec.ts`
- Admin can create a course
- Admin can add weeks to an existing course
- Tenaga Pengajar can view but cannot create courses

**Implementation (Green):**

- `app/[ipt_slug]/admin/courses/page.tsx` — course list
- `app/[ipt_slug]/admin/courses/new/page.tsx` — create course form
- `lib/courses.ts` — `createCourse()`, `addWeekToCourse()`, `getCoursesByIpt()`

---

## Phase 2 — Assignments, Submissions, Grading

### 2.1 Assignments

**Tests to write FIRST (Red):**

`tests/unit/assignments.test.ts`
- Zod schema validates that `due_date` is in the future
- `createAssignment()` links to the correct `week_id` and `course_id`

`tests/e2e/assignments.spec.ts`
- Tenaga Pengajar can create an assignment with a due date
- Ahli sees the assignment in their course week view
- Ahli cannot create or edit assignments (UI controls hidden; API returns 403)

**Implementation (Green):**

- `app/[ipt_slug]/courses/[courseId]/week/[weekId]/assignments/new/page.tsx`
- `lib/assignments.ts` — `createAssignment()`, `getAssignmentsByWeek()`
- Storage bucket config: `assignment-submissions/{assignmentId}/{userId}/file`

---

### 2.2 Submissions

**Tests to write FIRST (Red):**

`tests/unit/submissions.test.ts`
- File upload validates allowed MIME types (PDF, DOCX, images)
- Text submission validates non-empty content
- Submission after `due_date` is rejected

`tests/e2e/submissions.spec.ts`
- Ahli can submit a file upload successfully
- Ahli can submit a text answer successfully
- Submission is stored in Supabase Storage under the correct path

**Implementation (Green):**

- `app/[ipt_slug]/courses/[courseId]/week/[weekId]/assignments/[assignmentId]/page.tsx`
- `lib/submissions.ts` — `createSubmission()`, `getSubmissionByUser()`

---

### 2.3 Grading

**Tests to write FIRST (Red):**

`tests/unit/grading.test.ts`
- Grade must be a numeric value between 0 and 100
- Feedback field is optional

`tests/e2e/grading.spec.ts`
- Tenaga Pengajar can view all submissions for an assignment
- Tenaga Pengajar can assign a grade and feedback
- Ahli sees their grade on the submission page

**Implementation (Green):**

- `app/[ipt_slug]/admin/courses/[courseId]/assignments/[assignmentId]/submissions/page.tsx`
- `lib/grading.ts` — `gradeSubmission()`, `getGradeBySubmission()`

---

## Phase 3 — Quiz System

### 3.1 Quiz Creation

**Tests to write FIRST (Red):**

`tests/unit/quiz.test.ts`
- Multiple choice question requires at least 2 options and exactly 1 correct answer
- True/false question defaults the correct answer to a boolean
- Timer value must be a positive integer (minutes)
- `shuffleQuestions(questions)` returns the same set in a different order

`tests/e2e/quiz-creation.spec.ts`
- Tenaga Pengajar can create a quiz with multiple choice, true/false, and short answer questions
- Tenaga Pengajar can set a timer and enable question randomization

**Implementation (Green):**

- `app/[ipt_slug]/courses/[courseId]/week/[weekId]/quizzes/new/page.tsx`
- `lib/quizzes.ts` — `createQuiz()`, `addQuestion()`, `shuffleQuestions()`
- Tables: `quizzes`, `quiz_questions`

---

### 3.2 Quiz Taking

**Tests to write FIRST (Red):**

`tests/unit/quiz-grading.test.ts`
- Auto-grade: correct multiple choice answer → full marks
- Auto-grade: incorrect true/false answer → zero marks
- Short answer response is flagged as `pending_review`

`tests/e2e/quiz-taking.spec.ts`
- Ahli can start a quiz and the timer counts down
- Quiz auto-submits when the timer expires
- Ahli sees their score after submission (short answer shows "pending review")

**Implementation (Green):**

- `app/[ipt_slug]/courses/[courseId]/week/[weekId]/quizzes/[quizId]/page.tsx`
- `lib/quiz-attempt.ts` — `startAttempt()`, `submitAttempt()`, `autoGrade()`

---

## Phase 4 — Attendance Tracking & Class Scheduling

### 4.1 Attendance

**Tests to write FIRST (Red):**

`tests/unit/attendance.test.ts`
- `markAttendance()` requires a valid `session_id` and `user_id`
- Duplicate attendance record for the same session throws a unique constraint error
- Status must be one of `present` or `absent`

`tests/e2e/attendance.spec.ts`
- Instructor creates an attendance session for a course
- Instructor marks each student as present or absent
- Ahli views their own attendance history
- Admin views the full attendance report for a course

**Implementation (Green):**

- `app/[ipt_slug]/courses/[courseId]/attendance/page.tsx`
- `lib/attendance.ts` — `createSession()`, `markAttendance()`, `getAttendanceReport()`
- Tables: `attendance_sessions`, `attendance_records`

---

### 4.2 Class Scheduling

**Tests to write FIRST (Red):**

`tests/unit/schedule.test.ts`
- Schedule `start_time` must be before `end_time`
- Schedule record must belong to the correct `ipt_id`

`tests/e2e/schedule.spec.ts`
- Admin can create a class schedule
- Schedule appears on the course page for all enrolled users

**Implementation (Green):**

- `app/[ipt_slug]/admin/schedule/page.tsx`
- `lib/schedule.ts` — `createSchedule()`, `getSchedulesByCourse()`

---

## Cross-cutting Acceptance Criteria

- All Supabase RLS policies are tested with both matching and mismatched `ipt_id`
- Super Admin can access all tenants' data without `ipt_id` restriction
- No query runs without an `ipt_id` filter (except Super Admin context)
- Dashboard initial load time < 2 seconds (verified via Playwright `page.metrics()`)
- File uploads up to 100 MB accepted (Supabase Storage config)
- All role-based access controls enforced at both the UI and API/RLS levels

---

## Testing Stack Summary

| Tool | Purpose |
|------|---------|
| Vitest | Unit & integration tests (ESM-native, fast, works with Next.js) |
| React Testing Library | Component tests |
| Playwright | End-to-end tests |
| Supabase CLI (`supabase start`) | Local Supabase instance for DB/RLS integration tests |
