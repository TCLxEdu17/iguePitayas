import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { buildDateRange } from '@/lib/dashboard'
import { REVENUE_ACTIVITY_TYPES } from '@/types'
import { ActivityType } from '@prisma/client'
const REVENUE_TYPES = REVENUE_ACTIVITY_TYPES as unknown as ActivityType[]

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(req: Request) {
  if (process.env.NEXT_PUBLIC_BUILD_TARGET === 'mobile') return NextResponse.json({})
  let session = null
  try { session = await getServerSession(authOptions) } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const period = searchParams.get('period') ?? 'month'
  const siteId = searchParams.get('siteId')
  const { startDate, endDate } = buildDateRange(period)
  const dateFilter = { gte: startDate, lte: endDate }

  // Week range (always needed for AdminDashboard)
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)) // Monday
  weekStart.setHours(0, 0, 0, 0)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  weekEnd.setHours(23, 59, 59, 999)

  const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0)
  const todayEnd   = new Date(now); todayEnd.setHours(23, 59, 59, 999)

  const [
    totalActivities,
    totalHarvests,
    harvestRevenueAgg,
    costAgg,
    activityRevenueAgg,
    recentActivities,
    weekHarvests,
    weekActivities,
    todayActivities,
    sites,
  ] = await Promise.all([
    db.activity.count({ where: { date: dateFilter, ...(siteId ? { plot: { siteId } } : {}) } }),
    db.harvest.count({ where: { date: dateFilter, ...(siteId ? { plot: { siteId } } : {}) } }),
    db.harvest.aggregate({
      where: { date: dateFilter, ...(siteId ? { plot: { siteId } } : {}) },
      _sum:  { totalRevenue: true },
    }),
    db.activity.aggregate({
      where: { date: dateFilter, cost: { not: null }, type: { notIn: REVENUE_TYPES }, ...(siteId ? { plot: { siteId } } : {}) },
      _sum:  { cost: true },
    }),
    db.activity.aggregate({
      where: { date: dateFilter, cost: { not: null }, type: { in: REVENUE_TYPES }, ...(siteId ? { plot: { siteId } } : {}) },
      _sum:  { cost: true },
    }),
    db.activity.findMany({
      where:   { date: { gte: startDate, lte: endDate }, ...(siteId ? { plot: { siteId } } : {}) },
      orderBy: { date: 'desc' },
      take:    10,
      include: { plot: { select: { code: true, name: true, productType: true, site: { select: { name: true } } } } },
    }),
    db.harvest.findMany({
      where:   { date: { gte: weekStart, lte: weekEnd } },
      include: { plot: { select: { siteId: true, site: { select: { id: true, name: true } } } } },
    }),
    db.activity.findMany({
      where:   { date: { gte: weekStart, lte: weekEnd } },
      include: { plot: { select: { area: true, siteId: true } } },
    }),
    db.activity.findMany({
      where:   { date: { gte: todayStart, lte: todayEnd } },
      orderBy: { createdAt: 'desc' },
      take:    20,
      include: { plot: { select: { name: true, site: { select: { name: true } } } } },
    }),
    db.site.findMany({ orderBy: { createdAt: 'asc' } }),
  ])

  const totalRevenue = (harvestRevenueAgg._sum.totalRevenue ?? 0) + (activityRevenueAgg._sum.cost ?? 0)
  const totalCost    = costAgg._sum.cost ?? 0

  // Week harvest stats
  const weekBoxes    = weekHarvests.filter(h => h.unit === 'CAIXA').reduce((s, h) => s + h.quantity, 0)
  const weekRevenue  = weekHarvests.reduce((s, h) => s + h.totalRevenue, 0)

  // by-day counts (Mon=0 … Sun=6)
  const byDay = [0, 0, 0, 0, 0, 0, 0]
  weekActivities.forEach(a => {
    const d = new Date(a.date).getDay()
    const idx = d === 0 ? 6 : d - 1
    byDay[idx]++
  })

  // by-site boxes
  const siteBoxMap: Record<string, number> = {}
  weekHarvests.forEach(h => {
    const sid = (h.plot as any)?.site?.id ?? 'unknown'
    siteBoxMap[sid] = (siteBoxMap[sid] ?? 0) + (h.unit === 'CAIXA' ? h.quantity : 0)
  })
  const bySite = sites.map(s => ({ id: s.id, name: s.name, boxes: siteBoxMap[s.id] ?? 0 }))

  // Simple alerts
  const alerts: { kind: string; title: string; text: string }[] = []

  const userFirstName = session.user.name?.split(' ')[0] ?? ''

  return NextResponse.json({
    period,
    totalActivities,
    totalHarvests,
    totalRevenue,
    totalCost,
    margin: totalRevenue - totalCost,
    recentActivities,
    week: {
      totalBoxes: Math.round(weekBoxes),
      revenue:    weekRevenue,
      activities: weekActivities.length,
      byDay,
    },
    today: todayActivities,
    bySite,
    alerts,
    userFirstName,
    tip: 'Verifique o nível de irrigação nos talhões com colheita prevista.',
  })
}
