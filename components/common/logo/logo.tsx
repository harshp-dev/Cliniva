import Image from "next/image";

type LogoProps = {
  variant?: "full" | "mark";
  className?: string;
};

export function Logo({ variant = "mark", className }: LogoProps) {
  return (
    <Image
      src="/logo/Logomark.svg"
      alt="Cliniva"
      width={variant === "mark" ? 40 : 120}
      height={variant === "mark" ? 48 : 48}
      className={className}
      priority
    />
  );
}
