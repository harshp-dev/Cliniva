import {
  BellRing,
  CalendarRange,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  NotebookText,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/common/button";
import { EmptyState } from "@/components/common/empty-state";
import { StatusBadge } from "@/components/common/status-badge";
import {
  DashboardShell,
  type DashboardShellStat,
} from "@/components/features/dashboard/dashboard-shell";
import { DashboardPanel } from "@/components/features/dashboard/dashboard-panel";
import { NotificationList } from "@/components/features/notifications/notification-list";
import { getPatientNavItems } from "@/lib/dashboard/navigation";
import {
  formatDateLabel,
  formatDateTimeLabel,
  formatRelativeDateLabel,
  formatTimeRangeLabel,
} from "@/lib/utils/date-time";
import type { PatientDashboardData } from "@/types/domain/dashboard";

function getAppointmentTone(status: string) {
  if (status === "confirmed") return "success" as const;
  if (status === "requested") return "warning" as const;
  if (status === "cancelled") return "critical" as const;
  return "neutral" as const;
}

export function PatientDashboard({ data }: { data: PatientDashboardData }) {
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

  const summaryTitle = data.nextAppointment
    ? `${formatRelativeDateLabel(data.nextAppointment.startAt)} with ${data.nextAppointment.providerName}`
    : "Your next care step is open";

  const summaryDescription = data.nextAppointment
    ? `${data.nextAppointment.reason ?? "Your care team has scheduled your next visit."}`
    : "Complete the remaining profile basics and watch for scheduling activity from your care team.";

  const summaryItems = data.nextAppointment
    ? [
        `${formatDateTimeLabel(data.nextAppointment.startAt)} - ${formatTimeRangeLabel(data.nextAppointment.startAt, data.nextAppointment.endAt)}`,
        data.nextAppointment.providerSpecialty ?? "Assigned clinician",
        `Profile readiness: ${data.completionScore}% complete`,
      ]
    : [
        `Profile readiness: ${data.completionScore}% complete`,
        `${data.unreadNotificationsCount} unread portal updates`,
        `${data.sharedNotesCount} recent visit notes available`,
      ];

  const checklistItems = [
    {
      title: "Profile basics",
      detail:
        data.completionScore === 100
          ? "Your intake essentials are complete."
          : `You still have room to improve profile readiness from ${data.completionScore}% to 100%.`,
      isDone: data.completionScore === 100,
    },
    {
      title: "Upcoming visit prep",
      detail: data.nextAppointment
        ? `Your next appointment is on ${formatDateLabel(data.nextAppointment.startAt)}.`
        : "You do not have a confirmed or requested appointment yet.",
      isDone: Boolean(data.nextAppointment),
    },
    {
      title: "Post-visit records",
      detail:
        data.sharedNotesCount > 0
          ? "A shared note is ready in your portal."
          : "New shared visit notes will appear here after clinician release.",
      isDone: data.sharedNotesCount > 0,
    },
  ];

  return (
    <DashboardShell
      currentPath="/patient/dashboard"
      pageLabel="Overview"
      userName={data.user.fullName}
      userEmail={data.user.email}
      roleLabel="Patient workspace"
      title={`Welcome back, ${data.user.fullName}.`}
      description="Track the next appointment, stay on top of intake readiness, and review the visit records your care team has shared with you."
      summaryTitle={summaryTitle}
      summaryDescription={summaryDescription}
      summaryItems={summaryItems}
      stats={stats}
      navItems={getPatientNavItems(
        data.upcomingAppointmentsCount,
        data.sharedNotesCount,
        data.unreadNotificationsCount,
        data.completionScore
      )}
      actions={
        <>
          <Button href="/patient/appointments">Book appointments</Button>
          <Button href="/patient/profile" variant="secondary">
            Complete profile
          </Button>
        </>
      }
    >
      <div className="grid gap-6 2xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <DashboardPanel
            title="Upcoming appointments"
            description="Your upcoming care schedule, including provider details and visit purpose."
            action={<StatusBadge tone="accent">Patient portal</StatusBadge>}
          >
            <div className="space-y-4">
              {data.upcomingAppointments.length > 0 ? (
                data.upcomingAppointments.map((appointment) => (
                  <article
                    key={appointment.id}
                    className="rounded-[24px] border border-[#1F1A14]/10 bg-[#F8F4EC] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-1">
                        <h3 className="text-lg font-semibold text-[#1F1A14]">
                          {appointment.providerName}
                        </h3>
                        <p className="text-sm text-[#1F1A14]/62">
                          {appointment.providerSpecialty ?? "Care team"}
                        </p>
                      </div>
                      <StatusBadge tone={getAppointmentTone(appointment.status)}>
                        {appointment.status}
                      </StatusBadge>
                    </div>
                    <div className="mt-5 grid gap-3 rounded-[20px] border border-[#1F1A14]/8 bg-white/75 p-4 text-sm text-[#1F1A14]/72 sm:grid-cols-2">
                      <p>
                        <span className="font-semibold text-[#1F1A14]">When:</span> {formatRelativeDateLabel(appointment.startAt)} - {formatTimeRangeLabel(appointment.startAt, appointment.endAt)}
                      </p>
                      <p>
                        <span className="font-semibold text-[#1F1A14]">Purpose:</span> {appointment.reason ?? "General follow-up"}
                      </p>
                    </div>
                  </article>
                ))
              ) : (
                <EmptyState
                  title="No upcoming visits yet"
                  description="Once your care team confirms a request, it will appear here with the visit time and clinician details."
                  icon={<CalendarRange className="h-4 w-4" />}
                />
              )}
            </div>
          </DashboardPanel>

          <DashboardPanel
            title="Shared visit notes"
            description="Only records your provider has explicitly shared are shown here."
            action={<StatusBadge>Read-only</StatusBadge>}
          >
            <div className="space-y-4">
              {data.recentNotes.length > 0 ? (
                data.recentNotes.map((note) => (
                  <article
                    key={note.id}
                    className="rounded-[24px] border border-[#1F1A14]/10 bg-[#F8F4EC] p-5"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="text-base font-semibold text-[#1F1A14]">{note.providerName}</h3>
                        <p className="text-sm text-[#1F1A14]/62">Shared on {formatDateLabel(note.createdAt)}</p>
                      </div>
                      <StatusBadge tone="success">Available</StatusBadge>
                    </div>
                    <div className="mt-4 grid gap-3 text-sm text-[#1F1A14]/72 lg:grid-cols-2">
                      <div className="rounded-[18px] border border-[#1F1A14]/8 bg-white/75 p-4">
                        <p className="font-semibold text-[#1F1A14]">Assessment</p>
                        <p className="mt-2 leading-6">{note.assessment ?? "No assessment summary yet."}</p>
                      </div>
                      <div className="rounded-[18px] border border-[#1F1A14]/8 bg-white/75 p-4">
                        <p className="font-semibold text-[#1F1A14]">Plan</p>
                        <p className="mt-2 leading-6">{note.plan ?? "No plan summary yet."}</p>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <EmptyState
                  title="No shared notes yet"
                  description="Completed visits will surface here once your clinician marks the summary as patient-visible."
                  icon={<FileText className="h-4 w-4" />}
                />
              )}
            </div>
          </DashboardPanel>
        </div>

        <div className="space-y-6">
          <DashboardPanel
            title="Care checklist"
            description="A quick readiness pass so you know what needs attention before the next visit."
            action={<StatusBadge tone="warning">Review weekly</StatusBadge>}
          >
            <div className="space-y-4">
              {checklistItems.map((item) => (
                <div
                  key={item.title}
                  className="flex items-start gap-3 rounded-[24px] border border-[#1F1A14]/10 bg-[#F8F4EC] p-4"
                >
                  <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FA8112]/12 text-[#FA8112]">
                    {item.isDone ? <CheckCircle2 className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-[#1F1A14]">{item.title}</p>
                      <StatusBadge tone={item.isDone ? "success" : "warning"}>
                        {item.isDone ? "On track" : "Pending"}
                      </StatusBadge>
                    </div>
                    <p className="text-sm leading-6 text-[#1F1A14]/68">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </DashboardPanel>

          <DashboardPanel
            title="Notifications"
            description="Recent reminders, confirmations, and portal updates."
            action={<StatusBadge tone="accent">{data.unreadNotificationsCount} unread</StatusBadge>}
          >
            <NotificationList
              notifications={data.notifications}
              emptyTitle="No notifications right now"
              emptyDescription="Appointment confirmations and portal updates will show up here when they are available."
              className="soft-scrollbar max-h-[28rem] overflow-y-auto pr-2"
            />
          </DashboardPanel>
        </div>
      </div>
    </DashboardShell>
  );
}


