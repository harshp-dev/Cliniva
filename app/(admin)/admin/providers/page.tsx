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

type SearchParams = Record<string, string | string[] | undefined>;

type PageProps = {
  searchParams?: Promise<SearchParams>;
};

export default async function AdminProvidersPage({ searchParams }: PageProps) {
  const [data, resolvedSearchParams] = await Promise.all([
    getAdminDashboardData(),
    searchParams ?? Promise.resolve({} as SearchParams),
  ]);

  const specialtyFilter = typeof resolvedSearchParams.specialty === "string" ? resolvedSearchParams.specialty.trim().toLowerCase() : "";
  const query = typeof resolvedSearchParams.q === "string" ? resolvedSearchParams.q.trim().toLowerCase() : "";

  const filteredProviders = data.providerRoster.filter((provider) => {
    const matchesSpecialty = specialtyFilter.length === 0 ? true : (provider.specialty ?? "").toLowerCase().includes(specialtyFilter);
    const matchesQuery =
      query.length === 0
        ? true
        : [provider.fullName, provider.email ?? "", provider.licenseNumber ?? ""]
            .join(" ")
            .toLowerCase()
            .includes(query);

    return matchesSpecialty && matchesQuery;
  });

  const stats: DashboardShellStat[] = [
    { label: "Total users", value: String(data.totalUsersCount), detail: "All accounts currently represented in the MVP workspace.", icon: Users },
    { label: "Providers", value: String(data.providersCount), detail: "Clinician accounts available for operations and scheduling.", icon: UserCog },
    { label: "Patients", value: String(data.patientsCount), detail: "Patient accounts enrolled into the current care system.", icon: Activity },
    { label: "Upcoming appointments", value: String(data.upcomingAppointmentsCount), detail: "Requested or confirmed appointments still ahead of today.", icon: CalendarFold },
  ];

  return (
    <DashboardShell
      currentPath="/admin/providers"
      pageLabel="Provider Roster"
      userName={data.user.fullName}
      userEmail={data.user.email}
      roleLabel="Admin workspace"
      title="Provider roster"
      description="Review the current provider footprint with specialty and experience context for operations planning."
      summaryTitle={filteredProviders.length > 0 ? `${filteredProviders.length} provider profiles match the current filters` : "No providers match the current filters"}
      summaryDescription="This screen stays focused on roster visibility and staffing coverage for MVP operations."
      summaryItems={[
        `${data.providersCount} provider accounts active`,
        `${data.patientsCount} patients active in system`,
        `${data.upcomingAppointmentsCount} future appointments in queue`,
      ]}
      stats={stats}
      navItems={getAdminNavItems(
        data.upcomingAppointmentsCount,
        data.recentAuditEvents.length,
        data.providerRoster.length
      )}
      actions={
        <>
          <Button href="/admin/operations">Review operations</Button>
          <Button href="/admin/audit" variant="secondary">Open audit stream</Button>
        </>
      }
    >
      <DashboardPanel
        title="Provider roster snapshot"
        description="Current provider footprint with specialty and experience context for operations planning."
        action={<StatusBadge tone="warning">Coverage</StatusBadge>}
      >
        <form className="mb-6 grid gap-4 rounded-[22px] border border-[#1F1A14]/10 bg-white/70 p-4 lg:grid-cols-[0.9fr_1.1fr_auto]" method="get">
          <div>
            <label className="text-sm font-medium text-[#1F1A14]">Specialty keyword</label>
            <input name="specialty" defaultValue={typeof resolvedSearchParams.specialty === "string" ? resolvedSearchParams.specialty : ""} className="mt-2 w-full rounded-2xl border border-[#1F1A14]/10 bg-[#F8F4EC] px-4 py-3 text-sm" placeholder="Cardiology, family medicine" />
          </div>
          <div>
            <label className="text-sm font-medium text-[#1F1A14]">Search provider or license</label>
            <input name="q" defaultValue={typeof resolvedSearchParams.q === "string" ? resolvedSearchParams.q : ""} className="mt-2 w-full rounded-2xl border border-[#1F1A14]/10 bg-[#F8F4EC] px-4 py-3 text-sm" placeholder="Search name, email, or license" />
          </div>
          <div className="flex items-end gap-3">
            <Button type="submit">Apply filters</Button>
            <Button href="/admin/providers" variant="secondary">Reset</Button>
          </div>
        </form>

        <div className="space-y-3">
          {filteredProviders.length > 0 ? (
            filteredProviders.map((provider) => (
              <article key={provider.id} className="rounded-[22px] border border-[#1F1A14]/10 bg-[#F8F4EC] p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-semibold text-[#1F1A14]">{provider.fullName}</p>
                    <p className="text-sm text-[#1F1A14]/62">{provider.specialty ?? "Specialty pending"}</p>
                    <p className="mt-1 text-sm text-[#1F1A14]/56">{provider.email ?? "Email unavailable"}</p>
                    <p className="mt-1 text-sm text-[#1F1A14]/56">License: {provider.licenseNumber ?? "Pending"}</p>
                  </div>
                  <StatusBadge tone="accent">{provider.yearsExperience ? `${provider.yearsExperience} yrs` : "New"}</StatusBadge>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-[22px] border border-dashed border-[#1F1A14]/14 bg-[#F8F4EC] p-6 text-sm text-[#1F1A14]/62">No provider roster yet.</div>
          )}
        </div>
      </DashboardPanel>
    </DashboardShell>
  );
}

