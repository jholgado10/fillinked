import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,

  async initialize() {
    const { data: { session } } = await supabase.auth.getSession();
    set({ session });
    supabase.auth.onAuthStateChange((_event, session) => set({ session }));
  },

  async signOut() {
    await supabase.auth.signOut();
    set({ session: null });
  },
}));
