import { z } from 'zod'

export const loginSchema = z.object({
  ic_number: z
    .string()
    .min(1, 'Nombor IC diperlukan')
    .regex(/^\d{12}$/, 'Nombor IC mesti 12 digit tanpa sempang'),
  password: z.string().min(6, 'Kata laluan mesti sekurang-kurangnya 6 aksara'),
})

export type LoginInput = z.infer<typeof loginSchema>
