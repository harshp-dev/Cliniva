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
import { formatDateLabel } from "@/lib/utils/date-time";

function formatAuditAction(action: string) {
  return action.replaceAll(".", " / ");
}

type SearchParams = Record<string, string | string[] | undefined>;

type PageProps = {
  searchParams?: Promise<SearchParams>;
};

export default async function AdminAuditPage({ searchParams }: PageProps) {
  const [data, resolvedSearchParams] = await Promise.all([
    getAdminDashboardData(),
    searchParams ?? Promise.resolve({} as SearchParams),
  ]);

  const entityFilter = typeof resolvedSearchParams.entity === "string" ? resolvedSearchParams.entity : "all";
  const query = typeof resolvedSearchParams.q === "string" ? resolvedSearchParams.q.trim().toLowerCase() : "";

  const filteredEvents = data.recentAuditEvents.filter((event) => {
    const matchesEntity = entityFilter === "all" ? true : event.entityType === entityFilter;
    const matchesQuery =
      query.length === 0
        ? true
        : [event.action, event.entityType, event.actorName ?? ""]
            .join(" ")
            .toLowerCase()
            .includes(query);

    return matchesEntity && matchesQuery;
  });

  const stats: DashboardShellStat[] = [
    { label: "Total users", value: String(data.totalUsersCount), detail: "All accounts currently represented in the MVP workspace.", icon: Users },
    { label: "Providers", value: String(data.providersCount), detail: "Clinician accounts available for operations and scheduling.", icon: UserCog },
    { label: "Patients", value: String(data.patientsCount), detail: "Patient accounts enrolled into the current care system.", icon: Activity },
    { label: "Upcoming appointments", value: String(data.upcomingAppointmentsCount), detail: "Requested or confirmed appointments still ahead of today.", icon: CalendarFold },
  ];

  return (
    <DashboardShell
      currentPath="/admin/audit"
      pageLabel="Audit Stream"
      userName={data.user.fullName}
      userEmail={data.user.email}
      roleLabel="Admin workspace"
      title="Audit activity"
      description="Review the latest operational events recorded by the system without exposing unnecessary record detail."
      summaryTitle={filteredEvents.length > 0 ? `${filteredEvents.length} audit events match the current filters` : "No audit events match the current filters"}
      summaryDescription="Recent system events remain visible here so administrative changes can be reviewed with context."
      summaryItems={[
        `${data.recentAuditEvents.length} audit events loaded`,
        `${data.upcomingAppointmentsCount} future appointments in system view`,
        `${data.providersCount} providers active`,
      ]}
      stats={stats}
      navItems={getAdminNavItems(
        data.upcomingAppointmentsCount,
        data.recentAuditEvents.length,
        data.providerRoster.length
      )}
      actions={
        <>
          <Button href="/admin/providers">Review providers</Button>
          <Button href="/admin/operations" variant="secondary">Open operations</Button>
        </>
      }
    >
      <DashboardPanel
        title="Audit stream"
        description="The latest operational events recorded by the system."
        action={<StatusBadge tone="success">Tracked</StatusBadge>}
      >
        <form className="mb-6 grid gap-4 rounded-[22px] border border-[#1F1A14]/10 bg-white/70 p-4 lg:grid-cols-[0.9fr_1.1fr_auto]" method="get">
          <div>
            <label className="text-sm font-medium text-[#1F1A14]">Entity type</label>
            <select name="entity" defaultValue={entityFilter} className="mt-2 w-full rounded-2xl border border-[#1F1A14]/10 bg-[#F8F4EC] px-4 py-3 text-sm">
              <option value="all">All entity types</option>
              <option value="appointment">Appointment</option>
              <option value="consultation_session">Consultation session</option>
              <option value="soap_note">SOAP note</option>
              <option value="provider_profile">Provider profile</option>
              <option value="patient_profile">Patient profile</option>
              <option value="provider_availability">Provider availability</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-[#1F1A14]">Search action or actor</label>
            <input name="q" defaultValue={typeof resolvedSearchParams.q === "string" ? resolvedSearchParams.q : ""} className="mt-2 w-full rounded-2xl border border-[#1F1A14]/10 bg-[#F8F4EC] px-4 py-3 text-sm" placeholder="Search action, entity, or actor" />
          </div>
          <div className="flex items-end gap-3">
            <Button type="submit">Apply filters</Button>
            <Button href="/admin/audit" variant="secondary">Reset</Button>
          </div>
        </form>

        <div className="space-y-3">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <article key={event.id} className="rounded-[22px] border border-[#1F1A14]/10 bg-[#F8F4EC] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[#1F1A14]">{formatAuditAction(event.action)}</p>
                    <p className="mt-1 text-sm text-[#1F1A14]/62">Entity: {event.entityType}</p>
                    <p className="mt-1 text-sm text-[#1F1A14]/56">Actor: {event.actorName ?? "System or unavailable"}</p>
                  </div>
                  <StatusBadge>{formatDateLabel(event.createdAt)}</StatusBadge>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-[22px] border border-dashed border-[#1F1A14]/14 bg-[#F8F4EC] p-6 text-sm text-[#1F1A14]/62">No audit events yet.</div>
          )}
        </div>
      </DashboardPanel>
    </DashboardShell>
  );
}

