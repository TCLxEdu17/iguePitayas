// src/app/(app)/layout.tsx
'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { AppShell } from '@/components/layout/AppShell'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen bg-surface">
        <div className="text-primary text-lg font-medium">Carregando...</div>
      </div>
    )
  }

  if (!session) return null

  return <AppShell>{children}</AppShell>
}
