import { z } from 'zod'

export const createActivitySchema = z.object({
  localId:     z.string().min(1),
  plotId:      z.string().min(1),
  date:        z.string().min(1),
  type:        z.enum(['PULVERIZACAO', 'ROCAGEM', 'RETIRADA_BANANA', 'RETIRADA_CAIXAS', 'OUTRO']),
  responsible: z.string().min(1),
  quantity:    z.number().optional(),
  unit:        z.enum(['CAIXA', 'UNIDADE']).optional(),
  cost:        z.number().optional(),
  notes:       z.string().optional(),
  confirmed:   z.boolean().default(false),
  syncStatus:  z.enum(['PENDING', 'SYNCED', 'CONFLICT']).default('SYNCED'),
})

export const updateActivitySchema = createActivitySchema.partial()

export type CreateActivityInput = z.infer<typeof createActivitySchema>
