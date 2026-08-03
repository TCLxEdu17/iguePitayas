import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// Preço é informação de administrador. Operador recebe 403.
export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if ((session?.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }
  const url = new URL(req.url)
  const productType = url.searchParams.get('productType') ?? undefined
  const unit = url.searchParams.get('unit') ?? undefined
  if (!productType || !unit) return NextResponse.json({ error: 'params' }, { status: 400 })

  const price = await prisma.productPrice.findUnique({
    where: { productType_unit: { productType: productType as any, unit: unit as any } },
  })
  return NextResponse.json({ price: price?.price ?? 0 })
}
