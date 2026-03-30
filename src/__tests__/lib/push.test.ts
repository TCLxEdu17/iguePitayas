import { sendToAdmins } from '@/lib/push'
import { db } from '@/lib/db'

// Mock firebase-admin
jest.mock('firebase-admin/app', () => ({
  initializeApp: jest.fn(),
  getApps: jest.fn(() => []),
  cert: jest.fn((sa) => sa),
}))

jest.mock('firebase-admin/messaging', () => ({
  getMessaging: jest.fn(() => ({
    sendEachForMulticast: jest.fn().mockResolvedValue({
      responses: [],
      successCount: 0,
      failureCount: 0,
    }),
  })),
}))

jest.mock('@/lib/db', () => ({
  db: {
    pushToken: {
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}))

const mockFindMany = db.pushToken.findMany as jest.Mock
const mockDeleteMany = db.pushToken.deleteMany as jest.Mock

describe('sendToAdmins', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('skips silently when FIREBASE_SERVICE_ACCOUNT is not set', async () => {
    const prev = process.env.FIREBASE_SERVICE_ACCOUNT
    delete process.env.FIREBASE_SERVICE_ACCOUNT
    await expect(sendToAdmins('title', 'body')).resolves.toBeUndefined()
    expect(mockFindMany).not.toHaveBeenCalled()
    process.env.FIREBASE_SERVICE_ACCOUNT = prev
  })

  it('skips silently when no admin tokens exist', async () => {
    process.env.FIREBASE_SERVICE_ACCOUNT = '{"type":"service_account"}'
    mockFindMany.mockResolvedValue([])
    await expect(sendToAdmins('title', 'body')).resolves.toBeUndefined()
    process.env.FIREBASE_SERVICE_ACCOUNT = undefined
  })

  it('does not throw on firebase send error', async () => {
    process.env.FIREBASE_SERVICE_ACCOUNT = '{"type":"service_account"}'
    mockFindMany.mockResolvedValue([{ token: 'tok1' }])
    // getMessaging mock already returns resolved, this test ensures no rethrow
    await expect(sendToAdmins('test title', 'test body')).resolves.toBeUndefined()
    process.env.FIREBASE_SERVICE_ACCOUNT = undefined
  })
})
