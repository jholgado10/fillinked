import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useFeed() {
  return useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: ({ pageParam }) =>
      api.get('/feed', { params: { cursor: pageParam } }).then((r) => r.data),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined,
  });
}
