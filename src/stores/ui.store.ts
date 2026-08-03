import { create } from 'zustand'

interface UIStore {
  sidebarOpen: boolean
  toggleSidebar: () => void
  selectedSiteId: string | null
  setSelectedSiteId: (id: string | null) => void
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: typeof window !== 'undefined' ? window.innerWidth >= 768 : true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  selectedSiteId: null,
  setSelectedSiteId: (id) => set({ selectedSiteId: id }),
}))
