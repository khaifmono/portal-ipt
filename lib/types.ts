export type Role = 'super_admin' | 'admin' | 'tenaga_pengajar' | 'ahli'

export interface Ipt {
  id: string
  name: string
  slug: string
  is_active: boolean
  logo_url: string | null
  created_at: string
}

export interface User {
  id: string
  ipt_id: string
  ic_number: string
  nama: string
  role: Role
  kelas_latihan: string | null
  created_at: string
}

export interface Course {
  id: string
  ipt_id: string
  title: string
  description: string | null
  created_by: string
  created_at: string
}

export interface CourseWeek {
  id: string
  course_id: string
  ipt_id: string
  week_number: number
  title: string
  description: string | null
  created_at: string
}

export interface Enrollment {
  id: string
  course_id: string
  user_id: string
  ipt_id: string
  enrolled_at: string
}

export interface Assignment {
  id: string
  course_id: string
  week_id: string
  ipt_id: string
  title: string
  description: string | null
  type: 'file_upload' | 'text'
  due_date: string | null
  max_score: number
  created_by: string
  created_at: string
}

export interface Submission {
  id: string
  assignment_id: string
  user_id: string
  ipt_id: string
  content_text: string | null
  file_path: string | null
  submitted_at: string
  grade: number | null
  feedback: string | null
  graded_by: string | null
  graded_at: string | null
}

export interface Quiz {
  id: string
  course_id: string
  week_id: string
  ipt_id: string
  title: string
  description: string | null
  timer_minutes: number | null
  randomize_questions: boolean
  created_by: string
  created_at: string
}

export interface QuizQuestion {
  id: string
  quiz_id: string
  ipt_id: string
  question_text: string
  question_type: 'multiple_choice' | 'true_false' | 'short_answer'
  options: string[] | null
  correct_answer: string | null
  marks: number
  order_index: number
}

export interface QuizAttempt {
  id: string
  quiz_id: string
  user_id: string
  ipt_id: string
  started_at: string
  submitted_at: string | null
  answers: Record<string, string> | null
  score: number | null
  status: 'in_progress' | 'submitted'
}

export interface AttendanceSession {
  id: string
  course_id: string
  ipt_id: string
  session_date: string
  title: string
  qr_token: string | null
  created_by: string
  created_at: string
}

export type AttendanceStatusType = 'present' | 'absent' | 'late' | 'excused'

export interface AttendanceRecord {
  id: string
  session_id: string
  user_id: string
  ipt_id: string
  status: AttendanceStatusType
  remark: string | null
  marked_at: string
}

export type MaterialType = 'file' | 'link' | 'youtube' | 'google_drive'

export interface CourseMaterial {
  id: string
  week_id: string
  course_id: string
  ipt_id: string
  title: string
  description: string | null
  type: MaterialType
  file_path: string | null
  url: string | null
  order_index: number
  created_by: string
  created_at: string
}

export interface Announcement {
  id: string
  course_id: string | null
  ipt_id: string
  title: string
  content: string
  is_pinned: boolean
  created_by: string
  created_at: string
}

export interface Schedule {
  id: string
  course_id: string
  ipt_id: string
  title: string
  start_time: string
  end_time: string
  location: string | null
  recurring: boolean
  created_by: string
  created_at: string
}

export interface ForumThread {
  id: string
  course_id: string
  ipt_id: string
  title: string
  content: string
  is_pinned: boolean
  is_locked: boolean
  created_by: string
  created_at: string
}

export interface ForumReply {
  id: string
  thread_id: string
  ipt_id: string
  content: string
  created_by: string
  created_at: string
}
