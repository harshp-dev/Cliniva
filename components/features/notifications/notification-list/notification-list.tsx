import {
  BellRing,
  CalendarRange,
  FileText,
  MessageSquareText,
  Stethoscope,
} from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { StatusBadge } from "@/components/common/status-badge";
import { cn } from "@/lib/utils/cn";
import { formatDateTimeLabel, formatRelativeDateLabel } from "@/lib/utils/date-time";
import type { DashboardNotification } from "@/types/domain/dashboard";

type NotificationListProps = {
  notifications: DashboardNotification[];
  emptyTitle: string;
  emptyDescription: string;
  className?: string;
};

function getNotificationIcon(type: string) {
  if (type === "appointment") return CalendarRange;
  if (type === "consultation") return Stethoscope;
  if (type === "note") return FileText;
  if (type === "message") return MessageSquareText;
  return BellRing;
}

export function NotificationList({
  notifications,
  emptyTitle,
  emptyDescription,
  className,
}: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        icon={<BellRing className="h-4 w-4" />}
      />
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {notifications.map((notification) => {
        const Icon = getNotificationIcon(notification.type);

        return (
          <article
            key={notification.id}
            className={cn(
              "rounded-[22px] border bg-[#F8F4EC] p-4 transition-colors",
              notification.isRead
                ? "border-[#1F1A14]/10"
                : "border-[#FA8112]/22 bg-[linear-gradient(180deg,rgba(250,129,18,0.08),rgba(248,244,236,0.96))]"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FA8112]/12 text-[#FA8112]">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-[#1F1A14]">{notification.title}</p>
                    <p className="text-xs uppercase tracking-[0.24em] text-[#1F1A14]/42">
                      {notification.type}
                    </p>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-[#1F1A14]/64">
                    {notification.body ?? "No additional details provided."}
                  </p>
                  <p className="mt-2 text-xs text-[#1F1A14]/48">
                    {formatRelativeDateLabel(notification.createdAt)} - {formatDateTimeLabel(notification.createdAt)}
                  </p>
                </div>
              </div>
              <StatusBadge tone={notification.isRead ? "neutral" : "accent"}>
                {notification.isRead ? "Read" : "New"}
              </StatusBadge>
            </div>
          </article>
        );
      })}
    </div>
  );
}
