/** @jest-environment jsdom */
import { render, screen } from '@testing-library/react'
import { UserList } from '@/components/admin/UserList'

const mockUsers = [
  { id: 'u1', name: 'Admin User', email: 'admin@test.com', role: 'ADMIN' as const, active: true, createdAt: new Date() },
  { id: 'u2', name: 'Viewer User', email: 'viewer@test.com', role: 'VIEWER' as const, active: false, createdAt: new Date() },
]

describe('UserList', () => {
  it('renders all users', () => {
    render(<UserList users={mockUsers} currentUserId="u1" onEdit={jest.fn()} onToggleActive={jest.fn()} />)
    expect(screen.getByText('Admin User')).toBeInTheDocument()
    expect(screen.getByText('Viewer User')).toBeInTheDocument()
  })

  it('shows Ativo/Inativo status correctly', () => {
    render(<UserList users={mockUsers} currentUserId="u1" onEdit={jest.fn()} onToggleActive={jest.fn()} />)
    expect(screen.getByText('Ativo')).toBeInTheDocument()
    expect(screen.getByText('Inativo')).toBeInTheDocument()
  })

  it('shows role labels in Portuguese', () => {
    render(<UserList users={mockUsers} currentUserId="u1" onEdit={jest.fn()} onToggleActive={jest.fn()} />)
    expect(screen.getByText('Admin')).toBeInTheDocument()
    expect(screen.getByText('Visualizador')).toBeInTheDocument()
  })
})
