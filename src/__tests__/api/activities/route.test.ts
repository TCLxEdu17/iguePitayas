/**
 * @jest-environment node
 */
// src/__tests__/api/activities/route.test.ts

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

jest.mock('@/lib/auth', () => ({
  authOptions: {},
}))

jest.mock('@/lib/db', () => ({
  db: {
    activity: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}))

jest.mock('@/lib/audit', () => ({ logAction: jest.fn() }))
jest.mock('@/lib/push', () => ({ sendToAdmins: jest.fn() }))

import { GET, POST } from '@/app/api/activities/route'
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { logAction } from '@/lib/audit'
import { sendToAdmins } from '@/lib/push'

const mockSession = {
  user: { id: 'u1', name: 'Eduardo', email: 'edu@farm.com', role: 'OPERATOR' },
}

describe('GET /api/activities', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue(null)
    const req = new NextRequest('http://localhost/api/activities')
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it('returns activities list', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
    ;(db.activity.findMany as jest.Mock).mockResolvedValue([
      { id: 'a1', type: 'ROCAGEM', plot: { code: 'P1', name: 'Talhão 1', productType: 'BANANA' } },
    ])
    const req = new NextRequest('http://localhost/api/activities')
    const res = await GET(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toHaveLength(1)
  })
})

describe('POST /api/activities', () => {
  beforeEach(() => jest.clearAllMocks())

  const validBody = {
    localId: 'local-123',
    plotId: 'plot-1',
    date: '2024-01-15',
    type: 'ROCAGEM',
    responsible: 'João',
  }

  it('returns 401 when not authenticated', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue(null)
    const req = new NextRequest('http://localhost/api/activities', {
      method: 'POST',
      body: JSON.stringify(validBody),
      headers: { 'content-type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 403 when user is VIEWER', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue({ user: { ...mockSession.user, role: 'VIEWER' } })
    const req = new NextRequest('http://localhost/api/activities', {
      method: 'POST',
      body: JSON.stringify(validBody),
      headers: { 'content-type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(403)
  })

  it('returns 422 on invalid body', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
    const req = new NextRequest('http://localhost/api/activities', {
      method: 'POST',
      body: JSON.stringify({ localId: '', plotId: 'p1', date: '2024-01-01', type: 'INVALID', responsible: 'X' }),
      headers: { 'content-type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(422)
  })

  it('returns 409 on conflict (localId already exists)', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
    ;(db.activity.findUnique as jest.Mock).mockResolvedValue({ id: 'existing' })
    const req = new NextRequest('http://localhost/api/activities', {
      method: 'POST',
      body: JSON.stringify(validBody),
      headers: { 'content-type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(409)
  })

  it('creates activity, calls logAction and sendToAdmins, returns 201', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
    ;(db.activity.findUnique as jest.Mock).mockResolvedValue(null)
    ;(db.activity.create as jest.Mock).mockResolvedValue({
      id: 'a1',
      type: 'ROCAGEM',
      plot: { name: 'Talhão Norte' },
    })
    const req = new NextRequest('http://localhost/api/activities', {
      method: 'POST',
      body: JSON.stringify(validBody),
      headers: { 'content-type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(201)
    expect(logAction).toHaveBeenCalledWith(expect.objectContaining({ action: 'CREATE_ACTIVITY' }))
    expect(sendToAdmins).toHaveBeenCalled()
  })
})
