import { z } from 'zod'

export const createUserSchema = z.object({
  name:     z.string().min(2),
  email:    z.string().email(),
  password: z.string().min(6),
  role:     z.enum(['ADMIN', 'OPERATOR', 'VIEWER']),
})

export const updateUserSchema = z.object({
  name:     z.string().min(2).optional(),
  email:    z.string().email().optional(),
  password: z.string().min(6).optional(),
  role:     z.enum(['ADMIN', 'OPERATOR', 'VIEWER']).optional(),
  active:   z.boolean().optional(),
})
