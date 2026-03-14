import type { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/components/common/logo";

export default function AuthLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div className="min-h-screen bg-[#FAF3E1]">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 sm:py-6">
        <Link href="/" className="flex items-center gap-2" aria-label="Cliniva home">
          <Logo className="h-9 w-auto" />
          <span className="text-lg font-semibold text-[#222222]">Cliniva</span>
        </Link>
        <Link
          href="/"
          className="inline-flex min-h-[44px] items-center py-3 text-sm font-medium text-[#222222] hover:text-[#FA8112]"
        >
          Back to home
        </Link>
      </header>
      <main className="mx-auto flex min-h-[calc(100vh-100px)] w-full max-w-6xl items-center justify-center px-4 py-8 sm:px-6 sm:py-10">
        {children}
      </main>
    </div>
  );
}
