export const UNITS = [
  'KG', 'CAIXA', 'CACHO', 'PENCA', 'DUZIA', 'UNIDADE', 'SACO', 'TONELADA',
] as const
export type Unit = typeof UNITS[number]

export const UNIT_LABELS: Record<Unit, string> = {
  KG: 'kg',
  CAIXA: 'caixa',
  CACHO: 'cacho',
  PENCA: 'penca',
  DUZIA: 'dúzia',
  UNIDADE: 'unidade',
  SACO: 'saco',
  TONELADA: 'tonelada',
}

const UNIT_PLURAL_LABELS: Record<Unit, string> = {
  KG: 'kg',
  CAIXA: 'caixas',
  CACHO: 'cachos',
  PENCA: 'pencas',
  DUZIA: 'dúzias',
  UNIDADE: 'unidades',
  SACO: 'sacos',
  TONELADA: 'toneladas',
}

/** Returns singular for qty=1, plural otherwise */
export function unitLabel(unit: Unit, qty: number): string {
  return qty === 1 ? UNIT_LABELS[unit] : UNIT_PLURAL_LABELS[unit]
}

export const ACTIVITY_TYPES = [
  'PULVERIZACAO', 'ADUBACAO', 'ROCAGEM', 'DESFOLHA', 'DESBASTE', 'ENSACAMENTO',
  'ESCORA', 'IRRIGACAO', 'RETIRADA_BANANA', 'RETIRADA_CAIXAS', 'PLANTIO', 'OUTRO',
] as const
export type ActivityType = typeof ACTIVITY_TYPES[number]

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  PULVERIZACAO:    'Pulverização',
  ADUBACAO:        'Adubação',
  ROCAGEM:         'Roçagem',
  DESFOLHA:        'Desfolha',
  DESBASTE:        'Desbaste',
  ENSACAMENTO:     'Ensacamento',
  ESCORA:          'Escora',
  IRRIGACAO:       'Irrigação',
  RETIRADA_BANANA: 'Retirada de banana',
  RETIRADA_CAIXAS: 'Retirada de caixas',
  PLANTIO:         'Plantio',
  OUTRO:           'Outro',
}

export const ACTIVITY_COLORS: Record<ActivityType, string> = {
  PULVERIZACAO:    '#3498DB',
  ADUBACAO:        '#8B6F3E',
  ROCAGEM:         '#9B59B6',
  DESFOLHA:        '#6E8F4E',
  DESBASTE:        '#4E7038',
  ENSACAMENTO:     '#C17A4A',
  ESCORA:          '#8A7B5A',
  IRRIGACAO:       '#2E86C1',
  RETIRADA_BANANA: '#27AE60',
  RETIRADA_CAIXAS: '#F39C12',
  PLANTIO:         '#16A085',
  OUTRO:           '#95A5A6',
}

export const PRODUCT_LABELS = {
  BANANA_PRATA:  'Banana prata',
  BANANA_NANICA: 'Banana nanica',
  PITAYA:        'Pitaya',
} as const

export const PRODUCT_COLORS = {
  BANANA_PRATA:  '#8DB87A',
  BANANA_NANICA: '#D4A843',
  PITAYA:        '#E91E8C',
} as const

// Activity types that generate revenue (sale/withdrawal), not expense
export const REVENUE_ACTIVITY_TYPES = ['RETIRADA_CAIXAS', 'RETIRADA_BANANA'] as const

/** Suggested default unit for each activity type */
export const ACTIVITY_DEFAULT_UNIT: Record<ActivityType, Unit> = {
  PULVERIZACAO:    'UNIDADE',
  ADUBACAO:        'SACO',
  ROCAGEM:         'UNIDADE',
  DESFOLHA:        'UNIDADE',
  DESBASTE:        'CACHO',
  ENSACAMENTO:     'CACHO',
  ESCORA:          'UNIDADE',
  IRRIGACAO:       'UNIDADE',
  RETIRADA_BANANA: 'CACHO',
  RETIRADA_CAIXAS: 'CAIXA',
  PLANTIO:         'UNIDADE',
  OUTRO:           'UNIDADE',
}
