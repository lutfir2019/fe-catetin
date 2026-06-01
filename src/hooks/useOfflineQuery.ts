import { useQuery, type QueryKey } from "@tanstack/react-query";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

interface OfflineQueryOptions<T> {
  queryKey: QueryKey;
  localQuery: () => Promise<T>;
  onlineSync?: () => Promise<unknown>;
  enabled?: boolean;
}

export function useOfflineQuery<T>({ queryKey, localQuery, onlineSync, enabled = true }: OfflineQueryOptions<T>) {
  const online = useOnlineStatus();

  return useQuery({
    queryKey,
    enabled,
    queryFn: async () => {
      const localData = await localQuery();
      if (online && onlineSync) {
        void onlineSync();
      }
      return localData;
    },
    staleTime: 1_000,
    refetchOnWindowFocus: true
  });
}
