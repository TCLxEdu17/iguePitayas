import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic   = 'force-dynamic'
export const revalidate = 0

export async function GET(req: Request) {
  if (process.env.NEXT_PUBLIC_BUILD_TARGET === 'mobile') return NextResponse.json([])
  let session = null
  try { session = await getServerSession(authOptions) } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const includePlots = searchParams.get('include') === 'plots'

  const sites = await db.site.findMany({
    orderBy: { createdAt: 'asc' },
    include: includePlots
      ? {
          plots: {
            where: { status: 'ACTIVE' },
            select: { id: true, code: true, name: true, area: true, polygon: true, productType: true },
            orderBy: { code: 'asc' },
          },
        }
      : { _count: { select: { plots: true } } },
  })

  // When including plots, rename area → treeCount for the client
  if (includePlots) {
    return NextResponse.json(sites.map((s: any) => ({
      ...s,
      plots: s.plots.map((p: any) => ({ ...p, treeCount: p.area })),
    })))
  }

  return NextResponse.json(sites)
}
