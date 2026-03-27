import { create } from 'zustand'

interface SyncStore {
  pendingCount: number
  isSyncing:    boolean
  setPending:   (count: number) => void
  setSyncing:   (val: boolean) => void
}

export const useSyncStore = create<SyncStore>((set) => ({
  pendingCount: 0,
  isSyncing:    false,
  setPending:   (count) => set({ pendingCount: count }),
  setSyncing:   (val)   => set({ isSyncing: val }),
}))
