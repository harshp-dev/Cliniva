"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/common/logo";
import { Button } from "@/components/common/button";
const navLinks = [
  { href: "#", label: "Home" },
  { href: "#product", label: "Product" },
  { href: "#solutions", label: "Solutions" },
  { href: "#pricing", label: "Pricing" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];

export function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#222222]/10 bg-[#FAF3E1]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2" aria-label="Cliniva home">
          <Logo className="h-10 w-auto" />
          <span className="text-lg font-bold text-[#222222] sm:text-xl">Cliniva</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-[#222222] transition-colors hover:text-[#FA8112]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <Button variant="secondary" href="/sign-in">
            Sign in
          </Button>
          <Button variant="primary" href="/sign-up">
            Sign up
          </Button>
        </div>

        <button
          type="button"
          className="flex size-10 items-center justify-center rounded-lg md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle menu"
        >
          <svg
            className="size-6 text-[#222222]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {mobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-[#222222]/10 bg-[#FAF3E1] px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-4" aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="flex min-h-[44px] items-center py-3 text-sm font-medium text-[#222222] hover:text-[#FA8112]"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-4 flex flex-col gap-2">
              <Button variant="secondary" href="/sign-in" className="w-full justify-center">
                Sign in
              </Button>
              <Button variant="primary" href="/sign-up" className="w-full justify-center">
                Sign up
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
