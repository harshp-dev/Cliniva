import {
  Activity,
  CalendarFold,
  ShieldCheck,
  UserCog,
  Users,
  Waves,
} from "lucide-react";
import { Button } from "@/components/common/button";
import { EmptyState } from "@/components/common/empty-state";
import { StatusBadge } from "@/components/common/status-badge";
import {
  DashboardShell,
  type DashboardShellStat,
} from "@/components/features/dashboard/dashboard-shell";
import { DashboardPanel } from "@/components/features/dashboard/dashboard-panel";
import { getAdminNavItems } from "@/lib/dashboard/navigation";
import {
  formatDateLabel,
  formatDateTimeLabel,
  formatRelativeDateLabel,
  formatTimeRangeLabel,
} from "@/lib/utils/date-time";
import type { AdminDashboardData } from "@/types/domain/dashboard";

function getAppointmentTone(status: string) {
  if (status === "confirmed") return "success" as const;
  if (status === "requested") return "warning" as const;
  if (status === "cancelled") return "critical" as const;
  return "neutral" as const;
}

function formatAuditAction(action: string) {
  return action.replaceAll(".", " / ");
}

export function AdminDashboard({ data }: { data: AdminDashboardData }) {
  const stats: DashboardShellStat[] = [
    {
      label: "Total users",
      value: String(data.totalUsersCount),
      detail: "All accounts currently represented in the MVP workspace.",
      icon: Users,
    },
    {
      label: "Providers",
      value: String(data.providersCount),
      detail: "Clinician accounts available for operations and scheduling.",
      icon: UserCog,
    },
    {
      label: "Patients",
      value: String(data.patientsCount),
      detail: "Patient accounts enrolled into the current care system.",
      icon: Activity,
    },
    {
      label: "Upcoming appointments",
      value: String(data.upcomingAppointmentsCount),
      detail: "Requested or confirmed appointments still ahead of today.",
      icon: CalendarFold,
    },
  ];

  const summaryTitle = data.recentAppointments[0]
    ? `${formatRelativeDateLabel(data.recentAppointments[0].startAt)} operations start with ${data.recentAppointments[0].providerName}`
    : "Operations board is currently quiet";

  const summaryDescription = data.recentAppointments[0]
    ? `${data.recentAppointments[0].patientName} is the next patient in the upcoming appointment stream.`
    : "Use the board to monitor staffing coverage, queue health, and recent audit movement as new activity arrives.";

  const summaryItems = [
    `${data.providersCount} provider accounts live`,
    `${data.patientsCount} patient accounts active`,
    `${data.recentAuditEvents.length} recent audit events in view`,
  ];

  return (
    <DashboardShell
      currentPath="/admin/dashboard"
      pageLabel="Overview"
      userName={data.user.fullName}
      userEmail={data.user.email}
      roleLabel="Admin workspace"
      title={`Operations dashboard for ${data.user.fullName}`}
      description="Monitor user distribution, upcoming visits, and recent audit activity without widening access beyond the data the workflow actually needs."
      summaryTitle={summaryTitle}
      summaryDescription={summaryDescription}
      summaryItems={summaryItems}
      stats={stats}
      navItems={getAdminNavItems(
        data.upcomingAppointmentsCount,
        data.recentAuditEvents.length,
        data.providerRoster.length
      )}
      actions={
        <>
          <Button href="/admin/operations">Review operations</Button>
          <Button href="/admin/audit" variant="secondary">
            Open audit stream
          </Button>
        </>
      }
    >
      <div className="grid gap-6 2xl:grid-cols-[1.12fr_0.88fr]">
        <div className="space-y-6">
          <DashboardPanel
            title="Upcoming appointment operations"
            description="A narrow operational view of the next scheduled visits across the system."
            action={<StatusBadge tone="accent">Admin overview</StatusBadge>}
          >
            <div className="space-y-4">
              {data.recentAppointments.length > 0 ? (
                data.recentAppointments.map((appointment) => (
                  <article
                    key={appointment.id}
                    className="rounded-[24px] border border-[#1F1A14]/10 bg-[#F8F4EC] p-5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-1">
                        <h3 className="text-lg font-semibold text-[#1F1A14]">
                          {appointment.patientName}
                        </h3>
                        <p className="text-sm text-[#1F1A14]/62">
                          Assigned to {appointment.providerName}
                        </p>
                      </div>
                      <StatusBadge tone={getAppointmentTone(appointment.status)}>
                        {appointment.status}
                      </StatusBadge>
                    </div>
                    <div className="mt-5 grid gap-3 rounded-[20px] border border-[#1F1A14]/8 bg-white/75 p-4 text-sm text-[#1F1A14]/72 sm:grid-cols-2">
                      <p>
                        <span className="font-semibold text-[#1F1A14]">Start:</span> {formatDateTimeLabel(appointment.startAt)}
                      </p>
                      <p>
                        <span className="font-semibold text-[#1F1A14]">Duration:</span> {formatTimeRangeLabel(appointment.startAt, appointment.endAt)}
                      </p>
                      <p className="sm:col-span-2">
                        <span className="font-semibold text-[#1F1A14]">Reason:</span> {appointment.reason ?? "No reason captured yet."}
                      </p>
                    </div>
                  </article>
                ))
              ) : (
                <EmptyState
                  title="No upcoming appointments"
                  description="New requested and confirmed visits will appear here as the schedule fills."
                  icon={<CalendarFold className="h-4 w-4" />}
                />
              )}
            </div>
          </DashboardPanel>

          <DashboardPanel
            title="Recent audit activity"
            description="The latest operational events recorded by the system."
            action={<StatusBadge tone="success">Tracked</StatusBadge>}
          >
            <div className="space-y-3">
              {data.recentAuditEvents.length > 0 ? (
                data.recentAuditEvents.map((event) => (
                  <article
                    key={event.id}
                    className="rounded-[22px] border border-[#1F1A14]/10 bg-[#F8F4EC] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-[#1F1A14]">{formatAuditAction(event.action)}</p>
                        <p className="mt-1 text-sm text-[#1F1A14]/62">
                          Entity: {event.entityType}
                        </p>
                      </div>
                      <StatusBadge>{formatDateLabel(event.createdAt)}</StatusBadge>
                    </div>
                  </article>
                ))
              ) : (
                <EmptyState
                  title="No audit events yet"
                  description="Critical system actions will accumulate here as teams interact with appointments and records."
                  icon={<ShieldCheck className="h-4 w-4" />}
                />
              )}
            </div>
          </DashboardPanel>
        </div>

        <div className="space-y-6">
          <DashboardPanel
            title="Provider roster snapshot"
            description="Current provider footprint with specialty and experience context for operations planning."
            action={<StatusBadge tone="warning">Coverage</StatusBadge>}
          >
            <div className="space-y-3">
              {data.providerRoster.length > 0 ? (
                data.providerRoster.map((provider) => (
                  <article
                    key={provider.id}
                    className="rounded-[22px] border border-[#1F1A14]/10 bg-[#F8F4EC] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-[#1F1A14]">{provider.fullName}</p>
                        <p className="text-sm text-[#1F1A14]/62">
                          {provider.specialty ?? "Specialty pending"}
                        </p>
                      </div>
                      <StatusBadge tone="accent">
                        {provider.yearsExperience ? `${provider.yearsExperience} yrs` : "New"}
                      </StatusBadge>
                    </div>
                  </article>
                ))
              ) : (
                <EmptyState
                  title="No provider roster yet"
                  description="Provider accounts will appear here as onboarding completes."
                  icon={<UserCog className="h-4 w-4" />}
                />
              )}
            </div>
          </DashboardPanel>

          <DashboardPanel
            title="Operational posture"
            description="This workspace is designed for oversight without turning the admin view into a raw data dump."
            action={<StatusBadge tone="accent">Security aware</StatusBadge>}
          >
            <div className="space-y-3 text-sm text-[#1F1A14]/72">
              <div className="rounded-[22px] border border-[#1F1A14]/10 bg-[#F8F4EC] p-4">
                <div className="flex items-center gap-2 font-semibold text-[#1F1A14]">
                  <Waves className="h-4 w-4 text-[#FA8112]" />
                  Role-scoped summary views
                </div>
                <p className="mt-2 leading-6">Counts and queue summaries help operations respond quickly without broadening dashboard payloads unnecessarily.</p>
              </div>
              <div className="rounded-[22px] border border-[#1F1A14]/10 bg-[#F8F4EC] p-4">
                <div className="flex items-center gap-2 font-semibold text-[#1F1A14]">
                  <ShieldCheck className="h-4 w-4 text-[#FA8112]" />
                  Audit-first workflow
                </div>
                <p className="mt-2 leading-6">Recent events remain visible so sensitive operational changes can be reviewed with context.</p>
              </div>
              <div className="rounded-[22px] border border-[#1F1A14]/10 bg-[#F8F4EC] p-4">
                <div className="flex items-center gap-2 font-semibold text-[#1F1A14]">
                  <Users className="h-4 w-4 text-[#FA8112]" />
                  Authenticated user context is preserved across these reads.
                </div>
              </div>
            </div>
          </DashboardPanel>
        </div>
      </div>
    </DashboardShell>
  );
}
