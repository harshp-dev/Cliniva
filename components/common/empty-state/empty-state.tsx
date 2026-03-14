import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type EmptyStateProps = {
  title: string;
  description: string;
  icon?: ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  description,
  icon,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed border-[#222222]/14 bg-white/35 px-4 py-5 text-sm text-[#222222]/72",
        className
      )}
    >
      <div className="flex items-start gap-3">
        {icon ? (
          <div className="mt-0.5 rounded-xl bg-[#FA8112]/12 p-2 text-[#FA8112]">{icon}</div>
        ) : null}
        <div className="space-y-1">
          <p className="text-sm font-semibold text-[#222222]">{title}</p>
          <p>{description}</p>
        </div>
      </div>
    </div>
  );
}

