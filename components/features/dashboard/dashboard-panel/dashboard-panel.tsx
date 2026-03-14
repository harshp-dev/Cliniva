import type { ReactNode } from "react";
import { Card, CardContent, CardHeader } from "@/components/common/card";
import { cn } from "@/lib/utils/cn";

type DashboardPanelProps = {
  id?: string;
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

export function DashboardPanel({
  id,
  title,
  description,
  action,
  children,
  className,
  contentClassName,
}: DashboardPanelProps) {
  return (
    <Card
      id={id}
      className={cn(
        "rounded-[30px] border-[#1F1A14]/10 bg-white/80 shadow-[0_18px_70px_rgba(31,26,20,0.06)]",
        className
      )}
    >
      <CardHeader className="flex flex-col gap-4 border-b border-[#1F1A14]/8 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-7 sm:py-6">
        <div className="space-y-1.5">
          <h2 className="text-[1.35rem] font-semibold tracking-[-0.03em] text-[#1F1A14]">{title}</h2>
          <p className="max-w-2xl text-sm leading-6 text-[#1F1A14]/62">{description}</p>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </CardHeader>
      <CardContent className={cn("px-5 pt-5 sm:px-7 sm:pt-6", contentClassName)}>{children}</CardContent>
    </Card>
  );
}
