import type { User, Plot, Activity, Harvest, Farm, ProductType } from '@prisma/client'

export type { User, Plot, Activity, Harvest, Farm, ProductType }

export type UserWithoutPassword = Omit<User, 'passwordHash'>

export type PlotWithDetails = Plot & {
  activities: Activity[]
  harvests: Harvest[]
}

export const PRODUCT_LABELS: Record<string, string> = {
  BANANA_PRATA:  'Banana Prata',
  BANANA_NANICA: 'Banana Nanica',
  PITAYA:        'Pitaya',
}

export const PRODUCT_COLORS: Record<string, string> = {
  BANANA_PRATA:  '#27AE60',
  BANANA_NANICA: '#F4D03F',
  PITAYA:        '#E91E8C',
}

export const ACTIVITY_LABELS: Record<string, string> = {
  PULVERIZACAO:    'Pulverização',
  ROCAGEM:         'Roçagem',
  RETIRADA_BANANA: 'Retirada de Banana',
  RETIRADA_CAIXAS: 'Retirada de Caixas',
  OUTRO:           'Outro',
}

export const UNIT_LABELS: Record<string, string> = {
  CAIXA:   'Caixa',
  UNIDADE: 'Unidade',
}
