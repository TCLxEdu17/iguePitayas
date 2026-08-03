import { PRODUCT_LABELS, PRODUCT_COLORS } from '@/types'

interface ProductBadgeProps {
  productType: string
  className?: string
}

export function ProductBadge({ productType, className }: ProductBadgeProps) {
  const label = PRODUCT_LABELS[productType as keyof typeof PRODUCT_LABELS] ?? productType
  const color = PRODUCT_COLORS[productType as keyof typeof PRODUCT_COLORS] ?? '#888'

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-white ${className ?? ''}`}
      style={{ backgroundColor: color }}
    >
      {label}
    </span>
  )
}
