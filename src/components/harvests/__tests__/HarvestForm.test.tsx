import { render, screen } from '@testing-library/react'
import { HarvestForm } from '@/components/harvests/HarvestForm'

jest.mock('uuid', () => ({ v4: () => 'test-uuid' }))
jest.mock('@tanstack/react-query', () => ({
  useQuery: () => ({
    data: [{ id: 'p1', code: 'T01', name: 'Talhão 01', productType: 'BANANA_PRATA' }],
  }),
}))
jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: { user: { id: 'u1' } } }),
}))
jest.mock('next/navigation', () => ({ useRouter: () => ({ back: jest.fn() }) }))
jest.mock('@/lib/offline/db', () => ({
  offlineDb: { harvests: { add: jest.fn(), update: jest.fn() } },
}))
jest.mock('@/lib/offline/sync', () => ({
  getPendingCount: jest.fn().mockResolvedValue(0),
}))
jest.mock('@/stores/sync.store', () => ({
  useSyncStore: (selector: any) => selector({ setPending: jest.fn() }),
}))

describe('HarvestForm', () => {
  it('renders talhão selector', () => {
    render(<HarvestForm />)
    expect(screen.getByText('Selecione o talhão')).toBeInTheDocument()
  })

  it('renders quantity field', () => {
    render(<HarvestForm />)
    expect(screen.getByLabelText(/quantidade/i)).toBeInTheDocument()
  })

  it('renders price field', () => {
    render(<HarvestForm />)
    expect(screen.getByLabelText(/preço por unidade/i)).toBeInTheDocument()
  })

  it('renders submit button', () => {
    render(<HarvestForm />)
    expect(screen.getByRole('button', { name: /registrar colheita/i })).toBeInTheDocument()
  })
})
