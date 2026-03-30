/**
 * @jest-environment node
 */
import { GET } from '@/app/api/admin/audit/route'
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'

jest.mock('@/lib/auth', () => ({ authOptions: {} }))
jest.mock('next-auth', () => ({ getServerSession: jest.fn() }))
jest.mock('@/lib/db', () => ({
  db: {
    auditLog: {
      findMany: jest.fn(),
    },
  },
}))

import { getServerSession } from 'next-auth'
const mockSession = getServerSession as jest.Mock

describe('GET /api/admin/audit', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    mockSession.mockResolvedValue(null)
    const req = new NextRequest('http://localhost/api/admin/audit')
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it('returns 403 when not ADMIN', async () => {
    mockSession.mockResolvedValue({ user: { id: 'u1', role: 'OPERATOR' } })
    const req = new NextRequest('http://localhost/api/admin/audit')
    const res = await GET(req)
    expect(res.status).toBe(403)
  })

  it('returns audit logs for today when no date param', async () => {
    mockSession.mockResolvedValue({ user: { id: 'u1', role: 'ADMIN' } })
    ;(db.auditLog.findMany as jest.Mock).mockResolvedValue([
      { id: 'log1', action: 'CREATE_ACTIVITY', description: 'João criou algo', createdAt: new Date(), user: { name: 'João' } },
    ])
    const req = new NextRequest('http://localhost/api/admin/audit')
    const res = await GET(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toHaveLength(1)
    expect(body[0].user.name).toBe('João')
  })

  it('accepts date query param', async () => {
    mockSession.mockResolvedValue({ user: { id: 'u1', role: 'ADMIN' } })
    ;(db.auditLog.findMany as jest.Mock).mockResolvedValue([])
    const req = new NextRequest('http://localhost/api/admin/audit?date=2026-03-28')
    const res = await GET(req)
    expect(res.status).toBe(200)
    expect(db.auditLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          createdAt: expect.objectContaining({ gte: expect.any(Date) }),
        }),
      })
    )
  })
})
