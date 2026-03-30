/**
 * @jest-environment node
 */
import { POST } from '@/app/api/cron/weekly-report/route'
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'

jest.mock('@/lib/db', () => ({
  db: {
    activity: { count: jest.fn() },
    harvest: { count: jest.fn(), aggregate: jest.fn() },
    plot: { count: jest.fn() },
  },
}))
jest.mock('@/lib/push', () => ({ sendToAdmins: jest.fn() }))

describe('POST /api/cron/weekly-report', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.CRON_SECRET = 'test-secret'
  })

  afterEach(() => {
    delete process.env.CRON_SECRET
  })

  it('returns 401 when Authorization header is missing', async () => {
    const req = new NextRequest('http://localhost/api/cron/weekly-report', { method: 'POST' })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 401 when Authorization token is wrong', async () => {
    const req = new NextRequest('http://localhost/api/cron/weekly-report', {
      method: 'POST',
      headers: { Authorization: 'Bearer wrong-secret' },
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('calls sendToAdmins with weekly summary when authorized', async () => {
    ;(db.activity.count as jest.Mock).mockResolvedValue(12)
    ;(db.harvest.count as jest.Mock).mockResolvedValue(3)
    ;(db.harvest.aggregate as jest.Mock).mockResolvedValue({ _sum: { totalRevenue: 4200 } })
    ;(db.plot.count as jest.Mock).mockResolvedValue(5)

    const { sendToAdmins } = require('@/lib/push')

    const req = new NextRequest('http://localhost/api/cron/weekly-report', {
      method: 'POST',
      headers: { Authorization: 'Bearer test-secret' },
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(sendToAdmins).toHaveBeenCalledWith(
      'Relatório Semanal',
      expect.stringContaining('atividades')
    )
  })
})
