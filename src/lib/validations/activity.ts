import { z } from 'zod'

export const createActivitySchema = z.object({
  localId:     z.string().min(1),
  plotId:      z.string().min(1),
  date:        z.string().min(1),
  type:        z.enum(['PULVERIZACAO', 'ADUBACAO', 'ROCAGEM', 'DESFOLHA', 'DESBASTE', 'ENSACAMENTO', 'ESCORA', 'IRRIGACAO', 'RETIRADA_BANANA', 'RETIRADA_CAIXAS', 'PLANTIO', 'OUTRO']),
  responsible: z.string().min(1),
  quantity:    z.number().optional(),
  unit:        z.enum(['KG', 'LITRO', 'CAIXA', 'CACHO', 'PENCA', 'DUZIA', 'UNIDADE', 'SACO', 'TONELADA']).optional(),
  hoursWorked: z.number().optional(),
  cost:        z.number().optional(),
  notes:       z.string().optional(),
  confirmed:   z.boolean().default(false),
  syncStatus:  z.enum(['PENDING', 'SYNCED', 'CONFLICT']).default('SYNCED'),
})

export const updateActivitySchema = createActivitySchema.partial()

export type CreateActivityInput = z.infer<typeof createActivitySchema>
