# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Goal

Multi-tenant Learning Management System (LMS) for **Persatuan Seni Silat Cekak Malaysia (PSSCM)**.

Each IPT (Institut Pengajian Tinggi) chapter has its own isolated portal under a shared domain:

```
portalipt.silatcekak.org.my/{ipt_slug}
localhost:3000/{ipt_slug}
```

Pilot: 3 IPT (UPM, USM, UTM). Target scale: ~60 IPT.

## Commands

```bash
pnpm dev        # Start development server
pnpm build      # Production build
pnpm start      # Start production server
pnpm lint       # Run ESLint
npx prisma db push    # Push schema to database
npx prisma generate   # Regenerate Prisma client
npx tsx prisma/seed.ts  # Seed database
```

## Tech Stack

- **Framework**: Next.js App Router (TypeScript, strict mode)
- **Database**: PostgreSQL 16 (self-hosted via Coolify) + Prisma ORM 7
- **Auth**: NextAuth.js v5 (Credentials provider, IC Number + Password)
- **Storage**: Local filesystem (uploaded files stored on disk)
- **UI**: TailwindCSS v4 + Shadcn UI
- **Forms**: React Hook Form + Zod
- **Hosting**: Coolify (self-hosted PaaS)
- **Package manager**: pnpm

## Architecture

### Multi-tenancy
Every database table (except system-level) must include `ipt_id`. All queries filter by `ipt_id`. Access control is enforced at the application layer (middleware + API route checks). Super Admin is the only exception and can access all tenants.

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
Login via **IC Number + Password** (not email). Users are created by Admin (manually or via CSV bulk upload). NextAuth.js Credentials provider is used. Passwords are hashed with bcrypt. Session is stored as JWT cookie (7-day expiry).

### Database (Prisma)
Schema defined in `prisma/schema.prisma`. Uses `prisma-client` generator with `@prisma/adapter-pg` (driver adapter pattern). Generated client is in `lib/generated/prisma/`.

Key: `lib/db.ts` exports the shared `prisma` client instance.

### File Storage
Files are stored on local disk at `UPLOAD_DIR` (default: `./uploads`). Path structure: `assignment-submissions/{assignmentId}/{userId}/{fileName}`. Served via `GET /api/files/[...path]` with auth check.

### Course Structure
```
Course
  └── Week N
        ├── Materials (PDF, PowerPoint, Video, Google Drive link, YouTube link)
        ├── Assignments (file upload or text answer, with due date and grading)
        └── Quizzes (multiple choice, true/false, short answer; timer, randomization, auto-grade)
```

### Database Key Tables
`ipts`, `users` (with `ipt_id`, `ic_number`, `kelas_latihan`, `role`, `password_hash`), `courses`, `course_weeks`, `enrollments`, `assignments`, `submissions`, `quizzes`, `quiz_questions`, `quiz_attempts`, `attendance_sessions`, `attendance_records`, `schedules`

## Development Phases
1. **Phase 1**: Auth, IPT routing, user management, course creation, CSV enrollment
2. **Phase 2**: Assignments, submissions, grading
3. **Phase 3**: Quiz system
4. **Phase 4**: Attendance tracking, class scheduling

## Path Alias
`@/*` resolves to the project root (`./`). App directory is `app/` (no `src/` prefix).
