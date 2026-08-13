'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import {
  Map, Pencil, Bell, WifiOff, DollarSign, Tag, Wheat, RefreshCw, Clock, Users, ChevronRight, Moon, Sun,
} from 'lucide-react'
import Link from 'next/link'
import { useSyncStore } from '@/stores/sync.store'
import { getApiUrl } from '@/lib/api-url'
import { syncAll, getPendingCount } from '@/lib/offline/sync'
import { useUIStore } from '@/stores/ui.store'

const APP_VERSION = '0.1.10'

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: 11.5,
        fontWeight: 700,
        color: 'var(--color-ink-faint)',
        textTransform: 'uppercase',
        letterSpacing: '0.14em',
        margin: '0 0 10px',
      }}
    >
      {children}
    </p>
  )
}

interface SettingsRowProps {
  icon: React.ReactNode
  label: string
  subtitle?: string
  value?: React.ReactNode
  isLast?: boolean
}

function SettingsRow({ icon, label, subtitle, value, isLast }: SettingsRowProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        minHeight: 52,
        padding: '0 16px',
        borderBottom: isLast ? 'none' : '1px solid var(--color-line)',
      }}
    >
      <div style={{ color: 'var(--color-ink-soft)', flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14.5, color: 'var(--color-ink)', margin: 0, fontWeight: 500 }}>{label}</p>
        {subtitle && (
          <p style={{ fontSize: 12, color: 'var(--color-ink-faint)', margin: 0 }}>{subtitle}</p>
        )}
      </div>
      {value && (
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-ink-faint)', flexShrink: 0 }}>
          {value}
        </div>
      )}
    </div>
  )
}

function OperatorProfile({ session }: { session: any }) {
  const pendingCount = useSyncStore(s => s.pendingCount)
  const setPending = useSyncStore(s => s.setPending)
  const [syncing, setSyncing] = useState(false)
  const darkMode = useUIStore(s => s.darkMode)
  const toggleDarkMode = useUIStore(s => s.toggleDarkMode)

  async function handleSync() {
    if (syncing) return
    setSyncing(true)
    try {
      await syncAll()
      setPending(await getPendingCount())
    } finally {
      setSyncing(false)
    }
  }
  const name: string = session?.user?.name ?? ''
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
  const siteName = (session?.user as any)?.siteName ?? 'Sede'

  return (
    <div style={{ padding: '20px 20px', paddingBottom: 'calc(env(safe-area-inset-bottom) + 80px)' }}>
      {/* Identity card */}
      <div
        style={{
          borderRadius: 20,
          background: '#2C3E1F',
          padding: 18,
          marginBottom: 22,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: 18,
              background: 'rgba(212,168,67,.22)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-bricolage)',
                fontSize: 22,
                fontWeight: 700,
                color: '#D4A843',
              }}
            >
              {initials || '?'}
            </span>
          </div>
          <div>
            <p
              style={{
                fontFamily: 'var(--font-bricolage)',
                fontSize: 20,
                fontWeight: 700,
                color: '#F5ECD7',
                margin: 0,
              }}
            >
              {name || 'Operador'}
            </p>
            <p style={{ fontSize: 12.5, color: 'rgba(245,236,215,.65)', margin: '2px 0 0' }}>
              Operador · {siteName}
            </p>
          </div>
        </div>
      </div>

      {/* Sincronização */}
      <div style={{ marginBottom: 22 }}>
        <SectionLabel>Sincronização</SectionLabel>
        <div
          style={{
            borderRadius: 18,
            background: 'var(--color-surface)',
            border: '1px solid var(--color-line)',
            padding: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div
              style={{
                width: 9,
                height: 9,
                borderRadius: '50%',
                background: '#F39C12',
                flexShrink: 0,
              }}
            />
            <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-ink)', margin: 0, flex: 1 }}>
              {pendingCount} {pendingCount === 1 ? 'lançamento na fila' : 'lançamentos na fila'}
            </p>
            <p style={{ fontSize: 12, color: 'var(--color-ink-faint)', margin: 0 }}>agora</p>
          </div>
          <button
            onClick={handleSync}
            disabled={syncing || pendingCount === 0}
            style={{
              height: 44,
              width: '100%',
              borderRadius: 13,
              border: '1.5px solid var(--color-line-strong)',
              background: 'var(--color-surface)',
              fontSize: 14,
              fontWeight: 700,
              color: syncing || pendingCount === 0 ? 'var(--color-ink-faint)' : 'var(--color-primary)',
              cursor: syncing || pendingCount === 0 ? 'not-allowed' : 'pointer',
              transition: 'color 150ms ease',
            }}
          >
            {syncing ? 'Sincronizando…' : 'Sincronizar agora'}
          </button>
        </div>
      </div>

      {/* Preferências */}
      <div style={{ marginBottom: 22 }}>
        <SectionLabel>Preferências</SectionLabel>
        <div
          style={{
            borderRadius: 18,
            background: 'var(--color-surface)',
            border: '1px solid var(--color-line)',
            overflow: 'hidden',
          }}
        >
          <SettingsRow
            icon={<Map size={19} strokeWidth={1.9} />}
            label="Sítio padrão"
            value={siteName}
          />
          <SettingsRow
            icon={<Pencil size={19} strokeWidth={1.9} />}
            label="Unidade preferida"
            value="Caixa"
          />
          <SettingsRow
            icon={<Bell size={19} strokeWidth={1.9} />}
            label="Avisos de sincronia"
            value="Ligado"
          />
          <SettingsRow
            icon={<WifiOff size={19} strokeWidth={1.9} />}
            label="Modo economia"
            value="Auto"
          />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              minHeight: 52,
              padding: '0 16px',
            }}
          >
            <div style={{ color: 'var(--color-ink-soft)', flexShrink: 0 }}>
              {darkMode ? <Moon size={19} strokeWidth={1.9} /> : <Sun size={19} strokeWidth={1.9} />}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14.5, color: 'var(--color-ink)', margin: 0, fontWeight: 500 }}>Aparência</p>
            </div>
            <button
              onClick={toggleDarkMode}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                height: 32,
                padding: '0 14px',
                borderRadius: 20,
                border: '1.5px solid var(--color-line-strong)',
                background: darkMode ? '#2C3E1F' : '#F5ECD7',
                fontSize: 12.5,
                fontWeight: 700,
                color: darkMode ? '#D4A843' : '#3D5A2E',
                cursor: 'pointer',
                minHeight: 32,
              }}
            >
              {darkMode ? 'Escuro' : 'Claro'}
            </button>
          </div>
        </div>
      </div>

      {/* Sair */}
      <button
        onClick={() => signOut({ callbackUrl: '/login' })}
        style={{
          width: '100%',
          height: 52,
          borderRadius: 16,
          border: '1.5px solid rgba(192,57,43,.4)',
          background: 'transparent',
          fontSize: 15,
          fontFamily: 'var(--font-bricolage)',
          fontWeight: 700,
          color: '#C0392B',
          cursor: 'pointer',
          marginBottom: 16,
          transition: 'border-color 150ms ease',
        }}
      >
        Sair
      </button>

      <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--color-ink-faint)', margin: 0 }}>
        IGUE Bananas · v{APP_VERSION}
      </p>
    </div>
  )
}

function AdminSettings({ session }: { session: any }) {
  const darkMode = useUIStore(s => s.darkMode)
  const toggleDarkMode = useUIStore(s => s.toggleDarkMode)

  return (
    <div style={{ padding: '20px 20px', paddingBottom: 'calc(env(safe-area-inset-bottom) + 80px)' }}>
      <h1
        style={{
          fontFamily: 'var(--font-bricolage)',
          fontSize: 26,
          fontWeight: 700,
          color: 'var(--color-ink)',
          margin: '0 0 22px',
        }}
      >
        Configurações
      </h1>

      {/* Acesso rápido */}
      <div style={{ marginBottom: 22 }}>
        <SectionLabel>Gestão</SectionLabel>
        <div style={{ borderRadius: 18, background: 'var(--color-surface)', border: '1px solid var(--color-line)', overflow: 'hidden' }}>
          <Link href="/admin/usuarios" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 56, padding: '0 16px', borderBottom: '1px solid var(--color-line)' }}>
              <Users size={19} strokeWidth={1.9} color="var(--color-ink-soft)" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14.5, color: 'var(--color-ink)', margin: 0, fontWeight: 500 }}>Equipe</p>
                <p style={{ fontSize: 12, color: 'var(--color-ink-faint)', margin: 0 }}>Criar, editar e desativar usuários</p>
              </div>
              <ChevronRight size={16} color="var(--color-ink-faint)" />
            </div>
          </Link>
          <Link href="/relatorios" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 56, padding: '0 16px' }}>
              <RefreshCw size={19} strokeWidth={1.9} color="var(--color-ink-soft)" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14.5, color: 'var(--color-ink)', margin: 0, fontWeight: 500 }}>Relatórios de uso</p>
                <p style={{ fontSize: 12, color: 'var(--color-ink-faint)', margin: 0 }}>Margem, receita e comparativo por sítio</p>
              </div>
              <ChevronRight size={16} color="var(--color-ink-faint)" />
            </div>
          </Link>
        </div>
      </div>

      {/* Operação */}
      <div style={{ marginBottom: 22 }}>
        <SectionLabel>Operação</SectionLabel>
        <div
          style={{
            borderRadius: 18,
            background: 'var(--color-surface)',
            border: '1px solid var(--color-line)',
            overflow: 'hidden',
          }}
        >
          <SettingsRow
            icon={<Pencil size={19} strokeWidth={1.9} />}
            label="Unidades ativas"
            value="8"
          />
          <SettingsRow
            icon={<DollarSign size={19} strokeWidth={1.9} />}
            label="Tabela de preços"
            value={<a href="/admin/precos" style={{ color: '#3D5A2E', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>Editar</a>}
          />
          <SettingsRow
            icon={<Tag size={19} strokeWidth={1.9} />}
            label="Tipos de atividade"
            value="15"
            isLast
          />
        </div>
      </div>

      {/* Talhões e mapas */}
      <div style={{ marginBottom: 22 }}>
        <SectionLabel>Talhões e Mapas</SectionLabel>
        <div
          style={{
            borderRadius: 18,
            background: 'var(--color-surface)',
            border: '1px solid var(--color-line)',
            overflow: 'hidden',
          }}
        >
          <SettingsRow
            icon={<Map size={19} strokeWidth={1.9} />}
            label="Sítios"
            value="3"
          />
          <SettingsRow
            icon={<Wheat size={19} strokeWidth={1.9} />}
            label="Talhões"
            subtitle="Todos com polígono traçado"
            value="27"
            isLast
          />
        </div>
      </div>

      {/* Aparência */}
      <div style={{ marginBottom: 22 }}>
        <SectionLabel>Aparência</SectionLabel>
        <div style={{ borderRadius: 18, background: 'var(--color-surface)', border: '1px solid var(--color-line)', overflow: 'hidden' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              minHeight: 52,
              padding: '0 16px',
            }}
          >
            <div style={{ color: 'var(--color-ink-soft)', flexShrink: 0 }}>
              {darkMode ? <Moon size={19} strokeWidth={1.9} /> : <Sun size={19} strokeWidth={1.9} />}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14.5, color: 'var(--color-ink)', margin: 0, fontWeight: 500 }}>Tema</p>
            </div>
            <button
              onClick={toggleDarkMode}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                height: 32,
                padding: '0 14px',
                borderRadius: 20,
                border: '1.5px solid var(--color-line-strong)',
                background: darkMode ? '#2C3E1F' : '#F5ECD7',
                fontSize: 12.5,
                fontWeight: 700,
                color: darkMode ? '#D4A843' : '#3D5A2E',
                cursor: 'pointer',
                minHeight: 32,
              }}
            >
              {darkMode ? 'Escuro' : 'Claro'}
            </button>
          </div>
        </div>
      </div>

      {/* Sistema */}
      <div style={{ marginBottom: 22 }}>
        <SectionLabel>Sistema</SectionLabel>
        <div
          style={{
            borderRadius: 18,
            background: 'var(--color-surface)',
            border: '1px solid var(--color-line)',
            overflow: 'hidden',
          }}
        >
          <SettingsRow
            icon={<Bell size={19} strokeWidth={1.9} />}
            label="Resumo semanal"
            value="Domingo"
          />
          <SettingsRow
            icon={<RefreshCw size={19} strokeWidth={1.9} />}
            label="Sincronização"
            value="Automática"
          />
          <SettingsRow
            icon={<Clock size={19} strokeWidth={1.9} />}
            label="Registro de alterações"
            value={<span style={{ color: '#3D5A2E', fontWeight: 700, fontSize: 13 }}>Ver</span>}
            isLast
          />
        </div>
      </div>

      {/* Sair */}
      <button
        onClick={() => signOut({ callbackUrl: '/login' })}
        style={{
          width: '100%',
          height: 52,
          borderRadius: 16,
          border: '1.5px solid rgba(192,57,43,.4)',
          background: 'transparent',
          fontSize: 15,
          fontFamily: 'var(--font-bricolage)',
          fontWeight: 700,
          color: '#C0392B',
          cursor: 'pointer',
          marginBottom: 16,
          transition: 'border-color 150ms ease',
        }}
      >
        Sair
      </button>

      <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--color-ink-faint)', margin: 0 }}>
        IGUE Bananas · v{APP_VERSION} · 27 talhões mapeados
      </p>
    </div>
  )
}

export default function ConfiguracoesPage() {
  const { data: session, status } = useSession()

  if (status === 'loading') return null

  const role = (session?.user as any)?.role

  if (role === 'OPERATOR') {
    return <OperatorProfile session={session} />
  }

  if (role === 'ADMIN') {
    return <AdminSettings session={session} />
  }

  // Fallback
  return (
    <div style={{ padding: 20 }}>
      <p style={{ color: 'var(--color-ink-soft)' }}>Acesso restrito.</p>
    </div>
  )
}
