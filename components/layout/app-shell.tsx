"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { AppRole } from "@/types/domain";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Role = AppRole | "unknown";

const links: Array<{ href: string; label: string; roles: AppRole[] }> = [
  { href: "/dashboard", label: "Dashboard", roles: ["admin", "provider", "staff", "patient"] },
  { href: "/patients", label: "Patients", roles: ["admin", "provider", "staff"] },
  { href: "/appointments", label: "Appointments", roles: ["admin", "provider", "staff", "patient"] },
  { href: "/consultation", label: "Consultation", roles: ["admin", "provider", "staff", "patient"] },
  { href: "/messages", label: "Messages", roles: ["admin", "provider", "staff", "patient"] },
  { href: "/billing", label: "Billing", roles: ["admin", "staff"] },
  { href: "/patient", label: "Patient Portal", roles: ["admin", "provider", "staff", "patient"] },
  { href: "/provider", label: "Provider", roles: ["admin", "provider", "staff"] }
];

export function AppShell({ children, title }: { children: React.ReactNode; title: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<Role>("unknown");
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadRole() {
      try {
        const response = await fetch("/api/me", { cache: "no-store" });
        if (!response.ok) {
          return;
        }
        const payload = await response.json();
        const nextRole = payload?.data?.role as AppRole | undefined;
        if (active && nextRole) {
          setRole(nextRole);
        }
      } catch {
        // Keep default role fallback.
      }
    }

    loadRole();
    return () => {
      active = false;
    };
  }, []);

  const visibleLinks = useMemo(() => {
    if (role === "unknown") {
      return links.filter((link) => link.href === "/dashboard" || link.href === "/patient");
    }
    return links.filter((link) => link.roles.includes(role));
  }, [role]);

  async function handleSwitchAccount() {
    if (switching) {
      return;
    }

    setSwitching(true);
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white/95">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">Virtual Health Platform</p>
            <h1 className="text-lg font-bold text-slate-900">{title}</h1>
          </div>
          <button type="button" onClick={handleSwitchAccount} className="btn-secondary" disabled={switching}>
            {switching ? "Switching..." : "Switch Account"}
          </button>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl gap-6 px-6 py-6 lg:grid-cols-[220px_1fr]">
        <aside className="card h-fit p-3">
          <nav className="flex flex-col gap-2">
            {visibleLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium",
                  pathname === link.href ? "bg-sky-800 text-white" : "text-slate-700 hover:bg-slate-100"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
}
