import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { createHarvestSchema } from '@/lib/validations/harvest'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const plotId    = searchParams.get('plotId')
  const startDate = searchParams.get('startDate')
  const endDate   = searchParams.get('endDate')

  const harvests = await db.harvest.findMany({
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

  return NextResponse.json(harvests)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body   = await req.json()
  const parsed = createHarvestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const existing = await db.harvest.findUnique({ where: { localId: parsed.data.localId } })
  if (existing) return NextResponse.json({ error: 'Conflict' }, { status: 409 })

  const harvest = await db.harvest.create({
    data: {
      ...parsed.data,
      date:   new Date(parsed.data.date),
      userId: (session.user as any).id ?? 'system',
    },
  })

  return NextResponse.json(harvest, { status: 201 })
}
