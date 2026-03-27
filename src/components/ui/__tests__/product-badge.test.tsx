import { render, screen } from '@testing-library/react'
import { ProductBadge } from '@/components/ui/product-badge'

describe('ProductBadge', () => {
  it('renders Banana Prata label', () => {
    render(<ProductBadge productType="BANANA_PRATA" />)
    expect(screen.getByText('Banana Prata')).toBeInTheDocument()
  })

  it('renders Banana Nanica label', () => {
    render(<ProductBadge productType="BANANA_NANICA" />)
    expect(screen.getByText('Banana Nanica')).toBeInTheDocument()
  })

  it('renders Pitaya label', () => {
    render(<ProductBadge productType="PITAYA" />)
    expect(screen.getByText('Pitaya')).toBeInTheDocument()
  })

  it('renders unknown type as-is', () => {
    render(<ProductBadge productType="UNKNOWN" />)
    expect(screen.getByText('UNKNOWN')).toBeInTheDocument()
  })
})
