import { notFound } from "next/navigation";
import { Button } from "@/components/common/button";
import { StatusBadge } from "@/components/common/status-badge";
import { SoapNoteForm } from "@/components/features/notes/soap-note-editor";
import { requireAuthProfile } from "@/lib/auth/require-auth-profile";
import { getConsultationSession } from "@/lib/services/consultations/get-consultation-session";
import { getSoapNotesByAppointment } from "@/lib/services/notes/get-soap-notes-by-appointment";
import {
  formatDateTimeLabel,
  formatTimeRangeLabel,
} from "@/lib/utils/date-time";
import { saveSoapNoteAction } from "./actions";

export default async function ProviderSoapNotePage({
  params,
}: {
  params: Promise<{ appointmentId: string }>;
}) {
  const { appointmentId } = await params;
  const { supabase, profile } = await requireAuthProfile("provider");
  const [roomData, notes] = await Promise.all([
    getConsultationSession(supabase, appointmentId),
    getSoapNotesByAppointment(supabase, appointmentId),
  ]);

  if (!roomData || roomData.appointment.providerUserId !== profile.id) {
    notFound();
  }

  const latestNote = notes[0] ?? null;
  const consultationStatus = roomData.session?.status ?? "not_started";
  const canDocument = roomData.session && roomData.session.status !== "scheduled" && roomData.session.status !== "cancelled";

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#FAF3E1] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="absolute inset-x-0 top-0 h-[280px] bg-[radial-gradient(circle_at_top_left,_rgba(250,129,18,0.18),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(34,34,34,0.08),_transparent_24%)]" />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="rounded-[32px] border border-[#222222]/10 bg-[#F5E7C6]/92 p-6 shadow-[0_25px_80px_rgba(34,34,34,0.07)] lg:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <StatusBadge tone="accent">Clinical documentation</StatusBadge>
              <h1 className="text-3xl font-semibold tracking-[-0.03em] text-[#222222] sm:text-4xl">
                SOAP note for {roomData.appointment.patientName}
              </h1>
              <p className="max-w-3xl text-base leading-7 text-[#222222]/72">
                Capture the structured note for this consultation. Patient visibility stays controlled by the share toggle in the form.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button href={`/consultations/${appointmentId}`} variant="secondary">
                Back to consultation
              </Button>
              <Button href="/provider/appointments" variant="secondary">
                Back to appointments
              </Button>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[28px] border border-[#222222]/10 bg-white/60 p-6 shadow-[0_18px_40px_rgba(34,34,34,0.05)]">
            {canDocument ? (
              <SoapNoteForm
                appointmentId={appointmentId}
                initialNote={latestNote}
                onSave={saveSoapNoteAction}
              />
            ) : (
              <div className="space-y-4">
                <StatusBadge tone="warning">Consultation required</StatusBadge>
                <p className="text-sm leading-6 text-[#222222]/72">
                  The SOAP note editor becomes available once the consultation has started. Use the consultation room to begin the session first.
                </p>
                <Button href={`/consultations/${appointmentId}`}>Open consultation room</Button>
              </div>
            )}
          </section>

          <div className="space-y-6">
            <section className="rounded-[28px] border border-[#222222]/10 bg-white/60 p-6 shadow-[0_18px_40px_rgba(34,34,34,0.05)]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#222222]/55">
                Appointment context
              </p>
              <div className="mt-4 grid gap-4 text-sm text-[#222222]/72">
                <div className="rounded-2xl border border-[#222222]/10 bg-[#F5E7C6]/65 p-4">
                  <p className="font-semibold text-[#222222]">Consultation status</p>
                  <p className="mt-1">{consultationStatus}</p>
                </div>
                <div className="rounded-2xl border border-[#222222]/10 bg-[#F5E7C6]/65 p-4">
                  <p className="font-semibold text-[#222222]">Visit time</p>
                  <p className="mt-1">{formatDateTimeLabel(roomData.appointment.startAt)}</p>
                  <p className="mt-1">{formatTimeRangeLabel(roomData.appointment.startAt, roomData.appointment.endAt)}</p>
                </div>
                <div className="rounded-2xl border border-[#222222]/10 bg-[#F5E7C6]/65 p-4">
                  <p className="font-semibold text-[#222222]">Reason for visit</p>
                  <p className="mt-1">{roomData.appointment.reason ?? "No reason captured for this appointment."}</p>
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-[#222222]/10 bg-white/60 p-6 shadow-[0_18px_40px_rgba(34,34,34,0.05)]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#222222]/55">
                Current note state
              </p>
              <div className="mt-4 space-y-3 text-sm text-[#222222]/72">
                {latestNote ? (
                  <>
                    <div className="rounded-2xl border border-[#222222]/10 bg-[#F5E7C6]/65 p-4">
                      <p className="font-semibold text-[#222222]">Last updated</p>
                      <p className="mt-1">{formatDateTimeLabel(latestNote.updatedAt)}</p>
                    </div>
                    <div className="rounded-2xl border border-[#222222]/10 bg-[#F5E7C6]/65 p-4">
                      <p className="font-semibold text-[#222222]">Patient visibility</p>
                      <p className="mt-1">{latestNote.isSharedWithPatient ? "Shared with patient" : "Provider only"}</p>
                    </div>
                  </>
                ) : (
                  <div className="rounded-2xl border border-dashed border-[#222222]/14 bg-[#FAF3E1]/70 p-4">
                    <p className="font-semibold text-[#222222]">No note saved yet</p>
                    <p className="mt-1">Once saved, the latest documentation state will appear here for quick review.</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
