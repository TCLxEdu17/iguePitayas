import { DashboardGrid } from '@/components/dashboard/DashboardGrid'

export default function DashboardPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>Dashboard</h1>
        <p className="text-muted-foreground text-sm">Visão geral do sítio</p>
      </div>
      <DashboardGrid />
    </div>
  )
}
