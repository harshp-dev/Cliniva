import { notFound } from "next/navigation";
import { Button } from "@/components/common/button";
import { StatusBadge } from "@/components/common/status-badge";
import { ConsultationStatusPanel } from "@/components/features/consultations/consultation-status-panel";
import { requireAuthProfile } from "@/lib/auth/require-auth-profile";
import { getConsultationSession } from "@/lib/services/consultations/get-consultation-session";
import { getSoapNotesByAppointment } from "@/lib/services/notes/get-soap-notes-by-appointment";
import {
  formatDateTimeLabel,
  formatTimeRangeLabel,
} from "@/lib/utils/date-time";
import {
  completeConsultationAction,
  startConsultationAction,
} from "./actions";

export default async function ConsultationRoomPage({
  params,
}: {
  params: Promise<{ appointmentId: string }>;
}) {
  const { appointmentId } = await params;
  const { supabase, profile } = await requireAuthProfile();
  const [roomData, notes] = await Promise.all([
    getConsultationSession(supabase, appointmentId),
    getSoapNotesByAppointment(supabase, appointmentId),
  ]);

  if (!roomData) {
    notFound();
  }

  const isPatientViewer = roomData.appointment.patientUserId === profile.id;
  const isProviderViewer = roomData.appointment.providerUserId === profile.id;
  const isAdminViewer = profile.role === "admin";

  if (!isPatientViewer && !isProviderViewer && !isAdminViewer) {
    notFound();
  }

  const consultationState = roomData.session?.status ?? "not_started";
  const canStartSession =
    isProviderViewer &&
    roomData.appointment.status === "confirmed" &&
    (!roomData.session || roomData.session.status === "scheduled");
  const canCompleteSession =
    isProviderViewer &&
    roomData.appointment.status === "confirmed" &&
    roomData.session?.status === "in_progress";
  const sharedNote = notes[0] ?? null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#FAF3E1] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="absolute inset-x-0 top-0 h-[280px] bg-[radial-gradient(circle_at_top_left,_rgba(250,129,18,0.18),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(34,34,34,0.08),_transparent_24%)]" />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="rounded-[32px] border border-[#222222]/10 bg-[#F5E7C6]/92 p-6 shadow-[0_25px_80px_rgba(34,34,34,0.07)] lg:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <StatusBadge tone="accent">Consultation room</StatusBadge>
              <h1 className="text-3xl font-semibold tracking-[-0.03em] text-[#222222] sm:text-4xl">
                {roomData.appointment.patientName} with {roomData.appointment.providerName}
              </h1>
              <p className="max-w-3xl text-base leading-7 text-[#222222]/72">
                This is the stubbed consultation room for MVP. Video, mic controls, and Daily
                integration plug into this surface later without changing the appointment-linked
                workflow.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {canStartSession ? (
                <form action={startConsultationAction}>
                  <input type="hidden" name="appointment_id" value={roomData.appointment.id} />
                  <Button type="submit">Start consultation</Button>
                </form>
              ) : null}
              {canCompleteSession ? (
                <form action={completeConsultationAction}>
                  <input type="hidden" name="appointment_id" value={roomData.appointment.id} />
                  <Button type="submit" variant="secondary">
                    Complete session
                  </Button>
                </form>
              ) : null}
              {isProviderViewer && roomData.session ? (
                <Button href={`/provider/notes/${appointmentId}`} variant="secondary">
                  Document SOAP note
                </Button>
              ) : null}
              {isPatientViewer && sharedNote ? (
                <Button href="/patient/records" variant="secondary">
                  Open shared records
                </Button>
              ) : null}
              <Button
                href={
                  isProviderViewer
                    ? "/provider/appointments"
                    : profile.role === "patient"
                      ? "/patient/appointments"
                      : "/admin/dashboard"
                }
                variant="secondary"
              >
                Back
              </Button>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-[28px] border border-[#222222]/10 bg-white/60 p-6 shadow-[0_18px_40px_rgba(34,34,34,0.05)]">
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#222222]/55">
                  Appointment details
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-[#222222]/10 bg-[#F5E7C6]/65 p-4 text-sm text-[#222222]/72">
                    <p className="font-semibold text-[#222222]">Scheduled start</p>
                    <p className="mt-1">{formatDateTimeLabel(roomData.appointment.startAt)}</p>
                  </div>
                  <div className="rounded-2xl border border-[#222222]/10 bg-[#F5E7C6]/65 p-4 text-sm text-[#222222]/72">
                    <p className="font-semibold text-[#222222]">Visit window</p>
                    <p className="mt-1">
                      {formatTimeRangeLabel(
                        roomData.appointment.startAt,
                        roomData.appointment.endAt
                      )}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[#222222]/10 bg-[#F5E7C6]/65 p-4 text-sm text-[#222222]/72 sm:col-span-2">
                    <p className="font-semibold text-[#222222]">Appointment status</p>
                    <p className="mt-1">{roomData.appointment.status}</p>
                  </div>
                  <div className="rounded-2xl border border-[#222222]/10 bg-[#F5E7C6]/65 p-4 text-sm text-[#222222]/72 sm:col-span-2">
                    <p className="font-semibold text-[#222222]">Reason for visit</p>
                    <p className="mt-1">
                      {roomData.appointment.reason ?? "No reason captured for this appointment."}
                    </p>
                  </div>
                </div>
              </div>

              {sharedNote ? (
                <div className="rounded-[24px] border border-[#222222]/10 bg-[#F5E7C6]/72 p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#222222]/55">
                        Shared SOAP summary
                      </p>
                      <p className="mt-2 text-lg font-semibold text-[#222222]">
                        Patient-visible clinical summary
                      </p>
                    </div>
                    <StatusBadge tone="success">Shared</StatusBadge>
                  </div>
                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    <div className="rounded-2xl border border-[#222222]/10 bg-white/70 p-4 text-sm text-[#222222]/74">
                      <p className="font-semibold text-[#222222]">Assessment</p>
                      <p className="mt-2 whitespace-pre-wrap">{sharedNote.assessment ?? "No assessment summary provided."}</p>
                    </div>
                    <div className="rounded-2xl border border-[#222222]/10 bg-white/70 p-4 text-sm text-[#222222]/74">
                      <p className="font-semibold text-[#222222]">Plan</p>
                      <p className="mt-2 whitespace-pre-wrap">{sharedNote.plan ?? "No care plan provided."}</p>
                    </div>
                  </div>
                </div>
              ) : isPatientViewer ? (
                <div className="rounded-[24px] border border-dashed border-[#222222]/14 bg-[#FAF3E1]/70 p-6 text-sm text-[#222222]/68">
                  The provider has not shared a SOAP note for this appointment yet. Once shared, the assessment and plan will appear here and in your records.
                </div>
              ) : null}

              <div className="rounded-[24px] border border-dashed border-[#222222]/14 bg-[#FAF3E1]/70 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#222222]/55">
                  Video surface placeholder
                </p>
                <div className="mt-4 flex min-h-[260px] items-center justify-center rounded-[24px] border border-[#222222]/10 bg-[linear-gradient(135deg,rgba(245,231,198,0.96),rgba(255,255,255,0.82))] p-6 text-center">
                  <div className="max-w-md space-y-3">
                    <p className="text-2xl font-semibold text-[#222222]">Consultation workspace</p>
                    <p className="text-sm leading-6 text-[#222222]/68">
                      {consultationState === "not_started"
                        ? "The provider has not started the session yet. Once started, this room becomes the join surface for both participants."
                        : consultationState === "in_progress"
                          ? "The consultation is currently active. Replace this area with the Daily video canvas in the next phase."
                          : "This session is no longer active. The room remains available for review of timing and appointment context."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="space-y-6">
            <ConsultationStatusPanel
              status={consultationState}
              roomId={roomData.session?.roomId ?? null}
              startedAt={roomData.session?.startedAt ?? null}
              endedAt={roomData.session?.endedAt ?? null}
            />

            <section className="rounded-[28px] border border-[#222222]/10 bg-white/60 p-6 shadow-[0_18px_40px_rgba(34,34,34,0.05)]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#222222]/55">
                Access model
              </p>
              <div className="mt-4 space-y-3 text-sm text-[#222222]/72">
                <div className="rounded-2xl border border-[#222222]/10 bg-[#F5E7C6]/65 p-4">
                  <p className="font-semibold text-[#222222]">Viewer</p>
                  <p className="mt-1">
                    {isProviderViewer
                      ? "Provider managing the consultation"
                      : isPatientViewer
                        ? "Patient joining the consultation"
                        : "Admin oversight access"}
                  </p>
                </div>
                <div className="rounded-2xl border border-[#222222]/10 bg-[#F5E7C6]/65 p-4">
                  <p className="font-semibold text-[#222222]">Workflow note</p>
                  <p className="mt-1">
                    Provider start creates the consultation session record if it does not exist.
                    Patient join uses the same appointment-linked room path.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
