import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { updateHarvestSchema } from '@/lib/validations/harvest'
import { logAction } from '@/lib/audit'
import { sendToAdmins } from '@/lib/push'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (session.user.role === 'VIEWER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const body   = await req.json()
  const parsed = updateHarvestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const harvest = await db.harvest.update({
    where: { id },
    data:  {
      ...parsed.data,
      ...(parsed.data.date ? { date: new Date(parsed.data.date) } : {}),
    },
    include: { plot: { select: { name: true } } },
  })

  const description = `${session.user.name ?? session.user.email} editou colheita no ${harvest.plot?.name ?? 'talhão'}`
  await logAction({ userId: session.user.id, action: 'EDIT_HARVEST', entityType: 'Harvest', entityId: id, description })
  await sendToAdmins('Colheita editada', description)

  return NextResponse.json(harvest)
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (session.user.role === 'VIEWER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const harvest = await db.harvest.findUnique({
    where: { id },
    include: { plot: { select: { name: true } } },
  })
  await db.harvest.delete({ where: { id } })

  const description = `${session.user.name ?? session.user.email} removeu colheita no ${harvest?.plot?.name ?? 'talhão'}`
  await logAction({ userId: session.user.id, action: 'DELETE_HARVEST', entityType: 'Harvest', entityId: id, description })
  await sendToAdmins('Colheita removida', description)

  return new NextResponse(null, { status: 204 })
}
