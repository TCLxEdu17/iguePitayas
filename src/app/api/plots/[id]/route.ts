import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { updatePlotSchema } from '@/lib/validations/plot'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (process.env.NEXT_PUBLIC_BUILD_TARGET === 'mobile') return NextResponse.json(null)
  let session = null
  try { session = await getServerSession(authOptions) } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const plot = await db.plot.findUnique({
    where: { id },
    include: {
      activities: { orderBy: { date: 'desc' }, take: 10 },
      harvests:   { orderBy: { date: 'desc' }, take: 10 },
    },
  })

  if (!plot) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(plot)
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()
  const parsed = updatePlotSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const plot = await db.plot.update({
    where: { id },
    data:  parsed.data,
  })

  return NextResponse.json(plot)
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  await db.plot.delete({ where: { id } })
  return new NextResponse(null, { status: 204 })
}
