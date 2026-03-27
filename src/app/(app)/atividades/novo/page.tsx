import { ActivityForm } from '@/components/activities/ActivityForm'

export default function NovaAtividadePage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-primary)' }}>
        Registrar Atividade
      </h1>
      <p className="text-sm text-muted-foreground mb-6">
        Funciona mesmo sem internet — sincroniza automaticamente quando conectado.
      </p>
      <ActivityForm />
    </div>
  )
}
