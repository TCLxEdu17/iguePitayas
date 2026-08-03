'use client'

import { useState, useEffect } from 'react'
import { getApiUrl } from '@/lib/api-url'
import { X } from 'lucide-react'

type UserRole = 'ADMIN' | 'OPERATOR' | 'VIEWER'

interface User {
  id: string
  name: string
  email: string
  role: UserRole
  active: boolean
  createdAt: string
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: User | null
  onSuccess: () => void
}

const isEditMode = (user?: User | null): user is User => !!user

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: 50,
  borderRadius: 13,
  border: '1.5px solid #EDE3CC',
  background: '#FFFDF8',
  padding: '0 14px',
  fontSize: 15,
  color: '#1F2E15',
  outline: 'none',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  fontSize: 11.5,
  fontWeight: 700,
  color: '#9AA88A',
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  display: 'block',
  marginBottom: 6,
}

export function UserModal({ open, onOpenChange, user, onSuccess }: Props) {
  const editMode = isEditMode(user)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('OPERATOR')
  const [active, setActive] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      setRole('OPERATOR')
      setActive(true)
    }
    setError(null)
  }, [user, open]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const body: Record<string, unknown> = { name, email, role }
    if (!editMode || password) body.password = password
    if (editMode) body.active = active

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

  if (!open) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(15, 22, 8, 0.72)',
        display: 'flex',
        alignItems: 'flex-end',
      }}
      onClick={() => onOpenChange(false)}
    >
      <div
        style={{
          width: '100%',
          background: '#FDFAF3',
          borderRadius: '24px 24px 0 0',
          padding: '0 20px',
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 28px)',
          maxHeight: '92dvh',
          overflowY: 'auto',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* handle */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, marginBottom: 4 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#DDD5C0' }} />
        </div>

        {/* header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, paddingBottom: 20 }}>
          <p style={{ fontFamily: 'var(--font-bricolage)', fontSize: 20, fontWeight: 700, color: '#1F2E15', margin: 0 }}>
            {editMode ? 'Editar usuário' : 'Novo usuário'}
          </p>
          <button
            onClick={() => onOpenChange(false)}
            style={{ width: 34, height: 34, borderRadius: 11, border: '1.5px solid #EDE3CC', background: '#FFFDF8', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <X size={16} color="#6B7A5A" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={labelStyle}>Nome *</label>
              <input
                style={inputStyle}
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Nome completo"
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Email *</label>
              <input
                style={inputStyle}
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="email@exemplo.com"
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Senha {!editMode && '*'}</label>
              <input
                style={inputStyle}
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={editMode ? 'Deixar em branco para manter' : 'Senha'}
                required={!editMode}
              />
            </div>

            <div>
              <label style={labelStyle}>Perfil *</label>
              <select
                style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
                value={role}
                onChange={e => setRole(e.target.value as UserRole)}
                required
              >
                <option value="ADMIN">Admin</option>
                <option value="OPERATOR">Operador</option>
                <option value="VIEWER">Visualizador</option>
              </select>
            </div>

            {editMode && (
              <div>
                <label style={labelStyle}>Status</label>
                <select
                  style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
                  value={active ? 'true' : 'false'}
                  onChange={e => setActive(e.target.value === 'true')}
                >
                  <option value="true">Ativo</option>
                  <option value="false">Inativo</option>
                </select>
              </div>
            )}

            {error && (
              <p style={{ fontSize: 13, color: '#C0392B', margin: 0 }}>{error}</p>
            )}

            <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                style={{
                  flex: 1,
                  height: 50,
                  borderRadius: 14,
                  border: '1.5px solid #EDE3CC',
                  background: '#FFFDF8',
                  fontSize: 15,
                  fontWeight: 700,
                  color: '#6B7A5A',
                  cursor: 'pointer',
                  opacity: loading ? 0.5 : 1,
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 1,
                  height: 50,
                  borderRadius: 14,
                  border: 'none',
                  background: '#2C3E1F',
                  fontSize: 15,
                  fontWeight: 700,
                  color: '#F5ECD7',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? 'Salvando…' : 'Salvar'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
