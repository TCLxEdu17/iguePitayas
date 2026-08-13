import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIStore {
  sidebarOpen: boolean
  toggleSidebar: () => void
  selectedSiteId: string | null
  setSelectedSiteId: (id: string | null) => void
  darkMode: boolean
  toggleDarkMode: () => void
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarOpen: typeof window !== 'undefined' ? window.innerWidth >= 768 : true,
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      selectedSiteId: null,
      setSelectedSiteId: (id) => set({ selectedSiteId: id }),
      darkMode: false,
      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
    }),
    {
      name: 'ui-storage',
      partialize: (s) => ({ darkMode: s.darkMode }),
    }
  )
)
