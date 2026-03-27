import { z } from 'zod'

export const createHarvestSchema = z.object({
  localId:      z.string().min(1),
  plotId:       z.string().min(1),
  date:         z.string().min(1),
  quantity:     z.number().positive('Quantidade deve ser maior que zero'),
  unit:         z.enum(['CAIXA', 'UNIDADE']),
  pricePerUnit: z.number().nonnegative(),
  totalRevenue: z.number().nonnegative(),
  notes:        z.string().optional(),
  syncStatus:   z.enum(['PENDING', 'SYNCED', 'CONFLICT']).default('SYNCED'),
})

export const updateHarvestSchema = createHarvestSchema.partial()

export type CreateHarvestInput = z.infer<typeof createHarvestSchema>
