'use client'

import { useWeather, weatherIcon } from '@/hooks/useWeather'

export function WeatherWidget() {
  const { data, isPending, isError } = useWeather()

  if (isPending) {
    return <div className="h-28 rounded-lg bg-muted animate-pulse" />
  }

  if (isError || !data) return null

  const today = data.daily[0]
  const hasRain = today.precipitation > 0 || (data.daily[1]?.precipitation ?? 0) > 0

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      {hasRain && (
        <div className="mb-3 rounded-md bg-yellow-50 border border-yellow-200 px-3 py-2 text-sm text-yellow-800">
          ⚠️ Chuva prevista — evitar pulverização
        </div>
      )}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Itariri, SP</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>
              {Math.round(data.current.temperature)}°C
            </p>
            <p className="text-sm text-muted-foreground">
              Sensação {Math.round(data.current.apparentTemperature)}°C
            </p>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {Math.round(today.tempMin)}° / {Math.round(today.tempMax)}°
          </p>
        </div>
        <span className="text-5xl">{weatherIcon(data.current.weathercode)}</span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 border-t pt-3">
        {data.daily.slice(1).map((day) => (
          <div key={day.date} className="flex flex-col items-center gap-1 text-xs">
            <p className="text-muted-foreground">
              {new Date(day.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short' })}
            </p>
            <span className="text-xl">{weatherIcon(day.weathercode)}</span>
            <p>{Math.round(day.tempMin)}° / {Math.round(day.tempMax)}°</p>
          </div>
        ))}
      </div>
    </div>
  )
}
