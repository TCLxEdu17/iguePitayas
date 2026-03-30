/** @jest-environment jsdom */
import { render, screen } from '@testing-library/react'
import AdminUsuariosPage from '@/app/(app)/admin/usuarios/page'

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({ data: { user: { id: 'u1', role: 'ADMIN', name: 'Admin' } }, status: 'authenticated' })),
}))
jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(() => ({ data: [], isPending: false })),
  useMutation: jest.fn(() => ({ mutate: jest.fn(), isPending: false })),
  useQueryClient: jest.fn(() => ({ invalidateQueries: jest.fn() })),
}))
jest.mock('@/lib/api-url', () => ({ getApiUrl: (path: string) => path }))
jest.mock('@/components/admin/UserList', () => ({
  UserList: () => <div data-testid="user-list" />,
}))
jest.mock('@/components/admin/UserModal', () => ({
  UserModal: () => <div data-testid="user-modal" />,
}))

describe('AdminUsuariosPage', () => {
  it('renders page title', () => {
    render(<AdminUsuariosPage />)
    expect(screen.getByText(/Usuários/i)).toBeInTheDocument()
  })

  it('renders UserList and UserModal', () => {
    render(<AdminUsuariosPage />)
    expect(screen.getByTestId('user-list')).toBeInTheDocument()
    expect(screen.getByTestId('user-modal')).toBeInTheDocument()
  })

  it('shows access restricted for non-ADMIN', () => {
    const { useSession } = require('next-auth/react')
    useSession.mockReturnValue({ data: { user: { id: 'u1', role: 'OPERATOR' } }, status: 'authenticated' })
    render(<AdminUsuariosPage />)
    expect(screen.getByText(/Acesso restrito/i)).toBeInTheDocument()
  })
})
