import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const farm = await db.farm.findFirst({
    include: { plots: { orderBy: { code: 'asc' } } },
  })

  return NextResponse.json(farm ?? null)
}
