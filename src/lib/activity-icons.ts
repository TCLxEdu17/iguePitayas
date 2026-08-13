import {
  Droplets, Sprout, Scissors, Leaf, Package, Ruler, ClipboardList, Banana, Wind,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ActivityType } from '@/types'

export const ACTIVITY_ICONS: Record<ActivityType, LucideIcon> = {
  CORTE_BANANA:        Banana,
  PULVERIZACAO_FOLHAS: Droplets,
  PULVERIZACAO_CACHOS: Droplets,
  ADUBACAO:            Sprout,
  ROCADA:              Scissors,
  DESFOLHA:            Leaf,
  DESBASTE_MUDAS:      Sprout,
  ENSACAMENTO:         Package,
  ESCORAMENTO:         Ruler,
  PLANTIO:             Sprout,
  REPLANTIO:           Sprout,
  COROAMENTO:          Wind,
  LIMPEZA_ACEIRO:      Scissors,
  LIMPEZA_VALA:        Scissors,
  OUTRO:               ClipboardList,
}
