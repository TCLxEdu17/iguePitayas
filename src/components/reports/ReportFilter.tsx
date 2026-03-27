'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ReportFilterProps {
  onFilter: (params: { startDate: string; endDate: string }) => void
  loading?: boolean
}

function thisMonthRange() {
  const now   = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end   = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return {
    startDate: start.toISOString().split('T')[0],
    endDate:   end.toISOString().split('T')[0],
  }
}

export function ReportFilter({ onFilter, loading }: ReportFilterProps) {
  const defaults = thisMonthRange()
  const [startDate, setStartDate] = useState(defaults.startDate)
  const [endDate,   setEndDate]   = useState(defaults.endDate)

  function setPreset(days: number) {
    const end   = new Date()
    const start = new Date()
    start.setDate(end.getDate() - days + 1)
    setStartDate(start.toISOString().split('T')[0])
    setEndDate(end.toISOString().split('T')[0])
  }

  return (
    <div className="space-y-4 rounded-lg border bg-white p-4">
      <div className="flex gap-2 flex-wrap">
        <Button size="sm" variant="outline" onClick={() => {
          const d = thisMonthRange()
          setStartDate(d.startDate)
          setEndDate(d.endDate)
        }}>Este mês</Button>
        <Button size="sm" variant="outline" onClick={() => setPreset(7)}>7 dias</Button>
        <Button size="sm" variant="outline" onClick={() => setPreset(30)}>30 dias</Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Data início</Label>
          <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Data fim</Label>
          <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
      </div>

      <Button
        style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
        onClick={() => onFilter({ startDate, endDate })}
        disabled={loading}
      >
        {loading ? 'Gerando...' : 'Gerar Relatório'}
      </Button>
    </div>
  )
}
