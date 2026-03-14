import { Clock3, PlayCircle, Video, VideoOff } from "lucide-react";
import { StatusBadge } from "@/components/common/status-badge";
import { formatDateTimeLabel } from "@/lib/utils/date-time";
import type { ConsultationStatus } from "@/types/domain/consultations";

type ConsultationStatusPanelProps = {
  status: ConsultationStatus | "not_started";
  roomId: string | null;
  startedAt: string | null;
  endedAt: string | null;
};

function getStatusTone(status: ConsultationStatus | "not_started") {
  if (status === "in_progress") return "success" as const;
  if (status === "completed") return "accent" as const;
  if (status === "cancelled") return "critical" as const;
  if (status === "scheduled") return "warning" as const;
  return "neutral" as const;
}

function getStatusLabel(status: ConsultationStatus | "not_started") {
  if (status === "not_started") return "Not started";
  if (status === "in_progress") return "In progress";
  if (status === "completed") return "Completed";
  if (status === "cancelled") return "Cancelled";
  return "Scheduled";
}

function getStatusIcon(status: ConsultationStatus | "not_started") {
  if (status === "in_progress") return <PlayCircle className="h-5 w-5" />;
  if (status === "completed") return <Video className="h-5 w-5" />;
  if (status === "cancelled") return <VideoOff className="h-5 w-5" />;
  return <Clock3 className="h-5 w-5" />;
}

export function ConsultationStatusPanel({
  status,
  roomId,
  startedAt,
  endedAt,
}: ConsultationStatusPanelProps) {
  return (
    <div className="rounded-[28px] border border-[#222222]/10 bg-white/60 p-5 shadow-[0_18px_40px_rgba(34,34,34,0.05)]">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#222222]/55">
            Consultation state
          </p>
          <div className="flex items-center gap-3 text-[#FA8112]">
            <div className="rounded-2xl bg-[#FA8112]/12 p-3">{getStatusIcon(status)}</div>
            <div>
              <p className="text-xl font-semibold text-[#222222]">{getStatusLabel(status)}</p>
              <p className="text-sm text-[#222222]/68">
                {roomId ? `Room ID: ${roomId}` : "A room is created once the provider starts the consult."}
              </p>
            </div>
          </div>
        </div>
        <StatusBadge tone={getStatusTone(status)}>{getStatusLabel(status)}</StatusBadge>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-[#222222]/10 bg-[#F5E7C6]/65 p-4 text-sm text-[#222222]/72">
          <p className="font-semibold text-[#222222]">Started</p>
          <p className="mt-1">{startedAt ? formatDateTimeLabel(startedAt) : "Not started yet"}</p>
        </div>
        <div className="rounded-2xl border border-[#222222]/10 bg-[#F5E7C6]/65 p-4 text-sm text-[#222222]/72">
          <p className="font-semibold text-[#222222]">Ended</p>
          <p className="mt-1">{endedAt ? formatDateTimeLabel(endedAt) : "Session still open"}</p>
        </div>
      </div>
    </div>
  );
}
