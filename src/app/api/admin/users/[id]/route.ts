import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { updateUserSchema } from '@/lib/validations/user'
import { logAction } from '@/lib/audit'
import { sendToAdmins } from '@/lib/push'

export const dynamic = 'force-dynamic'

const USER_SELECT = {
  id: true, name: true, email: true, role: true, active: true, createdAt: true,
} as const

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const body = await req.json()
  const parsed = updateUserSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const data = parsed.data

  // Prevent self-deactivation and self-role-change
  if (id === session.user.id) {
    if (data.active === false) return NextResponse.json({ error: 'Cannot deactivate own account' }, { status: 400 })
    if (data.role !== undefined && data.role !== session.user.role) {
      return NextResponse.json({ error: 'Cannot change own role' }, { status: 400 })
    }
  }

  const updateData: Record<string, unknown> = {}
  if (data.name) updateData.name = data.name
  if (data.email) updateData.email = data.email
  if (data.role) updateData.role = data.role
  if (data.active !== undefined) updateData.active = data.active
  if (data.password) updateData.passwordHash = await hash(data.password, 10)

  let user
  try {
    user = await db.user.update({
      where: { id },
      data: updateData,
      select: USER_SELECT,
    })
  } catch (e: unknown) {
    if ((e as { code?: string }).code === 'P2025') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    throw e
  }

  const description = `${session.user.name ?? session.user.email} editou usuário ${user.name}`
  await logAction({ userId: session.user.id, action: 'EDIT_USER', entityType: 'User', entityId: id, description })
  await sendToAdmins('Usuário editado', description)

  return NextResponse.json(user)
}
