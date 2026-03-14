import { cn } from "@/lib/utils/cn";

type SectionHeaderProps = {
  label?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  className?: string;
};

export function SectionHeader({
  label,
  title,
  description,
  align = "center",
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "mb-12",
        align === "center" ? "text-center" : "text-left",
        className
      )}
    >
      {label && (
        <span className="mb-3 inline-block rounded-full bg-[#FA8112]/20 px-4 py-1.5 text-sm font-medium text-[#FA8112]">
          {label}
        </span>
      )}
      <h2 className="text-2xl font-bold text-[#222222] sm:text-3xl lg:text-4xl">
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "mt-4 max-w-full text-[#222222]/80 sm:max-w-2xl sm:text-lg",
            align === "center" && "mx-auto"
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
