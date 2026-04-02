'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import { offlineDb } from '@/lib/offline/db'
import { useSyncStore } from '@/stores/sync.store'
import { getPendingCount } from '@/lib/offline/sync'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { ACTIVITY_LABELS, REVENUE_ACTIVITY_TYPES } from '@/types'
import { getApiUrl } from '@/lib/api-url'

const formSchema = z.object({
  plotId:      z.string().min(1, 'Selecione o talhão'),
  date:        z.string().min(1, 'Data obrigatória'),
  type:        z.string().min(1, 'Selecione o tipo de atividade'),
  responsible: z.string().min(1, 'Responsável obrigatório'),
  quantity:    z.number().optional(),
  unit:        z.string().optional(),
  cost:        z.number().optional(),
  notes:       z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export function ActivityForm() {
  const router = useRouter()
  const { data: session } = useSession()
  const setPending = useSyncStore(s => s.setPending)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const selectedType = form.watch('type')
  const isRevenue = REVENUE_ACTIVITY_TYPES.includes(selectedType)

  const { data: plots } = useQuery({
    queryKey: ['plots'],
    queryFn:  () => fetch(getApiUrl('/api/plots')).then(r => r.json()),
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: { date: new Date().toISOString().split('T')[0] },
  })

  async function onSubmit(values: FormValues) {
    setSaving(true)
    const localId  = uuidv4()
    const isOnline = typeof navigator !== 'undefined' && navigator.onLine

    const record = {
      localId,
      plotId:      values.plotId,
      userId:      (session?.user as any)?.id ?? 'unknown',
      date:        new Date(values.date).toISOString(),
      type:        values.type,
      responsible: values.responsible,
      quantity:    values.quantity,
      unit:        values.unit,
      cost:        values.cost,
      notes:       values.notes,
      confirmed:   false,
      syncStatus:  'PENDING' as const,
      createdAt:   new Date().toISOString(),
    }

    // Always save locally first
    await offlineDb.activities.add(record)

    if (isOnline) {
      try {
        const res = await fetch(getApiUrl('/api/activities'), {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ ...record, syncStatus: 'SYNCED' }),
        })
        if (res.ok) {
          await offlineDb.activities.update(localId, { syncStatus: 'SYNCED' })
        }
      } catch {
        // network error — stays PENDING in IndexedDB
      }
    }

    const count = await getPendingCount()
    setPending(count)
    setSaving(false)
    setSaved(true)
    setTimeout(() => router.back(), 1500)
  }

  if (saved) return (
    <div className="text-center py-12">
      <p className="text-4xl mb-3">✅</p>
      <p className="font-medium text-lg" style={{ color: 'var(--color-primary)' }}>Atividade registrada!</p>
      <p className="text-sm text-muted-foreground mt-1">
        {typeof navigator !== 'undefined' && navigator.onLine
          ? 'Sincronizado com o servidor.'
          : 'Será sincronizado quando houver conexão.'}
      </p>
    </div>
  )

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
      <div className="space-y-2">
        <Label htmlFor="plotId">Talhão *</Label>
        <Select onValueChange={(v) => form.setValue('plotId', v)}>
          <SelectTrigger id="plotId">
            <SelectValue placeholder="Selecione o talhão" />
          </SelectTrigger>
          <SelectContent>
            {(plots ?? []).map((p: any) => (
              <SelectItem key={p.id} value={p.id}>{p.code} — {p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.plotId && (
          <p className="text-xs text-destructive">{form.formState.errors.plotId.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Data *</Label>
          <Input id="date" type="date" {...form.register('date')} />
          {form.formState.errors.date && (
            <p className="text-xs text-destructive">{form.formState.errors.date.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Tipo de Atividade *</Label>
          <Select onValueChange={(v) => form.setValue('type', v)}>
            <SelectTrigger id="type">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ACTIVITY_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.type && (
            <p className="text-xs text-destructive">{form.formState.errors.type.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="responsible">Responsável *</Label>
        <Input id="responsible" {...form.register('responsible')} placeholder="Nome do responsável" />
        {form.formState.errors.responsible && (
          <p className="text-xs text-destructive">{form.formState.errors.responsible.message}</p>
        )}
      </div>

      <details className="border rounded-lg p-3 cursor-pointer">
        <summary className="text-sm text-muted-foreground select-none">Mais detalhes (opcional)</summary>
        <div className="pt-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="quantity">Quantidade</Label>
              <Input id="quantity" type="number" step="0.01"
                {...form.register('quantity', { valueAsNumber: true })} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="unit">Unidade</Label>
              <Select onValueChange={(v) => form.setValue('unit', v)}>
                <SelectTrigger id="unit"><SelectValue placeholder="Unidade" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CAIXA">Caixa</SelectItem>
                  <SelectItem value="UNIDADE">Unidade</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="cost">
              {isRevenue ? 'Valor recebido (R$)' : 'Custo (R$)'}
            </Label>
            <Input id="cost" type="number" step="0.01"
              {...form.register('cost', { valueAsNumber: true })} placeholder="0,00" />
            {isRevenue && (
              <p className="text-xs text-green-600">Este valor será contabilizado como receita</p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="notes">Observações</Label>
            <Textarea id="notes" {...form.register('notes')} rows={2} />
          </div>
        </div>
      </details>

      <Button
        type="submit"
        className="w-full text-white"
        style={{ backgroundColor: 'var(--color-primary)' }}
        disabled={saving}
      >
        {saving ? 'Salvando...' : 'Registrar Atividade'}
      </Button>
    </form>
  )
}
