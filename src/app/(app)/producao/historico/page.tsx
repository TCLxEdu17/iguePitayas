'use client'

import { useQuery } from '@tanstack/react-query'
import { getApiUrl } from '@/lib/api-url'
import { PRODUCT_LABELS, PRODUCT_COLORS } from '@/types'

const MONTH_LABELS = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']

function currentMonthRange() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  }
}

type ProductType = keyof typeof PRODUCT_LABELS

function getProductType(harvest: any): ProductType | null {
  const pt = harvest.productType ?? harvest.plot?.productType
  if (pt && pt in PRODUCT_LABELS) return pt as ProductType
  return null
}

export default function HistoricoProducaoPage() {
  const { startDate, endDate } = currentMonthRange()

  const { data: harvests = [], isLoading } = useQuery({
    queryKey: ['harvests', startDate, endDate],
    queryFn: () =>
      fetch(getApiUrl(`/api/harvests?startDate=${startDate}T00:00:00.000Z&endDate=${endDate}T23:59:59.999Z`))
        .then(r => r.json()),
  })

  // Compute aggregates
  const totalBoxes = harvests.reduce((sum: number, h: any) => {
    if (h.unit === 'CAIXA' || h.unit === 'caixa') return sum + (h.quantity ?? 0)
    return sum + (h.quantity ?? 0)
  }, 0)

  const totalRevenue = harvests.reduce((sum: number, h: any) => sum + (h.totalRevenue ?? 0), 0)
  const avgPerBox = totalBoxes > 0 ? totalRevenue / totalBoxes : 0
  const totalTons = (totalBoxes * 22) / 1000 // approximate: 22kg per box

  // By product
  const byProduct: Record<string, { qty: number; revenue: number }> = {}
  for (const h of harvests) {
    const pt = getProductType(h) ?? 'BANANA_PRATA'
    if (!byProduct[pt]) byProduct[pt] = { qty: 0, revenue: 0 }
    byProduct[pt].qty += h.quantity ?? 0
    byProduct[pt].revenue += h.totalRevenue ?? 0
  }

  if (isLoading) {
    return (
      <div style={{ padding: '20px 20px' }}>
        <div style={{ height: 32, width: 120, borderRadius: 8, background: '#E8DDC2', marginBottom: 16 }} className="animate-pulse" />
        <div style={{ display: 'flex', gap: 8, marginBottom: 22 }}>
          <div style={{ flex: 1, height: 96, borderRadius: 16, background: '#E8DDC2' }} className="animate-pulse" />
          <div style={{ flex: 1, height: 96, borderRadius: 16, background: '#E8DDC2' }} className="animate-pulse" />
        </div>
      </div>
    )
  }

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
        Produção
      </h1>

      {/* Stat cards */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 22 }}>
        {/* Mês */}
        <div
          style={{
            flex: 1,
            borderRadius: 16,
            background: '#2C3E1F',
            padding: 14,
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: '#D4A843',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              margin: '0 0 6px',
            }}
          >
            MÊS
          </p>
          <p
            style={{
              fontFamily: 'var(--font-bricolage)',
              fontSize: 25,
              fontWeight: 700,
              color: '#F5ECD7',
              margin: '0 0 2px',
              lineHeight: 1,
            }}
          >
            {totalBoxes.toLocaleString('pt-BR')}
          </p>
          <p style={{ fontSize: 12, color: '#D4A843', margin: 0 }}>
            caixas · {totalTons.toFixed(1)} t
          </p>
        </div>

        {/* Receita */}
        <div
          style={{
            flex: 1,
            borderRadius: 16,
            background: '#FFFDF8',
            border: '1px solid #EDE3CC',
            padding: 14,
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: '#6B7A5A',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              margin: '0 0 6px',
            }}
          >
            RECEITA
          </p>
          <p
            style={{
              fontFamily: 'var(--font-bricolage)',
              fontSize: 25,
              fontWeight: 700,
              color: '#1F2E15',
              margin: '0 0 2px',
              lineHeight: 1,
            }}
          >
            {totalRevenue >= 1000
              ? `R$ ${(totalRevenue / 1000).toFixed(1)}k`
              : `R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`}
          </p>
          <p style={{ fontSize: 12, color: '#6E8F4E', margin: 0 }}>
            R$ {avgPerBox.toFixed(2).replace('.', ',')} / cx média
          </p>
        </div>
      </div>

      {/* Por produto */}
      {Object.keys(byProduct).length > 0 && (
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
            Por Produto
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {(Object.entries(byProduct) as [ProductType, { qty: number; revenue: number }][]).map(([pt, data]) => {
              const color = PRODUCT_COLORS[pt] ?? '#6E8F4E'
              const label = PRODUCT_LABELS[pt] ?? pt
              return (
                <div
                  key={pt}
                  style={{
                    borderRadius: 16,
                    background: '#FFFDF8',
                    border: '1px solid #EDE3CC',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  {/* Vertical bar */}
                  <div
                    style={{
                      width: 14,
                      height: 36,
                      borderRadius: 5,
                      background: color,
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14.5, fontWeight: 700, color: '#1F2E15', margin: 0 }}>{label}</p>
                    <p style={{ fontSize: 12.5, color: '#8B9A7A', margin: '2px 0 0' }}>
                      {data.qty.toLocaleString('pt-BR')} unid.
                    </p>
                  </div>
                  <p
                    style={{
                      fontFamily: 'var(--font-bricolage)',
                      fontSize: 16,
                      fontWeight: 700,
                      color: '#3D5A2E',
                      margin: 0,
                      flexShrink: 0,
                    }}
                  >
                    R$ {data.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Últimas colheitas */}
      <div>
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
          Últimas Colheitas
        </p>

        {harvests.length === 0 ? (
          <p style={{ textAlign: 'center', fontSize: 13.5, color: '#6B7A5A', paddingTop: 24 }}>
            Nenhuma colheita neste período.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {harvests.slice(0, 20).map((h: any) => {
              const date = new Date(h.date)
              const day = date.getDate()
              const monthIdx = date.getMonth()
              const pt = getProductType(h)
              const productLabel = pt ? PRODUCT_LABELS[pt] : (h.plot?.productType ?? '')
              const plotName = h.plot?.name ?? h.plot?.code ?? ''
              const location = plotName
              const qty = h.quantity != null ? `${h.quantity} ${h.unit === 'CAIXA' ? 'caixas' : (h.unit ?? '')}` : '—'
              const revenue = h.totalRevenue != null
                ? `R$ ${h.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                : null

              return (
                <div
                  key={h.id}
                  style={{
                    borderRadius: 14,
                    background: '#FFFDF8',
                    border: '1px solid #EDE3CC',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  {/* Date block */}
                  <div style={{ width: 46, flexShrink: 0, textAlign: 'center' }}>
                    <p
                      style={{
                        fontFamily: 'var(--font-bricolage)',
                        fontSize: 17,
                        fontWeight: 700,
                        color: '#1F2E15',
                        margin: 0,
                        lineHeight: 1,
                      }}
                    >
                      {day}
                    </p>
                    <p style={{ fontSize: 10.5, color: '#B0BCA0', textTransform: 'uppercase', margin: '2px 0 0' }}>
                      {MONTH_LABELS[monthIdx]}
                    </p>
                  </div>

                  {/* Divider */}
                  <div style={{ width: 1, height: 36, background: '#EFE5CC', flexShrink: 0 }} />

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0, paddingLeft: 2 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#1F2E15', margin: 0 }}>
                      {qty} · {productLabel.toLowerCase()}
                    </p>
                    <p
                      style={{
                        fontSize: 12,
                        color: '#8B9A7A',
                        margin: '2px 0 0',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {location}
                    </p>
                  </div>

                  {/* Revenue */}
                  {revenue && (
                    <p style={{ fontSize: 13.5, fontWeight: 700, color: '#A8632F', margin: 0, flexShrink: 0 }}>
                      {revenue}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
