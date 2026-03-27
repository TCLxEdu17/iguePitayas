import { PlotForm } from '@/components/plots/PlotForm'

export default function NovoTalhaoPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-primary)' }}>Novo Talhão</h1>
      <PlotForm />
    </div>
  )
}
