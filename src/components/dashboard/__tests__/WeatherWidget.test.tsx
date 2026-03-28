import { render, screen } from '@testing-library/react'
import { WeatherWidget } from '@/components/dashboard/WeatherWidget'
import * as weatherHook from '@/hooks/useWeather'

jest.mock('@/hooks/useWeather')

const mockUseWeather = weatherHook.useWeather as jest.MockedFunction<typeof weatherHook.useWeather>

const mockData: weatherHook.WeatherData = {
  current: { temperature: 28, apparentTemperature: 30, weathercode: 0, windspeed: 10 },
  daily: [
    { date: '2026-03-28', weathercode: 0, tempMax: 32, tempMin: 22, precipitation: 0 },
    { date: '2026-03-29', weathercode: 80, tempMax: 28, tempMin: 20, precipitation: 5 },
    { date: '2026-03-30', weathercode: 3, tempMax: 27, tempMin: 19, precipitation: 0 },
    { date: '2026-03-31', weathercode: 1, tempMax: 30, tempMin: 21, precipitation: 0 },
  ],
}

describe('WeatherWidget', () => {
  it('shows loading skeleton when pending', () => {
    mockUseWeather.mockReturnValue({ isPending: true, isError: false, data: undefined } as any)
    const { container } = render(<WeatherWidget />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('returns null on error', () => {
    mockUseWeather.mockReturnValue({ isPending: false, isError: true, data: undefined } as any)
    const { container } = render(<WeatherWidget />)
    expect(container.firstChild).toBeNull()
  })

  it('renders current temperature', () => {
    mockUseWeather.mockReturnValue({ isPending: false, isError: false, data: mockData } as any)
    render(<WeatherWidget />)
    expect(screen.getByText('28°C')).toBeInTheDocument()
  })

  it('renders rain alert when precipitation > 0 tomorrow', () => {
    mockUseWeather.mockReturnValue({ isPending: false, isError: false, data: mockData } as any)
    render(<WeatherWidget />)
    expect(screen.getByText(/Chuva prevista/)).toBeInTheDocument()
  })

  it('does not show rain alert when no precipitation', () => {
    const noRainData = {
      ...mockData,
      daily: mockData.daily.map(d => ({ ...d, precipitation: 0 })),
    }
    mockUseWeather.mockReturnValue({ isPending: false, isError: false, data: noRainData } as any)
    render(<WeatherWidget />)
    expect(screen.queryByText(/Chuva prevista/)).toBeNull()
  })

  it('renders location label', () => {
    mockUseWeather.mockReturnValue({ isPending: false, isError: false, data: mockData } as any)
    render(<WeatherWidget />)
    expect(screen.getByText('Itariri, SP')).toBeInTheDocument()
  })
})
