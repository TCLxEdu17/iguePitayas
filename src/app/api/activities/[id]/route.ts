import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { updateActivitySchema } from '@/lib/validations/activity'
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
  const parsed = updateActivitySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  let activity
  try {
    activity = await db.activity.update({
      where: { id },
      data: {
        ...parsed.data,
        ...(parsed.data.date ? { date: new Date(parsed.data.date) } : {}),
      },
      include: { plot: { select: { name: true } } },
    })
  } catch (e: any) {
    if (e?.code === 'P2025') return NextResponse.json({ error: 'Not found' }, { status: 404 })
    throw e
  }

  const description = `${session.user.name ?? session.user.email} editou atividade ${activity.type} no ${activity.plot?.name ?? 'talhão'}`
  await logAction({ userId: session.user.id, action: 'EDIT_ACTIVITY', entityType: 'Activity', entityId: id, description })
  await sendToAdmins('Atividade editada', description)

  return NextResponse.json(activity)
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

  const activity = await db.activity.findUnique({
    where: { id },
    include: { plot: { select: { name: true } } },
  })

  if (!activity) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await db.activity.delete({ where: { id } })

  const description = `${session.user.name ?? session.user.email} removeu atividade ${activity?.type ?? ''} no ${activity?.plot?.name ?? 'talhão'}`
  await logAction({ userId: session.user.id, action: 'DELETE_ACTIVITY', entityType: 'Activity', entityId: id, description })
  await sendToAdmins('Atividade removida', description)

  return new NextResponse(null, { status: 204 })
}
