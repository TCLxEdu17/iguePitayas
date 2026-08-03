import {
  Droplets, Sprout, Scissors, Leaf, Package, Ruler, ClipboardList,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ActivityType } from '@/types'

export const ACTIVITY_ICONS: Record<ActivityType, LucideIcon> = {
  PULVERIZACAO:    Droplets,
  ADUBACAO:        Sprout,
  ROCAGEM:         Scissors,
  DESFOLHA:        Leaf,
  DESBASTE:        Sprout,
  ENSACAMENTO:     Package,
  ESCORA:          Ruler,
  IRRIGACAO:       Droplets,
  RETIRADA_BANANA: Leaf,
  RETIRADA_CAIXAS: Package,
  PLANTIO:         Sprout,
  OUTRO:           ClipboardList,
}
