import { Button } from "@/components/common/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/common/card";
import { EmptyState } from "@/components/common/empty-state";
import { StatusBadge } from "@/components/common/status-badge";
import { requireAuthProfile } from "@/lib/auth/require-auth-profile";
import { getSharedSoapNotes } from "@/lib/services/notes/get-shared-soap-notes";
import {
  formatDateLabel,
  formatTimeRangeLabel,
} from "@/lib/utils/date-time";

export default async function PatientRecordsPage() {
  const { supabase, profile } = await requireAuthProfile("patient");
  const notes = await getSharedSoapNotes(supabase, profile.id);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#FAF3E1] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="absolute inset-x-0 top-0 h-[260px] bg-[radial-gradient(circle_at_top_left,_rgba(250,129,18,0.18),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(34,34,34,0.08),_transparent_24%)]" />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6">
        <Card className="rounded-[32px] border-[#222222]/10 bg-[#F5E7C6]/92 shadow-[0_25px_80px_rgba(34,34,34,0.07)]">
          <CardHeader className="space-y-4 px-6 py-6 lg:px-8 lg:py-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-3">
                <StatusBadge tone="accent">Patient records</StatusBadge>
                <CardTitle className="text-3xl tracking-[-0.03em] sm:text-4xl">
                  Shared SOAP notes
                </CardTitle>
                <CardDescription className="max-w-3xl text-base leading-7">
                  Only notes your provider has explicitly shared with you appear here. This view
                  is read-only and scoped to your own records.
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button href="/patient/appointments" variant="secondary">
                  Back to appointments
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 px-6 pb-6 sm:grid-cols-2 lg:px-8 lg:pb-8">
            <div className="rounded-[22px] border border-[#222222]/10 bg-white/72 p-4">
              <p className="text-sm text-[#222222]/62">Shared records available</p>
              <p className="mt-2 text-3xl font-semibold text-[#222222]">{notes.length}</p>
            </div>
            <div className="rounded-[22px] border border-[#222222]/10 bg-white/72 p-4">
              <p className="text-sm text-[#222222]/62">Access scope</p>
              <p className="mt-2 text-lg font-semibold text-[#222222]">Patient-visible only</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-[#222222]/10 bg-white/60 shadow-[0_18px_40px_rgba(34,34,34,0.05)]">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <CardTitle>Record library</CardTitle>
              <CardDescription>
                Shared visit summaries are organized by visit so you can revisit assessment and
                plan details.
              </CardDescription>
            </div>
            <StatusBadge tone="success">{notes.length} shared</StatusBadge>
          </CardHeader>
          <CardContent className="space-y-4">
            {notes.length > 0 ? (
              notes.map((note) => (
                <article
                  key={note.id}
                  className="rounded-[24px] border border-[#222222]/10 bg-[#F5E7C6]/65 p-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <h2 className="text-xl font-semibold text-[#222222]">{note.providerName}</h2>
                      <p className="text-sm text-[#222222]/68">
                        {formatDateLabel(note.appointmentStartAt)} - {formatTimeRangeLabel(note.appointmentStartAt, note.appointmentEndAt)}
                      </p>
                    </div>
                    <StatusBadge tone="success">Shared</StatusBadge>
                  </div>

                  <div className="mt-5 grid gap-4 text-sm text-[#222222]/74">
                    <div className="rounded-2xl border border-[#222222]/10 bg-white/58 p-4">
                      <p className="font-semibold text-[#222222]">Visit reason</p>
                      <p className="mt-1">{note.appointmentReason ?? "No visit reason captured."}</p>
                    </div>
                    <div className="rounded-2xl border border-[#222222]/10 bg-white/58 p-4">
                      <p className="font-semibold text-[#222222]">Subjective</p>
                      <p className="mt-1 whitespace-pre-wrap">{note.subjective ?? "No subjective summary available."}</p>
                    </div>
                    <div className="rounded-2xl border border-[#222222]/10 bg-white/58 p-4">
                      <p className="font-semibold text-[#222222]">Objective</p>
                      <p className="mt-1 whitespace-pre-wrap">{note.objective ?? "No objective summary available."}</p>
                    </div>
                    <div className="rounded-2xl border border-[#222222]/10 bg-white/58 p-4">
                      <p className="font-semibold text-[#222222]">Assessment</p>
                      <p className="mt-1 whitespace-pre-wrap">{note.assessment ?? "No assessment summary available."}</p>
                    </div>
                    <div className="rounded-2xl border border-[#222222]/10 bg-white/58 p-4">
                      <p className="font-semibold text-[#222222]">Plan</p>
                      <p className="mt-1 whitespace-pre-wrap">{note.plan ?? "No plan summary available."}</p>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <EmptyState
                title="No shared notes yet"
                description="Once your provider shares a completed SOAP note, it will appear here with the visit summary and treatment plan."
                className="bg-[#FAF3E1]/70"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
