import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

type ButtonProps = {
  variant?: "primary" | "secondary";
  href?: string;
  children: ReactNode;
  className?: string;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
};

const baseStyles =
  "inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#FA8112] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF3E1] disabled:cursor-not-allowed disabled:opacity-60";

const variants = {
  primary:
    "bg-[#FA8112] text-white hover:bg-[#e8730a] active:bg-[#d66609]",
  secondary:
    "border-2 border-[#222222] bg-transparent text-[#222222] hover:bg-[#222222]/5 active:bg-[#222222]/10",
};

export function Button({
  variant = "primary",
  href,
  children,
  className,
  type = "button",
  onClick,
  disabled,
}: ButtonProps) {
  const styles = cn(baseStyles, variants[variant], className);

  if (href) {
    return (
      <Link
        href={href}
        className={cn(styles, disabled ? "pointer-events-none" : "")}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
      >
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={styles} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
