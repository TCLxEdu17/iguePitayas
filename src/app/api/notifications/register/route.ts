// src/app/api/notifications/register/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-static'
export const revalidate = 0

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { token, platform } = body

  if (!token || !platform) {
    return NextResponse.json({ error: 'token and platform required' }, { status: 400 })
  }

  const userId = session.user.id

  await db.pushToken.upsert({
    where: { token },
    update: { userId, platform },
    create: { token, userId, platform },
  })

  return NextResponse.json({ ok: true })
}
