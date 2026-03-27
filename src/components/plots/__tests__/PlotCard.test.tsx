import { render, screen } from '@testing-library/react'
import { PlotCard } from '@/components/plots/PlotCard'

const mockPlot = {
  id: '1',
  code: 'T01',
  name: 'Talhão 01',
  productType: 'BANANA_PRATA',
  area: 1500,
  status: 'ACTIVE',
  _count: { activities: 3, harvests: 2 },
}

describe('PlotCard', () => {
  it('renders plot code and name', () => {
    render(<PlotCard plot={mockPlot} />)
    expect(screen.getByText('T01')).toBeInTheDocument()
    expect(screen.getByText('Talhão 01')).toBeInTheDocument()
  })

  it('renders product badge', () => {
    render(<PlotCard plot={mockPlot} />)
    expect(screen.getByText('Banana Prata')).toBeInTheDocument()
  })

  it('renders area', () => {
    render(<PlotCard plot={mockPlot} />)
    expect(screen.getByText(/1\.500/)).toBeInTheDocument()
  })

  it('renders activity and harvest counts', () => {
    render(<PlotCard plot={mockPlot} />)
    expect(screen.getByText(/3 atividades/)).toBeInTheDocument()
  })
})
