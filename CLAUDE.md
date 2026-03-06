# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Goal

Multi-tenant Learning Management System (LMS) for **Persatuan Seni Silat Cekak Malaysia (PSSCM)**.

Each IPT (Institut Pengajian Tinggi) chapter has its own isolated portal under a shared domain:

```
portalipt.silatcekak.org.my/{ipt_slug}
localhost:3000/{ipt_slug}
```

Pilot: 4 IPT. Target scale: ~60 IPT.

## Commands

```bash
pnpm dev        # Start development server
pnpm build      # Production build
pnpm start      # Start production server
pnpm lint       # Run ESLint
```

## Tech Stack

- **Framework**: Next.js App Router (TypeScript, strict mode)
- **Database / Auth / Storage**: Supabase (PostgreSQL + RLS + Supabase Auth + Supabase Storage)
- **UI**: TailwindCSS v4 + Shadcn UI
- **Forms**: React Hook Form + Zod
- **Hosting**: Vercel
- **Package manager**: pnpm

## Architecture

### Multi-tenancy
Every database table (except system-level) must include `ipt_id`. All queries filter by `ipt_id`. Supabase Row Level Security (RLS) enforces tenant isolation. Super Admin is the only exception and can access all tenants.

### URL Structure
```
/                              # Lists all IPT portals
/{ipt_slug}                    # IPT portal home
/{ipt_slug}/login
/{ipt_slug}/dashboard
/{ipt_slug}/courses
/{ipt_slug}/courses/[courseId]
/{ipt_slug}/courses/[courseId]/week/[weekId]
```

### Roles (hierarchy: Super Admin > Admin > Tenaga Pengajar > Ahli)
| Role | Key Capabilities |
|------|-----------------|
| Super Admin | Create IPT, assign admins, global analytics, disable IPT |
| Admin (Penyelia IPT) | Create courses/weeks, enroll users, upload CSV, view submissions, manage schedules |
| Tenaga Pengajar | Upload materials, create assignments/quizzes, grade submissions |
| Ahli | View materials, submit assignments, take quizzes, view grades/attendance |

### Authentication
Login via **IC Number + Password** (not email). Users are created by Admin (manually or via CSV bulk upload). Supabase Auth is used.

### Course Structure
```
Course
  └── Week N
        ├── Materials (PDF, PowerPoint, Video, Google Drive link, YouTube link)
        ├── Assignments (file upload or text answer, with due date and grading)
        └── Quizzes (multiple choice, true/false, short answer; timer, randomization, auto-grade)
```

### Database Key Tables
`ipts`, `users` (with `ipt_id`, `ic_number`, `kelas_latihan`, `role`), `courses`, `course_weeks`, `enrollments`, `course_materials`, `assignments`, `submissions`, `quizzes`, `quiz_questions`, `attendance_sessions`, `attendance_records`

### Supabase Storage Buckets
- `course-files/{courseId}/filename`
- `assignment-submissions/{assignmentId}/{userId}/file`

## Development Phases
1. **Phase 1**: Auth, IPT routing, user management, course creation, CSV enrollment
2. **Phase 2**: Assignments, submissions, grading
3. **Phase 3**: Quiz system
4. **Phase 4**: Attendance tracking, class scheduling

## Path Alias
`@/*` resolves to the project root (`./`). App directory is `app/` (no `src/` prefix).
