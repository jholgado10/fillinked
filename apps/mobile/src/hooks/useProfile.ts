import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useProfile(userId?: string) {
  return useQuery({
    queryKey: ['profile', userId ?? 'me'],
    queryFn: () =>
      api.get(userId ? `/profiles/${userId}` : '/profiles/me').then((r) => r.data),
  });
}
