import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic   = 'force-dynamic'
export const revalidate = 0

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  let session = null
  try { session = await getServerSession(authOptions) } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const site = await db.site.findUnique({
    where: { id },
    include: {
      plots: { orderBy: { code: 'asc' } },
    },
  })

  if (!site) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(site)
}
