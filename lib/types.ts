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
