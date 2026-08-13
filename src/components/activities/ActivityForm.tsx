'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import { v4 as uuidv4 } from 'uuid'
import { Check, WifiOff } from 'lucide-react'
import { offlineDb } from '@/lib/offline/db'
import { useSyncStore } from '@/stores/sync.store'
import { getPendingCount } from '@/lib/offline/sync'
import { getApiUrl } from '@/lib/api-url'
import { ACTIVITY_TYPES, ACTIVITY_LABELS, ACTIVITY_COLORS, UNITS, UNIT_LABELS, ACTIVITY_DEFAULT_UNIT, unitLabel } from '@/types'
import type { ActivityType, Unit } from '@/types'
import { ACTIVITY_ICONS } from '@/lib/activity-icons'

const DIAS = [
  { id: 'hoje',  label: 'Hoje',     offset: 0 },
  { id: 'ontem', label: 'Ontem',    offset: 1 },
  { id: 'outro', label: 'Escolher', offset: null },
] as const

export function ActivityForm() {
  const router = useRouter()
  const params = useSearchParams()
  const { data: session } = useSession()
  const setPending = useSyncStore(s => s.setPending)

  const plotId = params.get('plotId') ?? ''
  const [tipo, setTipo] = useState<ActivityType>('CORTE_BANANA')
  const [dia, setDia] = useState<string>('hoje')
  const [dataManual, setDataManual] = useState(new Date().toISOString().slice(0, 10))
  const [qtd, setQtd] = useState(0)
  const [unidade, setUnidade] = useState<Unit>(ACTIVITY_DEFAULT_UNIT['CORTE_BANANA'])
  const [horas, setHoras] = useState('')
  const [responsavel, setResponsavel] = useState('')
  const [notas, setNotas] = useState('')

  // session carrega async — atualiza responsável assim que o nome estiver disponível
  useEffect(() => {
    if (session?.user?.name && !responsavel) {
      setResponsavel(session.user.name)
    }
  }, [session?.user?.name])

  // ao trocar o tipo, sugere a unidade padrão
  useEffect(() => {
    setUnidade(ACTIVITY_DEFAULT_UNIT[tipo])
  }, [tipo])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const { data: plot } = useQuery({
    queryKey: ['plot', plotId],
    queryFn: () => fetch(getApiUrl(`/api/plots/${plotId}`)).then(r => r.json()),
    enabled: !!plotId,
  })

  const { data: equipe = [] } = useQuery<{ id: string; name: string }[]>({
    queryKey: ['equipe'],
    queryFn: () => fetch(getApiUrl('/api/team')).then(r => r.ok ? r.json() : []),
  })

  function resolveDate() {
    const d = DIAS.find(x => x.id === dia)
    if (!d || d.offset === null) return new Date(dataManual)
    const dt = new Date()
    dt.setDate(dt.getDate() - d.offset)
    return dt
  }

  async function save(again: boolean) {
    if (!plotId) return
    setSaving(true)
    try {
      const record = {
        localId: uuidv4(),
        plotId,
        userId: (session?.user as any)?.id ?? 'unknown',
        date: resolveDate().toISOString(),
        type: tipo,
        responsible: responsavel,
        quantity: qtd || undefined,
        unit: qtd ? unidade : undefined,
        hoursWorked: horas ? parseFloat(horas) : undefined,
        notes: notas || undefined,
        confirmed: true,
        syncStatus: 'PENDING' as const,
        createdAt: new Date().toISOString(),
      }

      await offlineDb.activities.add(record)
      if (navigator.onLine) {
        try {
          const res = await fetch(getApiUrl('/api/activities'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...record, syncStatus: 'SYNCED' }),
          })
          if (res.ok) await offlineDb.activities.update(record.localId, { syncStatus: 'SYNCED' })
        } catch { /* fica PENDING */ }
      }
      setPending(await getPendingCount())

      if (again) {
        setQtd(0); setNotas(''); setHoras('')
      } else {
        setSaved(true)
      }
    } finally {
      setSaving(false)
    }
  }

  const label = (id: string) => id

  return (
    <div className="px-4 pb-6">
      <h1 className="pb-3.5 pt-1 font-display text-[21px] font-bold">Nova atividade</h1>

      {/* talhão */}
      {!plotId && (
        <button
          onClick={() => router.push('/mapa')}
          className="mb-6 w-full rounded-[18px] p-4 text-left"
          style={{ background: '#2C3E1F', border: '1.5px dashed rgba(212,168,67,.4)' }}
        >
          <p className="text-[11px] uppercase mb-1" style={{ letterSpacing: '.14em', color: 'rgba(245,236,215,.55)' }}>Talhão</p>
          <p className="font-display text-[17px] font-bold" style={{ color: 'var(--color-gold)' }}>
            Toque para escolher no mapa →
          </p>
        </button>
      )}
      {plotId && (
      <div className="mb-6 flex items-center gap-3 rounded-[18px] p-3.5" style={{ background: '#2C3E1F', color: 'var(--color-surface)' }}>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase" style={{ letterSpacing: '.14em', color: 'rgba(245,236,215,.55)' }}>Talhão</p>
          <p className="font-display text-[18px] font-bold">
            {plot ? `${plot.name} · ${plot.site?.name ?? ''}` : '…'}
          </p>
        </div>
        <button onClick={() => router.push('/mapa')} className="rounded-[11px] px-3 py-2 text-[12.5px] font-bold"
          style={{ border: '1px solid rgba(245,236,215,.3)', color: 'var(--color-gold)' }}>
          Trocar
        </button>
      </div>
      )}

      {/* tipo */}
      <p className="mb-2.5 text-xs font-bold uppercase" style={{ letterSpacing: '.1em', color: 'var(--color-ink-soft)' }}>
        O que foi feito
      </p>
      <div className="mb-6 grid grid-cols-2 gap-2">
        {ACTIVITY_TYPES.map(t => {
          const Icon = ACTIVITY_ICONS[t]
          const on = tipo === t
          const color = ACTIVITY_COLORS[t]
          return (
            <button key={t} onClick={() => setTipo(t)}
              className="flex flex-col items-start gap-2 rounded-2xl p-3.5 text-left"
              style={{
                minHeight: 82,
                border: '1.5px solid ' + (on ? color : 'var(--color-line)'),
                background: on ? color + '14' : '#FFFDF8',
                color: on ? color : 'var(--color-ink-soft)',
              }}>
              <Icon size={21} strokeWidth={1.8} />
              <span className="text-[13px] font-bold leading-tight">{ACTIVITY_LABELS[t]}</span>
            </button>
          )
        })}
      </div>

      {/* quando */}
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

      {/* quanto */}
      <p className="mb-2.5 mt-6 text-xs font-bold uppercase" style={{ letterSpacing: '.1em', color: 'var(--color-ink-soft)' }}>
        Quanto <span className="font-medium normal-case" style={{ color: 'var(--color-ink-faint)' }}>· opcional</span>
      </p>
      <div className="mb-2.5 flex items-stretch gap-2">
        <button onClick={() => setQtd(q => Math.max(0, q - 1))} className="w-11 shrink-0 rounded-[14px] text-2xl font-bold"
          style={{ border: '1.5px solid var(--color-line-strong)', background: '#FFFDF8', color: 'var(--color-primary)' }}>−</button>
        <input
          value={qtd}
          onChange={e => setQtd(Number(e.target.value.replace(/\D/g, '')) || 0)}
          inputMode="numeric"
          className="min-w-0 flex-1 rounded-[14px] text-center font-display text-[28px] font-bold"
          style={{ height: 62, border: '1.5px solid var(--color-primary)', background: '#FFFDF8' }}
        />
        <button onClick={() => setQtd(q => q + 1)} className="w-11 shrink-0 rounded-[14px] text-2xl font-bold"
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

      {/* horas trabalhadas */}
      <p className="mb-2.5 text-xs font-bold uppercase" style={{ letterSpacing: '.1em', color: 'var(--color-ink-soft)' }}>
        Horas trabalhadas <span className="font-medium normal-case" style={{ color: 'var(--color-ink-faint)' }}>· opcional</span>
      </p>
      <div className="mb-6 flex items-stretch gap-2">
        <button onClick={() => setHoras(h => String(Math.max(0, (parseFloat(h) || 0) - 0.5)))}
          className="w-11 shrink-0 rounded-[14px] text-2xl font-bold"
          style={{ border: '1.5px solid var(--color-line-strong)', background: '#FFFDF8', color: 'var(--color-primary)' }}>−</button>
        <input
          value={horas}
          onChange={e => setHoras(e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.'))}
          inputMode="decimal"
          placeholder="0"
          className="min-w-0 flex-1 rounded-[14px] text-center font-display text-[28px] font-bold"
          style={{ height: 62, border: '1.5px solid var(--color-line-strong)', background: '#FFFDF8' }}
        />
        <button onClick={() => setHoras(h => String((parseFloat(h) || 0) + 0.5))}
          className="w-11 shrink-0 rounded-[14px] text-2xl font-bold"
          style={{ border: '1.5px solid var(--color-line-strong)', background: '#FFFDF8', color: 'var(--color-primary)' }}>+</button>
      </div>

      {/* quem */}
      <p className="mb-2.5 text-xs font-bold uppercase" style={{ letterSpacing: '.1em', color: 'var(--color-ink-soft)' }}>Quem fez</p>
      <div className="mb-6 flex flex-wrap gap-2">
        {[session?.user?.name, ...equipe.map(e => e.name)].filter(Boolean).map((n, i) => (
          <button key={label(n as string) + i} onClick={() => setResponsavel(n as string)}
            className="rounded-[13px] px-3.5 text-[13.5px] font-bold"
            style={{
              minHeight: 44,
              border: '1.5px solid ' + (responsavel === n ? 'var(--color-primary)' : 'var(--color-line-strong)'),
              background: responsavel === n ? 'var(--color-primary)' : '#FFFDF8',
              color: responsavel === n ? 'var(--color-paper)' : 'var(--color-ink-soft)',
            }}>
            {i === 0 ? `Eu (${String(n).split(' ')[0]})` : n}
          </button>
        ))}
      </div>

      <label className="mb-6 block">
        <span className="mb-2 block text-xs font-bold uppercase" style={{ letterSpacing: '.1em', color: 'var(--color-ink-soft)' }}>
          Observação
        </span>
        <textarea rows={2} value={notas} onChange={e => setNotas(e.target.value)}
          placeholder="Ex.: bomba entupiu, terminei só metade"
          className="w-full resize-none rounded-[14px] p-3.5 text-[15px]"
          style={{ border: '1.5px solid var(--color-line-strong)', background: '#FFFDF8' }} />
      </label>

      {typeof navigator !== 'undefined' && !navigator.onLine && (
        <div className="mb-6 flex items-center gap-2.5 rounded-[14px] p-3.5"
          style={{ background: 'rgba(243,156,18,.12)', border: '1px solid rgba(243,156,18,.3)' }}>
          <WifiOff size={17} color="#B87708" />
          <p className="text-[12.5px]" style={{ color: '#8A5A06' }}>
            Sem sinal agora — salva no aparelho e sobe sozinho quando pegar rede.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2.5">
        <button disabled={saving || !plotId} onClick={() => save(false)}
          className="rounded-2xl font-display text-[17px] font-bold disabled:opacity-50"
          style={{ height: 58, background: 'var(--color-primary)', color: 'var(--color-paper)' }}>
          {saving ? 'Salvando…' : 'Salvar lançamento'}
        </button>
        <button disabled={saving || !plotId} onClick={() => save(true)}
          className="rounded-2xl text-[15px] font-bold disabled:opacity-50"
          style={{ height: 50, border: '1.5px solid var(--color-line-strong)', color: 'var(--color-primary)' }}>
          Salvar e lançar outro
        </button>
      </div>

      {saved && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4.5 p-10 text-center"
          style={{ background: 'rgba(31,46,21,.94)' }}>
          <div className="animate-pop-in flex h-[84px] w-[84px] items-center justify-center rounded-full"
            style={{ background: 'var(--color-leaf-light)' }}>
            <Check size={42} strokeWidth={2.4} color="#1F2E15" />
          </div>
          <div className="animate-rise-in">
            <p className="font-display text-2xl font-bold" style={{ color: 'var(--color-surface)' }}>Lançado</p>
            <p className="mt-2 text-[14.5px]" style={{ color: 'rgba(245,236,215,.7)' }}>
              {ACTIVITY_LABELS[tipo]}{qtd ? ` · ${qtd} ${unitLabel(unidade, qtd)}` : ''}
            </p>
          </div>
          <button onClick={() => router.push('/mapa')} className="mt-1.5 rounded-[14px] px-6 py-3.5 text-[15px] font-bold"
            style={{ border: '1.5px solid rgba(245,236,215,.35)', color: 'var(--color-gold)' }}>
            Continuar
          </button>
        </div>
      )}
    </div>
  )
}
