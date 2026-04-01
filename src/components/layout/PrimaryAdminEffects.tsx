'use client'

import { useSession } from 'next-auth/react'

/**
 * Injeta efeitos visuais quando o usuário logado tem isPrimaryAdmin: true.
 * Facilmente replicável: qualquer usuário com isPrimaryAdmin: true recebe os efeitos.
 */
export function PrimaryAdminEffects() {
  const { data: session } = useSession()
  const isPrimary = (session?.user as any)?.isPrimaryAdmin === true

  if (!isPrimary) return null

  return (
    <>
      {/* Shimmer dourado no topo da viewport */}
      <div
        className="primary-admin-shimmer fixed top-0 left-0 right-0 h-1 z-50 pointer-events-none"
      />
    </>
  )
}
