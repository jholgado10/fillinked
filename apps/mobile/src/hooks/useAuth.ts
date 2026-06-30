import { useAuthStore } from '../store/authStore';

export function useAuth() {
  const session = useAuthStore((s) => s.session);
  const signOut = useAuthStore((s) => s.signOut);

  return { session, isAuthenticated: !!session, signOut };
}
