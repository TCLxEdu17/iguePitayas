'use client'

import { useSession } from 'next-auth/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { getApiUrl } from '@/lib/api-url'
import { UserList } from '@/components/admin/UserList'
import { UserModal } from '@/components/admin/UserModal'

interface User {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'OPERATOR' | 'VIEWER'
  active: boolean
  createdAt: string
}

export default function AdminUsuariosPage() {
  const { data: session, status } = useSession()
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['admin-users'],
    queryFn: () => fetch(getApiUrl('/api/admin/users')).then(r => r.json()),
    enabled: session?.user?.role === 'ADMIN',
  })

  const toggleActiveMutation = useMutation({
    mutationFn: (user: User) =>
      fetch(getApiUrl(`/api/admin/users/${user.id}`), {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ active: !user.active }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  })

  if (status === 'loading') return null
  if (session?.user?.role !== 'ADMIN') return (
    <div className="p-6">
      <p className="text-muted-foreground">Acesso restrito.</p>
    </div>
  )

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>Usuários</h1>
          <p className="text-muted-foreground text-sm">Gerenciar perfis de acesso</p>
        </div>
        <button
          onClick={() => { setEditingUser(null); setModalOpen(true) }}
          className="rounded-md px-4 py-2 text-sm font-medium text-white"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          Novo Usuário
        </button>
      </div>

      <UserList
        users={users}
        currentUserId={session.user.id}
        onEdit={(user) => { setEditingUser(user); setModalOpen(true) }}
        onToggleActive={(user) => toggleActiveMutation.mutate(user)}
      />

      <UserModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        user={editingUser}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['admin-users'] })}
      />
    </div>
  )
}
