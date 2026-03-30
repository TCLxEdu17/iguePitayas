import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendToAdmins } from '@/lib/push'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const auth = req.headers.get('Authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7) - 7)
  monday.setHours(0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)

  const where = { createdAt: { gte: monday, lte: sunday } }

  const [activityCount, harvestCount, revenueAgg, activePlotCount] = await Promise.all([
    db.activity.count({ where }),
    db.harvest.count({ where }),
    db.harvest.aggregate({ where, _sum: { totalRevenue: true } }),
    db.plot.count({ where: { status: 'ACTIVE' } }),
  ])

  const revenue = revenueAgg._sum.totalRevenue ?? 0
  const startStr = monday.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  const endStr = sunday.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  const message = `Semana ${startStr}–${endStr}: ${activityCount} atividades, ${harvestCount} colheitas, R$ ${revenue.toLocaleString('pt-BR')} de receita`

  await sendToAdmins('Relatório Semanal', message)

  return NextResponse.json({ ok: true, message })
}
