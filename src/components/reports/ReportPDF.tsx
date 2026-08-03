import {
  Document, Page, Text, View, StyleSheet, Font,
} from '@react-pdf/renderer'
import { PRODUCT_LABELS, ACTIVITY_LABELS } from '@/types'

function fmt(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR')
}

const GREEN  = '#166534'
const LIGHT  = '#f0fdf4'
const BORDER = '#d1fae5'
const MUTED  = '#6b7280'
const RED    = '#dc2626'
const RED_BG = '#fef2f2'

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#111827',
    paddingHorizontal: 32,
    paddingVertical: 28,
  },
  // Header
  header: {
    backgroundColor: GREEN,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: { flexDirection: 'column' },
  headerTitle: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#ffffff' },
  headerSub: { fontSize: 9, color: 'rgba(255,255,255,0.75)', marginTop: 3 },
  headerBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  headerBadgeText: { color: '#ffffff', fontSize: 8 },
  // Summary
  summaryRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  summaryCard: {
    flex: 1, borderRadius: 6, padding: 10, alignItems: 'center',
  },
  summaryLabel: { fontSize: 8, color: MUTED, marginBottom: 4 },
  summaryValue: { fontSize: 13, fontFamily: 'Helvetica-Bold' },
  // Section
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: GREEN,
    marginBottom: 6,
    marginTop: 12,
  },
  // Table
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: LIGHT,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderBottom: `1px solid ${BORDER}`,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderBottom: `1px solid #f3f4f6`,
  },
  tableRowAlt: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 6,
    backgroundColor: '#f9fafb',
    borderBottom: `1px solid #f3f4f6`,
  },
  tableWrapper: {
    border: `1px solid ${BORDER}`,
    borderRadius: 4,
    overflow: 'hidden',
  },
  th: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: MUTED },
  td: { fontSize: 8 },
  tdRight: { fontSize: 8, textAlign: 'right' },
  // Product row
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottom: `1px solid ${BORDER}`,
  },
  productName: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: GREEN },
  productStats: { fontSize: 8, color: MUTED },
  productValue: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: GREEN },
  // Footer
  footer: {
    marginTop: 24,
    paddingTop: 8,
    borderTop: `1px solid #e5e7eb`,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: { fontSize: 7, color: MUTED },
})

interface ReportSummary { totalRevenue: number; totalCost: number; margin: number }
interface ByProduct { [key: string]: { quantity: number; revenue: number; count: number } }
interface ReportData {
  summary:    ReportSummary
  byProduct:  ByProduct
  activities: any[]
  harvests:   any[]
}

interface Props {
  data:       ReportData
  startDate:  string
  endDate:    string
}

export function ReportPDF({ data, startDate, endDate }: Props) {
  const dateRange = `${fmtDate(startDate)} — ${fmtDate(endDate)}`
  const generatedAt = new Date().toLocaleString('pt-BR')

  return (
    <Document
      title={`Relatório IGUE Bananas — ${dateRange}`}
      author="IGUE Bananas"
    >
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <Text style={s.headerTitle}>🌾 IGUE Bananas</Text>
            <Text style={s.headerSub}>Gestão operacional e financeira do sítio</Text>
          </View>
          <View style={s.headerBadge}>
            <Text style={s.headerBadgeText}>Relatório</Text>
            <Text style={[s.headerBadgeText, { marginTop: 2 }]}>{dateRange}</Text>
          </View>
        </View>

        {/* Summary */}
        <Text style={s.sectionTitle}>Resumo Financeiro</Text>
        <View style={s.summaryRow}>
          <View style={[s.summaryCard, { backgroundColor: LIGHT, border: `1px solid ${BORDER}` }]}>
            <Text style={s.summaryLabel}>Receita</Text>
            <Text style={[s.summaryValue, { color: GREEN }]}>{fmt(data.summary.totalRevenue)}</Text>
          </View>
          <View style={[s.summaryCard, { backgroundColor: RED_BG, border: '1px solid #fecaca' }]}>
            <Text style={s.summaryLabel}>Custo</Text>
            <Text style={[s.summaryValue, { color: RED }]}>{fmt(data.summary.totalCost)}</Text>
          </View>
          <View style={[s.summaryCard, {
            backgroundColor: data.summary.margin >= 0 ? LIGHT : RED_BG,
            border: `1px solid ${data.summary.margin >= 0 ? BORDER : '#fecaca'}`,
          }]}>
            <Text style={s.summaryLabel}>Margem</Text>
            <Text style={[s.summaryValue, { color: data.summary.margin >= 0 ? GREEN : RED }]}>
              {fmt(data.summary.margin)}
            </Text>
          </View>
        </View>

        {/* By product */}
        {Object.keys(data.byProduct).length > 0 && (
          <>
            <Text style={s.sectionTitle}>Por Produto</Text>
            <View style={s.tableWrapper}>
              {Object.entries(data.byProduct).map(([pt, stats], i) => (
                <View key={pt} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
                  <Text style={[s.td, { flex: 2, fontFamily: 'Helvetica-Bold', color: GREEN }]}>
                    {PRODUCT_LABELS[pt as keyof typeof PRODUCT_LABELS] ?? pt}
                  </Text>
                  <Text style={[s.td, { flex: 2, color: MUTED }]}>
                    {stats.count} colheitas · {stats.quantity.toLocaleString('pt-BR')} un.
                  </Text>
                  <Text style={[s.tdRight, { flex: 1, fontFamily: 'Helvetica-Bold', color: GREEN }]}>
                    {fmt(stats.revenue)}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Harvests */}
        {data.harvests.length > 0 && (
          <>
            <Text style={s.sectionTitle}>Colheitas ({data.harvests.length})</Text>
            <View style={s.tableWrapper}>
              <View style={s.tableHeader}>
                <Text style={[s.th, { flex: 1 }]}>Data</Text>
                <Text style={[s.th, { flex: 2 }]}>Talhão</Text>
                <Text style={[s.th, { flex: 1, textAlign: 'right' }]}>Qtd</Text>
                <Text style={[s.th, { flex: 1, textAlign: 'right' }]}>Preço/un</Text>
                <Text style={[s.th, { flex: 1, textAlign: 'right' }]}>Receita</Text>
              </View>
              {data.harvests.map((h: any, i: number) => (
                <View key={h.id} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
                  <Text style={[s.td, { flex: 1 }]}>{fmtDate(h.date)}</Text>
                  <Text style={[s.td, { flex: 2 }]}>{h.plot?.code} — {h.plot?.name}</Text>
                  <Text style={[s.tdRight, { flex: 1 }]}>{h.quantity}</Text>
                  <Text style={[s.tdRight, { flex: 1 }]}>{fmt(h.pricePerUnit)}</Text>
                  <Text style={[s.tdRight, { flex: 1, fontFamily: 'Helvetica-Bold', color: GREEN }]}>
                    {fmt(h.totalRevenue)}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Activities */}
        {data.activities.length > 0 && (
          <>
            <Text style={s.sectionTitle}>Atividades ({data.activities.length})</Text>
            <View style={s.tableWrapper}>
              <View style={s.tableHeader}>
                <Text style={[s.th, { flex: 1 }]}>Data</Text>
                <Text style={[s.th, { flex: 2 }]}>Tipo</Text>
                <Text style={[s.th, { flex: 1 }]}>Talhão</Text>
                <Text style={[s.th, { flex: 2 }]}>Responsável</Text>
                <Text style={[s.th, { flex: 1, textAlign: 'right' }]}>Custo</Text>
              </View>
              {data.activities.map((a: any, i: number) => (
                <View key={a.id} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
                  <Text style={[s.td, { flex: 1 }]}>{fmtDate(a.date)}</Text>
                  <Text style={[s.td, { flex: 2 }]}>{ACTIVITY_LABELS[a.type as keyof typeof ACTIVITY_LABELS] ?? a.type}</Text>
                  <Text style={[s.td, { flex: 1 }]}>{a.plot?.code}</Text>
                  <Text style={[s.td, { flex: 2 }]}>{a.responsible}</Text>
                  <Text style={[s.tdRight, { flex: 1 }]}>
                    {a.cost != null ? fmt(a.cost) : '—'}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.footerText}>IGUE Bananas — Gestão do Sítio</Text>
          <Text style={s.footerText}>Gerado em {generatedAt}</Text>
        </View>
      </Page>
    </Document>
  )
}
