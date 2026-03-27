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
import { getApiUrl } from '@/lib/api-url'

const formSchema = z.object({
  plotId:       z.string().min(1, 'Selecione o talhão'),
  date:         z.string().min(1, 'Data obrigatória'),
  quantity:     z.number().positive('Quantidade deve ser maior que zero'),
  unit:         z.string().min(1, 'Selecione a unidade'),
  pricePerUnit: z.number().nonnegative(),
  notes:        z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export function HarvestForm() {
  const router = useRouter()
  const { data: session } = useSession()
  const setPending = useSyncStore(s => s.setPending)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedPlot, setSelectedPlot] = useState<any>(null)

  const { data: plots } = useQuery({
    queryKey: ['plots'],
    queryFn:  () => fetch(getApiUrl('/api/plots')).then(r => r.json()),
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      unit: 'CAIXA',
      pricePerUnit: 0,
    },
  })

  const quantity     = form.watch('quantity')     ?? 0
  const pricePerUnit = form.watch('pricePerUnit') ?? 0
  const totalRevenue = quantity * pricePerUnit

  function handlePlotChange(plotId: string) {
    form.setValue('plotId', plotId)
    const plot = (plots ?? []).find((p: any) => p.id === plotId)
    setSelectedPlot(plot)
    // Only Pitaya can use UNIDADE — Banana defaults to CAIXA
    if (plot?.productType !== 'PITAYA') {
      form.setValue('unit', 'CAIXA')
    }
  }

  async function onSubmit(values: FormValues) {
    setSaving(true)
    const localId  = uuidv4()
    const isOnline = typeof navigator !== 'undefined' && navigator.onLine
    const total    = values.quantity * values.pricePerUnit

    const record = {
      localId,
      plotId:       values.plotId,
      userId:       (session?.user as any)?.id ?? 'unknown',
      date:         new Date(values.date).toISOString(),
      quantity:     values.quantity,
      unit:         values.unit,
      pricePerUnit: values.pricePerUnit,
      totalRevenue: total,
      notes:        values.notes,
      syncStatus:   'PENDING' as const,
      createdAt:    new Date().toISOString(),
    }

    await offlineDb.harvests.add(record)

    if (isOnline) {
      try {
        const res = await fetch(getApiUrl('/api/harvests'), {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ ...record, syncStatus: 'SYNCED' }),
        })
        if (res.ok) {
          await offlineDb.harvests.update(localId, { syncStatus: 'SYNCED' })
        }
      } catch {
        // stays PENDING
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
      <p className="font-medium text-lg" style={{ color: 'var(--color-primary)' }}>Colheita registrada!</p>
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
        <Select onValueChange={handlePlotChange}>
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

      <div className="space-y-2">
        <Label htmlFor="date">Data *</Label>
        <Input id="date" type="date" {...form.register('date')} />
        {form.formState.errors.date && (
          <p className="text-xs text-destructive">{form.formState.errors.date.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantidade *</Label>
          <Input id="quantity" type="number" step="0.01"
            {...form.register('quantity', { valueAsNumber: true })}
            placeholder="0" />
          {form.formState.errors.quantity && (
            <p className="text-xs text-destructive">{form.formState.errors.quantity.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="unit">Unidade *</Label>
          <Select
            value={form.watch('unit') ?? 'CAIXA'}
            onValueChange={(v) => form.setValue('unit', v)}
            disabled={selectedPlot?.productType !== 'PITAYA'}
          >
            <SelectTrigger id="unit"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="CAIXA">Caixa</SelectItem>
              <SelectItem value="UNIDADE">Unidade</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="pricePerUnit">Preço por unidade (R$) *</Label>
        <Input id="pricePerUnit" type="number" step="0.01"
          {...form.register('pricePerUnit', { valueAsNumber: true })}
          placeholder="0,00" />
      </div>

      {quantity > 0 && pricePerUnit > 0 && (
        <div
          className="rounded-lg p-3 text-sm"
          style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)' }}
        >
          <span className="text-muted-foreground">Receita estimada: </span>
          <span className="font-semibold" style={{ color: 'var(--color-primary)' }}>
            R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea id="notes" {...form.register('notes')} rows={2} />
      </div>

      <Button
        type="submit"
        className="w-full text-white"
        style={{ backgroundColor: 'var(--color-primary)' }}
        disabled={saving}
      >
        {saving ? 'Salvando...' : 'Registrar Colheita'}
      </Button>
    </form>
  )
}
