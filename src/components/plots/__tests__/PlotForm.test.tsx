import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PlotForm } from '@/components/plots/PlotForm'

const mockMutate = jest.fn()
jest.mock('@tanstack/react-query', () => ({
  useMutation: () => ({ mutate: mockMutate, isPending: false, isError: false }),
  useQueryClient: () => ({ invalidateQueries: jest.fn() }),
}))
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn(), back: jest.fn() }) }))

describe('PlotForm', () => {
  it('renders required fields', () => {
    render(<PlotForm />)
    expect(screen.getByLabelText(/código/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/nome/i)).toBeInTheDocument()
  })

  it('shows validation error when code is empty on submit', async () => {
    render(<PlotForm />)
    fireEvent.click(screen.getByRole('button', { name: /salvar/i }))
    await waitFor(() => {
      expect(screen.getByText(/código obrigatório/i)).toBeInTheDocument()
    })
  })
})
