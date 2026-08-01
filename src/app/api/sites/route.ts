import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic   = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  if (process.env.NEXT_PUBLIC_BUILD_TARGET === 'mobile') return NextResponse.json([])
  let session = null
  try { session = await getServerSession(authOptions) } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sites = await db.site.findMany({
    orderBy: { createdAt: 'asc' },
    include: {
      _count: { select: { plots: true } },
    },
  })

  return NextResponse.json(sites)
}
