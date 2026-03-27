import { render, screen } from '@testing-library/react'
import { ActivityForm } from '@/components/activities/ActivityForm'

jest.mock('uuid', () => ({
  v4: () => 'test-uuid-1234',
}))

jest.mock('@tanstack/react-query', () => ({
  useQuery: () => ({
    data: [
      { id: 'p1', code: 'T01', name: 'Talhão 01', productType: 'BANANA_PRATA' },
    ],
  }),
}))

jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: { user: { id: 'u1', name: 'Admin' } } }),
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({ back: jest.fn() }),
}))

jest.mock('@/lib/offline/db', () => ({
  offlineDb: {
    activities: {
      add: jest.fn(),
      update: jest.fn(),
    },
  },
}))

jest.mock('@/lib/offline/sync', () => ({
  getPendingCount: jest.fn().mockResolvedValue(0),
}))

jest.mock('@/stores/sync.store', () => ({
  useSyncStore: (selector: any) => selector({ pendingCount: 0, setPending: jest.fn() }),
}))

describe('ActivityForm', () => {
  it('renders talhão selector', () => {
    render(<ActivityForm />)
    expect(screen.getByText('Selecione o talhão')).toBeInTheDocument()
  })

  it('renders date field', () => {
    render(<ActivityForm />)
    expect(screen.getByLabelText(/data/i)).toBeInTheDocument()
  })

  it('renders responsible field', () => {
    render(<ActivityForm />)
    expect(screen.getByLabelText(/responsável/i)).toBeInTheDocument()
  })

  it('renders submit button', () => {
    render(<ActivityForm />)
    expect(screen.getByRole('button', { name: /registrar atividade/i })).toBeInTheDocument()
  })
})
