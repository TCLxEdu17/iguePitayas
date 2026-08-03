import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { createActivitySchema } from '@/lib/validations/activity'
import { logAction } from '@/lib/audit'
import { sendToAdmins } from '@/lib/push'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(req: Request) {
  if (process.env.NEXT_PUBLIC_BUILD_TARGET === 'mobile') return NextResponse.json([])
  let session = null
  try { session = await getServerSession(authOptions) } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const plotId    = searchParams.get('plotId')
  const startDate = searchParams.get('startDate')
  const endDate   = searchParams.get('endDate')

  const dateFilter: Record<string, Date> = {}
  if (startDate) dateFilter.gte = new Date(startDate)
  if (endDate) dateFilter.lte = new Date(endDate)

  const activities = await db.activity.findMany({
    where: {
      ...(plotId ? { plotId } : {}),
      ...(Object.keys(dateFilter).length ? { date: dateFilter } : {}),
    },
    include: {
      plot: { select: { code: true, name: true, productType: true } },
    },
    orderBy: { date: 'desc' },
    take: 200,
  })

  return NextResponse.json(activities)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (session.user.role === 'VIEWER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body   = await req.json()
  const parsed = createActivitySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  // Conflict detection — same localId already exists
  const existing = await db.activity.findUnique({
    where: { localId: parsed.data.localId },
  })
  if (existing) return NextResponse.json({ error: 'Conflict' }, { status: 409 })

  const activity = await db.activity.create({
    data: {
      ...parsed.data,
      date:       new Date(parsed.data.date),
      userId:     session.user.id ?? 'system',
      syncStatus: 'SYNCED',
    },
    include: { plot: { select: { name: true } } },
  })

  const description = `${session.user.name ?? session.user.email} criou atividade ${activity.type} no ${activity.plot?.name ?? 'talhão'}`
  await logAction({ userId: session.user.id, action: 'CREATE_ACTIVITY', entityType: 'Activity', entityId: activity.id, description })
  await sendToAdmins('Nova atividade', description)

  return NextResponse.json(activity, { status: 201 })
}
