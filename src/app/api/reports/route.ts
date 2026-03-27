import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = process.env.NEXT_PUBLIC_BUILD_TARGET === 'mobile' ? 'force-static' : 'force-dynamic'
export const revalidate = 0

export async function GET(req: Request) {
  if (process.env.NEXT_PUBLIC_BUILD_TARGET === 'mobile') return NextResponse.json({})
  let session = null
  try { session = await getServerSession(authOptions) } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const startDate = searchParams.get('startDate')
  const endDate   = searchParams.get('endDate')

  if (!startDate || !endDate) {
    return NextResponse.json({ error: 'startDate and endDate required' }, { status: 400 })
  }

  const dateFilter = {
    gte: new Date(startDate),
    lte: new Date(endDate),
  }

  const [activities, harvests] = await Promise.all([
    db.activity.findMany({
      where:   { date: dateFilter },
      include: { plot: { select: { code: true, name: true, productType: true } } },
      orderBy: { date: 'asc' },
    }),
    db.harvest.findMany({
      where:   { date: dateFilter },
      include: { plot: { select: { code: true, name: true, productType: true } } },
      orderBy: { date: 'asc' },
    }),
  ])

  const totalRevenue = harvests.reduce((s, h) => s + h.totalRevenue, 0)
  const totalCost    = activities.reduce((s, a) => s + (a.cost ?? 0), 0)

  // Group harvests by product type
  const byProduct: Record<string, { quantity: number; revenue: number; count: number }> = {}
  for (const h of harvests) {
    const pt = h.plot.productType
    if (!byProduct[pt]) byProduct[pt] = { quantity: 0, revenue: 0, count: 0 }
    byProduct[pt].quantity += h.quantity
    byProduct[pt].revenue  += h.totalRevenue
    byProduct[pt].count    += 1
  }

  return NextResponse.json({
    period: { startDate, endDate },
    summary: { totalRevenue, totalCost, margin: totalRevenue - totalCost },
    byProduct,
    activities,
    harvests,
  })
}
