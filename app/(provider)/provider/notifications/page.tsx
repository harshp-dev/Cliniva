import { CalendarClock, ClipboardList, NotebookPen, Stethoscope } from "lucide-react";
import { Button } from "@/components/common/button";
import { StatusBadge } from "@/components/common/status-badge";
import {
  DashboardShell,
  type DashboardShellStat,
} from "@/components/features/dashboard/dashboard-shell";
import { DashboardPanel } from "@/components/features/dashboard/dashboard-panel";
import { getProviderNavItems } from "@/lib/dashboard/navigation";
import { getProviderDashboardData } from "@/lib/services/dashboards/get-provider-dashboard-data";
import { formatDateLabel } from "@/lib/utils/date-time";
import {
  markAllProviderNotificationsReadAction,
  markProviderNotificationReadAction,
} from "./actions";

export default async function ProviderNotificationsPage() {
  const data = await getProviderDashboardData();

  const stats: DashboardShellStat[] = [
    {
      label: "Today's load",
      value: String(data.todayAppointmentsCount),
      detail: "Appointments on the calendar for the current day.",
      icon: CalendarClock,
    },
    {
      label: "Active queue",
      value: String(data.activeQueueCount),
      detail: "Requested or confirmed visits still ahead in the schedule.",
      icon: ClipboardList,
    },
    {
      label: "Notes created",
      value: String(data.notesCreatedCount),
      detail: "Structured SOAP documentation authored from this workspace.",
      icon: NotebookPen,
    },
    {
      label: "Availability blocks",
      value: String(data.availabilityBlocksCount),
      detail: "Published schedule windows currently configured for booking.",
      icon: Stethoscope,
    },
  ];

  return (
    <DashboardShell
      currentPath="/provider/notifications"
      pageLabel="Notifications"
      userName={data.user.fullName}
      userEmail={data.user.email}
      roleLabel="Provider workspace"
      title="Provider notifications"
      description="Operational reminders, consultation prompts, and workflow notices remain collected here for quick review."
      summaryTitle={data.unreadNotificationsCount > 0 ? `${data.unreadNotificationsCount} unread provider notices` : "All provider notices reviewed"}
      summaryDescription="This stream reflects the latest provider-facing system events and care workflow messages."
      summaryItems={[
        `${data.activeQueueCount} appointments currently in queue`,
        `${data.todayAppointmentsCount} visits scheduled today`,
        `${data.availabilityBlocksCount} availability blocks published`,
      ]}
      stats={stats}
      navItems={getProviderNavItems(
        data.activeQueueCount,
        data.availabilityBlocksCount,
        data.unreadNotificationsCount,
        data.specialty
      )}
      actions={
        <>
          <form action={markAllProviderNotificationsReadAction}>
            <Button type="submit" variant="secondary" disabled={data.unreadNotificationsCount === 0}>
              Mark all read
            </Button>
          </form>
          <Button href="/provider/dashboard" variant="secondary">Back to dashboard</Button>
        </>
      }
    >
      <DashboardPanel
        title="Notification stream"
        description="Most recent provider-facing messages tied to scheduling, consultations, and care operations."
        action={<StatusBadge tone="accent">{data.unreadNotificationsCount} unread</StatusBadge>}
      >
        <div className="space-y-3">
          {data.notifications.length > 0 ? (
            data.notifications.map((notification) => (
              <article key={notification.id} className="rounded-[22px] border border-[#1F1A14]/10 bg-[#F8F4EC] p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-semibold text-[#1F1A14]">{notification.title}</p>
                    <p className="mt-1 text-sm leading-6 text-[#1F1A14]/64">{notification.body ?? "No additional details provided."}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[#1F1A14]/42">{notification.type} - {formatDateLabel(notification.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge tone={notification.isRead ? "neutral" : "accent"}>
                      {notification.isRead ? "Read" : "New"}
                    </StatusBadge>
                    {!notification.isRead ? (
                      <form action={markProviderNotificationReadAction}>
                        <input type="hidden" name="notification_id" value={notification.id} />
                        <Button type="submit" variant="secondary">Mark read</Button>
                      </form>
                    ) : null}
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-[22px] border border-dashed border-[#1F1A14]/14 bg-[#F8F4EC] p-6 text-sm text-[#1F1A14]/62">No notices right now.</div>
          )}
        </div>
      </DashboardPanel>
    </DashboardShell>
  );
}
