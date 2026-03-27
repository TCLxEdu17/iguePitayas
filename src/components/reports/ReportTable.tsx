import { PRODUCT_LABELS, ACTIVITY_LABELS } from '@/types'

interface ReportSummary { totalRevenue: number; totalCost: number; margin: number }
interface ByProduct { [key: string]: { quantity: number; revenue: number; count: number } }
interface ReportData {
  summary:    ReportSummary
  byProduct:  ByProduct
  activities: any[]
  harvests:   any[]
}

function fmt(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function ReportTable({ data }: { data: ReportData }) {
  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
          <p className="text-xs text-muted-foreground">Receita</p>
          <p className="text-xl font-bold text-green-700">{fmt(data.summary.totalRevenue)}</p>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
          <p className="text-xs text-muted-foreground">Custo</p>
          <p className="text-xl font-bold text-red-700">{fmt(data.summary.totalCost)}</p>
        </div>
        <div
          className="rounded-lg p-4 text-center"
          style={{
            backgroundColor: data.summary.margin >= 0
              ? 'color-mix(in srgb, var(--color-primary) 8%, transparent)'
              : '#fef2f2',
            border: `1px solid ${data.summary.margin >= 0
              ? 'color-mix(in srgb, var(--color-primary) 20%, transparent)'
              : '#fecaca'}`,
          }}
        >
          <p className="text-xs text-muted-foreground">Margem</p>
          <p
            className="text-xl font-bold"
            style={{ color: data.summary.margin >= 0 ? 'var(--color-primary)' : '#dc2626' }}
          >
            {fmt(data.summary.margin)}
          </p>
        </div>
      </div>

      {/* By product */}
      {Object.keys(data.byProduct).length > 0 && (
        <div>
          <h3 className="font-semibold mb-3" style={{ color: 'var(--color-primary)' }}>Por Produto</h3>
          <div className="space-y-2">
            {Object.entries(data.byProduct).map(([pt, stats]) => (
              <div key={pt} className="flex items-center justify-between rounded-lg border bg-white p-3">
                <span className="font-medium text-sm">{PRODUCT_LABELS[pt] ?? pt}</span>
                <div className="text-right text-sm">
                  <p className="text-muted-foreground">{stats.count} colheitas · {stats.quantity.toLocaleString('pt-BR')} un.</p>
                  <p className="font-bold" style={{ color: 'var(--color-primary)' }}>{fmt(stats.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Harvests table */}
      {data.harvests.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3" style={{ color: 'var(--color-primary)' }}>
            Colheitas ({data.harvests.length})
          </h3>
          <div className="overflow-x-auto rounded-lg border bg-white">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Data</th>
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Talhão</th>
                  <th className="text-right py-2 px-3 text-muted-foreground font-medium">Qtd</th>
                  <th className="text-right py-2 px-3 text-muted-foreground font-medium">Preço</th>
                  <th className="text-right py-2 px-3 text-muted-foreground font-medium">Receita</th>
                </tr>
              </thead>
              <tbody>
                {data.harvests.map((h: any, i: number) => (
                  <tr key={h.id} className={i % 2 === 0 ? '' : 'bg-muted/20'}>
                    <td className="py-2 px-3">{new Date(h.date).toLocaleDateString('pt-BR')}</td>
                    <td className="py-2 px-3">{h.plot?.code} — {h.plot?.name}</td>
                    <td className="py-2 px-3 text-right">{h.quantity}</td>
                    <td className="py-2 px-3 text-right">{fmt(h.pricePerUnit)}</td>
                    <td className="py-2 px-3 text-right font-medium" style={{ color: 'var(--color-primary)' }}>
                      {fmt(h.totalRevenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Activities table */}
      {data.activities.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3" style={{ color: 'var(--color-primary)' }}>
            Atividades ({data.activities.length})
          </h3>
          <div className="overflow-x-auto rounded-lg border bg-white">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Data</th>
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Tipo</th>
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Talhão</th>
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Responsável</th>
                  <th className="text-right py-2 px-3 text-muted-foreground font-medium">Custo</th>
                </tr>
              </thead>
              <tbody>
                {data.activities.map((a: any, i: number) => (
                  <tr key={a.id} className={i % 2 === 0 ? '' : 'bg-muted/20'}>
                    <td className="py-2 px-3">{new Date(a.date).toLocaleDateString('pt-BR')}</td>
                    <td className="py-2 px-3">{ACTIVITY_LABELS[a.type] ?? a.type}</td>
                    <td className="py-2 px-3">{a.plot?.code}</td>
                    <td className="py-2 px-3">{a.responsible}</td>
                    <td className="py-2 px-3 text-right">{a.cost != null ? fmt(a.cost) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
