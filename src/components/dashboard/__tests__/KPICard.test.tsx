import { render, screen } from '@testing-library/react'
import { KPICard } from '@/components/dashboard/KPICard'

describe('KPICard', () => {
  it('renders label and value', () => {
    render(<KPICard label="Receita" value="R$ 1.250,00" icon="💰" />)
    expect(screen.getByText('Receita')).toBeInTheDocument()
    expect(screen.getByText('R$ 1.250,00')).toBeInTheDocument()
  })

  it('renders icon', () => {
    render(<KPICard label="Colheitas" value={42} icon="🍌" />)
    expect(screen.getByText('🍌')).toBeInTheDocument()
  })

  it('renders subtitle when provided', () => {
    render(<KPICard label="Colheitas" value={42} icon="🍌" subtitle="12 atividades" />)
    expect(screen.getByText('12 atividades')).toBeInTheDocument()
  })
})
