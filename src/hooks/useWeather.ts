'use client'

import { useQuery } from '@tanstack/react-query'

const LAT = -24.29
const LNG = -47.17

export interface WeatherCurrent {
  temperature: number
  apparentTemperature: number
  weathercode: number
  windspeed: number
}

export interface WeatherDay {
  date: string
  weathercode: number
  tempMax: number
  tempMin: number
  precipitation: number
}

export interface WeatherData {
  current: WeatherCurrent
  daily: WeatherDay[]
}

export function weatherIcon(code: number): string {
  if (code === 0) return '☀️'
  if (code <= 3) return '⛅'
  if (code <= 48) return '🌫️'
  if (code <= 67) return '🌦️'
  if (code <= 77) return '❄️'
  if (code <= 82) return '🌧️'
  return '⛈️'
}

async function fetchWeather(): Promise<WeatherData> {
  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.searchParams.set('latitude', String(LAT))
  url.searchParams.set('longitude', String(LNG))
  url.searchParams.set('current', 'temperature_2m,apparent_temperature,weathercode,windspeed_10m')
  url.searchParams.set('daily', 'weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum')
  url.searchParams.set('timezone', 'America/Sao_Paulo')
  url.searchParams.set('forecast_days', '4')

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`Weather fetch failed: ${res.status}`)
  const json = await res.json()

  return {
    current: {
      temperature: json.current.temperature_2m,
      apparentTemperature: json.current.apparent_temperature,
      weathercode: json.current.weathercode,
      windspeed: json.current.windspeed_10m,
    },
    daily: (json.daily.time as string[]).map((date, i) => ({
      date,
      weathercode: json.daily.weathercode[i] as number,
      tempMax: json.daily.temperature_2m_max[i] as number,
      tempMin: json.daily.temperature_2m_min[i] as number,
      precipitation: json.daily.precipitation_sum[i] as number,
    })),
  }
}

export function useWeather() {
  return useQuery<WeatherData>({
    queryKey: ['weather'],
    queryFn: fetchWeather,
    staleTime: 30 * 60 * 1000,
  })
}
