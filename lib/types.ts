export type Role = 'super_admin' | 'admin' | 'tenaga_pengajar' | 'ahli'

export interface Ipt {
  id: string
  name: string
  slug: string
  is_active: boolean
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
