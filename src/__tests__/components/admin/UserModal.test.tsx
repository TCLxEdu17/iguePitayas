/** @jest-environment jsdom */
import { render, screen } from '@testing-library/react'
import { UserModal } from '@/components/admin/UserModal'

jest.mock('@/lib/api-url', () => ({ getApiUrl: (path: string) => path }))

describe('UserModal', () => {
  it('renders create mode title when no user provided', () => {
    render(<UserModal open={true} onOpenChange={jest.fn()} onSuccess={jest.fn()} />)
    expect(screen.getByText(/Novo Usuário/i)).toBeInTheDocument()
  })

  it('renders edit mode title when user provided', () => {
    const user = { id: 'u1', name: 'João', email: 'j@test.com', role: 'ADMIN' as const, active: true, createdAt: new Date() }
    render(<UserModal open={true} onOpenChange={jest.fn()} user={user} onSuccess={jest.fn()} />)
    expect(screen.getByText(/Editar Usuário/i)).toBeInTheDocument()
  })

  it('shows password placeholder text in edit mode', () => {
    const user = { id: 'u1', name: 'João', email: 'j@test.com', role: 'ADMIN' as const, active: true, createdAt: new Date() }
    render(<UserModal open={true} onOpenChange={jest.fn()} user={user} onSuccess={jest.fn()} />)
    expect(screen.getByPlaceholderText(/Deixar em branco/i)).toBeInTheDocument()
  })
})
