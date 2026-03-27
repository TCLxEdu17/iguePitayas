import { render, screen } from '@testing-library/react'
import { Sidebar } from '@/components/layout/Sidebar'

jest.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}))

jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: { user: { role: 'ADMIN', name: 'Admin' } } }),
}))

describe('Sidebar', () => {
  it('renders navigation links', () => {
    render(<Sidebar />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Talhões')).toBeInTheDocument()
    expect(screen.getByText('Atividades')).toBeInTheDocument()
    expect(screen.getByText('Produção')).toBeInTheDocument()
    expect(screen.getByText('Relatórios')).toBeInTheDocument()
  })

  it('shows Configurações for ADMIN', () => {
    render(<Sidebar />)
    expect(screen.getByText('Configurações')).toBeInTheDocument()
  })
})
