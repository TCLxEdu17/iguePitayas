import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const dateParam = searchParams.get('date')
  const date = dateParam ? new Date(dateParam) : new Date()

  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  const end = new Date(date)
  end.setHours(23, 59, 59, 999)

  const logs = await db.auditLog.findMany({
    where: { createdAt: { gte: start, lte: end } },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(logs)
}
