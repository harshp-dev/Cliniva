import { BellRing, CalendarClock, ClipboardList, NotebookPen } from "lucide-react";
import { Button } from "@/components/common/button";
import { StatusBadge } from "@/components/common/status-badge";
import {
  DashboardShell,
  type DashboardShellStat,
} from "@/components/features/dashboard/dashboard-shell";
import { DashboardPanel } from "@/components/features/dashboard/dashboard-panel";
import { getProviderNavItems } from "@/lib/dashboard/navigation";
import { requireAuthProfile } from "@/lib/auth/require-auth-profile";
import { getProviderDashboardData } from "@/lib/services/dashboards/get-provider-dashboard-data";
import { getProviderProfile } from "@/lib/services/profiles/get-provider-profile";
import { updateProviderProfileAction } from "./actions";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProviderProfilePage({ searchParams }: PageProps) {
  const fallbackSearchParams: Record<string, string | string[] | undefined> = {};
  const [{ supabase, profile }, dashboardData, resolvedSearchParams] = await Promise.all([
    requireAuthProfile("provider"),
    getProviderDashboardData(),
    searchParams ?? Promise.resolve(fallbackSearchParams),
  ]);
  const providerProfile = await getProviderProfile(supabase, profile.id);
  const wasUpdated = resolvedSearchParams.updated === "1";

  const stats: DashboardShellStat[] = [
    {
      label: "Today's load",
      value: String(dashboardData.todayAppointmentsCount),
      detail: "Appointments on the calendar for the current day.",
      icon: CalendarClock,
    },
    {
      label: "Active queue",
      value: String(dashboardData.activeQueueCount),
      detail: "Requested or confirmed visits still ahead in the schedule.",
      icon: ClipboardList,
    },
    {
      label: "Notes created",
      value: String(dashboardData.notesCreatedCount),
      detail: "Structured SOAP documentation authored from this workspace.",
      icon: NotebookPen,
    },
    {
      label: "Unread updates",
      value: String(dashboardData.unreadNotificationsCount),
      detail: "Provider-facing notices that still need review.",
      icon: BellRing,
    },
  ];

  return (
    <DashboardShell
      currentPath="/provider/profile"
      pageLabel="Profile"
      userName={dashboardData.user.fullName}
      userEmail={dashboardData.user.email}
      roleLabel="Provider workspace"
      title="Provider profile"
      description="Maintain the specialty, licensing, and bio details that shape the provider-facing experience and the admin roster view."
      summaryTitle={wasUpdated ? "Profile updated" : providerProfile.specialty || "Provider setup in progress"}
      summaryDescription={wasUpdated ? "Your provider profile was saved successfully." : "Keep clinician identity details current so patients and operations have clean context."}
      summaryItems={[
        providerProfile.licenseNumber ? `License on file: ${providerProfile.licenseNumber}` : "License number still missing",
        providerProfile.yearsExperience > 0 ? `${providerProfile.yearsExperience} years experience listed` : "Years of experience not added yet",
        providerProfile.phone ? `Primary phone: ${providerProfile.phone}` : "Primary phone still missing",
      ]}
      stats={stats}
      navItems={getProviderNavItems(
        dashboardData.activeQueueCount,
        dashboardData.availabilityBlocksCount,
        dashboardData.unreadNotificationsCount,
        dashboardData.specialty
      )}
      actions={
        <>
          <Button href="/provider/dashboard" variant="secondary">Back to dashboard</Button>
          <Button href="/provider/appointments">Open appointments</Button>
        </>
      }
    >
      <DashboardPanel
        title="Clinician identity and roster details"
        description="These fields feed the provider dashboard, patient booking experience, and the admin roster workspace."
        action={wasUpdated ? <StatusBadge tone="success">Saved</StatusBadge> : <StatusBadge tone="accent">Provider setup</StatusBadge>}
      >
        <form action={updateProviderProfileAction} className="grid gap-5 lg:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-[#1F1A14]">Full name</label>
            <input name="full_name" defaultValue={providerProfile.fullName} className="mt-2 w-full rounded-2xl border border-[#1F1A14]/10 bg-[#F8F4EC] px-4 py-3 text-sm" required />
          </div>
          <div>
            <label className="text-sm font-medium text-[#1F1A14]">Email</label>
            <input value={providerProfile.email} className="mt-2 w-full rounded-2xl border border-[#1F1A14]/10 bg-white/70 px-4 py-3 text-sm text-[#1F1A14]/55" disabled />
          </div>
          <div>
            <label className="text-sm font-medium text-[#1F1A14]">Phone</label>
            <input name="phone" defaultValue={providerProfile.phone} className="mt-2 w-full rounded-2xl border border-[#1F1A14]/10 bg-[#F8F4EC] px-4 py-3 text-sm" required />
          </div>
          <div>
            <label className="text-sm font-medium text-[#1F1A14]">Specialty</label>
            <input name="specialty" defaultValue={providerProfile.specialty} className="mt-2 w-full rounded-2xl border border-[#1F1A14]/10 bg-[#F8F4EC] px-4 py-3 text-sm" required />
          </div>
          <div>
            <label className="text-sm font-medium text-[#1F1A14]">License number</label>
            <input name="license_number" defaultValue={providerProfile.licenseNumber} className="mt-2 w-full rounded-2xl border border-[#1F1A14]/10 bg-[#F8F4EC] px-4 py-3 text-sm" required />
          </div>
          <div>
            <label className="text-sm font-medium text-[#1F1A14]">Years of experience</label>
            <input type="number" min="0" max="60" name="years_experience" defaultValue={String(providerProfile.yearsExperience)} className="mt-2 w-full rounded-2xl border border-[#1F1A14]/10 bg-[#F8F4EC] px-4 py-3 text-sm" required />
          </div>
          <div className="lg:col-span-2">
            <label className="text-sm font-medium text-[#1F1A14]">Bio</label>
            <textarea name="bio" defaultValue={providerProfile.bio} className="mt-2 min-h-[180px] w-full rounded-2xl border border-[#1F1A14]/10 bg-[#F8F4EC] px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#FA8112]" placeholder="Add a concise bio that helps patients and operations understand your care focus." />
          </div>
          <div className="lg:col-span-2 flex flex-wrap gap-3">
            <Button type="submit">Save profile</Button>
            <Button href="/provider/dashboard" variant="secondary">Back to dashboard</Button>
          </div>
        </form>
      </DashboardPanel>
    </DashboardShell>
  );
}

