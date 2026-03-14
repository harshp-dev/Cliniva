import type { InputHTMLAttributes } from "react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  hasError?: boolean;
};

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ className, hasError, ...props }, ref) => {
    return (
      <input
        ref={ref}
        aria-invalid={hasError ? "true" : "false"}
        className={cn(
          "w-full min-h-[44px] rounded-lg border bg-white px-3 py-3 text-sm text-[#222222] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FA8112]",
          hasError ? "border-[#B42318]" : "border-[#222222]/15",
          className
        )}
        {...props}
      />
    );
  }
);

TextInput.displayName = "TextInput";
