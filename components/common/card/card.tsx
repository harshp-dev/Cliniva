import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type CardProps = {
  id?: string;
  className?: string;
  children: ReactNode;
};

type CardSectionProps = {
  className?: string;
  children: ReactNode;
};

export function Card({ id, className, children }: CardProps) {
  return (
    <div
      id={id}
      className={cn(
        "rounded-2xl border border-[#222222]/10 bg-[#F5E7C6] shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children }: CardSectionProps) {
  return <div className={cn("px-4 py-4 sm:px-6 sm:pt-6 sm:pb-4", className)}>{children}</div>;
}

export function CardContent({ className, children }: CardSectionProps) {
  return <div className={cn("px-4 pb-4 sm:px-6 sm:pb-6", className)}>{children}</div>;
}

export function CardFooter({ className, children }: CardSectionProps) {
  return <div className={cn("px-4 pb-4 sm:px-6 sm:pb-6", className)}>{children}</div>;
}

export function CardTitle({ className, children }: CardSectionProps) {
  return (
    <h1 className={cn("text-xl font-semibold text-[#222222] sm:text-2xl", className)}>
      {children}
    </h1>
  );
}

export function CardDescription({ className, children }: CardSectionProps) {
  return (
    <p className={cn("mt-2 text-sm text-[#222222]/70", className)}>
      {children}
    </p>
  );
}

