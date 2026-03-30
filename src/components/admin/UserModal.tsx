'use client'

import { useState, useEffect } from 'react'
import { getApiUrl } from '@/lib/api-url'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type UserRole = 'ADMIN' | 'OPERATOR' | 'VIEWER'

interface User {
  id: string
  name: string
  email: string
  role: UserRole
  active: boolean
  createdAt: Date
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: User | null
  onSuccess: () => void
}

const isEditMode = (user?: User | null): user is User => !!user

export function UserModal({ open, onOpenChange, user, onSuccess }: Props) {
  const editMode = isEditMode(user)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('VIEWER')
  const [active, setActive] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Populate form when user changes (edit mode) or reset when creating
  useEffect(() => {
    if (editMode) {
      setName(user.name)
      setEmail(user.email)
      setPassword('')
      setRole(user.role)
      setActive(user.active)
    } else {
      setName('')
      setEmail('')
      setPassword('')
      setRole('VIEWER')
      setActive(true)
    }
    setError(null)
  }, [user, open]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const body: Record<string, unknown> = { name, email, role }
    if (!editMode || password) {
      body.password = password
    }
    if (editMode) {
      body.active = active
    }

    try {
      const url = editMode
        ? getApiUrl(`/api/admin/users/${user.id}`)
        : getApiUrl('/api/admin/users')
      const method = editMode ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data?.error ?? 'Erro ao salvar usuário')
        return
      }

      onOpenChange(false)
      onSuccess()
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editMode ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user-name">Nome *</Label>
            <Input
              id="user-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome completo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-email">Email *</Label>
            <Input
              id="user-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemplo.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-password">
              Senha {editMode ? '' : '*'}
            </Label>
            <Input
              id="user-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={editMode ? 'Deixar em branco para manter' : 'Senha'}
              required={!editMode}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-role">Perfil *</Label>
            <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
              <SelectTrigger id="user-role">
                <SelectValue placeholder="Selecione o perfil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="OPERATOR">Operador</SelectItem>
                <SelectItem value="VIEWER">Visualizador</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {editMode && (
            <div className="space-y-2">
              <Label htmlFor="user-active">Status</Label>
              <Select
                value={active ? 'true' : 'false'}
                onValueChange={(v) => setActive(v === 'true')}
              >
                <SelectTrigger id="user-active">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Ativo</SelectItem>
                  <SelectItem value="false">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
