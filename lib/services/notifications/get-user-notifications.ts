import type { SupabaseClient } from "@supabase/supabase-js";
import type { DashboardNotification } from "@/types/domain/dashboard";

type NotificationRow = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  is_read: boolean;
  created_at: string;
};

type GetUserNotificationsOptions = {
  limit?: number;
};

function mapNotification(row: NotificationRow): DashboardNotification {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    isRead: row.is_read,
    createdAt: row.created_at,
  };
}

export async function getUserNotifications(
  supabase: SupabaseClient,
  userId: string,
  options: GetUserNotificationsOptions = {}
) {
  const limit = options.limit ?? 6;

  const [{ data: notificationRows, error: notificationsError }, unreadQuery] = await Promise.all([
    supabase
      .from("notifications")
      .select("id, type, title, body, is_read, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit)
      .returns<NotificationRow[]>(),
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false),
  ]);

  if (notificationsError) {
    throw notificationsError;
  }

  if (unreadQuery.error) {
    throw unreadQuery.error;
  }

  return {
    notifications: (notificationRows ?? []).map(mapNotification),
    unreadCount: unreadQuery.count ?? 0,
  };
}
