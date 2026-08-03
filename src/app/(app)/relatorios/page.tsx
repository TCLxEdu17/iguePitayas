'use client'

import { useState, useCallback } from 'react'
import { Download, Share } from 'lucide-react'
import { getApiUrl } from '@/lib/api-url'

type Period = 'week' | 'month' | 'season'

const PERIOD_CHIPS: { id: Period; label: string }[] = [
  { id: 'week', label: 'Semana' },
  { id: 'month', label: 'Mês' },
  { id: 'season', label: 'Safra' },
]

const MOCK_SITES = [
  { id: '1', name: 'Sede', receita: 42000, custo: 28000 },
  { id: '2', name: 'Guanhanhã', receita: 31000, custo: 21000 },
  { id: '3', name: 'Guanhanhã II', receita: 24200, custo: 16000 },
]

function periodDateRange(period: Period): { startDate: string; endDate: string } {
  const now = new Date()
  if (period === 'week') {
    const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1
    const start = new Date(now)
    start.setDate(now.getDate() - dayOfWeek)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    }
  }
  if (period === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    }
  }
  // season: last 12 months
  const start = new Date(now)
  start.setFullYear(now.getFullYear() - 1)
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: now.toISOString().split('T')[0],
  }
}

export default function RelatoriosPage() {
  const [period, setPeriod] = useState<Period>('month')
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pdfLoading, setPdfLoading] = useState(false)

  const { startDate, endDate } = periodDateRange(period)

  const fetchReport = useCallback(async (p: Period) => {
    const { startDate: sd, endDate: ed } = periodDateRange(p)
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(getApiUrl(`/api/reports?startDate=${sd}T00:00:00.000Z&endDate=${ed}T23:59:59.999Z`))
      const json = await res.json()
      setData(json)
    } catch (err) {
      console.error('Failed to fetch report', err)
      setError('Falha ao carregar relatório.')
    } finally {
      setLoading(false)
    }
  }, [])

  function handlePeriodChange(p: Period) {
    setPeriod(p)
    fetchReport(p)
  }

  async function handleDownloadPDF() {
    if (!data) return
    setPdfLoading(true)
    try {
      const res = await fetch('/api/reports/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, startDate, endDate }),
      })
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `relatorio-igue-${startDate}-${endDate}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('PDF generation failed', err)
    } finally {
      setPdfLoading(false)
    }
  }

  // Derive values from data or show placeholders
  const margin = data?.margin ?? data?.summary?.margin ?? null
  const receita = data?.totalRevenue ?? data?.summary?.totalRevenue ?? null
  const custo = data?.totalCost ?? data?.summary?.totalCost ?? null
  const marginPct = margin != null && receita != null && receita > 0
    ? ((margin / receita) * 100).toFixed(1)
    : null

  const sites = data?.bySite ?? MOCK_SITES

  const maxSiteVal = Math.max(...sites.map((s: any) => Math.max(s.receita ?? 0, s.custo ?? 0, 1)))

  return (
    <div style={{ padding: '20px 20px', paddingBottom: 'calc(env(safe-area-inset-bottom) + 80px)' }}>
      {/* Title */}
      <h1
        style={{
          fontFamily: 'var(--font-bricolage)',
          fontSize: 26,
          fontWeight: 700,
          color: '#1F2E15',
          margin: '0 0 16px',
        }}
      >
        Relatórios
      </h1>

      {/* Period chips */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 22 }}>
        {PERIOD_CHIPS.map(chip => (
          <button
            key={chip.id}
            onClick={() => handlePeriodChange(chip.id)}
            style={{
              flex: 1,
              height: 44,
              borderRadius: 9999,
              border: period === chip.id ? 'none' : '1.5px solid #D8CEBC',
              background: period === chip.id ? '#3D5A2E' : '#FFFDF8',
              color: period === chip.id ? '#F5ECD7' : '#6B7A5A',
              fontSize: 13.5,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 150ms ease, color 150ms ease',
            }}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Margin card */}
      <div
        style={{
          borderRadius: 20,
          background: 'linear-gradient(160deg, #1F2E15 0%, #3D5A2E 100%)',
          padding: 22,
          marginBottom: 22,
        }}
      >
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: '#A8CC8C',
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            margin: '0 0 10px',
          }}
        >
          Margem do Período
        </p>

        {loading ? (
          <div style={{ height: 48, borderRadius: 8, background: 'rgba(255,255,255,.1)' }} className="animate-pulse" />
        ) : (
          <>
            <p
              style={{
                fontFamily: 'var(--font-bricolage)',
                fontSize: 36,
                fontWeight: 800,
                color: '#F5ECD7',
                margin: '0 0 16px',
                lineHeight: 1,
                letterSpacing: '-0.02em',
              }}
            >
              {marginPct != null ? `${marginPct}%` : '—'}
            </p>

            <div style={{ display: 'flex', gap: 24 }}>
              <div>
                <p style={{ fontSize: 11, color: 'rgba(168,204,140,.7)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Receita
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-bricolage)',
                    fontSize: 16,
                    fontWeight: 700,
                    color: '#A8CC8C',
                    margin: 0,
                  }}
                >
                  {receita != null
                    ? receita >= 1000
                      ? `R$ ${(receita / 1000).toFixed(1)}k`
                      : `R$ ${receita.toLocaleString('pt-BR')}`
                    : '—'}
                </p>
              </div>
              <div>
                <p style={{ fontSize: 11, color: 'rgba(232,168,124,.7)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Custo
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-bricolage)',
                    fontSize: 16,
                    fontWeight: 700,
                    color: '#E8A87C',
                    margin: 0,
                  }}
                >
                  {custo != null
                    ? custo >= 1000
                      ? `R$ ${(custo / 1000).toFixed(1)}k`
                      : `R$ ${custo.toLocaleString('pt-BR')}`
                    : '—'}
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Comparativo por sítio */}
      <div style={{ marginBottom: 22 }}>
        <p
          style={{
            fontSize: 11.5,
            fontWeight: 700,
            color: '#9AA88A',
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            margin: '0 0 10px',
          }}
        >
          Comparativo por Sítio
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {sites.map((site: any) => {
            const receitaVal = site.receita ?? site.boxes ?? 0
            const custoVal = site.custo ?? 0
            const siteMargin = receitaVal > 0 ? (((receitaVal - custoVal) / receitaVal) * 100).toFixed(1) : null

            return (
              <div key={site.id ?? site.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#1F2E15', margin: 0 }}>{site.name}</p>
                  {siteMargin != null && (
                    <p style={{ fontSize: 12.5, fontWeight: 700, color: '#3D5A2E', margin: 0 }}>
                      {siteMargin}%
                    </p>
                  )}
                </div>
                {/* Progress bars */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <div style={{ height: 8, borderRadius: 3, background: '#F0E7D2', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${maxSiteVal > 0 ? (receitaVal / maxSiteVal) * 100 : 0}%`,
                        background: '#6E8F4E',
                        borderRadius: 3,
                        transition: 'width 400ms ease',
                      }}
                    />
                  </div>
                  <div style={{ height: 8, borderRadius: 3, background: '#F0E7D2', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${maxSiteVal > 0 ? (custoVal / maxSiteVal) * 100 : 0}%`,
                        background: '#C17A4A',
                        borderRadius: 3,
                        transition: 'width 400ms ease',
                      }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: '#6E8F4E' }} />
            <span style={{ fontSize: 12, color: '#6B7A5A' }}>Receita</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: '#C17A4A' }} />
            <span style={{ fontSize: 12, color: '#6B7A5A' }}>Custo</span>
          </div>
        </div>
      </div>

      {error && (
        <p style={{ fontSize: 12, color: '#C0392B', textAlign: 'center', marginBottom: 16 }}>{error}</p>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          onClick={handleDownloadPDF}
          disabled={pdfLoading || !data}
          style={{
            height: 54,
            borderRadius: 16,
            background: '#2C3E1F',
            border: 'none',
            color: '#F5ECD7',
            fontFamily: 'var(--font-bricolage)',
            fontSize: 15,
            fontWeight: 700,
            cursor: (!data || pdfLoading) ? 'not-allowed' : 'pointer',
            opacity: (!data || pdfLoading) ? 0.6 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'opacity 150ms ease',
          }}
        >
          <Download size={18} strokeWidth={1.9} />
          {pdfLoading ? 'Gerando PDF...' : 'Baixar PDF do período'}
        </button>

        <button
          style={{
            height: 50,
            borderRadius: 16,
            background: 'transparent',
            border: '1.5px solid #C8BCA5',
            color: '#3D5A2E',
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <Share size={18} strokeWidth={1.9} />
          Enviar por WhatsApp
        </button>
      </div>
    </div>
  )
}
