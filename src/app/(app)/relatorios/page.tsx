'use client'

import { useState } from 'react'
import { ReportFilter } from '@/components/reports/ReportFilter'
import { ReportTable } from '@/components/reports/ReportTable'
import { getApiUrl } from '@/lib/api-url'

export default function RelatoriosPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFilter({ startDate, endDate }: { startDate: string; endDate: string }) {
    setLoading(true)
    setError(null)
    try {
      const res  = await fetch(getApiUrl(`/api/reports?startDate=${startDate}T00:00:00.000Z&endDate=${endDate}T23:59:59.999Z`))
      const json = await res.json()
      setData(json)
    } catch (err) {
      console.error('Failed to fetch report', err)
      setError('Falha ao carregar relatório. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>Relatórios</h1>
        <p className="text-sm text-muted-foreground">Análise por período</p>
      </div>

      <ReportFilter onFilter={handleFilter} loading={loading} />

      {error && (
        <p className="text-center text-red-600 py-4 text-sm">{error}</p>
      )}

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />)}
        </div>
      )}

      {data && !loading && <ReportTable data={data} />}

      {!data && !loading && !error && (
        <p className="text-center text-muted-foreground py-12 text-sm">
          Selecione um período e clique em "Gerar Relatório"
        </p>
      )}
    </div>
  )
}
