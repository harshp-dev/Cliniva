"use client";

import { useCallback, useEffect, useState } from "react";

interface NotificationItem {
  id: string;
  user_id: string;
  channel: "in_app" | "sms" | "email";
  title: string;
  body: string;
  read_at: string | null;
  delivery_status: string;
  created_at: string;
}

export function NotificationsPanel() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/notifications?limit=25", { cache: "no-store" });
      const payload = await response.json().catch(() => null);
      setItems((payload?.data ?? []) as NotificationItem[]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  async function markRead(id: string) {
    setStatus("Updating notification...");
    const response = await fetch(`/api/notifications/${id}/read`, { method: "POST" });
    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setStatus(payload?.error?.message ?? "Unable to update notification");
      return;
    }

    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, read_at: new Date().toISOString(), delivery_status: "sent" } : item))
    );
    setStatus("Notification updated.");
  }

  const unreadCount = items.filter((item) => !item.read_at).length;

  return (
    <section className="card">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Notifications</h3>
        <button type="button" className="btn-secondary" onClick={loadNotifications}>
          Refresh
        </button>
      </div>

      <p className="mb-3 text-sm text-slate-600">Unread: {unreadCount}</p>
      {loading ? <p className="text-sm text-slate-500">Loading notifications...</p> : null}

      <div className="space-y-2">
        {!loading && items.length === 0 ? <p className="text-sm text-slate-500">No notifications yet.</p> : null}
        {items.map((item) => (
          <article key={item.id} className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-sm font-semibold text-slate-900">{item.title}</h4>
                <p className="mt-1 text-sm text-slate-700">{item.body}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {new Date(item.created_at).toLocaleString()} | {item.channel} | {item.delivery_status}
                </p>
              </div>
              {!item.read_at ? (
                <button type="button" className="btn-secondary" onClick={() => markRead(item.id)}>
                  Mark Read
                </button>
              ) : (
                <span className="text-xs font-medium text-emerald-700">Read</span>
              )}
            </div>
          </article>
        ))}
      </div>

      {status ? <p className="mt-3 text-xs text-slate-600">{status}</p> : null}
    </section>
  );
}
