'use client'

import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { ACTIVITY_LABELS, ACTIVITY_COLORS, unitLabel } from '@/types'
import type { Unit } from '@/types'
import { ACTIVITY_ICONS } from '@/lib/activity-icons'
import { getApiUrl } from '@/lib/api-url'

function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

function formatGroupDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.getTime() === today.getTime()) return 'Hoje'
  if (date.getTime() === yesterday.getTime()) return 'Ontem'

  return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }).toUpperCase()
}

function formatGroupLabel(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (date.getTime() === today.getTime()) {
    const day = date.getDate()
    const month = date.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '')
    return `HOJE · ${day} ${month}`
  }

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.getTime() === yesterday.getTime()) {
    const day = date.getDate()
    const month = date.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '')
    return `ONTEM · ${day} ${month}`
  }

  return date.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })
    .toUpperCase()
    .replace(/\./g, '')
}

// Operator list item
function OperatorItem({ activity }: { activity: any }) {
  const type = activity.type as keyof typeof ACTIVITY_LABELS
  const color = ACTIVITY_COLORS[type] ?? '#95A5A6'
  const Icon = ACTIVITY_ICONS[type]
  const isPending = activity.syncStatus === 'PENDING' || !activity.confirmed
  const label = ACTIVITY_LABELS[type] ?? activity.type
  const siteName = activity.plot?.site?.name ?? ''
  const plotName = activity.plot?.name ?? activity.plot?.code ?? ''
  const location = [siteName, plotName].filter(Boolean).join(' · ')
  const qty = activity.quantity != null ? `${activity.quantity} ${activity.unit ? (unitLabel(activity.unit as Unit, activity.quantity ?? 1)) : ''}` : '—'

  return (
    <div
      style={{
        borderRadius: 14,
        background: '#FFFDF8',
        border: '1px solid #E8DDC2',
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 9,
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 11,
          background: hexToRgba(color, 0.12),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {Icon && <Icon size={18} color={color} strokeWidth={1.9} />}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14.5, fontWeight: 700, color: '#1F2E15', margin: 0, lineHeight: 1.2 }}>
          {label}
        </p>
        <p style={{ fontSize: 12, color: '#8B9A7A', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {location}
        </p>
      </div>

      {/* Right */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#3D5A2E', margin: 0 }}>{qty}</p>
        <p style={{ fontSize: 11, margin: '2px 0 0', color: isPending ? '#B87708' : '#6E8F4E', fontWeight: 600 }}>
          {isPending ? 'Na fila' : 'Enviado'}
        </p>
      </div>
    </div>
  )
}

// Admin list item
function AdminItem({ activity }: { activity: any }) {
  const type = activity.type as keyof typeof ACTIVITY_LABELS
  const color = ACTIVITY_COLORS[type] ?? '#95A5A6'
  const Icon = ACTIVITY_ICONS[type]
  const label = ACTIVITY_LABELS[type] ?? activity.type
  const siteName = activity.plot?.site?.name ?? ''
  const plotName = activity.plot?.name ?? activity.plot?.code ?? ''
  const location = [siteName, plotName].filter(Boolean).join(' · ')
  const qty = activity.quantity != null ? `${activity.quantity} ${activity.unit ? (unitLabel(activity.unit as Unit, activity.quantity ?? 1)) : ''}` : '—'
  const cost = activity.cost != null ? `R$ ${activity.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : null

  return (
    <div
      style={{
        borderRadius: 14,
        background: '#FFFDF8',
        border: '1px solid #E8DDC2',
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 9,
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 11,
          background: hexToRgba(color, 0.12),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {Icon && <Icon size={18} color={color} strokeWidth={1.9} />}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14.5, fontWeight: 700, color: '#1F2E15', margin: 0, lineHeight: 1.2 }}>
          {label}
        </p>
        <p style={{ fontSize: 12, color: '#8B9A7A', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {location} {activity.responsible ? `· ${activity.responsible}` : ''}
        </p>
      </div>

      {/* Right */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#3D5A2E', margin: 0 }}>{qty}</p>
        {cost && (
          <p style={{ fontSize: 11.5, color: '#A8632F', margin: '2px 0 0' }}>{cost}</p>
        )}
      </div>
    </div>
  )
}

export function ActivityList() {
  const { data: session } = useSession()
  const isAdmin = (session?.user as any)?.role === 'ADMIN'

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['activities'],
    queryFn: () => fetch(getApiUrl('/api/activities')).then(r => r.json()),
  })

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {[1, 2, 3].map(i => (
          <div
            key={i}
            style={{ height: 58, borderRadius: 14, background: '#E8DDC2' }}
            className="animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (isAdmin) {
    // Group by date
    const grouped: Record<string, any[]> = {}
    for (const a of activities) {
      const dateKey = a.date?.split('T')[0] ?? 'unknown'
      if (!grouped[dateKey]) grouped[dateKey] = []
      grouped[dateKey].push(a)
    }
    const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        {sortedDates.map(dateKey => (
          <div key={dateKey}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: '#9AA88A', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
                {formatGroupLabel(dateKey)}
              </span>
              <span style={{ fontSize: 12, color: '#B0BCA0' }}>
                {grouped[dateKey].length}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {grouped[dateKey].map((a: any) => (
                <AdminItem key={a.id} activity={a} />
              ))}
            </div>
          </div>
        ))}
        {sortedDates.length === 0 && (
          <p style={{ textAlign: 'center', fontSize: 13.5, color: '#6B7A5A', paddingTop: 40 }}>
            Nenhuma atividade registrada.
          </p>
        )}
      </div>
    )
  }

  // Operator view
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
      {activities.map((a: any) => (
        <OperatorItem key={a.id} activity={a} />
      ))}
      {activities.length === 0 && (
        <p style={{ textAlign: 'center', fontSize: 13.5, color: '#6B7A5A', paddingTop: 40 }}>
          Nada lançado ainda hoje.
        </p>
      )}
    </div>
  )
}
