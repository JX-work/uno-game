import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AVATAR_LIST } from '../components/Avatar.jsx';

export const useUserStore = create(
  persist(
    (set) => ({
      nickname: '',
      avatarIndex: 0,
      // Derived color from avatar for backwards compat
      get avatarColor() {
        return AVATAR_LIST[this.avatarIndex]?.color ?? '#FF8C42';
      },
      setNickname: (nickname) => set({ nickname }),
      setAvatarIndex: (avatarIndex) => set({ avatarIndex }),
    }),
    { name: 'uno_user_v2' }
  )
);
