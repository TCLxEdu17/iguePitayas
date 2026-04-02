import { ActivityForm } from '@/components/activities/ActivityForm'
import { PageTitle } from '@/components/layout/PageTitle'

export default function NovaAtividadePage() {
  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <PageTitle title="Registrar Atividade" />
      </div>
      <p className="text-sm text-muted-foreground -mt-4 mb-6">
        Funciona mesmo sem internet — sincroniza automaticamente quando conectado.
      </p>
      <ActivityForm />
    </div>
  )
}
