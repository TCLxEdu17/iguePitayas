import { db } from '@/lib/db'

let messagingInstance: ReturnType<typeof import('firebase-admin/messaging').getMessaging> | null = null

async function getMessagingInstance() {
  const { getApps, initializeApp, cert } = await import('firebase-admin/app')
  const { getMessaging } = await import('firebase-admin/messaging')
  if (getApps().length === 0) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT!)
    initializeApp({ credential: cert(serviceAccount) })
  }
  if (!messagingInstance) {
    messagingInstance = getMessaging()
  }
  return messagingInstance
}

export async function sendToAdmins(title: string, body: string): Promise<void> {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT) return

  try {
    const tokens = await db.pushToken.findMany({
      where: { user: { role: 'ADMIN', active: true } },
      select: { token: true, id: true },
    })

    if (tokens.length === 0) return

    const messaging = await getMessagingInstance()
    const result = await messaging.sendEachForMulticast({
      tokens: tokens.map((t) => t.token),
      notification: { title, body },
    })

    // Remove invalid tokens
    const invalidTokenIds = result.responses
      .map((r, i) => (!r.success && r.error?.code === 'messaging/registration-token-not-registered' ? tokens[i].id : null))
      .filter((id): id is string => id !== null)

    if (invalidTokenIds.length > 0) {
      await db.pushToken.deleteMany({ where: { id: { in: invalidTokenIds } } })
    }
  } catch {
    // Push failures must never break the main operation
  }
}

/**
 * Envia push notification APENAS para usuários com isPrimaryAdmin: true.
 * Usado para notificações detalhadas exclusivas do admin principal (Fábio).
 */
export async function notifyPrimaryAdmins(title: string, body: string): Promise<void> {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT) return

  try {
    const tokens = await db.pushToken.findMany({
      where: { user: { isPrimaryAdmin: true, active: true } },
      select: { token: true, id: true },
    })

    if (tokens.length === 0) return

    const messaging = await getMessagingInstance()
    const result = await messaging.sendEachForMulticast({
      tokens: tokens.map((t) => t.token),
      notification: { title, body },
    })

    const invalidTokenIds = result.responses
      .map((r, i) => (!r.success && r.error?.code === 'messaging/registration-token-not-registered' ? tokens[i].id : null))
      .filter((id): id is string => id !== null)

    if (invalidTokenIds.length > 0) {
      await db.pushToken.deleteMany({ where: { id: { in: invalidTokenIds } } })
    }
  } catch {
    // Push failures must never break the main operation
  }
}
