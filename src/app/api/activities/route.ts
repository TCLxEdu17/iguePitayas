import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { createActivitySchema } from '@/lib/validations/activity'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const plotId    = searchParams.get('plotId')
  const startDate = searchParams.get('startDate')
  const endDate   = searchParams.get('endDate')

  const activities = await db.activity.findMany({
    where: {
      ...(plotId    ? { plotId }    : {}),
      ...(startDate ? { date: { gte: new Date(startDate) } } : {}),
      ...(endDate   ? { date: { lte: new Date(endDate)   } } : {}),
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
      date:   new Date(parsed.data.date),
      userId: (session.user as any).id ?? 'system',
    },
  })

  return NextResponse.json(activity, { status: 201 })
}
