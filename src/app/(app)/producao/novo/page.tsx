import { HarvestForm } from '@/components/harvests/HarvestForm'

export default function NovaColheitaPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-primary)' }}>
        Registrar Colheita
      </h1>
      <p className="text-sm text-muted-foreground mb-6">
        Funciona mesmo sem internet — sincroniza automaticamente quando conectado.
      </p>
      <HarvestForm />
    </div>
  )
}
