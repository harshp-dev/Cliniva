import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";

type DashboardStatCardProps = {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
};

export function DashboardStatCard({
  label,
  value,
  detail,
  icon: Icon,
}: DashboardStatCardProps) {
  return (
    <div className="group overflow-hidden rounded-[28px] border border-[#1F1A14]/10 bg-white/82 p-5 shadow-[0_18px_50px_rgba(31,26,20,0.06)] transition-transform duration-200 hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1F1A14]/46">
            {label}
          </p>
          <p className="text-3xl font-semibold tracking-[-0.04em] text-[#1F1A14] sm:text-[2.25rem]">
            {value}
          </p>
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-[linear-gradient(135deg,#FA8112,#F6B35E)] text-[#1F1A14] shadow-[0_14px_30px_rgba(250,129,18,0.28)]">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-5 flex items-end justify-between gap-4 border-t border-[#1F1A14]/8 pt-4">
        <p className="text-sm leading-6 text-[#1F1A14]/64">{detail}</p>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-[#1F1A14]/26 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </div>
    </div>
  );
}
