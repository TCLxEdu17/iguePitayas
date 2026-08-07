import { Suspense } from 'react'
import { ActivityForm } from '@/components/activities/ActivityForm'

export default function NovaAtividadePage() {
  return (
    <Suspense>
      <ActivityForm />
    </Suspense>
  )
}
