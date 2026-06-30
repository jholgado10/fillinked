import { create } from 'zustand';
import type { Profile } from '../types';

interface ProfileState {
  profile: Profile | null;
  setProfile: (profile: Profile) => void;
  clear: () => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
  clear: () => set({ profile: null }),
}));
