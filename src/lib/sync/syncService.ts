import { getEntityTable, markEntitySynced, nowIso, setMeta } from "@/lib/db/indexedDb";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import { enqueueSync, getPendingQueue, markQueueDone, retryFailedQueue, updateQueueItem } from "@/lib/sync/syncQueue";
import type { EntityMap, EntityName, QueueOperation, SyncQueueRecord } from "@/types";

type SyncReason = "app_start" | "login" | "online" | "mutation" | "manual" | "interval";
type ConflictStrategy = "local" | "server" | "manual";

const entities: EntityName[] = ["categories", "wallets", "transactions", "budgets", "goals"];

function cleanForServer(record: Record<string, unknown>) {
  const {
    sync_status: _syncStatus,
    local_updated_at: _localUpdatedAt,
    server_updated_at: _serverUpdatedAt,
    server_snapshot: _serverSnapshot,
    category_name: _categoryName,
    wallet_name: _walletName,
    ...serverRecord
  } = record;
  return serverRecord;
}

function stringifyError(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}

function canUseNetwork() {
  return typeof navigator === "undefined" || navigator.onLine;
}

function changedOnServer(localServerUpdatedAt: string | null, serverUpdatedAt: string | null) {
  if (!serverUpdatedAt) return false;
  if (!localServerUpdatedAt) return true;
  return new Date(serverUpdatedAt).getTime() > new Date(localServerUpdatedAt).getTime();
}

class SyncService {
  private syncing = false;
  private intervalId: number | null = null;
  private onlineHandler: (() => void) | null = null;
  private currentUserId: string | null = null;

  isSyncing() {
    return this.syncing;
  }

  startAutoSync(userId: string) {
    this.stopAutoSync();
    this.currentUserId = userId;
    this.onlineHandler = () => {
      void this.syncNow(userId, "online");
    };

    if (typeof window !== "undefined") {
      window.addEventListener("online", this.onlineHandler);
      this.intervalId = window.setInterval(() => {
        void this.syncNow(userId, "interval");
      }, 60_000);
    }

    void this.syncNow(userId, "app_start");
  }

  stopAutoSync() {
    if (this.onlineHandler && typeof window !== "undefined") {
      window.removeEventListener("online", this.onlineHandler);
    }
    if (this.intervalId && typeof window !== "undefined") {
      window.clearInterval(this.intervalId);
    }
    this.intervalId = null;
    this.onlineHandler = null;
    this.currentUserId = null;
  }

  async syncNow(userId = this.currentUserId, reason: SyncReason = "manual") {
    if (!userId || this.syncing || !isSupabaseConfigured || !canUseNetwork()) {
      return { ok: false, skipped: true, reason };
    }

    this.syncing = true;
    await setMeta("sync_state", "syncing");

    try {
      await retryFailedQueue();
      const queue = await getPendingQueue();
      for (const item of queue) {
        await this.pushQueueItem(item);
      }
      for (const entity of entities) {
        await this.pullEntity(entity, userId);
      }
      await setMeta("sync_state", "idle");
      await setMeta("last_sync_at", nowIso());
      window.dispatchEvent(new CustomEvent("catetin:sync-complete"));
      return { ok: true, skipped: false, reason };
    } catch (error) {
      await setMeta("sync_state", "failed");
      window.dispatchEvent(new CustomEvent("catetin:sync-failed", { detail: stringifyError(error) }));
      return { ok: false, skipped: false, reason, error };
    } finally {
      this.syncing = false;
    }
  }

  private async pushQueueItem(item: SyncQueueRecord) {
    await updateQueueItem(item.id, { status: "syncing" });
    const table = getEntityTable(item.entity);
    const localRecord = (await table.get(item.entity_id)) as EntityMap[typeof item.entity] | undefined;
    const payload = (localRecord ?? item.payload) as Record<string, unknown>;
    const operation: QueueOperation = item.operation;

    try {
      if (operation === "delete") {
        const deletedAt = String(payload.deleted_at ?? nowIso());
        const { error } = await supabase
          .from(item.entity)
          .update({ deleted_at: deletedAt, updated_at: nowIso() })
          .eq("id", item.entity_id)
          .eq("user_id", String(payload.user_id));

        if (error) throw error;
        await table.delete(item.entity_id);
        await markQueueDone(item.id);
        return;
      }

      const serverPayload = cleanForServer({
        ...payload,
        updated_at: nowIso(),
        deleted_at: payload.deleted_at ?? null
      });
      const { data, error } = await supabase.from(item.entity).upsert(serverPayload).select().single();
      if (error) throw error;
      await markEntitySynced(item.entity, data as EntityMap[typeof item.entity]);
      await markQueueDone(item.id);
    } catch (error) {
      await updateQueueItem(item.id, {
        status: "failed",
        retry_count: item.retry_count + 1,
        last_error: stringifyError(error)
      });
      throw error;
    }
  }

  private async pullEntity<T extends EntityName>(entity: T, userId: string) {
    const { data, error } = await supabase
      .from(entity)
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });
    if (error) throw error;

    const table = getEntityTable(entity);
    for (const serverRecord of data ?? []) {
      const typedServerRecord = serverRecord as EntityMap[T];
      const local = await table.get(typedServerRecord.id);

      if (local && local.sync_status !== "synced") {
        if (changedOnServer(local.server_updated_at, typedServerRecord.updated_at)) {
          await table.put({
            ...local,
            sync_status: "conflict",
            server_snapshot: typedServerRecord,
            server_updated_at: typedServerRecord.updated_at
          });
        }
        continue;
      }

      if (typedServerRecord.deleted_at) {
        await table.delete(typedServerRecord.id);
      } else {
        await markEntitySynced(entity, typedServerRecord);
      }
    }
  }

  async resolveConflict<T extends EntityName>(
    entity: T,
    id: string,
    strategy: ConflictStrategy,
    manualPatch?: Partial<EntityMap[T]>
  ) {
    const table = getEntityTable(entity);
    const local = await table.get(id);
    if (!local) return;

    if (strategy === "server" && local.server_snapshot) {
      await markEntitySynced(entity, local.server_snapshot as EntityMap[T]);
      return;
    }

    const timestamp = nowIso();
    const serverBase = (local.server_snapshot ?? {}) as Partial<EntityMap[T]>;
    const nextRecord = {
      ...(strategy === "manual" ? serverBase : {}),
      ...local,
      ...manualPatch,
      sync_status: "pending_update",
      updated_at: timestamp,
      local_updated_at: timestamp,
      deleted_at: null,
      server_snapshot: undefined
    } as EntityMap[T];

    await table.put(nextRecord);
    await enqueueSync(entity, id, "update", nextRecord);
    await this.syncNow(nextRecord.user_id, "manual");
  }
}

export const syncService = new SyncService();
