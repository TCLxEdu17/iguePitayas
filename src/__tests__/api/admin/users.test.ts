/**
 * @jest-environment node
 */
// src/__tests__/api/admin/users.test.ts

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

jest.mock('@/lib/auth', () => ({
  authOptions: {},
}))

jest.mock('@/lib/db', () => ({
  db: {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}))

jest.mock('@/lib/audit', () => ({ logAction: jest.fn() }))
jest.mock('@/lib/push', () => ({ sendToAdmins: jest.fn() }))
jest.mock('bcryptjs', () => ({ hash: jest.fn().mockResolvedValue('hashed') }))

import { GET, POST } from '@/app/api/admin/users/route'
import { PUT } from '@/app/api/admin/users/[id]/route'
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'

const mockSession = getServerSession as jest.Mock

describe('GET /api/admin/users', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    mockSession.mockResolvedValue(null)
    const req = new NextRequest('http://localhost/api/admin/users')
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it('returns 403 when not ADMIN', async () => {
    mockSession.mockResolvedValue({ user: { id: 'u1', role: 'OPERATOR' } })
    const req = new NextRequest('http://localhost/api/admin/users')
    const res = await GET(req)
    expect(res.status).toBe(403)
  })

  it('returns users list without passwordHash', async () => {
    mockSession.mockResolvedValue({ user: { id: 'u1', role: 'ADMIN' } })
    ;(db.user.findMany as jest.Mock).mockResolvedValue([
      { id: 'u1', name: 'Admin', email: 'a@b.com', role: 'ADMIN', active: true, createdAt: new Date() },
    ])
    const req = new NextRequest('http://localhost/api/admin/users')
    const res = await GET(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toHaveLength(1)
    expect(body[0]).not.toHaveProperty('passwordHash')
  })
})

describe('POST /api/admin/users', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    mockSession.mockResolvedValue(null)
    const req = new NextRequest('http://localhost/api/admin/users', {
      method: 'POST',
      body: JSON.stringify({ name: 'Maria', email: 'm@b.com', password: 'secret', role: 'VIEWER' }),
      headers: { 'content-type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 400 on invalid body', async () => {
    mockSession.mockResolvedValue({ user: { id: 'u1', role: 'ADMIN' } })
    const req = new NextRequest('http://localhost/api/admin/users', {
      method: 'POST',
      body: JSON.stringify({ name: 'M', email: 'bad', password: '123', role: 'ADMIN' }),
      headers: { 'content-type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('creates user and returns 201', async () => {
    mockSession.mockResolvedValue({ user: { id: 'u1', role: 'ADMIN' } })
    ;(db.user.create as jest.Mock).mockResolvedValue({
      id: 'u2', name: 'Maria', email: 'm@b.com', role: 'VIEWER', active: true, createdAt: new Date(),
    })
    const req = new NextRequest('http://localhost/api/admin/users', {
      method: 'POST',
      body: JSON.stringify({ name: 'Maria', email: 'm@b.com', password: 'secret123', role: 'VIEWER' }),
      headers: { 'content-type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(201)
  })
})

describe('PUT /api/admin/users/[id]', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 403 when not ADMIN', async () => {
    mockSession.mockResolvedValue({ user: { id: 'u1', role: 'OPERATOR' } })
    const req = new NextRequest('http://localhost/api/admin/users/u2', {
      method: 'PUT',
      body: JSON.stringify({ name: 'New Name' }),
      headers: { 'content-type': 'application/json' },
    })
    const res = await PUT(req, { params: Promise.resolve({ id: 'u2' }) })
    expect(res.status).toBe(403)
  })

  it('prevents admin from deactivating their own account', async () => {
    mockSession.mockResolvedValue({ user: { id: 'u1', role: 'ADMIN' } })
    const req = new NextRequest('http://localhost/api/admin/users/u1', {
      method: 'PUT',
      body: JSON.stringify({ active: false }),
      headers: { 'content-type': 'application/json' },
    })
    const res = await PUT(req, { params: Promise.resolve({ id: 'u1' }) })
    expect(res.status).toBe(400)
  })

  it('updates user and returns 200', async () => {
    mockSession.mockResolvedValue({ user: { id: 'u1', role: 'ADMIN' } })
    ;(db.user.update as jest.Mock).mockResolvedValue({
      id: 'u2', name: 'Updated', email: 'u@b.com', role: 'VIEWER', active: true, createdAt: new Date(),
    })
    const req = new NextRequest('http://localhost/api/admin/users/u2', {
      method: 'PUT',
      body: JSON.stringify({ name: 'Updated' }),
      headers: { 'content-type': 'application/json' },
    })
    const res = await PUT(req, { params: Promise.resolve({ id: 'u2' }) })
    expect(res.status).toBe(200)
  })
})
