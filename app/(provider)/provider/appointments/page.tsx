import { CalendarClock, ClipboardList, NotebookPen, Stethoscope } from "lucide-react";
import { Button } from "@/components/common/button";
import { StatusBadge } from "@/components/common/status-badge";
import { startConsultationAction } from "@/app/consultations/[appointmentId]/actions";
import {
  getAppointmentStatusLabel,
  getAppointmentStatusTone,
} from "@/lib/constants/appointments";
import {
  DashboardShell,
  type DashboardShellStat,
} from "@/components/features/dashboard/dashboard-shell";
import { DashboardPanel } from "@/components/features/dashboard/dashboard-panel";
import { getProviderNavItems } from "@/lib/dashboard/navigation";
import { getProviderAppointments } from "@/lib/services/appointments/get-provider-appointments";
import { getProviderDashboardData } from "@/lib/services/dashboards/get-provider-dashboard-data";
import { createServerSupabaseClient } from "@/lib/supabase/server/client";
import {
  formatDateTimeLabel,
  formatTimeRangeLabel,
} from "@/lib/utils/date-time";
import type { AppointmentStatus } from "@/types/domain/appointments";
import type { ConsultationStatus } from "@/types/domain/consultations";
import { updateAppointmentStatusAction } from "./actions";

function getConsultationTone(status: ConsultationStatus | null) {
  if (status === "in_progress") return "success" as const;
  if (status === "completed") return "accent" as const;
  if (status === "scheduled") return "warning" as const;
  if (status === "cancelled") return "critical" as const;
  return "neutral" as const;
}

function getConsultationLabel(status: ConsultationStatus | null) {
  if (!status) return "Not started";
  if (status === "in_progress") return "In progress";
  if (status === "completed") return "Completed";
  if (status === "cancelled") return "Cancelled";
  return "Scheduled";
}

function getProviderAppointmentSummary(
  status: AppointmentStatus,
  consultationStatus: ConsultationStatus | null
) {
  if (status === "requested") {
    return "Review the request, then confirm it before opening the consultation room.";
  }

  if (status === "cancelled") {
    return "This appointment was cancelled. The patient will see the updated status immediately.";
  }

  if (status === "completed") {
    return "This visit is complete. You can still revisit the room and finish documentation.";
  }

  if (consultationStatus === "in_progress") {
    return "The consultation is live. Re-enter the room or complete the visit when you are done.";
  }

  if (consultationStatus === "completed") {
    return "The consultation has ended. Mark the appointment complete if the visit is finished.";
  }

  return "This appointment is confirmed and ready for consultation when the patient is ready.";
}

function CancelAppointmentButton({ appointmentId }: { appointmentId: string }) {
  return (
    <form action={updateAppointmentStatusAction}>
      <input type="hidden" name="appointment_id" value={appointmentId} />
      <input type="hidden" name="next_status" value="cancelled" />
      <Button
        type="submit"
        variant="secondary"
        className="border-rose-700 text-rose-700 hover:bg-rose-700/5 active:bg-rose-700/10"
      >
        Cancel
      </Button>
    </form>
  );
}

export default async function ProviderAppointmentsPage() {
  const dashboardData = await getProviderDashboardData();
  const supabase = await createServerSupabaseClient();
  const appointments = await getProviderAppointments(supabase, dashboardData.user.id);

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
      currentPath="/provider/appointments"
      pageLabel="Appointments"
      userName={dashboardData.user.fullName}
      userEmail={dashboardData.user.email}
      roleLabel="Provider workspace"
      title="Appointment queue"
      description="Confirm new requests, start consultation rooms for approved visits, and complete visits once care is delivered."
      summaryTitle={appointments[0] ? `Next visit: ${appointments[0].patient_name}` : "Queue is clear"}
      summaryDescription={
        appointments[0]
          ? `${formatDateTimeLabel(appointments[0].start_at)} - ${appointments[0].reason ?? "General consultation"}`
          : "New requests and confirmed visits will appear here as they move through your provider workflow."
      }
      summaryItems={[
        `${appointments.length} appointments loaded`,
        `${dashboardData.todayAppointmentsCount} scheduled today`,
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
          <Button href="/provider/availability">Manage availability</Button>
          <Button href="/provider/profile" variant="secondary">
            Update profile
          </Button>
        </>
      }
    >
      <DashboardPanel
        title="Appointment workflow"
        description="Confirm incoming requests, cancel exceptions, and close visits cleanly once the consultation is done."
        action={<StatusBadge tone="accent">Provider workflow</StatusBadge>}
      >
        <div className="space-y-4">
          {appointments.length === 0 ? (
            <div className="rounded-[22px] border border-dashed border-[#1F1A14]/14 bg-[#F8F4EC] p-6 text-sm text-[#1F1A14]/62">
              No appointments yet.
            </div>
          ) : (
            appointments.map((appointment) => {
              const canConfirm = appointment.status === "requested";
              const canCancel =
                appointment.status === "requested" || appointment.status === "confirmed";
              const canComplete = appointment.status === "confirmed";
              const canStartConsultation =
                appointment.status === "confirmed" &&
                (!appointment.consultation_status || appointment.consultation_status === "scheduled");
              const canViewRoom =
                appointment.consultation_status === "in_progress" ||
                appointment.consultation_status === "completed";
              const canDocumentNote =
                appointment.consultation_status === "in_progress" ||
                appointment.consultation_status === "completed";

              return (
                <article
                  key={appointment.id}
                  className="rounded-[24px] border border-[#1F1A14]/10 bg-[#F8F4EC] p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-lg font-semibold text-[#1F1A14]">
                          {appointment.patient_name}
                        </p>
                        <StatusBadge tone={getAppointmentStatusTone(appointment.status)}>
                          {getAppointmentStatusLabel(appointment.status)}
                        </StatusBadge>
                        <StatusBadge tone={getConsultationTone(appointment.consultation_status)}>
                          {getConsultationLabel(appointment.consultation_status)}
                        </StatusBadge>
                      </div>
                      <p className="text-sm text-[#1F1A14]/72">
                        {appointment.reason ?? "General consultation"}
                      </p>
                      <p className="text-sm text-[#1F1A14]/68">
                        {formatDateTimeLabel(appointment.start_at)}
                      </p>
                      <p className="text-sm text-[#1F1A14]/68">
                        {formatTimeRangeLabel(appointment.start_at, appointment.end_at)}
                      </p>
                      <p className="max-w-2xl text-sm leading-6 text-[#1F1A14]/64">
                        {getProviderAppointmentSummary(
                          appointment.status,
                          appointment.consultation_status
                        )}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {canConfirm ? (
                        <form action={updateAppointmentStatusAction}>
                          <input type="hidden" name="appointment_id" value={appointment.id} />
                          <input type="hidden" name="next_status" value="confirmed" />
                          <Button type="submit">Confirm</Button>
                        </form>
                      ) : null}

                      {canStartConsultation ? (
                        <form action={startConsultationAction}>
                          <input type="hidden" name="appointment_id" value={appointment.id} />
                          <Button type="submit">Start consultation</Button>
                        </form>
                      ) : null}

                      {canViewRoom ? (
                        <Button href={`/consultations/${appointment.id}`} variant="secondary">
                          {appointment.consultation_status === "completed"
                            ? "View room"
                            : "Re-enter room"}
                        </Button>
                      ) : null}

                      {canDocumentNote ? (
                        <Button href={`/provider/notes/${appointment.id}`} variant="secondary">
                          Document note
                        </Button>
                      ) : null}

                      {canComplete ? (
                        <form action={updateAppointmentStatusAction}>
                          <input type="hidden" name="appointment_id" value={appointment.id} />
                          <input type="hidden" name="next_status" value="completed" />
                          <Button type="submit" variant="secondary">
                            Complete
                          </Button>
                        </form>
                      ) : null}

                      {canCancel ? <CancelAppointmentButton appointmentId={appointment.id} /> : null}
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </DashboardPanel>
    </DashboardShell>
  );
}
