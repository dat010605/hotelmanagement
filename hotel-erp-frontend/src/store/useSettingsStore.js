import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useSettingsStore = create(
  persist(
    (set) => ({
      themeMode: 'light', // 'light' or 'dark'
      primaryColor: '#1677ff', // default antd blue
      compactMode: false,
      
      setThemeMode: (mode) => set({ themeMode: mode }),
      setPrimaryColor: (color) => set({ primaryColor: color }),
      setCompactMode: (compact) => set({ compactMode: compact }),
      resetSettings: () => set({ themeMode: 'light', primaryColor: '#1677ff', compactMode: false })
    }),
    {
      name: 'hotel-erp-settings', // tên key trong localStorage
    }
  )
);

export default useSettingsStore;
