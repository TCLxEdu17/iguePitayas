export const UNITS = [
  'KG', 'LITRO', 'CACHO', 'UNIDADE', 'SACO', 'CAIXA',
] as const
export type Unit = typeof UNITS[number]

export const UNIT_LABELS: Record<Unit, string> = {
  KG: 'kg',
  LITRO: 'litro',
  CACHO: 'cacho',
  UNIDADE: 'unidade',
  SACO: 'saco',
  CAIXA: 'caixa',
}

const UNIT_PLURAL_LABELS: Record<Unit, string> = {
  KG: 'kg',
  LITRO: 'litros',
  CACHO: 'cachos',
  UNIDADE: 'unidades',
  SACO: 'sacos',
  CAIXA: 'caixas',
}

/** Returns singular for qty=1, plural otherwise */
export function unitLabel(unit: Unit, qty: number): string {
  return qty === 1 ? UNIT_LABELS[unit] : UNIT_PLURAL_LABELS[unit]
}

export const ACTIVITY_TYPES = [
  'CORTE_BANANA', 'PULVERIZACAO_FOLHAS', 'PULVERIZACAO_CACHOS', 'ADUBACAO',
  'ROCADA', 'DESFOLHA', 'DESBASTE_MUDAS', 'ENSACAMENTO', 'ESCORAMENTO',
  'PLANTIO', 'REPLANTIO', 'COROAMENTO', 'LIMPEZA_ACEIRO', 'LIMPEZA_VALA', 'OUTRO',
] as const
export type ActivityType = typeof ACTIVITY_TYPES[number]

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  CORTE_BANANA:        'Corte de Banana',
  PULVERIZACAO_FOLHAS: 'Pulverização de folhas',
  PULVERIZACAO_CACHOS: 'Pulverização de cachos',
  ADUBACAO:            'Adubação',
  ROCADA:              'Roçada',
  DESFOLHA:            'Desfolha',
  DESBASTE_MUDAS:      'Desbaste de Mudas',
  ENSACAMENTO:         'Ensacamento',
  ESCORAMENTO:         'Escoramento',
  PLANTIO:             'Plantio',
  REPLANTIO:           'Replantio',
  COROAMENTO:          'Coroamento',
  LIMPEZA_ACEIRO:      'Limpeza Aceiro',
  LIMPEZA_VALA:        'Limpeza de vala',
  OUTRO:               'Outros',
}

export const ACTIVITY_COLORS: Record<ActivityType, string> = {
  CORTE_BANANA:        '#27AE60',
  PULVERIZACAO_FOLHAS: '#3498DB',
  PULVERIZACAO_CACHOS: '#2E86C1',
  ADUBACAO:            '#8B6F3E',
  ROCADA:              '#9B59B6',
  DESFOLHA:            '#6E8F4E',
  DESBASTE_MUDAS:      '#4E7038',
  ENSACAMENTO:         '#C17A4A',
  ESCORAMENTO:         '#8A7B5A',
  PLANTIO:             '#16A085',
  REPLANTIO:           '#1ABC9C',
  COROAMENTO:          '#D4A843',
  LIMPEZA_ACEIRO:      '#7F8C8D',
  LIMPEZA_VALA:        '#5D6D7E',
  OUTRO:               '#95A5A6',
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

// Activity types that generate revenue (sale/harvest), not expense
export const REVENUE_ACTIVITY_TYPES = ['CORTE_BANANA'] as const

/** Suggested default unit for each activity type */
export const ACTIVITY_DEFAULT_UNIT: Record<ActivityType, Unit> = {
  CORTE_BANANA:        'CACHO',
  PULVERIZACAO_FOLHAS: 'LITRO',
  PULVERIZACAO_CACHOS: 'LITRO',
  ADUBACAO:            'SACO',
  ROCADA:              'UNIDADE',
  DESFOLHA:            'UNIDADE',
  DESBASTE_MUDAS:      'UNIDADE',
  ENSACAMENTO:         'CACHO',
  ESCORAMENTO:         'UNIDADE',
  PLANTIO:             'UNIDADE',
  REPLANTIO:           'UNIDADE',
  COROAMENTO:          'UNIDADE',
  LIMPEZA_ACEIRO:      'UNIDADE',
  LIMPEZA_VALA:        'UNIDADE',
  OUTRO:               'UNIDADE',
}
