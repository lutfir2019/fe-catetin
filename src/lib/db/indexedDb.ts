import Dexie, { type Table } from "dexie";
import { defaultCategories, defaultWallets } from "@/data/defaults";
import type {
  AppMetaRecord,
  BaseEntity,
  BudgetRecord,
  CategoryRecord,
  EntityMap,
  EntityName,
  GoalRecord,
  SyncQueueRecord,
  SyncStatus,
  TransactionRecord,
  WalletRecord
} from "@/types";

export class CatetinDexie extends Dexie {
  transactions!: Table<TransactionRecord, string>;
  categories!: Table<CategoryRecord, string>;
  wallets!: Table<WalletRecord, string>;
  budgets!: Table<BudgetRecord, string>;
  goals!: Table<GoalRecord, string>;
  syncQueue!: Table<SyncQueueRecord, string>;
  appMeta!: Table<AppMetaRecord, string>;

  constructor() {
    super("catetin-offline-db");
    this.version(1).stores({
      transactions:
        "id, user_id, type, category_id, wallet_id, date, sync_status, deleted_at, local_updated_at",
      categories: "id, user_id, type, name, sync_status, deleted_at, local_updated_at",
      wallets: "id, user_id, name, sync_status, deleted_at, local_updated_at",
      budgets: "id, user_id, category_id, month, sync_status, deleted_at, local_updated_at",
      goals: "id, user_id, deadline, sync_status, deleted_at, local_updated_at",
      syncQueue: "id, entity, entity_id, operation, status, created_at, [entity+entity_id]",
      appMeta: "key"
    });
  }
}

export const db = new CatetinDexie();

export function nowIso() {
  return new Date().toISOString();
}

export function newId(prefix = "local") {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function createBaseEntity(userId: string, syncStatus: SyncStatus = "pending_create"): BaseEntity {
  const timestamp = nowIso();
  return {
    id: newId(),
    user_id: userId,
    created_at: timestamp,
    updated_at: timestamp,
    deleted_at: null,
    sync_status: syncStatus,
    local_updated_at: timestamp,
    server_updated_at: null
  };
}

export function getEntityTable<T extends EntityName>(entity: T): Table<EntityMap[T], string> {
  return db.table(entity) as Table<EntityMap[T], string>;
}

export async function listActive<T extends EntityName>(entity: T, userId: string): Promise<EntityMap[T][]> {
  const rows = await getEntityTable(entity).where("user_id").equals(userId).toArray();
  return rows
    .filter((row) => !row.deleted_at)
    .sort((a, b) => b.local_updated_at.localeCompare(a.local_updated_at));
}

export async function listConflicts(userId: string) {
  const entities: EntityName[] = ["transactions", "categories", "wallets", "budgets", "goals"];
  const results = await Promise.all(
    entities.map(async (entity) => {
      const rows = await getEntityTable(entity).where("user_id").equals(userId).toArray();
      return rows
        .filter((row) => row.sync_status === "conflict")
        .map((row) => ({ entity, record: row }));
    })
  );
  return results.flat();
}

export async function upsertLocal<T extends EntityName>(entity: T, record: EntityMap[T]) {
  await getEntityTable(entity).put(record);
}

export async function softDeleteLocal<T extends EntityName>(entity: T, id: string) {
  const table = getEntityTable(entity);
  const existing = await table.get(id);
  if (!existing) return null;
  const timestamp = nowIso();
  const nextRecord = {
    ...existing,
    deleted_at: timestamp,
    updated_at: timestamp,
    local_updated_at: timestamp,
    sync_status: "pending_delete" as const
  };
  await table.put(nextRecord);
  return nextRecord;
}

export async function markEntitySynced<T extends EntityName>(entity: T, record: EntityMap[T]) {
  const timestamp = nowIso();
  await getEntityTable(entity).put({
    ...record,
    deleted_at: record.deleted_at ?? null,
    sync_status: "synced",
    local_updated_at: timestamp,
    server_updated_at: record.updated_at ?? timestamp,
    server_snapshot: undefined
  });
}

export async function setMeta(key: string, value: unknown) {
  await db.appMeta.put({ key, value, updated_at: nowIso() });
}

export async function getMeta<T>(key: string, fallback: T): Promise<T> {
  const record = await db.appMeta.get(key);
  return (record?.value as T | undefined) ?? fallback;
}

export async function ensureDefaultData(userId: string) {
  const [categoryCount, walletCount] = await Promise.all([
    db.categories.where("user_id").equals(userId).count(),
    db.wallets.where("user_id").equals(userId).count()
  ]);

  const queueRows: SyncQueueRecord[] = [];

  if (categoryCount === 0) {
    const categories = defaultCategories.map<CategoryRecord>((category) => {
      const record = {
        ...createBaseEntity(userId),
        ...category,
        favorite: category.name === "Makanan" || category.name === "Gaji"
      };
      queueRows.push({
        id: newId("queue"),
        entity: "categories",
        entity_id: record.id,
        operation: "create",
        payload: record,
        created_at: nowIso(),
        retry_count: 0,
        last_error: null,
        status: "pending"
      });
      return record;
    });
    await db.categories.bulkPut(categories);
  }

  if (walletCount === 0) {
    const wallets = defaultWallets.map<WalletRecord>((wallet) => {
      const record = {
        ...createBaseEntity(userId),
        ...wallet
      };
      queueRows.push({
        id: newId("queue"),
        entity: "wallets",
        entity_id: record.id,
        operation: "create",
        payload: record,
        created_at: nowIso(),
        retry_count: 0,
        last_error: null,
        status: "pending"
      });
      return record;
    });
    await db.wallets.bulkPut(wallets);
  }

  if (queueRows.length > 0) {
    await db.syncQueue.bulkPut(queueRows);
  }
}

export async function clearLocalUserData(userId: string) {
  await db.transaction(
    "rw",
    [db.transactions, db.categories, db.wallets, db.budgets, db.goals, db.syncQueue, db.appMeta],
    async () => {
      await Promise.all([
        db.transactions.where("user_id").equals(userId).delete(),
        db.categories.where("user_id").equals(userId).delete(),
        db.wallets.where("user_id").equals(userId).delete(),
        db.budgets.where("user_id").equals(userId).delete(),
        db.goals.where("user_id").equals(userId).delete(),
        db.syncQueue.clear(),
        db.appMeta.clear()
      ]);
    }
  );
}
