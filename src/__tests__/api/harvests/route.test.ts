/**
 * @jest-environment node
 */
// src/__tests__/api/harvests/route.test.ts

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

jest.mock('@/lib/auth', () => ({
  authOptions: {},
}))

jest.mock('@/lib/db', () => ({
  db: {
    harvest: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}))

jest.mock('@/lib/audit', () => ({ logAction: jest.fn() }))
jest.mock('@/lib/push', () => ({ sendToAdmins: jest.fn() }))

import { GET, POST } from '@/app/api/harvests/route'
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { logAction } from '@/lib/audit'
import { sendToAdmins } from '@/lib/push'

const mockSession = {
  user: { id: 'u1', name: 'Eduardo', email: 'edu@farm.com', role: 'OPERATOR' },
}

describe('GET /api/harvests', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue(null)
    const req = new NextRequest('http://localhost/api/harvests')
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it('returns harvests list', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
    ;(db.harvest.findMany as jest.Mock).mockResolvedValue([
      { id: 'h1', quantity: 100, plot: { code: 'P1', name: 'Talhão 1', productType: 'BANANA' } },
    ])
    const req = new NextRequest('http://localhost/api/harvests')
    const res = await GET(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toHaveLength(1)
  })
})

describe('POST /api/harvests', () => {
  beforeEach(() => jest.clearAllMocks())

  const validBody = {
    localId: 'local-123',
    plotId: 'plot-1',
    date: '2024-01-15',
    quantity: 200,
    unit: 'CAIXA',
    pricePerUnit: 5.5,
    totalRevenue: 1100,
  }

  it('returns 401 when not authenticated', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue(null)
    const req = new NextRequest('http://localhost/api/harvests', {
      method: 'POST',
      body: JSON.stringify(validBody),
      headers: { 'content-type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 403 when user is VIEWER', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue({ user: { ...mockSession.user, role: 'VIEWER' } })
    const req = new NextRequest('http://localhost/api/harvests', {
      method: 'POST',
      body: JSON.stringify(validBody),
      headers: { 'content-type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(403)
  })

  it('returns 422 on invalid body', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
    const req = new NextRequest('http://localhost/api/harvests', {
      method: 'POST',
      body: JSON.stringify({ localId: '', plotId: 'p1', date: '2024-01-01' }),
      headers: { 'content-type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(422)
  })

  it('returns 409 on conflict (localId already exists)', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
    ;(db.harvest.findUnique as jest.Mock).mockResolvedValue({ id: 'existing' })
    const req = new NextRequest('http://localhost/api/harvests', {
      method: 'POST',
      body: JSON.stringify(validBody),
      headers: { 'content-type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(409)
  })

  it('creates harvest, calls logAction with CREATE_HARVEST and sendToAdmins with Nova colheita, returns 201', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
    ;(db.harvest.findUnique as jest.Mock).mockResolvedValue(null)
    ;(db.harvest.create as jest.Mock).mockResolvedValue({
      id: 'h1',
      quantity: 200,
      plot: { name: 'Talhão Norte' },
    })
    const req = new NextRequest('http://localhost/api/harvests', {
      method: 'POST',
      body: JSON.stringify(validBody),
      headers: { 'content-type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(201)
    expect(logAction).toHaveBeenCalledWith(expect.objectContaining({ action: 'CREATE_HARVEST' }))
    expect(sendToAdmins).toHaveBeenCalledWith('Nova colheita', expect.any(String))
  })
})
