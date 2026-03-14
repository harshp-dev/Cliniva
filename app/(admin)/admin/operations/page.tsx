import { Activity, CalendarFold, UserCog, Users } from "lucide-react";
import { Button } from "@/components/common/button";
import { StatusBadge } from "@/components/common/status-badge";
import {
  DashboardShell,
  type DashboardShellStat,
} from "@/components/features/dashboard/dashboard-shell";
import { DashboardPanel } from "@/components/features/dashboard/dashboard-panel";
import { getAdminNavItems } from "@/lib/dashboard/navigation";
import { getAdminDashboardData } from "@/lib/services/dashboards/get-admin-dashboard-data";
import {
  formatDateTimeLabel,
  formatTimeRangeLabel,
} from "@/lib/utils/date-time";
import { cancelAppointmentAsAdminAction } from "./actions";

function getAppointmentTone(status: string) {
  if (status === "confirmed") return "success" as const;
  if (status === "requested") return "warning" as const;
  if (status === "cancelled") return "critical" as const;
  return "neutral" as const;
}

type SearchParams = Record<string, string | string[] | undefined>;

type PageProps = {
  searchParams?: Promise<SearchParams>;
};

export default async function AdminOperationsPage({ searchParams }: PageProps) {
  const [data, resolvedSearchParams] = await Promise.all([
    getAdminDashboardData(),
    searchParams ?? Promise.resolve({} as SearchParams),
  ]);

  const statusFilter = typeof resolvedSearchParams.status === "string" ? resolvedSearchParams.status : "all";
  const searchTerm = typeof resolvedSearchParams.q === "string" ? resolvedSearchParams.q.trim().toLowerCase() : "";

  const filteredAppointments = data.recentAppointments.filter((appointment) => {
    const matchesStatus = statusFilter === "all" ? true : appointment.status === statusFilter;
    const matchesSearch =
      searchTerm.length === 0
        ? true
        : [appointment.patientName, appointment.providerName, appointment.reason ?? ""]
            .join(" ")
            .toLowerCase()
            .includes(searchTerm);

    return matchesStatus && matchesSearch;
  });

  const stats: DashboardShellStat[] = [
    { label: "Total users", value: String(data.totalUsersCount), detail: "All accounts currently represented in the MVP workspace.", icon: Users },
    { label: "Providers", value: String(data.providersCount), detail: "Clinician accounts available for operations and scheduling.", icon: UserCog },
    { label: "Patients", value: String(data.patientsCount), detail: "Patient accounts enrolled into the current care system.", icon: Activity },
    { label: "Upcoming appointments", value: String(data.upcomingAppointmentsCount), detail: "Requested or confirmed appointments still ahead of today.", icon: CalendarFold },
  ];

  return (
    <DashboardShell
      currentPath="/admin/operations"
      pageLabel="Operations"
      userName={data.user.fullName}
      userEmail={data.user.email}
      roleLabel="Admin workspace"
      title="Upcoming appointment operations"
      description="Monitor the next scheduled visits across the system with an operations-first view that stays role-scoped."
      summaryTitle={filteredAppointments.length > 0 ? `${filteredAppointments.length} appointments match the current filters` : "No appointments match the current filters"}
      summaryDescription="Use this board to track patient-provider assignment, visit timing, and operational readiness."
      summaryItems={[
        `${data.upcomingAppointmentsCount} future appointments across the system`,
        `${data.providersCount} provider accounts active`,
        `${data.patientsCount} patient accounts active`,
      ]}
      stats={stats}
      navItems={getAdminNavItems(
        data.upcomingAppointmentsCount,
        data.recentAuditEvents.length,
        data.providerRoster.length
      )}
      actions={
        <>
          <Button href="/admin/audit">Open audit stream</Button>
          <Button href="/admin/providers" variant="secondary">Review provider roster</Button>
        </>
      }
    >
      <DashboardPanel
        title="Operations board"
        description="A narrow operational view of the next scheduled visits across the system."
        action={<StatusBadge tone="accent">Admin overview</StatusBadge>}
      >
        <form className="mb-6 grid gap-4 rounded-[22px] border border-[#1F1A14]/10 bg-white/70 p-4 lg:grid-cols-[0.9fr_1.1fr_auto]" method="get">
          <div>
            <label className="text-sm font-medium text-[#1F1A14]">Status</label>
            <select name="status" defaultValue={statusFilter} className="mt-2 w-full rounded-2xl border border-[#1F1A14]/10 bg-[#F8F4EC] px-4 py-3 text-sm">
              <option value="all">All active statuses</option>
              <option value="requested">Requested</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-[#1F1A14]">Search patient, provider, or reason</label>
            <input name="q" defaultValue={typeof resolvedSearchParams.q === "string" ? resolvedSearchParams.q : ""} className="mt-2 w-full rounded-2xl border border-[#1F1A14]/10 bg-[#F8F4EC] px-4 py-3 text-sm" placeholder="Search names or appointment reasons" />
          </div>
          <div className="flex items-end gap-3">
            <Button type="submit">Apply filters</Button>
            <Button href="/admin/operations" variant="secondary">Reset</Button>
          </div>
        </form>

        <div className="space-y-4">
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((appointment) => {
              const canCancel = appointment.status === "requested" || appointment.status === "confirmed";

              return (
                <article key={appointment.id} className="rounded-[24px] border border-[#1F1A14]/10 bg-[#F8F4EC] p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold text-[#1F1A14]">{appointment.patientName}</h3>
                      <p className="text-sm text-[#1F1A14]/62">Assigned to {appointment.providerName}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <StatusBadge tone={getAppointmentTone(appointment.status)}>{appointment.status}</StatusBadge>
                      {canCancel ? (
                        <form action={cancelAppointmentAsAdminAction}>
                          <input type="hidden" name="appointment_id" value={appointment.id} />
                          <Button type="submit" variant="secondary" className="border-rose-700 text-rose-700 hover:bg-rose-700/5 active:bg-rose-700/10">
                            Cancel as admin
                          </Button>
                        </form>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-5 grid gap-3 rounded-[20px] border border-[#1F1A14]/8 bg-white/75 p-4 text-sm text-[#1F1A14]/72 sm:grid-cols-2">
                    <p><span className="font-semibold text-[#1F1A14]">Start:</span> {formatDateTimeLabel(appointment.startAt)}</p>
                    <p><span className="font-semibold text-[#1F1A14]">Duration:</span> {formatTimeRangeLabel(appointment.startAt, appointment.endAt)}</p>
                    <p className="sm:col-span-2"><span className="font-semibold text-[#1F1A14]">Reason:</span> {appointment.reason ?? "No reason captured yet."}</p>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="rounded-[22px] border border-dashed border-[#1F1A14]/14 bg-[#F8F4EC] p-6 text-sm text-[#1F1A14]/62">No upcoming appointments.</div>
          )}
        </div>
      </DashboardPanel>
    </DashboardShell>
  );
}

