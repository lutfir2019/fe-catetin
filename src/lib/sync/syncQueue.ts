import { db, getEntityTable, newId, nowIso } from "@/lib/db/indexedDb";
import type { EntityMap, EntityName, QueueOperation, QueueStatus, SyncQueueRecord } from "@/types";

export async function enqueueSync<T extends EntityName>(
  entity: T,
  entityId: string,
  operation: QueueOperation,
  payload: EntityMap[T]
) {
  const existing = await db.syncQueue
    .where("[entity+entity_id]")
    .equals([entity, entityId])
    .filter((item) => item.status === "pending" || item.status === "failed")
    .first();

  if (existing?.operation === "create" && operation === "delete") {
    await db.syncQueue.delete(existing.id);
    await getEntityTable(entity).delete(entityId);
    return;
  }

  if (existing) {
    const mergedOperation = existing.operation === "create" ? "create" : operation;
    await db.syncQueue.update(existing.id, {
      operation: mergedOperation,
      payload,
      created_at: nowIso(),
      status: "pending",
      last_error: null
    });
    return;
  }

  const row: SyncQueueRecord = {
    id: newId("queue"),
    entity,
    entity_id: entityId,
    operation,
    payload,
    created_at: nowIso(),
    retry_count: 0,
    last_error: null,
    status: "pending"
  };
  await db.syncQueue.add(row);
}

export async function getPendingQueue() {
  return db.syncQueue
    .where("status")
    .anyOf(["pending", "failed"] satisfies QueueStatus[])
    .sortBy("created_at");
}

export async function queueCounts() {
  const [pending, syncing, failed, conflicts] = await Promise.all([
    db.syncQueue.where("status").equals("pending").count(),
    db.syncQueue.where("status").equals("syncing").count(),
    db.syncQueue.where("status").equals("failed").count(),
    Promise.all([
      db.transactions.where("sync_status").equals("conflict").count(),
      db.categories.where("sync_status").equals("conflict").count(),
      db.wallets.where("sync_status").equals("conflict").count(),
      db.budgets.where("sync_status").equals("conflict").count(),
      db.goals.where("sync_status").equals("conflict").count()
    ]).then((counts) => counts.reduce((sum, count) => sum + count, 0))
  ]);

  return { pending, syncing, failed, conflicts };
}

export async function updateQueueItem(id: string, patch: Partial<SyncQueueRecord>) {
  await db.syncQueue.update(id, patch);
}

export async function markQueueDone(id: string) {
  await db.syncQueue.update(id, { status: "done", last_error: null });
  await db.syncQueue.delete(id);
}

export async function retryFailedQueue() {
  const failed = await db.syncQueue.where("status").equals("failed").toArray();
  await Promise.all(failed.map((item) => db.syncQueue.update(item.id, { status: "pending" })));
}
