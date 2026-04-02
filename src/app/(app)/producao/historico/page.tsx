import { HarvestList } from '@/components/harvests/HarvestList'
import { Button } from '@/components/ui/button'
import { PageTitle } from '@/components/layout/PageTitle'
import Link from 'next/link'

export default function HistoricoProducaoPage() {
  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <PageTitle title="Produção" subtitle="Histórico de colheitas" />
        <Button asChild size="sm" style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}>
          <Link href="/producao/novo">+ Registrar</Link>
        </Button>
      </div>
      <HarvestList />
    </div>
  )
}
