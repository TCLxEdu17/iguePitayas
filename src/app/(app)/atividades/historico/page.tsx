import { ActivityList } from '@/components/activities/ActivityList'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function HistoricoAtividadesPage() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>Atividades</h1>
          <p className="text-sm text-muted-foreground">Histórico de registros</p>
        </div>
        <Button asChild style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}>
          <Link href="/atividades/novo">+ Registrar</Link>
        </Button>
      </div>
      <ActivityList />
    </div>
  )
}
