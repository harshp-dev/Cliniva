import { CalendarClock, ClipboardList, NotebookPen, Stethoscope } from "lucide-react";
import { Button } from "@/components/common/button";
import { StatusBadge } from "@/components/common/status-badge";
import {
  DashboardShell,
  type DashboardShellStat,
} from "@/components/features/dashboard/dashboard-shell";
import { DashboardPanel } from "@/components/features/dashboard/dashboard-panel";
import { getProviderNavItems } from "@/lib/dashboard/navigation";
import { getProviderAvailability } from "@/lib/services/appointments/get-provider-availability";
import { getProviderDashboardData } from "@/lib/services/dashboards/get-provider-dashboard-data";
import { createServerSupabaseClient } from "@/lib/supabase/server/client";
import { formatClockLabel, formatWeekdayLabel } from "@/lib/utils/date-time";
import { createAvailabilityAction, deleteAvailabilityAction } from "../appointments/actions";

const dayLabels = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default async function ProviderAvailabilityPage() {
  const dashboardData = await getProviderDashboardData();
  const supabase = await createServerSupabaseClient();
  const availability = await getProviderAvailability(supabase, dashboardData.user.id);

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
      label: "Availability blocks",
      value: String(dashboardData.availabilityBlocksCount),
      detail: "Published schedule windows currently configured for booking.",
      icon: Stethoscope,
    },
  ];

  return (
    <DashboardShell
      currentPath="/provider/availability"
      pageLabel="Availability"
      userName={dashboardData.user.fullName}
      userEmail={dashboardData.user.email}
      roleLabel="Provider workspace"
      title="Availability management"
      description="Set the windows patients can book, keep your schedule current, and make booking capacity visible to the system."
      summaryTitle={availability.length > 0 ? `${availability.length} published schedule blocks` : "No availability configured yet"}
      summaryDescription="Times are stored in the timezone you choose and used to shape booking access for patients."
      summaryItems={[
        `${dashboardData.activeQueueCount} active appointments in queue`,
        `${dashboardData.todayAppointmentsCount} appointments scheduled today`,
        `${dashboardData.unreadNotificationsCount} unread provider notices`,
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
          <Button href="/provider/appointments">Open appointments</Button>
          <Button href="/provider/profile" variant="secondary">Update profile</Button>
        </>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <DashboardPanel
          title="Publish new availability"
          description="Create recurring weekly windows patients can book against."
          action={<StatusBadge tone="warning">Schedule control</StatusBadge>}
        >
          <form action={createAvailabilityAction} className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-[#1F1A14]">Day of week</label>
              <select name="day_of_week" className="mt-2 w-full rounded-2xl border border-[#1F1A14]/10 bg-[#F8F4EC] px-4 py-3 text-sm" defaultValue="1">
                {dayLabels.map((label, index) => (
                  <option value={index} key={label}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-[#1F1A14]">Start</label>
              <input type="time" name="start_time" className="mt-2 w-full rounded-2xl border border-[#1F1A14]/10 bg-[#F8F4EC] px-4 py-3 text-sm" required />
            </div>
            <div>
              <label className="text-sm font-medium text-[#1F1A14]">End</label>
              <input type="time" name="end_time" className="mt-2 w-full rounded-2xl border border-[#1F1A14]/10 bg-[#F8F4EC] px-4 py-3 text-sm" required />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-[#1F1A14]">Timezone</label>
              <input type="text" name="timezone" className="mt-2 w-full rounded-2xl border border-[#1F1A14]/10 bg-[#F8F4EC] px-4 py-3 text-sm" defaultValue="UTC" required />
            </div>
            <div className="md:col-span-2">
              <Button type="submit">Add availability</Button>
            </div>
          </form>
        </DashboardPanel>

        <DashboardPanel
          title="Published schedule windows"
          description="Remove or review the current recurring blocks that shape booking capacity."
          action={<StatusBadge tone="accent">Live schedule</StatusBadge>}
        >
          <div className="space-y-3">
            {availability.length === 0 ? (
              <div className="rounded-[22px] border border-dashed border-[#1F1A14]/14 bg-[#F8F4EC] p-6 text-sm text-[#1F1A14]/62">No availability set yet.</div>
            ) : (
              availability.map((slot) => (
                <article key={slot.id} className="flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-[#1F1A14]/10 bg-[#F8F4EC] p-4">
                  <div>
                    <p className="text-sm font-semibold text-[#1F1A14]">{formatWeekdayLabel(slot.day_of_week)}</p>
                    <p className="text-xs text-[#1F1A14]/60">{formatClockLabel(slot.start_time)} - {formatClockLabel(slot.end_time)} ({slot.timezone})</p>
                  </div>
                  <form action={deleteAvailabilityAction}>
                    <input type="hidden" name="availability_id" value={slot.id} />
                    <Button type="submit" variant="secondary">Remove</Button>
                  </form>
                </article>
              ))
            )}
          </div>
        </DashboardPanel>
      </div>
    </DashboardShell>
  );
}
