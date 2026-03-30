import { sendToAdmins } from '@/lib/push'
import { db } from '@/lib/db'

jest.mock('firebase-admin/app', () => ({
  initializeApp: jest.fn(),
  getApps: jest.fn(() => []),
  cert: jest.fn((sa) => sa),
}))

const mockSendEach = jest.fn()
jest.mock('firebase-admin/messaging', () => ({
  getMessaging: jest.fn(() => ({
    sendEachForMulticast: mockSendEach,
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
    delete process.env.FIREBASE_SERVICE_ACCOUNT
  })

  afterEach(() => {
    delete process.env.FIREBASE_SERVICE_ACCOUNT
  })

  it('skips silently when FIREBASE_SERVICE_ACCOUNT is not set', async () => {
    await expect(sendToAdmins('title', 'body')).resolves.toBeUndefined()
    expect(mockFindMany).not.toHaveBeenCalled()
  })

  it('skips silently when no admin tokens exist', async () => {
    process.env.FIREBASE_SERVICE_ACCOUNT = '{"type":"service_account"}'
    mockFindMany.mockResolvedValue([])
    await expect(sendToAdmins('title', 'body')).resolves.toBeUndefined()
    expect(mockSendEach).not.toHaveBeenCalled()
  })

  it('does not throw when sendEachForMulticast rejects', async () => {
    process.env.FIREBASE_SERVICE_ACCOUNT = '{"type":"service_account"}'
    mockFindMany.mockResolvedValue([{ token: 'tok1', id: 'id1' }])
    mockSendEach.mockRejectedValue(new Error('Firebase network error'))
    await expect(sendToAdmins('test title', 'test body')).resolves.toBeUndefined()
  })
})
