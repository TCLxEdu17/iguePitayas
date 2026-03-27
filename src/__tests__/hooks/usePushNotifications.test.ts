/**
 * @jest-environment jsdom
 */
import { renderHook, waitFor } from '@testing-library/react'
import { usePushNotifications } from '@/hooks/usePushNotifications'

jest.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: jest.fn(() => false),
    getPlatform: jest.fn(() => 'web'),
  },
}))

jest.mock('@capacitor/push-notifications', () => ({
  PushNotifications: {
    requestPermissions: jest.fn(),
    register: jest.fn(),
    addListener: jest.fn(() => ({ remove: jest.fn() })),
  },
}))

describe('usePushNotifications', () => {
  it('does nothing when not on native platform', async () => {
    const { result } = renderHook(() => usePushNotifications())
    await waitFor(() => {
      expect(result.current.supported).toBe(false)
    })
  })
})
