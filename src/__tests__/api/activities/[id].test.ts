/**
 * @jest-environment node
 */
// src/__tests__/api/activities/[id].test.ts

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

jest.mock('@/lib/auth', () => ({
  authOptions: {},
}))

jest.mock('@/lib/db', () => ({
  db: {
    activity: {
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}))

jest.mock('@/lib/audit', () => ({ logAction: jest.fn() }))
jest.mock('@/lib/push', () => ({ sendToAdmins: jest.fn() }))

import { PUT, DELETE } from '@/app/api/activities/[id]/route'
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { logAction } from '@/lib/audit'
import { sendToAdmins } from '@/lib/push'

const mockSession = {
  user: { id: 'u1', name: 'Eduardo', email: 'edu@farm.com', role: 'OPERATOR' },
}

describe('PUT /api/activities/[id]', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue(null)
    const req = new NextRequest('http://localhost/api/activities/a1', {
      method: 'PUT',
      body: JSON.stringify({ responsible: 'Maria' }),
      headers: { 'content-type': 'application/json' },
    })
    const res = await PUT(req, { params: Promise.resolve({ id: 'a1' }) })
    expect(res.status).toBe(401)
  })

  it('returns 403 when user is VIEWER', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue({ user: { ...mockSession.user, role: 'VIEWER' } })
    const req = new NextRequest('http://localhost/api/activities/a1', {
      method: 'PUT',
      body: JSON.stringify({ responsible: 'Maria' }),
      headers: { 'content-type': 'application/json' },
    })
    const res = await PUT(req, { params: Promise.resolve({ id: 'a1' }) })
    expect(res.status).toBe(403)
  })

  it('updates activity, calls logAction and sendToAdmins, returns 200', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
    ;(db.activity.update as jest.Mock).mockResolvedValue({
      id: 'a1',
      type: 'PULVERIZACAO',
      plot: { name: 'Talhão Sul' },
    })
    const req = new NextRequest('http://localhost/api/activities/a1', {
      method: 'PUT',
      body: JSON.stringify({ responsible: 'Maria' }),
      headers: { 'content-type': 'application/json' },
    })
    const res = await PUT(req, { params: Promise.resolve({ id: 'a1' }) })
    expect(res.status).toBe(200)
    expect(logAction).toHaveBeenCalledWith(expect.objectContaining({ action: 'EDIT_ACTIVITY' }))
    expect(sendToAdmins).toHaveBeenCalled()
  })
})

describe('DELETE /api/activities/[id]', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue(null)
    const req = new NextRequest('http://localhost/api/activities/a1', { method: 'DELETE' })
    const res = await DELETE(req, { params: Promise.resolve({ id: 'a1' }) })
    expect(res.status).toBe(401)
  })

  it('returns 403 when user is VIEWER', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue({ user: { ...mockSession.user, role: 'VIEWER' } })
    const req = new NextRequest('http://localhost/api/activities/a1', { method: 'DELETE' })
    const res = await DELETE(req, { params: Promise.resolve({ id: 'a1' }) })
    expect(res.status).toBe(403)
  })

  it('deletes activity, calls logAction and sendToAdmins, returns 204', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
    ;(db.activity.findUnique as jest.Mock).mockResolvedValue({
      id: 'a1',
      plot: { name: 'Talhão Norte' },
    })
    ;(db.activity.delete as jest.Mock).mockResolvedValue({})
    const req = new NextRequest('http://localhost/api/activities/a1', { method: 'DELETE' })
    const res = await DELETE(req, { params: Promise.resolve({ id: 'a1' }) })
    expect(res.status).toBe(204)
    expect(logAction).toHaveBeenCalledWith(expect.objectContaining({ action: 'DELETE_ACTIVITY' }))
    expect(sendToAdmins).toHaveBeenCalled()
  })
})
