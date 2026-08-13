'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { getApiUrl } from '@/lib/api-url'
import { Plus, Leaf, X, Search, ClipboardList } from 'lucide-react'

type Point = { x: number; y: number }
type Plot = {
  id: string
  code: string
  name: string
  area?: number | null
  polygon: Point[] | null
  productType?: string | null
  treeCount?: number | null
}
type Site = { id: string; name: string; mapImageUrl: string | null; plots: Plot[] }

const KEY = 'igue.siteId'

export function SiteCarousel() {
  const router = useRouter()
  const rail = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<{ plot: Plot; site: Site } | null>(null)
  const restored = useRef(false)

  const { data: sites = [] } = useQuery<Site[]>({
    queryKey: ['sites', 'with-plots'],
    queryFn: () => fetch(getApiUrl('/api/sites?include=plots')).then(r => r.json()),
    staleTime: 5 * 60 * 1000,
  })

  // lembra o sítio do usuário
  useEffect(() => {
    if (restored.current || !sites.length || !rail.current) return
    restored.current = true
    const saved = localStorage.getItem(KEY)
    const i = Math.max(0, sites.findIndex(s => s.id === saved))
    setIndex(i)
    requestAnimationFrame(() => {
      if (rail.current) rail.current.scrollLeft = i * rail.current.clientWidth
    })
  }, [sites])

  function goTo(i: number) {
    setIndex(i)
    localStorage.setItem(KEY, sites[i]?.id ?? '')
    requestAnimationFrame(() => {
      if (rail.current) rail.current.scrollLeft = i * rail.current.clientWidth
    })
  }

  function onScroll() {
    const el = rail.current
    if (!el || !el.clientWidth) return
    const i = Math.round(el.scrollLeft / el.clientWidth)
    if (i !== index && sites[i]) {
      setIndex(i)
      localStorage.setItem(KEY, sites[i].id)
    }
  }

  const site = sites[index]
  const totalTrees = site?.plots.reduce((s, p) => s + (p.treeCount ?? 0), 0) ?? 0

  return (
    <div className="pb-6">
      <header className="flex items-start justify-between gap-3 px-5 pb-3 pt-1">
        <div>
          <p className="text-[11px] font-semibold uppercase" style={{ letterSpacing: '.16em', color: 'var(--color-ink-faint)' }}>
            Seu sítio
          </p>
          <h1 className="font-display text-[27px] font-bold" style={{ color: 'var(--color-ink)' }}>
            {site?.name ?? '—'}
          </h1>
          <p className="text-[13px]" style={{ color: 'var(--color-ink-soft)' }}>
            {site ? `${site.plots.length} talhões${totalTrees ? ` · ${totalTrees.toLocaleString('pt-BR')} pés` : ''}` : 'carregando mapa…'}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex h-[42px] w-[42px] items-center justify-center rounded-[13px]"
            style={{ border: '1.5px solid var(--color-line-strong)', background: 'var(--color-surface)', color: 'var(--color-primary)' }}>
            <Search size={19} strokeWidth={1.9} />
          </button>
          <button onClick={() => router.push('/atividades/historico')}
            className="flex h-[42px] w-[42px] items-center justify-center rounded-[13px]"
            style={{ border: '1.5px solid var(--color-line-strong)', background: 'var(--color-surface)', color: 'var(--color-primary)' }}>
            <ClipboardList size={19} strokeWidth={1.9} />
          </button>
        </div>
      </header>

      <div className="flex gap-2 overflow-x-auto px-5 pb-3">
        {sites.map((s, i) => (
          <button key={s.id} onClick={() => goTo(i)} className="shrink-0 rounded-[13px] px-4 text-[13.5px] font-bold"
            style={{
              minHeight: 44,
              border: '1.5px solid ' + (i === index ? 'var(--color-primary)' : 'var(--color-line-strong)'),
              background: i === index ? 'var(--color-primary)' : 'var(--color-surface)',
              color: i === index ? 'var(--color-paper)' : 'var(--color-ink-soft)',
            }}>
            {s.name}
          </button>
        ))}
      </div>

      <div ref={rail} onScroll={onScroll} className="snap-rail flex overflow-x-auto">
        {sites.map(s => (
          <div key={s.id} className="snap-item box-border shrink-0 grow-0 basis-full px-5">
            <div
              className="relative overflow-hidden rounded-[20px]"
              style={{
                background: `#2C3E1F${s.mapImageUrl ? ` url(${s.mapImageUrl}) center/100% 100% no-repeat` : ''}`,
                boxShadow: '0 14px 30px -14px rgba(31,46,21,.55)',
                aspectRatio: '1.2 / 1',
              }}
            >
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="block h-full w-full">
                {s.plots.filter(p => p.polygon?.length).map(p => (
                  <polygon
                    key={p.id}
                    points={p.polygon!.map(pt => `${pt.x * 100},${pt.y * 100}`).join(' ')}
                    fill="rgba(212,168,67,.28)"
                    stroke={selected?.plot.id === p.id ? '#FBF6EA' : 'rgba(251,246,234,.55)'}
                    strokeWidth={selected?.plot.id === p.id ? 0.6 : 0.3}
                    vectorEffect="non-scaling-stroke"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelected({ plot: p, site: s })}
                  />
                ))}
              </svg>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-[7px] pb-1 pt-3.5">
        {sites.map((s, i) => (
          <span key={s.id} className="h-[7px] rounded-[5px] transition-all"
            style={{ width: i === index ? 22 : 7, background: i === index ? 'var(--color-primary)' : 'var(--color-line-strong)' }} />
        ))}
      </div>
      <p className="px-5 text-center text-[12.5px]" style={{ color: 'var(--color-ink-faint)' }}>
        Arraste para trocar de sítio · toque num talhão para lançar
      </p>

      {/* lista de talhões */}
      <section className="px-5 pt-5">
        <h2 className="mb-2.5 font-display text-[15px] font-bold" style={{ color: 'var(--color-ink)' }}>
          Talhões deste sítio
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {site?.plots.map(p => (
            <button key={p.id} onClick={() => setSelected({ plot: p, site })}
              className="flex items-center gap-2.5 rounded-[14px] p-3 text-left"
              style={{ minHeight: 52, border: '1.5px solid var(--color-line)', background: 'var(--color-surface)' }}>
              <span className="h-3 w-3 shrink-0 rounded" style={{ background: 'var(--color-gold)' }} />
              <span className="min-w-0">
                <span className="block truncate text-[13.5px] font-bold" style={{ color: 'var(--color-ink)' }}>{p.name}</span>
                <span className="block text-[11.5px]" style={{ color: 'var(--color-ink-faint)' }}>
                  {p.treeCount ? `${p.treeCount.toLocaleString('pt-BR')} pés` : p.code}
                </span>
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ficha do talhão */}
      {selected && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0" style={{ background: 'rgba(20,27,15,.5)' }} onClick={() => setSelected(null)} />
          <div className="animate-sheet-up relative rounded-t-[26px] px-5 pb-7 pt-2.5"
            style={{ background: 'var(--color-paper)', paddingBottom: 'calc(env(safe-area-inset-bottom) + 1.75rem)' }}>
            <div className="mx-auto mb-4 h-1 w-[42px] rounded-sm" style={{ background: 'var(--color-line-strong)' }} />
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase" style={{ letterSpacing: '.16em', color: 'var(--color-ink-faint)' }}>
                  {selected.site.name}
                </p>
                <h3 className="font-display text-[25px] font-bold" style={{ color: 'var(--color-ink)' }}>{selected.plot.name}</h3>
              </div>
              <button onClick={() => setSelected(null)} className="flex h-[38px] w-[38px] items-center justify-center rounded-xl"
                style={{ background: '#EFE5CC', color: 'var(--color-ink-soft)' }}>
                <X size={18} />
              </button>
            </div>
            <div className="my-4 flex gap-2">
              <div className="flex-1 rounded-[14px] p-3" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-line)' }}>
                <p className="text-[11px]" style={{ color: 'var(--color-ink-faint)' }}>Pés</p>
                <p className="font-display text-[19px] font-bold">{selected.plot.treeCount?.toLocaleString('pt-BR') ?? '—'}</p>
              </div>
              <div className="flex-1 rounded-[14px] p-3" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-line)' }}>
                <p className="text-[11px]" style={{ color: 'var(--color-ink-faint)' }}>Código</p>
                <p className="font-display text-[19px] font-bold">{selected.plot.code}</p>
              </div>
            </div>
            <div className="flex flex-col gap-2.5">
              <button onClick={() => router.push(`/atividades/novo?plotId=${selected.plot.id}`)}
                className="flex items-center justify-center gap-2.5 rounded-2xl font-display text-[16.5px] font-bold"
                style={{ height: 56, background: 'var(--color-primary)', color: 'var(--color-paper)' }}>
                <Plus size={20} /> Registrar atividade
              </button>
              <button onClick={() => router.push(`/producao/novo?plotId=${selected.plot.id}`)}
                className="flex items-center justify-center gap-2.5 rounded-2xl text-[15px] font-bold"
                style={{ height: 52, border: '1.5px solid var(--color-accent)', color: 'var(--color-accent-dark)' }}>
                <Leaf size={19} /> Registrar colheita
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
