"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/common/logo";
import { Button } from "@/components/common/button";

const FOOTER_LINKS = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Solutions", href: "#solutions" },
      { label: "Integrations", href: "#" },
      { label: "API", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#about" },
      { label: "Blog", href: "#blog" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "#contact" },
      { label: "Partners", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "#" },
      { label: "Help Center", href: "#" },
      { label: "Compliance", href: "#" },
      { label: "Status", href: "#" },
      { label: "Changelog", href: "#" },
    ],
  },
];

const SOCIAL_LINKS = [
  { label: "LinkedIn", href: "#", icon: "linkedin" },
  { label: "Twitter", href: "#", icon: "twitter" },
  { label: "GitHub", href: "#", icon: "github" },
];

function SocialIcon({ icon }: { icon: string }) {
  const icons: Record<string, React.ReactNode> = {
    linkedin: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM6 5a2 2 0 100-4 2 2 0 000 4z"
      />
    ),
    twitter: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    ),
    github: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
      />
    ),
  };
  return (
    <svg
      className="size-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden
    >
      {icons[icon] || icons.github}
    </svg>
  );
}

export function LandingFooter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    setStatus("success");
    setEmail("");
  };

  return (
    <>
      <div className="rounded-t-2xl bg-black px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <h3 className="text-xl font-bold text-white sm:text-2xl lg:text-3xl">
            Subscribe to our newsletter
          </h3>
          <form
            onSubmit={handleSubscribe}
            className="flex w-full max-w-md flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 rounded-lg border-0 bg-white px-4 py-3 text-[#222222] placeholder:text-[#222222]/60 focus:outline-none focus:ring-2 focus:ring-[#FA8112]"
              disabled={status === "loading"}
            />
            <Button
              type="submit"
              variant="primary"
              className="shrink-0"
            >
              {status === "loading" ? "Subscribing..." : "Subscribe"}
            </Button>
          </form>
        </div>
      </div>

      <footer className="bg-black px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-3 gap-4 sm:gap-6 lg:grid-cols-4">
            <div className="col-span-3 lg:col-span-1">
              <Link
                href="/"
                className="flex items-center gap-2"
                aria-label="Cliniva home"
              >
                <Logo className="h-8 w-auto brightness-0 invert" />
                <span className="text-lg font-bold text-white">Cliniva</span>
              </Link>
              <p className="mt-3 max-w-xs text-sm text-white/70">
                Build and scale virtual care with compliant, API-first
                infrastructure.
              </p>
              <div className="mt-6 flex gap-3">
                {SOCIAL_LINKS.map((social) => (
                  <a
                    key={social.icon}
                    href={social.href}
                    className="flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-[#FA8112]"
                    aria-label={social.label}
                  >
                    <SocialIcon icon={social.icon} />
                  </a>
                ))}
              </div>
              <p className="mt-4 text-sm text-white/50">
                © {new Date().getFullYear()} Cliniva. All rights reserved.
              </p>
            </div>
            {FOOTER_LINKS.map((column) => (
              <nav key={column.title} aria-label={column.title} className="min-w-0">
                <h4 className="font-semibold text-white text-sm sm:text-base">{column.title}</h4>
                <ul className="mt-3 space-y-1.5 sm:mt-4 sm:space-y-2">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-xs text-white/70 transition-colors hover:text-[#FA8112] sm:text-sm"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
