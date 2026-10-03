import { api } from "@/lib/api";
import { AppNotification, NotificationPage } from "@/types/notification";

export function listNotifications({ limit = 20, after }: { limit?: number; after?: string } = {}) {
  const query = new URLSearchParams({ limit: String(limit) });
  if (after) query.set("after", after);
  return api<NotificationPage>(`/v1/notifications?${query}`);
}

export function markNotificationRead(notificationId: string) {
  return api<AppNotification & { unread_count: number }>(`/v1/notifications/${notificationId}/read`, { method: "POST" });
}

export function markAllNotificationsRead() {
  return api<{ updated: number; unread_count: number }>("/v1/notifications/read-all", { method: "POST" });
}
