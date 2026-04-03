# Portal IPT — GSD Feature Roadmap (Moodle-inspired)

## What's Already Done
- Multi-tenant IPT portals (3 pilot)
- User management (IC + password, CSV bulk upload)
- Courses with weekly structure
- Assignments (file upload + text, due dates, grading)
- Quizzes (MCQ, true/false, short answer, timer, auto-grade)
- Attendance tracking
- Class scheduling
- Role-based access (Super Admin, Admin, Tenaga Pengajar, Ahli)

---

## Phase 5: Course Content & Materials
**Goal:** Let instructors upload learning materials per week (like Moodle resources).

- [ ] Course materials model (PDF, video, PowerPoint, external links)
- [ ] Upload materials UI (drag & drop file upload per week)
- [ ] YouTube/Google Drive link embedding
- [ ] Material ordering within a week
- [ ] Download tracking (who downloaded what)
- [ ] File preview (PDF viewer, video player inline)

**Impact:** Core LMS feature — students can't learn without materials.

---

## Phase 6: Enrollment Management
**Goal:** Admin can manage who's in which course.

- [ ] Enroll/unenroll students from courses
- [ ] Bulk enrollment via CSV
- [ ] Auto-enroll by kelas latihan
- [ ] Enrollment status page (enrolled, completed, dropped)
- [ ] Student view: "My Courses" with enrollment status
- [ ] Course capacity limits (optional)

**Impact:** Right now courses exist but enrollment flow is manual.

---

## Phase 7: Gradebook & Progress
**Goal:** Consolidated view of all grades and student progress.

- [ ] Gradebook page per course (table: students x assignments/quizzes)
- [ ] Export grades to CSV/Excel
- [ ] Student progress bar (% materials viewed, assignments submitted, quizzes taken)
- [ ] Course completion criteria (min attendance %, min grade)
- [ ] Student transcript view (all courses, all grades)
- [ ] Grade weighting (assignments 40%, quizzes 30%, attendance 30%)

**Impact:** Instructors need a single view to see class performance.

---

## Phase 8: Announcements & Notifications
**Goal:** Communication between instructors and students.

- [ ] Course announcements (instructor posts, students see)
- [ ] System notifications (assignment due soon, new material uploaded, grade posted)
- [ ] Notification bell in navbar with unread count
- [ ] Email notifications (optional, via SMTP)
- [ ] WhatsApp/Telegram webhook notifications (optional)

**Impact:** Students miss deadlines because they don't know about updates.

---

## Phase 9: Discussion Forum
**Goal:** Per-course discussion like Moodle forums.

- [ ] Discussion forum per course
- [ ] Thread creation (instructor or student)
- [ ] Reply to threads
- [ ] Pin important threads
- [ ] Instructor can lock/close threads
- [ ] File attachments in posts

**Impact:** Nice to have for collaboration, not critical for pilot.

---

## Phase 10: Dashboard & Analytics
**Goal:** Better dashboards for each role.

- [ ] **Admin dashboard:** total users, active courses, attendance rates, submission rates
- [ ] **Instructor dashboard:** my courses, pending grading count, upcoming sessions
- [ ] **Student dashboard:** upcoming deadlines, recent grades, attendance summary
- [ ] **Super Admin dashboard:** cross-IPT analytics, user growth, system health
- [ ] Charts/graphs (use recharts or chart.js)
- [ ] Export reports to PDF

**Impact:** Decision-makers need data to justify the platform.

---

## Phase 11: User Profile & Settings
**Goal:** Users can view and manage their profile.

- [ ] Profile page (nama, IC, kelas latihan, role)
- [ ] Change password
- [ ] Profile photo upload
- [ ] Admin can edit user details
- [ ] Admin can reset user password
- [ ] Account deactivation (soft delete)

**Impact:** Basic UX expectation.

---

## Phase 12: Calendar & Scheduling
**Goal:** Visual calendar for classes, deadlines, and events.

- [ ] Calendar view (monthly/weekly) showing:
  - Class schedules
  - Assignment due dates
  - Quiz dates
  - Attendance sessions
- [ ] iCal export (sync with Google Calendar/Apple Calendar)
- [ ] Admin can create events
- [ ] Color coding by type (class, assignment, quiz)

**Impact:** Visual overview helps students plan their week.

---

## Phase 13: Certificate Generation
**Goal:** Auto-generate completion certificates.

- [ ] Certificate template (PDF with IPT logo, student name, course name, date)
- [ ] Auto-issue on course completion (meets all criteria)
- [ ] Certificate verification page (QR code or unique ID)
- [ ] Bulk certificate generation
- [ ] Certificate gallery for students

**Impact:** Important for PSSCM — silat grading may require proof of training.

---

## Phase 14: Mobile & PWA
**Goal:** Mobile-friendly experience.

- [ ] Responsive design audit (already TailwindCSS, mostly done)
- [ ] PWA manifest (installable on phone)
- [ ] Offline support for viewing downloaded materials
- [ ] Push notifications
- [ ] QR code attendance (student scans to mark present)

**Impact:** Most users will access via phone.

---

## Phase 15: Admin & System Management
**Goal:** Super Admin tools for managing the platform.

- [ ] Create/edit/deactivate IPTs
- [ ] System-wide user search
- [ ] Audit log (who did what, when)
- [ ] Backup management (trigger DB backup, download)
- [ ] System settings (default language, timezone, email config)
- [ ] Storage usage dashboard

**Impact:** Needed before scaling to 60 IPTs.

---

## Recommended Priority for Pilot

| Priority | Phase | Reason |
|----------|-------|--------|
| 1 | Phase 5: Course Materials | Can't learn without content |
| 2 | Phase 6: Enrollment Management | Need to assign students to courses |
| 3 | Phase 7: Gradebook | Instructors need grade overview |
| 4 | Phase 11: User Profile | Password change is essential |
| 5 | Phase 8: Announcements | Communication is important |
| 6 | Phase 10: Dashboard | Analytics for admins |
| 7 | Phase 14: Mobile/PWA | Most users on phone |
| 8 | Phase 12: Calendar | Nice to have |
| 9 | Phase 13: Certificates | After pilot validation |
| 10 | Phase 9: Forums | Low priority for pilot |
| 11 | Phase 15: System Admin | Before scaling |

---

## Estimated Effort Per Phase

| Phase | Complexity | Estimate |
|-------|-----------|----------|
| Phase 5 | Medium | 2-3 days |
| Phase 6 | Low | 1-2 days |
| Phase 7 | Medium | 2-3 days |
| Phase 8 | Medium | 2-3 days |
| Phase 9 | High | 3-4 days |
| Phase 10 | Medium | 2-3 days |
| Phase 11 | Low | 1-2 days |
| Phase 12 | Medium | 2-3 days |
| Phase 13 | Medium | 2-3 days |
| Phase 14 | Low-Medium | 2-3 days |
| Phase 15 | High | 3-5 days |
