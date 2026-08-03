'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import { v4 as uuidv4 } from 'uuid'
import { Check } from 'lucide-react'
import { offlineDb } from '@/lib/offline/db'
import { useSyncStore } from '@/stores/sync.store'
import { getPendingCount } from '@/lib/offline/sync'
import { getApiUrl } from '@/lib/api-url'
import { UNITS, UNIT_LABELS, PRODUCT_LABELS, PRODUCT_COLORS } from '@/types'
import type { Unit } from '@/types'

type ProductKey = keyof typeof PRODUCT_LABELS

const DIAS = [
  { id: 'hoje',  label: 'Hoje',     offset: 0 },
  { id: 'ontem', label: 'Ontem',    offset: 1 },
  { id: 'outro', label: 'Escolher', offset: null },
] as const

export function HarvestForm() {
  const router = useRouter()
  const params = useSearchParams()
  const { data: session } = useSession()
  const isAdmin = (session?.user as any)?.role === 'ADMIN'
  const setPending = useSyncStore(s => s.setPending)

  const plotId = params.get('plotId') ?? ''
  const [qtd, setQtd] = useState(0)
  const [unidade, setUnidade] = useState<Unit>('CAIXA')
  const [produto, setProduto] = useState<ProductKey>('BANANA_PRATA')
  const [dia, setDia] = useState<string>('hoje')
  const [dataManual, setDataManual] = useState(new Date().toISOString().slice(0, 10))
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const { data: plot } = useQuery({
    queryKey: ['plot', plotId],
    queryFn: () => fetch(getApiUrl(`/api/plots/${plotId}`)).then(r => r.json()),
    enabled: !!plotId,
  })

  // preço só é buscado para admin — o operador nunca recebe valores
  const { data: preco } = useQuery<{ price: number }>({
    queryKey: ['preco', produto, unidade],
    queryFn: () => fetch(getApiUrl(`/api/prices?productType=${produto}&unit=${unidade}`)).then(r => r.json()),
    enabled: isAdmin,
  })

  function resolveDate() {
    const d = DIAS.find(x => x.id === dia)
    if (!d || d.offset === null) return new Date(dataManual)
    const dt = new Date()
    dt.setDate(dt.getDate() - d.offset)
    return dt
  }

  async function save() {
    if (!plotId || !qtd) return
    setSaving(true)
    // pricePerUnit/totalRevenue são calculados no servidor a partir de ProductPrice
    const record = {
      localId: uuidv4(),
      plotId,
      userId: (session?.user as any)?.id ?? 'unknown',
      date: resolveDate().toISOString(),
      quantity: qtd,
      unit: unidade,
      productType: produto,
      syncStatus: 'PENDING' as const,
      createdAt: new Date().toISOString(),
    }

    await offlineDb.harvests.add(record as any)
    if (navigator.onLine) {
      try {
        const res = await fetch(getApiUrl('/api/harvests'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record),
        })
        if (res.ok) await offlineDb.harvests.update(record.localId, { syncStatus: 'SYNCED' })
      } catch { /* fica PENDING */ }
    }
    setPending(await getPendingCount())
    setSaving(false)
    setSaved(true)
  }

  return (
    <div className="px-4 pb-6">
      <h1 className="pb-3.5 pt-1 font-display text-[21px] font-bold">Colheita</h1>

      <div className="mb-6 flex items-center gap-3 rounded-[18px] p-3.5" style={{ background: 'var(--color-accent)', color: '#FFF8EC' }}>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase" style={{ letterSpacing: '.14em', color: 'rgba(255,248,236,.7)' }}>Talhão</p>
          <p className="font-display text-[18px] font-bold">
            {plot ? `${plot.name} · ${plot.site?.name ?? ''}` : 'Selecione no mapa'}
          </p>
        </div>
        <button onClick={() => router.push('/mapa')} className="rounded-[11px] px-3 py-2 text-[12.5px] font-bold"
          style={{ border: '1px solid rgba(255,248,236,.45)', color: '#FFF8EC' }}>
          Trocar
        </button>
      </div>

      <p className="mb-2.5 text-xs font-bold uppercase" style={{ letterSpacing: '.1em', color: 'var(--color-ink-soft)' }}>Quanto saiu</p>
      <div className="mb-2.5 flex items-stretch gap-2">
        <button onClick={() => setQtd(q => Math.max(0, q - 1))} className="w-14 rounded-[14px] text-2xl font-bold"
          style={{ border: '1.5px solid var(--color-line-strong)', background: '#FFFDF8', color: 'var(--color-primary)' }}>−</button>
        <input value={qtd} inputMode="numeric"
          onChange={e => setQtd(Number(e.target.value.replace(/\D/g, '')) || 0)}
          className="flex-1 rounded-[14px] text-center font-display text-[32px] font-bold"
          style={{ height: 68, border: '1.5px solid var(--color-accent)', background: '#FFFDF8' }} />
        <button onClick={() => setQtd(q => q + 1)} className="w-14 rounded-[14px] text-2xl font-bold"
          style={{ border: '1.5px solid var(--color-line-strong)', background: '#FFFDF8', color: 'var(--color-primary)' }}>+</button>
      </div>
      <div className="mb-6 flex flex-wrap gap-[7px]">
        {UNITS.map(u => (
          <button key={u} onClick={() => setUnidade(u)} className="rounded-[13px] px-3.5 text-[13.5px] font-bold"
            style={{
              minHeight: 44,
              border: '1.5px solid ' + (unidade === u ? 'var(--color-accent)' : 'var(--color-line-strong)'),
              background: unidade === u ? 'var(--color-accent)' : '#FFFDF8',
              color: unidade === u ? '#FFF8EC' : 'var(--color-ink-soft)',
            }}>
            {UNIT_LABELS[u]}
          </button>
        ))}
      </div>

      <p className="mb-2.5 text-xs font-bold uppercase" style={{ letterSpacing: '.1em', color: 'var(--color-ink-soft)' }}>Produto</p>
      <div className="mb-6 flex flex-wrap gap-2">
        {(Object.keys(PRODUCT_LABELS) as ProductKey[]).map(p => {
          const on = produto === p
          return (
            <button key={p} onClick={() => setProduto(p)} className="flex items-center rounded-[13px] px-3.5 text-[13.5px] font-bold"
              style={{
                minHeight: 44,
                border: '1.5px solid ' + (on ? PRODUCT_COLORS[p] : 'var(--color-line-strong)'),
                background: on ? PRODUCT_COLORS[p] : '#FFFDF8',
                color: on ? '#1F2E15' : 'var(--color-ink-soft)',
              }}>
              <span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full" style={{ background: PRODUCT_COLORS[p] }} />
              {PRODUCT_LABELS[p]}
            </button>
          )
        })}
      </div>

      <p className="mb-2.5 text-xs font-bold uppercase" style={{ letterSpacing: '.1em', color: 'var(--color-ink-soft)' }}>Quando</p>
      <div className="mb-3 flex gap-2">
        {DIAS.map(d => (
          <button key={d.id} onClick={() => setDia(d.id)} className="flex-1 rounded-[13px] text-[13.5px] font-bold"
            style={{
              minHeight: 44,
              border: '1.5px solid ' + (dia === d.id ? 'var(--color-primary)' : 'var(--color-line-strong)'),
              background: dia === d.id ? 'var(--color-primary)' : '#FFFDF8',
              color: dia === d.id ? 'var(--color-paper)' : 'var(--color-ink-soft)',
            }}>
            {d.label}
          </button>
        ))}
      </div>
      {dia === 'outro' && (
        <input type="date" value={dataManual} onChange={e => setDataManual(e.target.value)}
          className="mb-6 w-full rounded-[14px] px-4 text-base"
          style={{ height: 52, border: '1.5px solid var(--color-line-strong)', background: '#FFFDF8' }} />
      )}

      {isAdmin && preco?.price ? (
        <div className="mb-6 mt-6 rounded-2xl p-3.5" style={{ background: 'rgba(61,90,46,.08)', border: '1px solid rgba(61,90,46,.2)' }}>
          <p className="text-xs" style={{ color: 'var(--color-ink-soft)' }}>Receita estimada · preço da tabela</p>
          <p className="mt-1 font-display text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
            {(qtd * preco.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
      ) : <div className="mb-6" />}

      <button disabled={saving || !qtd || !plotId} onClick={save}
        className="w-full rounded-2xl font-display text-[17px] font-bold disabled:opacity-50"
        style={{ height: 58, background: 'var(--color-accent)', color: '#FFF8EC' }}>
        {saving ? 'Salvando…' : 'Salvar colheita'}
      </button>

      {saved && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 p-10 text-center"
          style={{ background: 'rgba(31,46,21,.94)' }}>
          <div className="animate-pop-in flex h-[84px] w-[84px] items-center justify-center rounded-full" style={{ background: 'var(--color-gold)' }}>
            <Check size={42} strokeWidth={2.4} color="#1F2E15" />
          </div>
          <div className="animate-rise-in">
            <p className="font-display text-2xl font-bold" style={{ color: 'var(--color-surface)' }}>Colheita lançada</p>
            <p className="mt-2 text-[14.5px]" style={{ color: 'rgba(245,236,215,.7)' }}>
              {qtd} {UNIT_LABELS[unidade]} · {PRODUCT_LABELS[produto]}
            </p>
          </div>
          <button onClick={() => router.push('/producao/historico')} className="mt-1.5 rounded-[14px] px-6 py-3.5 text-[15px] font-bold"
            style={{ border: '1.5px solid rgba(245,236,215,.35)', color: 'var(--color-gold)' }}>
            Continuar
          </button>
        </div>
      )}
    </div>
  )
}
