'use client'

import { useSession } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { ActivityList } from '@/components/activities/ActivityList'
import { getApiUrl } from '@/lib/api-url'

function todayDateLabel() {
  const now = new Date()
  const weekday = now.toLocaleDateString('pt-BR', { weekday: 'long' })
  const day = now.getDate()
  const month = now.toLocaleDateString('pt-BR', { month: 'long' })
  // Capitalize first letter
  const capitalWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1)
  return `${capitalWeekday}, ${day} de ${month}`
}

function isTodayDate(dateStr: string): boolean {
  const today = new Date()
  const d = new Date(dateStr)
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  )
}

export default function HistoricoAtividadesPage() {
  const { data: session, status } = useSession()
  const isAdmin = (session?.user as any)?.role === 'ADMIN'
  const [pendingCount, setPendingCount] = useState(0)

  const { data: activities = [] } = useQuery({
    queryKey: ['activities'],
    queryFn: () => fetch(getApiUrl('/api/activities')).then(r => r.json()),
    enabled: status === 'authenticated',
  })

  // Load pending count from offline db (operator only)
  useEffect(() => {
    if (isAdmin) return
    async function loadPending() {
      try {
        const { offlineDb } = await import('@/lib/offline/db')
        const count = await offlineDb.activities.where('syncStatus').equals('PENDING').count()
        setPendingCount(count)
      } catch {
        setPendingCount(0)
      }
    }
    loadPending()
  }, [isAdmin])

  if (status === 'loading') return null

  const todayCount = Array.isArray(activities)
    ? activities.filter((a: any) => a.date && isTodayDate(a.date)).length
    : 0

  // Admin filter chips (visual only — data already loaded)
  const [activeChip, setActiveChip] = useState('7d')
  const chips = [
    { id: '7d', label: 'Últimos 7 dias' },
    { id: 'all-sites', label: 'Todos os sítios' },
    { id: 'all-types', label: 'Todos os tipos' },
    { id: 'who', label: 'Quem fez' },
  ]

  if (isAdmin) {
    return (
      <div style={{ padding: '20px 20px', paddingBottom: 'calc(env(safe-area-inset-bottom) + 80px)' }}>
        {/* Title */}
        <h1
          style={{
            fontFamily: 'var(--font-bricolage)',
            fontSize: 26,
            fontWeight: 700,
            color: '#1F2E15',
            margin: '0 0 16px',
          }}
        >
          Atividades
        </h1>

        {/* Filter chips */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            marginBottom: 22,
            scrollbarWidth: 'none',
          }}
        >
          {chips.map(chip => (
            <button
              key={chip.id}
              onClick={() => setActiveChip(chip.id)}
              style={{
                height: 44,
                borderRadius: 9999,
                padding: '0 16px',
                border: activeChip === chip.id ? 'none' : '1.5px solid #D8CEBC',
                background: activeChip === chip.id ? '#3D5A2E' : '#FFFDF8',
                color: activeChip === chip.id ? '#F5ECD7' : '#6B7A5A',
                fontSize: 13.5,
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                transition: 'background 150ms ease, color 150ms ease',
              }}
            >
              {chip.label}
            </button>
          ))}
        </div>

        <ActivityList />
      </div>
    )
  }

  // Operator view
  return (
    <div style={{ padding: '20px 20px', paddingBottom: 'calc(env(safe-area-inset-bottom) + 80px)' }}>
      {/* Title + date */}
      <div style={{ marginBottom: 16 }}>
        <h1
          style={{
            fontFamily: 'var(--font-bricolage)',
            fontSize: 26,
            fontWeight: 700,
            color: '#1F2E15',
            margin: 0,
          }}
        >
          Meus lançamentos
        </h1>
        <p style={{ fontSize: 13.5, color: '#6B7A5A', margin: '4px 0 0' }}>
          {todayDateLabel()}
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 22 }}>
        {/* Today */}
        <div
          style={{
            flex: 1,
            borderRadius: 16,
            background: '#2C3E1F',
            padding: 14,
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: '#D4A843',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              margin: '0 0 6px',
            }}
          >
            HOJE
          </p>
          <p
            style={{
              fontFamily: 'var(--font-bricolage)',
              fontSize: 26,
              fontWeight: 700,
              color: '#F5ECD7',
              margin: 0,
              lineHeight: 1,
            }}
          >
            {todayCount}
          </p>
        </div>

        {/* To sync */}
        <div
          style={{
            flex: 1,
            borderRadius: 16,
            background: '#FFFDF8',
            border: '1.5px solid rgba(243,156,18,.4)',
            padding: 14,
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: '#B87708',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              margin: '0 0 6px',
            }}
          >
            A SINCRONIZAR
          </p>
          <p
            style={{
              fontFamily: 'var(--font-bricolage)',
              fontSize: 26,
              fontWeight: 700,
              color: '#B87708',
              margin: 0,
              lineHeight: 1,
            }}
          >
            {pendingCount}
          </p>
        </div>
      </div>

      <ActivityList />
    </div>
  )
}
