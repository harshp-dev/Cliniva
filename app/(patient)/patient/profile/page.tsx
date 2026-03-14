import { BellRing, CalendarRange, ClipboardCheck, HeartHandshake } from "lucide-react";
import { Button } from "@/components/common/button";
import { StatusBadge } from "@/components/common/status-badge";
import {
  DashboardShell,
  type DashboardShellStat,
} from "@/components/features/dashboard/dashboard-shell";
import { DashboardPanel } from "@/components/features/dashboard/dashboard-panel";
import { getPatientNavItems } from "@/lib/dashboard/navigation";
import { requireAuthProfile } from "@/lib/auth/require-auth-profile";
import { getPatientDashboardData } from "@/lib/services/dashboards/get-patient-dashboard-data";
import { getPatientProfile } from "@/lib/services/profiles/get-patient-profile";
import { updatePatientProfileAction } from "./actions";

type SearchParams = Record<string, string | string[] | undefined>;

type PageProps = {
  searchParams?: Promise<SearchParams>;
};

export default async function PatientProfilePage({ searchParams }: PageProps) {
  const [{ supabase, profile }, dashboardData, resolvedSearchParams] = await Promise.all([
    requireAuthProfile("patient"),
    getPatientDashboardData(),
    searchParams ?? Promise.resolve({} as SearchParams),
  ]);
  const patientProfile = await getPatientProfile(supabase, profile.id);
  const wasUpdated = resolvedSearchParams.updated === "1";

  const stats: DashboardShellStat[] = [
    {
      label: "Profile completion",
      value: `${dashboardData.completionScore}%`,
      detail: "Progress across intake and contact essentials.",
      icon: ClipboardCheck,
    },
    {
      label: "Upcoming visits",
      value: String(dashboardData.upcomingAppointmentsCount),
      detail: "Requested or confirmed appointments still ahead of you.",
      icon: CalendarRange,
    },
    {
      label: "Unread updates",
      value: String(dashboardData.unreadNotificationsCount),
      detail: "Notifications that still need your attention.",
      icon: BellRing,
    },
    {
      label: "Shared notes",
      value: String(dashboardData.sharedNotesCount),
      detail: "Records released into your patient portal.",
      icon: HeartHandshake,
    },
  ];

  return (
    <DashboardShell
      currentPath="/patient/profile"
      pageLabel="Profile"
      userName={dashboardData.user.fullName}
      userEmail={dashboardData.user.email}
      roleLabel="Patient workspace"
      title="Patient profile"
      description="Keep intake details, phone contact, and emergency contact data current so appointment and follow-up workflows stay reliable."
      summaryTitle={wasUpdated ? "Profile updated" : `${dashboardData.completionScore}% profile readiness`}
      summaryDescription={wasUpdated ? "Your intake and contact information were saved successfully." : "Complete the remaining intake fields so scheduling and care workflows have the details they need."}
      summaryItems={[
        patientProfile.phone ? `Primary phone: ${patientProfile.phone}` : "Primary phone still missing",
        patientProfile.emergencyContactName ? `Emergency contact: ${patientProfile.emergencyContactName}` : "Emergency contact not added yet",
        patientProfile.dateOfBirth ? `Date of birth on file: ${patientProfile.dateOfBirth}` : "Date of birth not saved yet",
      ]}
      stats={stats}
      navItems={getPatientNavItems(
        dashboardData.upcomingAppointmentsCount,
        dashboardData.sharedNotesCount,
        dashboardData.unreadNotificationsCount,
        dashboardData.completionScore
      )}
      actions={
        <>
          <Button href="/patient/appointments">Open appointments</Button>
          <Button href="/patient/notifications" variant="secondary">Review notifications</Button>
        </>
      }
    >
      <DashboardPanel
        title="Profile and intake details"
        description="These details stay scoped to your authenticated patient account and drive the profile completion score on the dashboard."
        action={wasUpdated ? <StatusBadge tone="success">Saved</StatusBadge> : <StatusBadge tone="accent">Patient intake</StatusBadge>}
      >
        <form action={updatePatientProfileAction} className="grid gap-5 lg:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-[#1F1A14]">Full name</label>
            <input name="full_name" defaultValue={patientProfile.fullName} className="mt-2 w-full rounded-2xl border border-[#1F1A14]/10 bg-[#F8F4EC] px-4 py-3 text-sm" required />
          </div>
          <div>
            <label className="text-sm font-medium text-[#1F1A14]">Email</label>
            <input value={patientProfile.email} className="mt-2 w-full rounded-2xl border border-[#1F1A14]/10 bg-white/70 px-4 py-3 text-sm text-[#1F1A14]/55" disabled />
          </div>
          <div>
            <label className="text-sm font-medium text-[#1F1A14]">Phone</label>
            <input name="phone" defaultValue={patientProfile.phone} className="mt-2 w-full rounded-2xl border border-[#1F1A14]/10 bg-[#F8F4EC] px-4 py-3 text-sm" required />
          </div>
          <div>
            <label className="text-sm font-medium text-[#1F1A14]">Date of birth</label>
            <input type="date" name="date_of_birth" defaultValue={patientProfile.dateOfBirth} className="mt-2 w-full rounded-2xl border border-[#1F1A14]/10 bg-[#F8F4EC] px-4 py-3 text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium text-[#1F1A14]">Gender</label>
            <input name="gender" defaultValue={patientProfile.gender} className="mt-2 w-full rounded-2xl border border-[#1F1A14]/10 bg-[#F8F4EC] px-4 py-3 text-sm" placeholder="For example: Female, Male, Non-binary" />
          </div>
          <div>
            <label className="text-sm font-medium text-[#1F1A14]">Address</label>
            <input name="address" defaultValue={patientProfile.address} className="mt-2 w-full rounded-2xl border border-[#1F1A14]/10 bg-[#F8F4EC] px-4 py-3 text-sm" placeholder="Street, city, state" />
          </div>
          <div>
            <label className="text-sm font-medium text-[#1F1A14]">Emergency contact name</label>
            <input name="emergency_contact_name" defaultValue={patientProfile.emergencyContactName} className="mt-2 w-full rounded-2xl border border-[#1F1A14]/10 bg-[#F8F4EC] px-4 py-3 text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium text-[#1F1A14]">Emergency contact phone</label>
            <input name="emergency_contact_phone" defaultValue={patientProfile.emergencyContactPhone} className="mt-2 w-full rounded-2xl border border-[#1F1A14]/10 bg-[#F8F4EC] px-4 py-3 text-sm" />
          </div>
          <div className="lg:col-span-2">
            <label className="text-sm font-medium text-[#1F1A14]">Emergency contact relation</label>
            <input name="emergency_contact_relation" defaultValue={patientProfile.emergencyContactRelation} className="mt-2 w-full rounded-2xl border border-[#1F1A14]/10 bg-[#F8F4EC] px-4 py-3 text-sm" placeholder="Parent, spouse, sibling, friend" />
          </div>
          <div className="lg:col-span-2 flex flex-wrap gap-3">
            <Button type="submit">Save profile</Button>
            <Button href="/patient/dashboard" variant="secondary">Back to dashboard</Button>
          </div>
        </form>
      </DashboardPanel>
    </DashboardShell>
  );
}

