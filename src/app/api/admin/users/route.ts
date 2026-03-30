import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createUserSchema } from '@/lib/validations/user'
import { logAction } from '@/lib/audit'
import { sendToAdmins } from '@/lib/push'

export const dynamic = 'force-dynamic'

const USER_SELECT = {
  id: true, name: true, email: true, role: true, active: true, createdAt: true,
} as const

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const users = await db.user.findMany({
    select: USER_SELECT,
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(users)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const parsed = createUserSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { name, email, password, role } = parsed.data
  const passwordHash = await hash(password, 10)

  const user = await db.user.create({
    data: { name, email, passwordHash, role },
    select: USER_SELECT,
  })

  const description = `${session.user.name ?? session.user.email} criou usuário ${name}`
  await logAction({ userId: session.user.id, action: 'CREATE_USER', entityType: 'User', entityId: user.id, description })
  await sendToAdmins('Novo usuário', description)

  return NextResponse.json(user, { status: 201 })
}
