/**
 * @jest-environment node
 */

// Mock PrismaClient before importing db
jest.mock('@prisma/client', () => {
  const mockClient = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $transaction: jest.fn(),
  }
  return {
    PrismaClient: jest.fn(() => mockClient),
  }
})

import { db } from '@/lib/db'

describe('db singleton', () => {
  it('exports a PrismaClient instance', () => {
    expect(db).toBeDefined()
    expect(typeof db.$connect).toBe('function')
  })

  it('returns the same instance on repeated imports', async () => {
    const { db: db2 } = await import('@/lib/db')
    expect(db2).toBe(db)
  })
})
