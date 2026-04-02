'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { ReportFilter } from '@/components/reports/ReportFilter'
import { ReportTable } from '@/components/reports/ReportTable'
import { PageTitle } from '@/components/layout/PageTitle'
import { getApiUrl } from '@/lib/api-url'

const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then(m => m.PDFDownloadLink),
  { ssr: false }
)
const ReportPDF = dynamic(
  () => import('@/components/reports/ReportPDF').then(m => m.ReportPDF),
  { ssr: false }
)

function thisMonthRange() {
  const now   = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end   = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return {
    startDate: start.toISOString().split('T')[0],
    endDate:   end.toISOString().split('T')[0],
  }
}

export default function RelatoriosPage() {
  const defaults = thisMonthRange()
  const [data,      setData]      = useState<any>(null)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState<string | null>(null)
  const [startDate, setStartDate] = useState(defaults.startDate)
  const [endDate,   setEndDate]   = useState(defaults.endDate)

  async function handleFilter({ startDate: sd, endDate: ed }: { startDate: string; endDate: string }) {
    setStartDate(sd)
    setEndDate(ed)
    setLoading(true)
    setError(null)
    try {
      const res  = await fetch(getApiUrl(`/api/reports?startDate=${sd}T00:00:00.000Z&endDate=${ed}T23:59:59.999Z`))
      const json = await res.json()
      setData(json)
    } catch (err) {
      console.error('Failed to fetch report', err)
      setError('Falha ao carregar relatório. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const fileName = `relatorio-igue-${startDate}-${endDate}.pdf`

  return (
    <div className="p-4 md:p-6 space-y-6">
      <PageTitle title="Relatórios" subtitle="Análise por período" />

      <ReportFilter onFilter={handleFilter} loading={loading} />

      {error && (
        <p className="text-center text-red-600 py-4 text-sm">{error}</p>
      )}

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />)}
        </div>
      )}

      {data && !loading && (
        <>
          <ReportTable data={data} />

          {/* PDF Download */}
          <div className="flex justify-end pt-2">
            <PDFDownloadLink
              document={<ReportPDF data={data} startDate={startDate} endDate={endDate} />}
              fileName={fileName}
            >
              {({ loading: pdfLoading }) => (
                <button
                  disabled={pdfLoading}
                  className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-60"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  {pdfLoading ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Preparando PDF...
                    </>
                  ) : (
                    <>
                      ⬇ Baixar PDF
                    </>
                  )}
                </button>
              )}
            </PDFDownloadLink>
          </div>
        </>
      )}

      {!data && !loading && !error && (
        <p className="text-center text-muted-foreground py-12 text-sm">
          Selecione um período e clique em "Gerar Relatório"
        </p>
      )}
    </div>
  )
}
