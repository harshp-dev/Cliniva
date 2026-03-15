import type { ReactNode } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { CalendarDays, ChevronRight, Sparkles } from "lucide-react";
import { SignOutButton } from "@/components/features/auth/sign-out-button";
import { DashboardStatCard } from "@/components/features/dashboard/dashboard-stat-card";
import { formatDateLabel } from "@/lib/utils/date-time";
import { cn } from "@/lib/utils/cn";

export type DashboardShellStat = {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
};

export type DashboardShellNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  meta?: string;
  matchPaths?: string[];
};

type DashboardShellProps = {
  currentPath: string;
  pageLabel?: string;
  userName: string;
  userEmail: string;
  roleLabel: string;
  title: string;
  description: string;
  summaryTitle: string;
  summaryDescription: string;
  summaryItems: string[];
  stats: DashboardShellStat[];
  navItems: DashboardShellNavItem[];
  actions?: ReactNode;
  children: ReactNode;
};

function isItemActive(currentPath: string, item: DashboardShellNavItem) {
  if (currentPath === item.href) return true;
  if (currentPath.startsWith(`${item.href}/`)) return true;
  if (!item.matchPaths) return false;
  return item.matchPaths.some((path) => currentPath === path || currentPath.startsWith(`${path}/`));
}

export function DashboardShell({
  currentPath,
  pageLabel = "Dashboard overview",
  userName,
  userEmail,
  roleLabel,
  title,
  description,
  summaryTitle,
  summaryDescription,
  summaryItems,
  stats,
  navItems,
  actions,
  children,
}: DashboardShellProps) {
  return (
    <div className="min-h-screen min-w-0 overflow-x-hidden bg-[#F7F1E3] text-[#1F1A14]">
      <div className="min-h-screen min-w-0 bg-[radial-gradient(circle_at_top_left,_rgba(250,129,18,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(34,34,34,0.08),_transparent_26%)]">
        <div className="mx-auto flex min-h-screen w-full max-w-[1600px] min-w-0 flex-col gap-6 overflow-x-hidden px-4 py-4 sm:px-6 lg:flex-row lg:px-8 lg:py-6">
          <aside className="w-full shrink-0 lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:max-w-[320px]">
            <div className="flex h-full flex-col overflow-hidden rounded-[32px] border border-[#1F1A14]/10 bg-[#16120F] text-[#F8F4EC] shadow-[0_28px_90px_rgba(15,10,6,0.16)]">
              <div className="border-b border-white/10 px-6 py-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FA8112] text-[#16120F] shadow-[0_18px_30px_rgba(250,129,18,0.32)]">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#F8F4EC]/58">
                      Cliniva
                    </p>
                    <p className="text-lg font-semibold">{roleLabel}</p>
                  </div>
                </div>
                <div className="mt-6 rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-semibold text-white">{userName}</p>
                  <p className="mt-1 text-sm text-[#F8F4EC]/62">{userEmail}</p>
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#FA8112]/30 bg-[#FA8112]/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#FFB869]">
                    Active workspace
                  </div>
                </div>
              </div>

              <div className="hide-scrollbar flex-1 space-y-6 overflow-y-auto bg-[#16120F] px-4 py-5">
                <div>
                  <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#F8F4EC]/46">
                    Navigation
                  </p>
                  <nav className="mt-3 space-y-2">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = isItemActive(currentPath, item);

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "group flex items-center gap-3 rounded-[22px] border px-4 py-3 transition-all duration-200",
                            isActive
                              ? "border-[#FA8112]/40 bg-[#FA8112]/14"
                              : "border-white/6 bg-white/[0.04] hover:border-[#FA8112]/28 hover:bg-white/[0.08]"
                          )}
                        >
                          <div
                            className={cn(
                              "flex h-10 w-10 items-center justify-center rounded-2xl transition-colors",
                              isActive
                                ? "bg-[#FA8112] text-[#16120F]"
                                : "bg-[#FA8112]/12 text-[#FFB869] group-hover:bg-[#FA8112] group-hover:text-[#16120F]"
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-white">{item.label}</p>
                            {item.meta ? (
                              <p className="truncate text-xs text-[#F8F4EC]/52">{item.meta}</p>
                            ) : null}
                          </div>
                          <ChevronRight
                            className={cn(
                              "h-4 w-4 transition-transform",
                              isActive
                                ? "text-[#FFB869]"
                                : "text-[#F8F4EC]/36 group-hover:translate-x-0.5"
                            )}
                          />
                        </Link>
                      );
                    })}
                  </nav>
                </div>

                <div className="rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,rgba(250,129,18,0.18),rgba(255,255,255,0.03))] p-5">
                  <div className="flex items-center gap-2 text-[#FFD7AB]">
                    <CalendarDays className="h-4 w-4" />
                    <p className="text-xs font-semibold uppercase tracking-[0.18em]">Today</p>
                  </div>
                  <p className="mt-3 text-xl font-semibold text-white">{formatDateLabel(new Date().toISOString())}</p>
                  <p className="mt-2 text-sm leading-6 text-[#F8F4EC]/68">
                    This workspace stays role-scoped and focused on the MVP actions that matter right now.
                  </p>
                </div>
              </div>

              <div className="border-t border-white/10 px-6 py-5">
                <SignOutButton />
              </div>
            </div>
          </aside>

          <main className="min-w-0 flex-1">
            <div className="space-y-6">
              <section className="min-w-0 overflow-hidden rounded-[34px] border border-[#1F1A14]/10 bg-white/80 shadow-[0_22px_80px_rgba(31,26,20,0.08)] backdrop-blur">
                <div className="grid min-w-0 gap-0 xl:grid-cols-[1.45fr_0.95fr]">
                  <div className="min-w-0 border-b border-[#1F1A14]/8 px-6 py-7 sm:px-8 xl:border-r xl:border-b-0 xl:px-10 xl:py-10">
                    <div className="flex flex-wrap items-center gap-3 text-sm text-[#1F1A14]/62">
                      <span className="rounded-full border border-[#FA8112]/25 bg-[#FA8112]/12 px-3 py-1 font-semibold uppercase tracking-[0.18em] text-[#9A4B00]">
                        {roleLabel}
                      </span>
                      <span className="rounded-full border border-[#1F1A14]/8 bg-[#F8F4EC] px-3 py-1">
                        {pageLabel}
                      </span>
                    </div>
                    <h1 className="mt-5 max-w-4xl text-3xl font-semibold tracking-[-0.04em] text-[#1F1A14] sm:text-4xl xl:text-[3.65rem] xl:leading-[0.98]">
                      {title}
                    </h1>
                    <p className="mt-4 max-w-2xl text-base leading-7 text-[#1F1A14]/68 sm:text-lg">
                      {description}
                    </p>
                    {actions ? <div className="mt-6 flex flex-wrap gap-3">{actions}</div> : null}
                  </div>

                  <div className="min-w-0 bg-[linear-gradient(180deg,rgba(248,244,236,0.95),rgba(245,231,198,0.9))] px-6 py-7 sm:px-8 xl:px-8 xl:py-10">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1F1A14]/48">
                      Operational focus
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#1F1A14]">
                      {summaryTitle}
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-[#1F1A14]/68">
                      {summaryDescription}
                    </p>
                    <div className="mt-6 space-y-3">
                      {summaryItems.map((item) => (
                        <div
                          key={item}
                          className="flex items-start gap-3 rounded-[22px] border border-[#1F1A14]/8 bg-white/65 px-4 py-3"
                        >
                          <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#FA8112]" />
                          <p className="text-sm leading-6 text-[#1F1A14]/74">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
                {stats.map((stat) => (
                  <DashboardStatCard key={stat.label} {...stat} />
                ))}
              </section>

              <section>{children}</section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
