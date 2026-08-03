import { z } from 'zod'

const ALL_UNITS = ['KG', 'CAIXA', 'CACHO', 'PENCA', 'DUZIA', 'UNIDADE', 'SACO', 'TONELADA'] as const
const ALL_PRODUCTS = ['BANANA_PRATA', 'BANANA_NANICA', 'PITAYA'] as const

export const createHarvestSchema = z.object({
  localId:     z.string().min(1),
  plotId:      z.string().min(1),
  date:        z.string().min(1),
  quantity:    z.number().positive('Quantidade deve ser maior que zero'),
  unit:        z.enum(ALL_UNITS),
  productType: z.enum(ALL_PRODUCTS).optional(),
  notes:       z.string().optional(),
  syncStatus:  z.enum(['PENDING', 'SYNCED', 'CONFLICT']).default('SYNCED'),
})

export const updateHarvestSchema = createHarvestSchema.partial()
export type CreateHarvestInput = z.infer<typeof createHarvestSchema>
