import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type FormFieldProps = {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
};

export function FormField({
  label,
  htmlFor,
  error,
  hint,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-[#222222]">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-sm text-[#B42318]" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-sm text-[#222222]/60">{hint}</p>
      ) : null}
    </div>
  );
}
