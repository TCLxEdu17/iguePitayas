import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { PRODUCT_LABELS, PRODUCT_COLORS } from '@/types'

export default async function TalhaoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const { id } = await params
  const plot = await db.plot.findUnique({
    where: { id },
    include: {
      activities: { orderBy: { date: 'desc' }, take: 10 },
      harvests: { orderBy: { date: 'desc' }, take: 10 },
    }
  })

  if (!plot) notFound()

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">{plot.name}</h1>
        <span className="text-sm px-2 py-1 rounded-full text-white" style={{ backgroundColor: PRODUCT_COLORS[plot.productType] }}>
          {PRODUCT_LABELS[plot.productType]}
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-500">Código</p>
          <p className="font-semibold">{plot.code}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-500">Área</p>
          <p className="font-semibold">{plot.area ? `${plot.area} m²` : '—'}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-500">Status</p>
          <p className="font-semibold">{plot.status}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-500">Atividades</p>
          <p className="font-semibold">{plot.activities.length}</p>
        </div>
      </div>
      {plot.notes && (
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Notas</p>
          <p>{plot.notes}</p>
        </div>
      )}
    </main>
  )
}
