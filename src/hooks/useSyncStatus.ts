import { useSyncExternalStore } from "react";
import { syncService, type SyncState } from "@/lib/sync/syncService";

export function useSyncStatus(): SyncState {
  return useSyncExternalStore(
    (listener) => syncService.subscribe(listener),
    () => syncService.getState(),
    () => "idle"
  );
}
