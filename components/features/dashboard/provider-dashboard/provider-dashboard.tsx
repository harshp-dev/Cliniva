import {
  CalendarClock,
  ClipboardList,
  NotebookPen,
  ShieldCheck,
  Stethoscope,
  TimerReset,
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
import { getProviderNavItems } from "@/lib/dashboard/navigation";
import {
  formatClockLabel,
  formatDateLabel,
  formatRelativeDateLabel,
  formatTimeRangeLabel,
  formatWeekdayLabel,
} from "@/lib/utils/date-time";
import type { ProviderDashboardData } from "@/types/domain/dashboard";

function getAppointmentTone(status: string) {
  if (status === "confirmed") return "success" as const;
  if (status === "requested") return "warning" as const;
  if (status === "completed") return "accent" as const;
  return "neutral" as const;
}

export function ProviderDashboard({ data }: { data: ProviderDashboardData }) {
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

  const summaryTitle = data.upcomingAppointments[0]
    ? `${formatRelativeDateLabel(data.upcomingAppointments[0].startAt)} starts with ${data.upcomingAppointments[0].patientName}`
    : "Your queue is clear right now";

  const summaryDescription = data.upcomingAppointments[0]
    ? `${data.upcomingAppointments[0].reason ?? "Next scheduled visit is ready for review."}`
    : "Use the quieter window to tighten availability, clean up documentation, and prep future follow-ups.";

  const summaryItems = [
    data.specialty ?? "Specialty not set yet",
    data.licenseNumber ? `License: ${data.licenseNumber}` : "License details can be added in provider setup",
    data.yearsExperience ? `${data.yearsExperience} years of experience on profile` : "Experience years not set yet",
  ];

  return (
    <DashboardShell
      currentPath="/provider/dashboard"
      pageLabel="Overview"
      userName={data.user.fullName}
      userEmail={data.user.email}
      roleLabel="Provider workspace"
      title={`Clinical dashboard for ${data.user.fullName}`}
      description="Review the active queue, keep documentation current, and manage the availability patients rely on for booking."
      summaryTitle={summaryTitle}
      summaryDescription={summaryDescription}
      summaryItems={summaryItems}
      stats={stats}
      navItems={getProviderNavItems(
        data.activeQueueCount,
        data.availabilityBlocksCount,
        data.unreadNotificationsCount,
        data.specialty
      )}
      actions={
        <>
          <Button href="/provider/appointments">Open appointments</Button>
          <Button href="/provider/profile" variant="secondary">
            Update profile
          </Button>
        </>
      }
    >
      <div className="grid gap-6 2xl:grid-cols-[1.18fr_0.82fr]">
        <div className="space-y-6">
          <DashboardPanel
            title="Upcoming patient queue"
            description="Priority schedule view for the next appointments assigned to you."
            action={<StatusBadge tone="accent">Live from role-scoped reads</StatusBadge>}
          >
            <div className="space-y-4">
              {data.upcomingAppointments.length > 0 ? (
                data.upcomingAppointments.map((appointment) => (
                  <article
                    key={appointment.id}
                    className="rounded-[24px] border border-[#1F1A14]/10 bg-[#F8F4EC] p-5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-[#1F1A14]">
                          {appointment.patientName}
                        </h3>
                        <p className="mt-1 text-sm text-[#1F1A14]/62">
                          {appointment.reason ?? "General follow-up"}
                        </p>
                      </div>
                      <StatusBadge tone={getAppointmentTone(appointment.status)}>
                        {appointment.status}
                      </StatusBadge>
                    </div>
                    <div className="mt-5 grid gap-3 rounded-[20px] border border-[#1F1A14]/8 bg-white/75 p-4 text-sm text-[#1F1A14]/72 sm:grid-cols-2">
                      <p>
                        <span className="font-semibold text-[#1F1A14]">Visit day:</span> {formatRelativeDateLabel(appointment.startAt)}
                      </p>
                      <p>
                        <span className="font-semibold text-[#1F1A14]">Time:</span> {formatTimeRangeLabel(appointment.startAt, appointment.endAt)}
                      </p>
                    </div>
                  </article>
                ))
              ) : (
                <EmptyState
                  title="No upcoming patient visits"
                  description="As new requests or confirmed visits arrive, the queue will populate here for rapid triage."
                  icon={<CalendarClock className="h-4 w-4" />}
                />
              )}
            </div>
          </DashboardPanel>

          <DashboardPanel
            title="Recent documentation"
            description="The latest SOAP notes created in your workspace."
            action={<StatusBadge tone="success">Documented</StatusBadge>}
          >
            <div className="space-y-4">
              {data.recentNotes.length > 0 ? (
                data.recentNotes.map((note) => (
                  <article
                    key={note.id}
                    className="rounded-[24px] border border-[#1F1A14]/10 bg-[#F8F4EC] p-5"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-base font-semibold text-[#1F1A14]">{note.patientName}</h3>
                        <p className="text-sm text-[#1F1A14]/62">Updated {formatDateLabel(note.createdAt)}</p>
                      </div>
                      <StatusBadge tone={note.isSharedWithPatient ? "success" : "warning"}>
                        {note.isSharedWithPatient ? "Shared" : "Provider only"}
                      </StatusBadge>
                    </div>
                    <div className="mt-4 grid gap-3 text-sm text-[#1F1A14]/72 lg:grid-cols-2">
                      <div className="rounded-[18px] border border-[#1F1A14]/8 bg-white/75 p-4">
                        <p className="font-semibold text-[#1F1A14]">Assessment</p>
                        <p className="mt-2 leading-6">{note.assessment ?? "No assessment entered."}</p>
                      </div>
                      <div className="rounded-[18px] border border-[#1F1A14]/8 bg-white/75 p-4">
                        <p className="font-semibold text-[#1F1A14]">Plan</p>
                        <p className="mt-2 leading-6">{note.plan ?? "No treatment plan entered."}</p>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <EmptyState
                  title="No notes yet"
                  description="Completed consultations and follow-ups will start building your note history here."
                  icon={<NotebookPen className="h-4 w-4" />}
                />
              )}
            </div>
          </DashboardPanel>
        </div>

        <div className="space-y-6">
          <DashboardPanel
            title="Published availability"
            description="The schedule windows that currently shape patient booking capacity."
            action={<StatusBadge tone="warning">Keep current</StatusBadge>}
          >
            <div className="space-y-3">
              {data.availability.length > 0 ? (
                data.availability.map((block) => (
                  <article
                    key={block.id}
                    className="rounded-[22px] border border-[#1F1A14]/10 bg-[#F8F4EC] p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-[#1F1A14]">
                          {formatWeekdayLabel(block.dayOfWeek)}
                        </p>
                        <p className="text-sm text-[#1F1A14]/62">{block.timezone}</p>
                      </div>
                      <StatusBadge>{formatClockLabel(block.startTime)} - {formatClockLabel(block.endTime)}</StatusBadge>
                    </div>
                  </article>
                ))
              ) : (
                <EmptyState
                  title="No availability configured"
                  description="Add recurring schedule windows to unlock patient booking and appointment routing."
                  icon={<Stethoscope className="h-4 w-4" />}
                />
              )}
            </div>
          </DashboardPanel>

          <DashboardPanel
            title="Operational notices"
            description="Recent notifications tied to your clinician account."
            action={<StatusBadge tone="accent">{data.unreadNotificationsCount} unread</StatusBadge>}
          >
            <NotificationList
              notifications={data.notifications}
              emptyTitle="No notices right now"
              emptyDescription="System reminders, consult updates, and follow-up prompts will surface here when needed."
            />
          </DashboardPanel>

          <DashboardPanel
            title="Clinical posture"
            description="The provider workspace is tuned for queue control, documentation quality, and scheduling readiness."
            action={<StatusBadge tone="success">MVP aligned</StatusBadge>}
          >
            <div className="space-y-3 text-sm text-[#1F1A14]/72">
              <div className="rounded-[22px] border border-[#1F1A14]/10 bg-[#F8F4EC] p-4">
                <div className="flex items-center gap-2 font-semibold text-[#1F1A14]">
                  <ShieldCheck className="h-4 w-4 text-[#FA8112]" />
                  Protected scheduling access
                </div>
                <p className="mt-2 leading-6">Queue data is loaded with authenticated user context and appointment-scoped access only.</p>
              </div>
              <div className="rounded-[22px] border border-[#1F1A14]/10 bg-[#F8F4EC] p-4">
                <div className="flex items-center gap-2 font-semibold text-[#1F1A14]">
                  <NotebookPen className="h-4 w-4 text-[#FA8112]" />
                  Structured note workflow
                </div>
                <p className="mt-2 leading-6">SOAP summaries and patient-visible note state stay distinct so the portal only shows intentional releases.</p>
              </div>
              <div className="rounded-[22px] border border-[#1F1A14]/10 bg-[#F8F4EC] p-4">
                <div className="flex items-center gap-2 font-semibold text-[#1F1A14]">
                  <TimerReset className="h-4 w-4 text-[#FA8112]" />
                  Faster daily review
                </div>
                <p className="mt-2 leading-6">Today&apos;s load, current queue, and live availability stay visible without forcing a context switch.</p>
              </div>
            </div>
          </DashboardPanel>
        </div>
      </div>
    </DashboardShell>
  );
}
