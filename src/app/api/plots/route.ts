import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { createPlotSchema } from '@/lib/validations/plot'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const plots = await db.plot.findMany({
    orderBy: { code: 'asc' },
    include: {
      _count: { select: { activities: true, harvests: true } },
    },
  })

  return NextResponse.json(plots)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if ((session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = createPlotSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const farm = await db.farm.findFirst()
  if (!farm) return NextResponse.json({ error: 'Farm not configured' }, { status: 400 })

  const plot = await db.plot.create({
    data: { ...parsed.data, farmId: farm.id },
  })

  return NextResponse.json(plot, { status: 201 })
}
