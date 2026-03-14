import { cn } from "@/lib/utils/cn";

type FeatureMiniAppCardProps = {
  children: React.ReactNode;
  backgroundColor: string;
  className?: string;
};

export function FeatureMiniAppCard({
  children,
  backgroundColor,
  className,
}: FeatureMiniAppCardProps) {
  return (
    <div
      className={cn(
        "reveal-text overflow-hidden rounded-xl p-4 shadow-md",
        className
      )}
      style={{ backgroundColor }}
    >
      <div className="rounded-lg bg-[#1a1a1a] p-4 text-white">
        {children}
      </div>
    </div>
  );
}
