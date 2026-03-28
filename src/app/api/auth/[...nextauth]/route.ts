import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const handler = NextAuth(authOptions)

export async function GET(req: Request, ctx: any) {
  if (process.env.NEXT_PUBLIC_BUILD_TARGET === 'mobile') return NextResponse.json({})
  try { return await handler(req, ctx) } catch { return NextResponse.json({}, { status: 200 }) }
}

export async function POST(req: Request, ctx: any) {
  if (process.env.NEXT_PUBLIC_BUILD_TARGET === 'mobile') return NextResponse.json({})
  try { return await handler(req, ctx) } catch { return NextResponse.json({}, { status: 200 }) }
}
