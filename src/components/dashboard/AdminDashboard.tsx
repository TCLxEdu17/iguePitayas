'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import {
  TrendingUp, Wallet, ClipboardList, Sprout, WifiOff, Clock, TriangleAlert, Sun, Droplet,
} from 'lucide-react'
import { getApiUrl } from '@/lib/api-url'
import { ACTIVITY_LABELS, ACTIVITY_COLORS, unitLabel } from '@/types'
import type { ActivityType, Unit } from '@/types'
import { ACTIVITY_ICONS } from '@/lib/activity-icons'

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
const DIAS = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D']

export function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'week'],
    queryFn: () => fetch(getApiUrl('/api/dashboard?period=week')).then(r => r.json()),
    refetchInterval: 60_000,
  })

  const week = data?.week ?? {}
  const byDay: number[] = week.byDay ?? [0, 0, 0, 0, 0, 0, 0]
  const max = Math.max(1, ...byDay)
  const today = new Date().getDay()
  const todayIdx = today === 0 ? 6 : today - 1

  return (
    <div className="pb-6">
      <header className="px-5 pb-4 pt-1">
        <p className="text-[11px] font-semibold uppercase" style={{ letterSpacing: '.16em', color: 'var(--color-ink-faint)' }}>
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
        <h1 className="font-display text-[27px] font-bold">Bom dia{data?.userFirstName ? `, ${data.userFirstName}` : ''}</h1>
      </header>

      {/* colhido esta semana */}
      <section className="px-5">
        <div className="rounded-[22px] p-5"
          style={{ background: 'linear-gradient(160deg, #3D5A2E 0%, #1F2E15 100%)', color: 'var(--color-surface)', boxShadow: '0 18px 34px -18px rgba(31,46,21,.8)' }}>
          <div className="flex items-center justify-between">
            <p className="text-[11.5px] font-semibold uppercase" style={{ letterSpacing: '.14em', color: 'rgba(245,236,215,.6)' }}>
              Colhido esta semana
            </p>
            {week.deltaPct != null && (
              <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold"
                style={{ background: 'rgba(141,184,122,.22)', color: '#A8CC8C' }}>
                <TrendingUp size={13} strokeWidth={2.4} /> {Math.abs(week.deltaPct)}%
              </span>
            )}
          </div>
          <div className="mb-0.5 mt-2.5 flex items-baseline gap-2">
            <p className="font-display text-[46px] font-extrabold leading-none">
              {isLoading ? '—' : (week.totalBoxes ?? 0).toLocaleString('pt-BR')}
            </p>
            <p className="font-display text-[17px] font-semibold" style={{ color: 'var(--color-gold)' }}>caixas</p>
          </div>
          <p className="mb-4 text-[13.5px]" style={{ color: 'rgba(245,236,215,.65)' }}>
            {week.tons ? `≈ ${week.tons} t · ` : ''}{week.bunches ? `${week.bunches.toLocaleString('pt-BR')} cachos · ` : ''}
            {week.revenue != null ? `${brl(week.revenue)} em receita` : ''}
          </p>
          <div className="flex h-[76px] items-end gap-1.5">
            {byDay.map((v, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                <div className="w-full rounded-t-md"
                  style={{
                    height: Math.max(4, Math.round(v / max * 56)),
                    background: i === todayIdx ? 'linear-gradient(180deg,#D4A843,#C17A4A)' : 'rgba(168,204,140,.5)',
                  }} />
                <span className="text-[10.5px] font-semibold"
                  style={{ color: i === todayIdx ? 'var(--color-gold)' : 'rgba(245,236,215,.45)' }}>
                  {DIAS[i]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* o que foi feito hoje */}
      <section className="px-5 pt-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-[17px] font-bold">O que foi feito hoje</h2>
          <span className="text-[12.5px] font-semibold" style={{ color: 'var(--color-ink-faint)' }}>
            {(data?.today ?? []).length} lançamentos
          </span>
        </div>
        <div>
          {(data?.today ?? []).map((a: any) => {
            const type = a.type as ActivityType
            const Icon = ACTIVITY_ICONS[type] ?? ClipboardList
            const color = ACTIVITY_COLORS[type] ?? '#95A5A6'
            return (
              <div key={a.id} className="relative flex gap-3 pb-3.5">
                <div className="flex shrink-0 flex-col items-center">
                  <span className="flex h-[30px] w-[30px] items-center justify-center rounded-[10px]"
                    style={{ background: color + '1E', color }}>
                    <Icon size={17} strokeWidth={1.9} />
                  </span>
                  <span className="mt-1 w-[1.5px] flex-1" style={{ background: 'var(--color-line)' }} />
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-[14.5px] font-bold">{ACTIVITY_LABELS[type] ?? a.type}</p>
                    <span className="shrink-0 text-xs" style={{ color: 'var(--color-ink-faint)' }}>
                      {new Date(a.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[12.5px]" style={{ color: 'var(--color-ink-faint)' }}>
                    {a.plot?.site?.name} · {a.plot?.name} · {a.responsible}
                  </p>
                  {a.quantity != null && (
                    <p className="mt-1 text-[12.5px] font-bold" style={{ color }}>
                      {a.quantity.toLocaleString('pt-BR')} {a.unit ? unitLabel(a.unit as Unit, a.quantity) : ''}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        <Link href="/atividades/historico"
          className="flex items-center justify-center rounded-[14px] text-sm font-bold"
          style={{ height: 46, border: '1.5px solid var(--color-line-strong)', color: 'var(--color-primary)' }}>
          Ver todas as atividades
        </Link>
      </section>

      {/* semana em números */}
      <section className="px-5 pt-6">
        <h2 className="mb-3 font-display text-[17px] font-bold">Semana em números</h2>
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { label: 'Custo semana',   value: brl(week.cost ?? 0),  sub: week.costDelta ?? '',    Icon: Wallet,        color: '#C17A4A' },
            { label: 'Margem',         value: brl(week.margin ?? 0), sub: week.marginPct ?? '',   Icon: TrendingUp,    color: '#6E8F4E' },
            { label: 'Atividades',     value: String(week.activities ?? 0), sub: `${(data?.today ?? []).length} hoje`, Icon: ClipboardList, color: '#3498DB' },
            { label: 'Pés produzindo', value: (week.trees ?? 0).toLocaleString('pt-BR'), sub: `${week.plots ?? 0} talhões`, Icon: Sprout, color: '#4E7038' },
          ].map(k => (
            <div key={k.label} className="rounded-[18px] p-4" style={{ background: '#FFFDF8', border: '1px solid var(--color-line)' }}>
              <div className="mb-2 flex items-center gap-1.5">
                <k.Icon size={16} strokeWidth={1.9} color={k.color} />
                <span className="text-[11.5px] font-semibold uppercase" style={{ letterSpacing: '.08em', color: 'var(--color-ink-faint)' }}>
                  {k.label}
                </span>
              </div>
              <p className="font-display text-[22px] font-bold">{k.value}</p>
              <p className="mt-0.5 text-xs" style={{ color: k.color }}>{k.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* por sítio */}
      <section className="px-5 pt-6">
        <h2 className="mb-3 font-display text-[17px] font-bold">Por sítio</h2>
        <div className="flex flex-col gap-4 rounded-[20px] p-4" style={{ background: '#FFFDF8', border: '1px solid var(--color-line)' }}>
          {(data?.bySite ?? []).map((s: any, i: number) => {
            const total = Math.max(1, ...(data?.bySite ?? []).map((x: any) => x.boxes))
            const colors = ['#3D5A2E', '#6E8F4E', '#C17A4A']
            return (
              <div key={s.id ?? i}>
                <div className="mb-1.5 flex items-baseline justify-between">
                  <p className="text-sm font-bold">{s.name}</p>
                  <p className="text-[13px]" style={{ color: 'var(--color-ink-soft)' }}>{s.boxes} cx</p>
                </div>
                <div className="h-[9px] overflow-hidden rounded-md" style={{ background: '#F0E7D2' }}>
                  <div className="h-full rounded-md" style={{ width: `${Math.round(s.boxes / total * 100)}%`, background: colors[i % 3] }} />
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* precisa de olho */}
      <section className="px-5 pt-6">
        <h2 className="mb-3 font-display text-[17px] font-bold">Precisa de olho</h2>
        <div className="flex flex-col gap-2.5">
          {(data?.alerts ?? []).map((a: any, i: number) => {
            const tone = a.kind === 'sync'
              ? { Icon: WifiOff, color: '#B87708', bg: 'rgba(243,156,18,.1)', bd: 'rgba(243,156,18,.3)' }
              : a.kind === 'idle'
                ? { Icon: Clock, color: '#C0392B', bg: 'rgba(192,57,43,.08)', bd: 'rgba(192,57,43,.25)' }
                : { Icon: TriangleAlert, color: '#A8632F', bg: 'rgba(193,122,74,.1)', bd: 'rgba(193,122,74,.28)' }
            return (
              <div key={i} className="flex gap-3 rounded-2xl p-3.5" style={{ background: tone.bg, border: `1px solid ${tone.bd}` }}>
                <tone.Icon size={19} strokeWidth={1.9} color={tone.color} className="mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-bold">{a.title}</p>
                  <p className="mt-0.5 text-[12.5px]" style={{ color: 'var(--color-ink-soft)' }}>{a.text}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* clima + dica */}
      <section className="flex gap-2.5 px-5 pt-6">
        <div className="flex-1 rounded-[18px] p-4" style={{ background: 'linear-gradient(150deg, #C17A4A, #A8632F)', color: '#FFF8EC' }}>
          <Sun size={20} strokeWidth={1.8} />
          <p className="mt-2.5 font-display text-[26px] font-bold">{data?.weather?.temp ?? '—'}°</p>
          <p className="mt-0.5 text-[12.5px]" style={{ color: 'rgba(255,248,236,.8)' }}>{data?.weather?.summary ?? ''}</p>
        </div>
        <div className="flex-1 rounded-[18px] p-4" style={{ background: '#2C3E1F', color: 'var(--color-surface)' }}>
          <Droplet size={20} strokeWidth={1.8} color="#D4A843" />
          <p className="mt-2.5 text-[13px]" style={{ color: 'rgba(245,236,215,.85)' }}>{data?.tip ?? ''}</p>
        </div>
      </section>
    </div>
  )
}
