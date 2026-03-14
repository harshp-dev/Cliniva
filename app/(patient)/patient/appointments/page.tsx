import { Button } from "@/components/common/button";
import { StatusBadge } from "@/components/common/status-badge";
import {
  getAppointmentStatusLabel,
  getAppointmentStatusTone,
} from "@/lib/constants/appointments";
import { createServerSupabaseClient } from "@/lib/supabase/server/client";
import { getPatientAppointments } from "@/lib/services/appointments/get-patient-appointments";
import { getProviders } from "@/lib/services/profiles/get-providers";
import {
  formatDateTimeLabel,
  formatTimeRangeLabel,
} from "@/lib/utils/date-time";
import type { AppointmentStatus } from "@/types/domain/appointments";
import type { ConsultationStatus } from "@/types/domain/consultations";
import { createAppointmentAction } from "./actions";

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

function getPatientAppointmentSummary(
  status: AppointmentStatus,
  consultationStatus: ConsultationStatus | null
) {
  if (status === "requested") {
    return "Your provider still needs to confirm this request before the consultation room opens.";
  }

  if (status === "cancelled") {
    return "This appointment has been cancelled. Book a new visit if you still need care.";
  }

  if (status === "completed") {
    return "This visit is complete. Shared clinical notes will appear in your records once released.";
  }

  if (consultationStatus === "in_progress") {
    return "Your provider has started the consultation. You can join from this card now.";
  }

  return "Your appointment is confirmed. Join the room from this card when the provider is ready.";
}

export default async function PatientAppointmentsPage() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return null;
  }

  const [appointments, providers] = await Promise.all([
    getPatientAppointments(supabase, data.user.id),
    getProviders(supabase),
  ]);

  return (
    <div className="min-h-screen bg-[#FAF3E1] px-6 py-12">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
        <section className="rounded-[28px] border border-[#222222]/10 bg-[#F5E7C6] p-8 shadow-[0_18px_40px_rgba(34,34,34,0.05)]">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-[#222222]">Book an appointment</h1>
              <p className="mt-2 text-sm text-[#222222]/70">
                Choose a provider, date, and time. We will request the appointment on your behalf.
              </p>
            </div>
            <Button href="/patient/dashboard" variant="secondary">
              Back to dashboard
            </Button>
          </div>

          <form action={createAppointmentAction} className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-[#222222]">Provider</label>
              <select
                name="provider_user_id"
                className="mt-2 w-full rounded-lg border border-[#222222]/15 bg-white px-3 py-2 text-sm"
                required
              >
                <option value="">Select a provider</option>
                {providers.map((provider) => (
                  <option value={provider.id} key={provider.id}>
                    {provider.full_name ?? provider.email}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-[#222222]">Date</label>
              <input
                type="date"
                name="date"
                className="mt-2 w-full rounded-lg border border-[#222222]/15 bg-white px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#222222]">Time</label>
              <input
                type="time"
                name="time"
                className="mt-2 w-full rounded-lg border border-[#222222]/15 bg-white px-3 py-2 text-sm"
                required
              />
            </div>
            <div className="md:col-span-4">
              <label className="text-sm font-medium text-[#222222]">Reason (optional)</label>
              <input
                type="text"
                name="reason"
                className="mt-2 w-full rounded-lg border border-[#222222]/15 bg-white px-3 py-2 text-sm"
                placeholder="Brief reason for your visit"
              />
            </div>
            <div className="md:col-span-4">
              <Button type="submit">Request appointment</Button>
            </div>
          </form>
        </section>

        <section className="rounded-[28px] border border-[#222222]/10 bg-[#F5E7C6] p-8 shadow-[0_18px_40px_rgba(34,34,34,0.05)]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-[#222222]">Your appointments</h2>
              <p className="mt-2 text-sm text-[#222222]/70">
                Track provider confirmation and join the consultation room when your visit is ready.
              </p>
            </div>
            <StatusBadge tone="accent">Patient portal</StatusBadge>
          </div>

          <div className="mt-6 grid gap-4">
            {appointments.length === 0 ? (
              <p className="text-sm text-[#222222]/60">No appointments yet.</p>
            ) : (
              appointments.map((appointment) => {
                const canOpenRoom =
                  appointment.status !== "cancelled" &&
                  (appointment.status === "confirmed" ||
                    appointment.consultation_status === "in_progress" ||
                    appointment.consultation_status === "completed");

                return (
                  <article
                    key={appointment.id}
                    className="rounded-2xl border border-[#222222]/10 bg-white px-4 py-4"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-lg font-semibold text-[#222222]">
                            {appointment.provider_name}
                          </p>
                          <StatusBadge tone={getAppointmentStatusTone(appointment.status)}>
                            {getAppointmentStatusLabel(appointment.status)}
                          </StatusBadge>
                          <StatusBadge tone={getConsultationTone(appointment.consultation_status)}>
                            {getConsultationLabel(appointment.consultation_status)}
                          </StatusBadge>
                        </div>
                        <p className="text-sm text-[#222222]/72">
                          {appointment.reason ?? "General consultation"}
                        </p>
                        <p className="text-sm text-[#222222]/68">
                          {formatDateTimeLabel(appointment.start_at)}
                        </p>
                        <p className="text-sm text-[#222222]/68">
                          {formatTimeRangeLabel(appointment.start_at, appointment.end_at)}
                        </p>
                        <p className="max-w-2xl text-sm leading-6 text-[#222222]/64">
                          {getPatientAppointmentSummary(
                            appointment.status,
                            appointment.consultation_status
                          )}
                        </p>
                      </div>
                      {appointment.status === "requested" ? (
                        <Button variant="secondary" disabled>
                          Awaiting confirmation
                        </Button>
                      ) : canOpenRoom ? (
                        <Button href={`/consultations/${appointment.id}`} variant="secondary">
                          {appointment.consultation_status === "completed" ||
                          appointment.status === "completed"
                            ? "Open room"
                            : "Join consultation"}
                        </Button>
                      ) : null}
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

