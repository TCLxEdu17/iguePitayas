'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { createPlotSchema, type CreatePlotInput } from '@/lib/validations/plot'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

interface PlotFormProps {
  defaultValues?: Partial<CreatePlotInput>
  plotId?: string
}

export function PlotForm({ defaultValues, plotId }: PlotFormProps) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const form = useForm<CreatePlotInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createPlotSchema) as any,
    defaultValues: { status: 'ACTIVE', ...defaultValues },
  })

  const mutation = useMutation({
    mutationFn: async (data: CreatePlotInput) => {
      const url    = plotId ? `/api/plots/${plotId}` : '/api/plots'
      const method = plotId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Falha ao salvar talhão')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plots'] })
      router.push('/talhoes')
    },
  })

  return (
    <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-4 max-w-lg">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="code">Código *</Label>
          <Input id="code" {...form.register('code')} placeholder="T01" />
          {form.formState.errors.code && (
            <p className="text-xs text-destructive">{form.formState.errors.code.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Nome *</Label>
          <Input id="name" {...form.register('name')} placeholder="Talhão 01" />
          {form.formState.errors.name && (
            <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="productType">Produto *</Label>
        <Select
          defaultValue={defaultValues?.productType}
          onValueChange={(v) => form.setValue('productType', v as any)}
        >
          <SelectTrigger id="productType">
            <SelectValue placeholder="Selecione o produto" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="BANANA_PRATA">Banana Prata</SelectItem>
            <SelectItem value="BANANA_NANICA">Banana Nanica</SelectItem>
            <SelectItem value="PITAYA">Pitaya</SelectItem>
          </SelectContent>
        </Select>
        {form.formState.errors.productType && (
          <p className="text-xs text-destructive">{form.formState.errors.productType.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="area">Área (m²)</Label>
          <Input
            id="area"
            type="number"
            {...form.register('area', { valueAsNumber: true })}
            placeholder="1500"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            defaultValue={defaultValues?.status ?? 'ACTIVE'}
            onValueChange={(v) => form.setValue('status', v as any)}
          >
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE">Ativo</SelectItem>
              <SelectItem value="INACTIVE">Inativo</SelectItem>
              <SelectItem value="MAINTENANCE">Manutenção</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea id="notes" {...form.register('notes')} rows={3} />
      </div>

      {mutation.isError && (
        <p className="text-sm text-destructive">Erro ao salvar. Tente novamente.</p>
      )}

      <div className="flex gap-2">
        <Button
          type="submit"
          style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Salvando...' : 'Salvar'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
