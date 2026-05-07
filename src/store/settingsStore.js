import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useSettingsStore = create(
  persist(
    (set) => ({
      soundEnabled: true,
      musicEnabled: false,
      setSoundEnabled: (v) => set({ soundEnabled: v }),
      setMusicEnabled: (v) => set({ musicEnabled: v }),
    }),
    { name: 'uno_settings_v1' }
  )
);

export function isSoundEnabled() {
  try {
    const raw = localStorage.getItem('uno_settings_v1');
    if (!raw) return true;
    const parsed = JSON.parse(raw);
    return parsed?.state?.soundEnabled !== false;
  } catch { return true; }
}
