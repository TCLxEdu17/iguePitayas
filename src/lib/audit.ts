import { db } from '@/lib/db'

interface AuditParams {
  userId: string
  action: string
  entityType: string
  entityId: string
  description: string
}

export async function logAction(params: AuditParams): Promise<void> {
  try {
    await db.auditLog.create({ data: params })
  } catch {
    // Audit failures must never break the main operation
  }
}
