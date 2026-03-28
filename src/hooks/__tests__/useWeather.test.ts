/**
 * @jest-environment node
 */
import { weatherIcon } from '@/hooks/useWeather'

describe('weatherIcon', () => {
  it('returns sun for clear sky (code 0)', () => {
    expect(weatherIcon(0)).toBe('☀️')
  })

  it('returns partly cloudy for codes 1-3', () => {
    expect(weatherIcon(1)).toBe('⛅')
    expect(weatherIcon(3)).toBe('⛅')
  })

  it('returns fog for codes 45-48', () => {
    expect(weatherIcon(45)).toBe('🌫️')
    expect(weatherIcon(48)).toBe('🌫️')
  })

  it('returns rain for codes 51-67', () => {
    expect(weatherIcon(51)).toBe('🌦️')
    expect(weatherIcon(67)).toBe('🌦️')
  })

  it('returns heavy rain for codes 80-82', () => {
    expect(weatherIcon(80)).toBe('🌧️')
    expect(weatherIcon(82)).toBe('🌧️')
  })

  it('returns thunderstorm for codes 95-99', () => {
    expect(weatherIcon(95)).toBe('⛈️')
    expect(weatherIcon(99)).toBe('⛈️')
  })
})
