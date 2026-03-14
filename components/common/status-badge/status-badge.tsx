import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type StatusBadgeProps = {
  children: ReactNode;
  tone?: "neutral" | "accent" | "success" | "warning" | "critical";
  className?: string;
};

const toneStyles = {
  neutral: "border-[#222222]/10 bg-white/55 text-[#222222]/75",
  accent: "border-[#FA8112]/30 bg-[#FA8112]/12 text-[#9A4B00]",
  success: "border-emerald-600/20 bg-emerald-600/10 text-emerald-800",
  warning: "border-amber-600/20 bg-amber-500/12 text-amber-900",
  critical: "border-rose-600/20 bg-rose-500/12 text-rose-900",
};

export function StatusBadge({
  children,
  tone = "neutral",
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.14em] uppercase",
        toneStyles[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

