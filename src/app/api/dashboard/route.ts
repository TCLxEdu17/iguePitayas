import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { buildDateRange } from '@/lib/dashboard'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const period = searchParams.get('period') ?? 'month'
  const { startDate, endDate } = buildDateRange(period)
  const dateFilter = { gte: startDate, lte: endDate }

  const [
    totalActivities,
    totalHarvests,
    revenueAgg,
    costAgg,
    recentActivities,
  ] = await Promise.all([
    db.activity.count({ where: { date: dateFilter } }),

    db.harvest.count({ where: { date: dateFilter } }),

    db.harvest.aggregate({
      where: { date: dateFilter },
      _sum:  { totalRevenue: true },
    }),

    db.activity.aggregate({
      where: { date: dateFilter, cost: { not: null } },
      _sum:  { cost: true },
    }),

    db.activity.findMany({
      where:   { date: dateFilter },
      orderBy: { date: 'desc' },
      take:    5,
      include: {
        plot: { select: { code: true, name: true, productType: true } },
      },
    }),
  ])

  const totalRevenue = revenueAgg._sum.totalRevenue ?? 0
  const totalCost    = costAgg._sum.cost ?? 0

  return NextResponse.json({
    period,
    totalActivities,
    totalHarvests,
    totalRevenue,
    totalCost,
    margin: totalRevenue - totalCost,
    recentActivities,
  })
}
