// In-app alerts from the API (GET /v1/notifications) and the live events
// pushed over the WebSocket at /v1/ws.

export type NotificationKind =
  | "money_received"
  | "money_sent"
  | "own_transfer"
  | "kyc_approved"
  | "kyc_rejected"
  | (string & {});

export interface AppNotification {
  notification_id: string;
  kind: NotificationKind;
  title: string;
  body: string | null;
  transaction_id: string | null;
  account_id: string | null;
  direction: "credit" | "debit" | null;
  amount_minor: number | null;
  currency_code: string | null;
  read_at: string | null;
  created_at: string;
}

export interface NotificationPage {
  data: AppNotification[];
  next_cursor: string | null;
  has_more: boolean;
  unread_count: number;
}

export type LiveEvent =
  | { type: "ready" }
  | { type: "notification.created"; notification: AppNotification }
  | { type: "notifications.read"; notification_ids?: string[]; all?: boolean }
  | { type: "accounts.changed"; account_ids: string[]; transaction_id: string }
  | { type: "user.changed" };
