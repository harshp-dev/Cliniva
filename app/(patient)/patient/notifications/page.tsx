import { BellRing, CalendarRange, ClipboardCheck, NotebookText } from "lucide-react";
import { Button } from "@/components/common/button";
import { StatusBadge } from "@/components/common/status-badge";
import {
  DashboardShell,
  type DashboardShellStat,
} from "@/components/features/dashboard/dashboard-shell";
import { DashboardPanel } from "@/components/features/dashboard/dashboard-panel";
import { getPatientNavItems } from "@/lib/dashboard/navigation";
import { getPatientDashboardData } from "@/lib/services/dashboards/get-patient-dashboard-data";
import { formatDateLabel } from "@/lib/utils/date-time";
import {
  markAllPatientNotificationsReadAction,
  markPatientNotificationReadAction,
} from "./actions";

export default async function PatientNotificationsPage() {
  const data = await getPatientDashboardData();

  const stats: DashboardShellStat[] = [
    {
      label: "Upcoming visits",
      value: String(data.upcomingAppointmentsCount),
      detail: "Confirmed or requested appointments still ahead of you.",
      icon: CalendarRange,
    },
    {
      label: "Shared notes",
      value: String(data.sharedNotesCount),
      detail: "Visit summaries your care team has released to your portal.",
      icon: NotebookText,
    },
    {
      label: "Unread updates",
      value: String(data.unreadNotificationsCount),
      detail: "Notifications that still need your attention.",
      icon: BellRing,
    },
    {
      label: "Profile completion",
      value: `${data.completionScore}%`,
      detail: "Profile readiness based on contact and intake essentials.",
      icon: ClipboardCheck,
    },
  ];

  return (
    <DashboardShell
      currentPath="/patient/notifications"
      pageLabel="Notifications"
      userName={data.user.fullName}
      userEmail={data.user.email}
      roleLabel="Patient workspace"
      title="Patient notifications"
      description="Appointment confirmations, portal alerts, and workflow reminders stay collected here so the patient workspace has one source of truth."
      summaryTitle={data.unreadNotificationsCount > 0 ? `${data.unreadNotificationsCount} unread updates` : "All notifications reviewed"}
      summaryDescription="Use this stream to keep pace with booking updates, shared notes, and care team reminders."
      summaryItems={[
        `${data.notifications.length} recent notifications loaded`,
        `${data.upcomingAppointmentsCount} upcoming appointments`,
        `${data.sharedNotesCount} shared records available`,
      ]}
      stats={stats}
      navItems={getPatientNavItems(
        data.upcomingAppointmentsCount,
        data.sharedNotesCount,
        data.unreadNotificationsCount,
        data.completionScore
      )}
      actions={
        <>
          <form action={markAllPatientNotificationsReadAction}>
            <Button type="submit" variant="secondary" disabled={data.unreadNotificationsCount === 0}>
              Mark all read
            </Button>
          </form>
          <Button href="/patient/profile">Open profile</Button>
        </>
      }
    >
      <DashboardPanel
        title="Notification stream"
        description="Most recent patient-facing updates from scheduling and care delivery workflows."
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
                      <form action={markPatientNotificationReadAction}>
                        <input type="hidden" name="notification_id" value={notification.id} />
                        <Button type="submit" variant="secondary">Mark read</Button>
                      </form>
                    ) : null}
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-[22px] border border-dashed border-[#1F1A14]/14 bg-[#F8F4EC] p-6 text-sm text-[#1F1A14]/62">
              No notifications right now.
            </div>
          )}
        </div>
      </DashboardPanel>
    </DashboardShell>
  );
}
