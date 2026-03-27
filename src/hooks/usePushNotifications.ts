'use client'

import { useEffect, useState } from 'react'
import { getApiUrl } from '@/lib/api-url'

export function usePushNotifications() {
  const [supported, setSupported] = useState(false)

  useEffect(() => {
    let cleanup: (() => void) | undefined

    async function init() {
      let CapacitorCore: typeof import('@capacitor/core')
      let PushNotificationsModule: typeof import('@capacitor/push-notifications')

      try {
        CapacitorCore = await import('@capacitor/core')
        PushNotificationsModule = await import('@capacitor/push-notifications')
      } catch {
        return
      }

      const { Capacitor } = CapacitorCore
      const { PushNotifications } = PushNotificationsModule

      if (!Capacitor.isNativePlatform()) return
      setSupported(true)

      const { receive } = await PushNotifications.requestPermissions()
      if (receive !== 'granted') return

      await PushNotifications.register()

      const regListener = await PushNotifications.addListener(
        'registration',
        async (token: { value: string }) => {
          const platform = Capacitor.getPlatform()
          try {
            await fetch(getApiUrl('/api/notifications/register'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token: token.value, platform }),
            })
          } catch {
            console.warn('[Push] Failed to register token')
          }
        }
      )

      cleanup = () => regListener.remove()
    }

    init()
    return () => cleanup?.()
  }, [])

  return { supported }
}
