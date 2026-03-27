import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if ((session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

  const allowed = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowed.includes(file.type)) {
    return NextResponse.json(
      { error: 'Tipo inválido. Use JPG, PNG ou WebP.' },
      { status: 400 }
    )
  }

  const bytes  = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'maps')
  await mkdir(uploadDir, { recursive: true })

  const ext      = path.extname(file.name) || '.jpg'
  const filename = `map-${Date.now()}${ext}`
  const filepath  = path.join(uploadDir, filename)
  await writeFile(filepath, buffer)

  const mapImageUrl = `/uploads/maps/${filename}`

  let farm = await db.farm.findFirst()
  if (!farm) {
    farm = await db.farm.create({ data: { name: 'IGUE Bananas', mapImageUrl } })
  } else {
    farm = await db.farm.update({ where: { id: farm.id }, data: { mapImageUrl } })
  }

  return NextResponse.json({ mapImageUrl })
}
