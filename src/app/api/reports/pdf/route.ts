import { renderToBuffer } from '@react-pdf/renderer'
import { createElement } from 'react'
import { ReportPDF } from '@/components/reports/ReportPDF'

export async function POST(req: Request) {
  const { data, startDate, endDate } = await req.json()

  const buffer = await renderToBuffer(
    createElement(ReportPDF, { data, startDate, endDate }) as any
  )

  const fileName = `relatorio-igue-${startDate}-${endDate}.pdf`

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    },
  })
}
