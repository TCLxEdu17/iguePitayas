import { getTipOfTheDay } from '@/lib/tips'

export function DailyTipCard() {
  const tip = getTipOfTheDay()
  const isBanana = tip.tipo === 'banana'

  return (
    <div
      className="rounded-xl p-4 border"
      style={{
        backgroundColor: isBanana ? '#FDF3E3' : '#FDE8F0',
        borderColor:     isBanana ? '#D4A843'  : '#E91E8C',
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{isBanana ? '🍌' : '🌵'}</span>
        <span
          className="text-xs font-semibold uppercase tracking-wide"
          style={{ color: isBanana ? '#C17A4A' : '#C0166E' }}
        >
          Dica do Dia — {isBanana ? 'Banana' : 'Pitaya'}
        </span>
      </div>

      <h3
        className="font-bold text-sm mb-1"
        style={{ color: isBanana ? '#2C3E1F' : '#2C1F2E' }}
      >
        {tip.titulo}
      </h3>

      <p className="text-sm mb-2" style={{ color: '#3D3D3D' }}>
        {tip.dica}
      </p>

      <p
        className="text-xs italic"
        style={{ color: isBanana ? '#C17A4A' : '#C0166E' }}
      >
        💡 {tip.curiosidade}
      </p>
    </div>
  )
}
