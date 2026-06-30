import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useConnections() {
  return useQuery({
    queryKey: ['connections'],
    queryFn: () => api.get('/connections').then((r) => r.data),
  });
}

export function useConnectionSuggestions() {
  return useQuery({
    queryKey: ['connections', 'suggestions'],
    queryFn: () => api.get('/connections/suggestions').then((r) => r.data),
  });
}
