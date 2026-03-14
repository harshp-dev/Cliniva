import type { SelectHTMLAttributes } from "react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  hasError?: boolean;
};

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ className, hasError, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        aria-invalid={hasError ? "true" : "false"}
        className={cn(
          "w-full rounded-lg border bg-white px-3 py-2 text-sm text-[#222222] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FA8112]",
          hasError ? "border-[#B42318]" : "border-[#222222]/15",
          className
        )}
        {...props}
      >
        {children}
      </select>
    );
  }
);

SelectField.displayName = "SelectField";
