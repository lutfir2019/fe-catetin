export type TransactionType = "income" | "expense";

export type SyncStatus =
  | "synced"
  | "pending_create"
  | "pending_update"
  | "pending_delete"
  | "conflict";

export type QueueOperation = "create" | "update" | "delete";
export type QueueStatus = "pending" | "syncing" | "failed" | "done";

export type EntityName = "transactions" | "categories" | "wallets" | "budgets" | "goals";

export type NavPage =
  | "dashboard"
  | "transactions"
  | "categories"
  | "wallets"
  | "budgets"
  | "goals"
  | "reports"
  | "settings";

export interface BaseEntity {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  sync_status: SyncStatus;
  local_updated_at: string;
  server_updated_at: string | null;
  server_snapshot?: unknown;
}

export interface TransactionRecord extends BaseEntity {
  title: string;
  amount: number;
  type: TransactionType;
  category_id: string | null;
  category_name?: string | null;
  date: string;
  notes?: string | null;
  wallet_id: string | null;
  wallet_name?: string | null;
  receipt_url?: string | null;
  is_pinned?: boolean;
  recurring_interval?: "none" | "daily" | "weekly" | "monthly";
}

export interface CategoryRecord extends BaseEntity {
  name: string;
  type: TransactionType | "both";
  icon: string;
  color: string;
  description?: string | null;
  favorite?: boolean;
}

export interface WalletRecord extends BaseEntity {
  name: string;
  initial_balance: number;
  icon: string;
  color: string;
}

export interface BudgetRecord extends BaseEntity {
  category_id: string | null;
  category_name?: string | null;
  amount: number;
  month: string;
  alert_threshold: number;
}

export interface GoalRecord extends BaseEntity {
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  icon: string;
  color: string;
}

export interface EntityMap {
  transactions: TransactionRecord;
  categories: CategoryRecord;
  wallets: WalletRecord;
  budgets: BudgetRecord;
  goals: GoalRecord;
}

export interface SyncQueueRecord {
  id: string;
  entity: EntityName;
  entity_id: string;
  operation: QueueOperation;
  payload: unknown;
  created_at: string;
  retry_count: number;
  last_error: string | null;
  status: QueueStatus;
}

export interface AppMetaRecord {
  key: string;
  value: unknown;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar_url?: string | null;
  isDemo?: boolean;
}

export interface DashboardInsight {
  title: string;
  body: string;
  tone: "good" | "warning" | "info";
}
