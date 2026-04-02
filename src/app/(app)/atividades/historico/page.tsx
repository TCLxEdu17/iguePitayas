import { ActivityList } from '@/components/activities/ActivityList'
import { Button } from '@/components/ui/button'
import { PageTitle } from '@/components/layout/PageTitle'
import Link from 'next/link'

export default function HistoricoAtividadesPage() {
  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <PageTitle title="Atividades" subtitle="Histórico de registros" />
        <Button asChild size="sm" style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}>
          <Link href="/atividades/novo">+ Registrar</Link>
        </Button>
      </div>
      <ActivityList />
    </div>
  )
}
