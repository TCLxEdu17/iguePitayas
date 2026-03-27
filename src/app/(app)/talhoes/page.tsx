import { Button } from '@/components/ui/button'
import { PlotList } from '@/components/plots/PlotList'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function TalhoesPage() {
  const isMobile = process.env.NEXT_PUBLIC_BUILD_TARGET === 'mobile'
  const session = isMobile ? null : await getServerSession(authOptions)
  const isAdmin = !isMobile && (session?.user as any)?.role === 'ADMIN'

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>Talhões</h1>
          <p className="text-muted-foreground text-sm">Gerencie os talhões do sítio</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button asChild variant="outline">
            <Link href="/talhoes/mapa">Ver Mapa</Link>
          </Button>
          {isAdmin && (
            <Button asChild style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}>
              <Link href="/talhoes/novo">+ Novo Talhão</Link>
            </Button>
          )}
        </div>
      </div>
      <PlotList />
    </div>
  )
}
