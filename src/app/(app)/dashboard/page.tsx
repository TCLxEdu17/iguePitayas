import { DashboardGrid } from '@/components/dashboard/DashboardGrid'
import { PageTitle } from '@/components/layout/PageTitle'

export default function DashboardPage() {
  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <PageTitle title="Dashboard" subtitle="Visão geral do sítio" />
      </div>
      <DashboardGrid />
    </div>
  )
}
