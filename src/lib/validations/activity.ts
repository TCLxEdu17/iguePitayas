import { z } from 'zod'

export const createActivitySchema = z.object({
  localId:     z.string().min(1),
  plotId:      z.string().min(1),
  date:        z.string().min(1),
  type:        z.enum(['CORTE_BANANA', 'PULVERIZACAO_FOLHAS', 'PULVERIZACAO_CACHOS', 'ADUBACAO', 'ROCADA', 'DESFOLHA', 'DESBASTE_MUDAS', 'ENSACAMENTO', 'ESCORAMENTO', 'PLANTIO', 'REPLANTIO', 'COROAMENTO', 'LIMPEZA_ACEIRO', 'LIMPEZA_VALA', 'OUTRO']),
  responsible: z.string().min(1),
  quantity:    z.number().optional(),
  unit:        z.enum(['KG', 'LITRO', 'CACHO', 'UNIDADE', 'SACO', 'CAIXA']).optional(),
  hoursWorked: z.number().optional(),
  cost:        z.number().optional(),
  notes:       z.string().optional(),
  confirmed:   z.boolean().default(false),
  syncStatus:  z.enum(['PENDING', 'SYNCED', 'CONFLICT']).default('SYNCED'),
})

export const updateActivitySchema = createActivitySchema.partial()

export type CreateActivityInput = z.infer<typeof createActivitySchema>
