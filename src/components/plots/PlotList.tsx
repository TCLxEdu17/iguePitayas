'use client'

import { useQuery } from '@tanstack/react-query'
import { PlotCard } from './PlotCard'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

async function fetchPlots() {
  const res = await fetch('/api/plots')
  if (!res.ok) throw new Error('Failed to fetch plots')
  return res.json()
}

export function PlotList() {
  const { data: plots, isLoading, error } = useQuery({
    queryKey: ['plots'],
    queryFn: fetchPlots,
  })

  if (isLoading) return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-36 rounded-lg bg-muted animate-pulse" />
      ))}
    </div>
  )

  if (error) return (
    <p className="text-destructive text-sm">Erro ao carregar talhões.</p>
  )

  if (!plots?.length) return (
    <div className="text-center py-12">
      <p className="text-muted-foreground mb-4">Nenhum talhão cadastrado ainda.</p>
      <Button asChild style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}>
        <Link href="/talhoes/novo">Cadastrar primeiro talhão</Link>
      </Button>
    </div>
  )

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {plots.map((plot: any) => (
        <PlotCard key={plot.id} plot={plot} />
      ))}
    </div>
  )
}
