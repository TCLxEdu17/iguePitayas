/**
 * @jest-environment node
 */
// src/__tests__/api/notifications.test.ts
import { NextRequest } from 'next/server'

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

jest.mock('@/lib/auth', () => ({
  authOptions: {},
}))

jest.mock('@/lib/db', () => ({
  db: {
    pushToken: {
      upsert: jest.fn(),
    },
  },
}))

import { POST } from '@/app/api/notifications/register/route'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'

const mockSession = { user: { id: 'user-1', role: 'OPERATOR' } }

describe('POST /api/notifications/register', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue(null)
    const req = new NextRequest('http://localhost/api/notifications/register', {
      method: 'POST',
      body: JSON.stringify({ token: 'abc', platform: 'android' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 400 when token is missing', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
    const req = new NextRequest('http://localhost/api/notifications/register', {
      method: 'POST',
      body: JSON.stringify({ platform: 'android' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('upserts token and returns 200', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
    ;(db.pushToken.upsert as jest.Mock).mockResolvedValue({ id: 'pt-1' })
    const req = new NextRequest('http://localhost/api/notifications/register', {
      method: 'POST',
      body: JSON.stringify({ token: 'fcm-token-xyz', platform: 'android' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(db.pushToken.upsert).toHaveBeenCalledWith({
      where: { token: 'fcm-token-xyz' },
      update: { userId: 'user-1', platform: 'android' },
      create: { token: 'fcm-token-xyz', userId: 'user-1', platform: 'android' },
    })
  })
})
