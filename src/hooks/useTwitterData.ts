import { useQuery } from '@tanstack/react-query';
import { fetchTwitterData } from '@/lib/api';
import { TwitterData } from '@/types';

export function useTwitterData(username: string | null) {
  return useQuery<TwitterData>({
    queryKey: ['twitter-data', username],
    queryFn: () => fetchTwitterData(username!),
    enabled: !!username,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}
