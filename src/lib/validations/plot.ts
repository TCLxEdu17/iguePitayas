import { z } from 'zod'

export const createPlotSchema = z.object({
  code:        z.string().min(1, 'Código obrigatório'),
  name:        z.string().min(1, 'Nome obrigatório'),
  productType: z.enum(['BANANA_PRATA', 'BANANA_NANICA', 'PITAYA']),
  area:        z.number().positive().optional(),
  status:      z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE']).default('ACTIVE'),
  notes:       z.string().optional(),
  polygon:     z.array(z.object({ x: z.number(), y: z.number() })).optional(),
})

export const updatePlotSchema = createPlotSchema.partial()

export type CreatePlotInput = z.infer<typeof createPlotSchema>
export type UpdatePlotInput = z.infer<typeof updatePlotSchema>
