import type { TextareaHTMLAttributes } from "react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type TextareaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  hasError?: boolean;
};

export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  ({ className, hasError, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        aria-invalid={hasError ? "true" : "false"}
        className={cn(
          "min-h-[144px] w-full rounded-lg border bg-white px-3 py-3 text-sm text-[#222222] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FA8112]",
          hasError ? "border-[#B42318]" : "border-[#222222]/15",
          className
        )}
        {...props}
      />
    );
  }
);

TextareaField.displayName = "TextareaField";
