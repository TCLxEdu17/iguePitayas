import { logAction } from '@/lib/audit'
import { db } from '@/lib/db'

jest.mock('@/lib/db', () => ({
  db: {
    auditLog: {
      create: jest.fn(),
    },
  },
}))

const mockCreate = db.auditLog.create as jest.Mock

describe('logAction', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('creates an audit log entry with correct params', async () => {
    mockCreate.mockResolvedValue({})
    await logAction({
      userId: 'user-1',
      action: 'CREATE_ACTIVITY',
      entityType: 'Activity',
      entityId: 'act-1',
      description: 'João criou Pulverização no Talhão 01',
    })
    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        action: 'CREATE_ACTIVITY',
        entityType: 'Activity',
        entityId: 'act-1',
        description: 'João criou Pulverização no Talhão 01',
      },
    })
  })

  it('does not throw when db.create fails', async () => {
    mockCreate.mockRejectedValue(new Error('DB error'))
    await expect(
      logAction({
        userId: 'user-1',
        action: 'CREATE_ACTIVITY',
        entityType: 'Activity',
        entityId: 'act-1',
        description: 'test',
      })
    ).resolves.toBeUndefined()
  })

  it('does not throw when db.create throws synchronously', async () => {
    mockCreate.mockImplementation(() => { throw new Error('sync error') })
    await expect(
      logAction({
        userId: 'user-1',
        action: 'DELETE_ACTIVITY',
        entityType: 'Activity',
        entityId: 'act-2',
        description: 'test delete',
      })
    ).resolves.toBeUndefined()
  })
})
