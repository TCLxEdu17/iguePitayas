/**
 * @jest-environment node
 */
// src/__tests__/api/harvests/[id].test.ts

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

jest.mock('@/lib/auth', () => ({
  authOptions: {},
}))

jest.mock('@/lib/db', () => ({
  db: {
    harvest: {
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}))

jest.mock('@/lib/audit', () => ({ logAction: jest.fn() }))
jest.mock('@/lib/push', () => ({ sendToAdmins: jest.fn() }))

import { PUT, DELETE } from '@/app/api/harvests/[id]/route'
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { logAction } from '@/lib/audit'
import { sendToAdmins } from '@/lib/push'

const mockSession = {
  user: { id: 'u1', name: 'Eduardo', email: 'edu@farm.com', role: 'OPERATOR' },
}

describe('PUT /api/harvests/[id]', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue(null)
    const req = new NextRequest('http://localhost/api/harvests/h1', {
      method: 'PUT',
      body: JSON.stringify({ quantity: 150 }),
      headers: { 'content-type': 'application/json' },
    })
    const res = await PUT(req, { params: Promise.resolve({ id: 'h1' }) })
    expect(res.status).toBe(401)
  })

  it('returns 403 when user is VIEWER', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue({ user: { ...mockSession.user, role: 'VIEWER' } })
    const req = new NextRequest('http://localhost/api/harvests/h1', {
      method: 'PUT',
      body: JSON.stringify({ quantity: 150 }),
      headers: { 'content-type': 'application/json' },
    })
    const res = await PUT(req, { params: Promise.resolve({ id: 'h1' }) })
    expect(res.status).toBe(403)
  })

  it('updates harvest, calls logAction with EDIT_HARVEST and sendToAdmins with Colheita editada, returns 200', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
    ;(db.harvest.update as jest.Mock).mockResolvedValue({
      id: 'h1',
      quantity: 150,
      plot: { name: 'Talhão Sul' },
    })
    const req = new NextRequest('http://localhost/api/harvests/h1', {
      method: 'PUT',
      body: JSON.stringify({ quantity: 150 }),
      headers: { 'content-type': 'application/json' },
    })
    const res = await PUT(req, { params: Promise.resolve({ id: 'h1' }) })
    expect(res.status).toBe(200)
    expect(logAction).toHaveBeenCalledWith(expect.objectContaining({ action: 'EDIT_HARVEST' }))
    expect(sendToAdmins).toHaveBeenCalledWith('Colheita editada', expect.any(String))
  })
})

describe('DELETE /api/harvests/[id]', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue(null)
    const req = new NextRequest('http://localhost/api/harvests/h1', { method: 'DELETE' })
    const res = await DELETE(req, { params: Promise.resolve({ id: 'h1' }) })
    expect(res.status).toBe(401)
  })

  it('returns 403 when user is VIEWER', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue({ user: { ...mockSession.user, role: 'VIEWER' } })
    const req = new NextRequest('http://localhost/api/harvests/h1', { method: 'DELETE' })
    const res = await DELETE(req, { params: Promise.resolve({ id: 'h1' }) })
    expect(res.status).toBe(403)
  })

  it('deletes harvest, calls logAction with DELETE_HARVEST and sendToAdmins with Colheita removida, returns 204', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
    ;(db.harvest.findUnique as jest.Mock).mockResolvedValue({
      id: 'h1',
      plot: { name: 'Talhão Norte' },
    })
    ;(db.harvest.delete as jest.Mock).mockResolvedValue({})
    const req = new NextRequest('http://localhost/api/harvests/h1', { method: 'DELETE' })
    const res = await DELETE(req, { params: Promise.resolve({ id: 'h1' }) })
    expect(res.status).toBe(204)
    expect(logAction).toHaveBeenCalledWith(expect.objectContaining({ action: 'DELETE_HARVEST' }))
    expect(sendToAdmins).toHaveBeenCalledWith('Colheita removida', expect.any(String))
  })
})
