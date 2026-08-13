'use client'

import { useQuery } from '@tanstack/react-query'
import { useRef, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  TrendingUp, Wallet, ClipboardList, Sprout, WifiOff, Clock, TriangleAlert, Sun, Droplet,
} from 'lucide-react'
import { getApiUrl } from '@/lib/api-url'
import { ACTIVITY_LABELS, ACTIVITY_COLORS, unitLabel } from '@/types'
import type { ActivityType, Unit } from '@/types'
import { ACTIVITY_ICONS } from '@/lib/activity-icons'
import { useSyncStore } from '@/stores/sync.store'
import { syncAll, getPendingCount } from '@/lib/offline/sync'

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
const DIAS = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D']
const WEEKLY_GOAL = 1500

export function AdminDashboard() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['dashboard', 'week'],
    queryFn: () => fetch(getApiUrl('/api/dashboard?period=week')).then(r => r.json()),
    refetchInterval: 60_000,
  })

  const week       = data?.week ?? {}
  const byDay: number[] = week.byDay ?? [0, 0, 0, 0, 0, 0, 0]
  const max        = Math.max(1, ...byDay)
  const today      = new Date().getDay()
  const todayIdx   = today === 0 ? 6 : today - 1
  const totalBoxes = week.totalBoxes ?? 0
  const goalPct    = Math.min(100, Math.round(totalBoxes / WEEKLY_GOAL * 100))
  const goalMet    = totalBoxes >= WEEKLY_GOAL

  // ── 2. Animação de entrada ──────────────────────────────────────────────
  const [displayCount, setDisplayCount] = useState(0)
  const [goalBarPct,   setGoalBarPct]   = useState(0)
  const [barsVisible,  setBarsVisible]  = useState(false)
  const [listVisible,  setListVisible]  = useState(false)
  const didAnimate = useRef(false)

  useEffect(() => {
    if (isLoading || didAnimate.current || !totalBoxes) return
    didAnimate.current = true

    const reduced    = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const alreadyRan = sessionStorage.getItem('igue-dash-animated')

    if (reduced || alreadyRan) {
      setDisplayCount(totalBoxes); setGoalBarPct(goalPct); setBarsVisible(true); setListVisible(true)
      return
    }
    sessionStorage.setItem('igue-dash-animated', '1')

    const dur = 600, start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur)
      setDisplayCount(Math.round((1 - Math.pow(1 - t, 3)) * totalBoxes))
      if (t < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
    setTimeout(() => setGoalBarPct(goalPct), 150)
    setTimeout(() => setBarsVisible(true),   200)
    setTimeout(() => setListVisible(true),   350)
  }, [isLoading, totalBoxes, goalPct])

  // ── 6. Pull-to-refresh ─────────────────────────────────────────────────
  const setPending      = useSyncStore(s => s.setPending)
  const [pullY,         setPullY]        = useState(0)
  const [isRefreshing,  setIsRefreshing] = useState(false)
  const pullYRef        = useRef(0)
  const isRefreshingRef = useRef(false)
  const startYRef       = useRef(0)
  const PULL_THRESHOLD  = 64

  const triggerRefresh = useCallback(async () => {
    isRefreshingRef.current = true
    setIsRefreshing(true)
    setPullY(PULL_THRESHOLD)
    try {
      await refetch()
      await syncAll()
      setPending(await getPendingCount())
    } finally {
      setTimeout(() => {
        isRefreshingRef.current = false; setIsRefreshing(false)
        pullYRef.current = 0; setPullY(0)
      }, 1400)
    }
  }, [refetch, setPending])

  useEffect(() => {
    const onStart = (e: TouchEvent) => { startYRef.current = e.touches[0].clientY }
    const onMove  = (e: TouchEvent) => {
      if (isRefreshingRef.current) return
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
      if (scrollTop > 2) return
      const dy = e.touches[0].clientY - startYRef.current
      if (dy <= 0) { if (pullYRef.current > 0) { pullYRef.current = 0; setPullY(0) }; return }
      e.preventDefault()
      const py = Math.min(dy * 0.5, 80)
      pullYRef.current = py; setPullY(py)
    }
    const onEnd = () => {
      if (isRefreshingRef.current) return
      if (pullYRef.current >= PULL_THRESHOLD * 0.5) triggerRefresh()
      else { pullYRef.current = 0; setPullY(0) }
    }
    window.addEventListener('touchstart', onStart, { passive: true  })
    window.addEventListener('touchmove',  onMove,  { passive: false })
    window.addEventListener('touchend',   onEnd,   { passive: true  })
    return () => {
      window.removeEventListener('touchstart', onStart)
      window.removeEventListener('touchmove',  onMove)
      window.removeEventListener('touchend',   onEnd)
    }
  }, [triggerRefresh])

  const logoRotation = isRefreshing ? undefined : Math.round((pullY / PULL_THRESHOLD) * 180)

  // ──────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* 6. PTR indicator */}
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        height:  pullY, overflow: 'hidden', pointerEvents: 'none',
        transition: (pullY === 0 && !isRefreshing) ? 'height 300ms cubic-bezier(.2,.9,.2,1)' : 'none',
      }} aria-hidden>
        <Image src="/logo.png" alt="" width={30} height={30}
          style={{
            borderRadius: '50%', objectFit: 'cover',
            opacity:   Math.min(1, pullY / PULL_THRESHOLD),
            transform: isRefreshing ? undefined : `rotate(${logoRotation}deg)`,
            animation: isRefreshing ? 'igue-spin 1s linear infinite' : 'none',
          }}
        />
      </div>

      <div className="pb-6">
        {/* Cabeçalho */}
        <header className="px-5 pb-4 pt-1">
          <p className="text-[11px] font-semibold uppercase" style={{ letterSpacing: '.16em', color: 'var(--color-ink-faint)' }}>
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h1 className="font-display text-[27px] font-bold" style={{ letterSpacing: '-.02em' }}>
            Bom dia{data?.userFirstName ? `, ${data.userFirstName}` : ''}
          </h1>
        </header>

        {/* 1. Colhido esta semana + barra de meta */}
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
              <p className="font-display text-[46px] font-extrabold leading-none"
                style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '-.02em' }}>
                {isLoading ? '—' : displayCount.toLocaleString('pt-BR')}
              </p>
              <p className="font-display text-[17px] font-semibold" style={{ color: 'var(--color-gold)' }}>caixas</p>
            </div>

            <p className="text-[13.5px]" style={{ color: 'rgba(245,236,215,.65)' }}>
              {week.tons    ? `≈ ${week.tons} t · ` : ''}
              {week.bunches ? `${week.bunches.toLocaleString('pt-BR')} cachos · ` : ''}
              {week.revenue != null ? `${brl(week.revenue)} em receita` : ''}
            </p>

            {/* 1. Barra de meta semanal */}
            {!isLoading && (
              <div style={{ marginTop: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: 'rgba(245,236,215,.55)' }}>Meta da semana</span>
                  {goalMet
                    ? <span style={{ fontSize: 11, fontWeight: 700, color: '#A8CC8C' }}>Meta batida</span>
                    : <span style={{ fontSize: 11, color: 'rgba(245,236,215,.55)' }}>
                        <span style={{ fontWeight: 700, color: 'rgba(245,236,215,.9)' }}>{totalBoxes.toLocaleString('pt-BR')}</span>
                        {' / '}{WEEKLY_GOAL.toLocaleString('pt-BR')}
                      </span>
                  }
                </div>
                <div style={{ height: 4, borderRadius: 999, background: 'rgba(255,255,255,.15)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 999, background: goalMet ? '#A8CC8C' : '#6E8F4E', width: `${goalBarPct}%`, transition: 'width 500ms cubic-bezier(.16,1,.3,1)' }} />
                </div>
              </div>
            )}

            {/* 2. Gráfico de barras animado */}
            <div className="mt-3 flex h-[76px] items-end gap-1.5">
              {byDay.map((v, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                  <div className="w-full rounded-t-md"
                    style={{
                      height: Math.max(4, Math.round(v / max * 56)),
                      background: i === todayIdx ? 'linear-gradient(180deg,#D4A843,#C17A4A)' : 'rgba(168,204,140,.5)',
                      transform: barsVisible ? 'scaleY(1)' : 'scaleY(0)',
                      transformOrigin: 'bottom',
                      transition: barsVisible ? `transform 320ms cubic-bezier(.16,1,.3,1) ${200 + i * 45}ms` : 'none',
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

        {/* 2. Lista animada */}
        <section className="px-5 pt-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-[17px] font-bold" style={{ letterSpacing: '-.02em' }}>O que foi feito hoje</h2>
            <span className="text-[12.5px] font-semibold" style={{ color: 'var(--color-ink-faint)' }}>
              {(data?.today ?? []).length} lançamentos
            </span>
          </div>
          <div>
            {(data?.today ?? []).map((a: any, idx: number) => {
              const type  = a.type as ActivityType
              const Icon  = ACTIVITY_ICONS[type] ?? ClipboardList
              const color = ACTIVITY_COLORS[type] ?? '#95A5A6'
              return (
                <div key={a.id} className="relative flex gap-3 pb-3.5"
                  style={{
                    opacity:    listVisible ? 1 : 0,
                    transform:  listVisible ? 'none' : 'translateY(6px)',
                    transition: listVisible
                      ? `opacity 260ms ease ${350 + idx * 60}ms, transform 260ms ease ${350 + idx * 60}ms`
                      : 'none',
                  }}>
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

        {/* Semana em números */}
        <section className="px-5 pt-6">
          <h2 className="mb-3 font-display text-[17px] font-bold" style={{ letterSpacing: '-.02em' }}>Semana em números</h2>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { label: 'Custo semana',   value: brl(week.cost ?? 0),  sub: week.costDelta ?? '',    Icon: Wallet,        color: '#C17A4A' },
              { label: 'Margem',         value: brl(week.margin ?? 0), sub: week.marginPct ?? '',   Icon: TrendingUp,    color: '#6E8F4E' },
              { label: 'Atividades',     value: String(week.activities ?? 0), sub: `${(data?.today ?? []).length} hoje`, Icon: ClipboardList, color: '#3498DB' },
              { label: 'Pés produzindo', value: (week.trees ?? 0).toLocaleString('pt-BR'), sub: `${week.plots ?? 0} talhões`, Icon: Sprout, color: '#4E7038' },
            ].map(k => (
              <div key={k.label} className="rounded-[18px] p-4" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-line)' }}>
                <div className="mb-2 flex items-center gap-1.5">
                  <k.Icon size={16} strokeWidth={1.9} color={k.color} />
                  <span className="text-[11.5px] font-semibold uppercase" style={{ letterSpacing: '.08em', color: 'var(--color-ink-faint)' }}>
                    {k.label}
                  </span>
                </div>
                <p className="font-display text-[22px] font-bold" style={{ letterSpacing: '-.02em' }}>{k.value}</p>
                <p className="mt-0.5 text-xs" style={{ color: k.color }}>{k.sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Por sítio */}
        <section className="px-5 pt-6">
          <h2 className="mb-3 font-display text-[17px] font-bold" style={{ letterSpacing: '-.02em' }}>Por sítio</h2>
          <div className="flex flex-col gap-4 rounded-[20px] p-4" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-line)' }}>
            {(data?.bySite ?? []).map((s: any, i: number) => {
              const total  = Math.max(1, ...(data?.bySite ?? []).map((x: any) => x.boxes))
              const colors = ['#3D5A2E', '#6E8F4E', '#C17A4A']
              return (
                <div key={s.id ?? i}>
                  <div className="mb-1.5 flex items-baseline justify-between">
                    <p className="text-sm font-bold">{s.name}</p>
                    <p className="text-[13px]" style={{ color: 'var(--color-ink-soft)' }}>{s.boxes} cx</p>
                  </div>
                  <div className="h-[9px] overflow-hidden rounded-md" style={{ background: 'var(--color-line)' }}>
                    <div className="h-full rounded-md" style={{ width: `${Math.round(s.boxes / total * 100)}%`, background: colors[i % 3] }} />
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Precisa de olho */}
        <section className="px-5 pt-6">
          <h2 className="mb-3 font-display text-[17px] font-bold" style={{ letterSpacing: '-.02em' }}>Precisa de olho</h2>
          <div className="flex flex-col gap-2.5">
            {(data?.alerts ?? []).map((a: any, i: number) => {
              const tone = a.kind === 'sync'
                ? { Icon: WifiOff,         color: '#B87708', bg: 'rgba(243,156,18,.1)',  bd: 'rgba(243,156,18,.3)'  }
                : a.kind === 'idle'
                  ? { Icon: Clock,         color: '#C0392B', bg: 'rgba(192,57,43,.08)', bd: 'rgba(192,57,43,.25)'  }
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

        {/* Clima + dica */}
        <section className="flex gap-2.5 px-5 pt-6">
          <div className="flex-1 rounded-[18px] p-4" style={{ background: 'linear-gradient(150deg, #C17A4A, #A8632F)', color: '#FFF8EC' }}>
            <Sun size={20} strokeWidth={1.8} />
            <p className="mt-2.5 font-display text-[26px] font-bold" style={{ letterSpacing: '-.02em' }}>{data?.weather?.temp ?? '—'}°</p>
            <p className="mt-0.5 text-[12.5px]" style={{ color: 'rgba(255,248,236,.8)' }}>{data?.weather?.summary ?? ''}</p>
          </div>
          <div className="flex-1 rounded-[18px] p-4" style={{ background: '#2C3E1F', color: 'var(--color-surface)' }}>
            <Droplet size={20} strokeWidth={1.8} color="#D4A843" />
            <p className="mt-2.5 text-[13px]" style={{ color: 'rgba(245,236,215,.85)' }}>{data?.tip ?? ''}</p>
          </div>
        </section>

        <div style={{ height: 24 }} />
      </div>

      <style>{`@keyframes igue-spin { to { transform: rotate(360deg); } }`}</style>
    </>
  )
}
