"use client";

import { useState } from "react";
import { SectionHeader } from "@/components/common/section-header";
import { cn } from "@/lib/utils/cn";

const IconChart = () => (
  <svg className="size-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);
const IconMobile = () => (
  <svg className="size-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);
const IconVideo = () => (
  <svg className="size-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);
const IconShield = () => (
  <svg className="size-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const FEATURES = [
  {
    id: "analytics",
    label: "Reporting & analytics",
    title: "Reporting & analytics",
    pillIcon: IconChart,
    description:
      "Gain actionable insights with clinical outcomes tracking, operational metrics, and regulatory reporting dashboards.",
    icon: (
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#FA8112]">
        <svg
          className="size-5 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      </div>
    ),
    widget: (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium opacity-80">Patient metrics</span>
          <select className="rounded bg-white/10 px-2 py-1 text-xs text-white">
            <option>Monthly</option>
          </select>
        </div>
        <div className="flex justify-center py-2">
          <div className="relative flex size-24 items-center justify-center">
            <svg className="size-24 -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeDasharray="80, 100"
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-xl font-bold text-white">80%</span>
          </div>
        </div>
        <p className="text-center text-xs opacity-80">Engagement this month</p>
        <div className="flex justify-center gap-4 text-xs">
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-emerald-400" />
            Active
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-[#FA8112]" />
            Pending
          </span>
        </div>
      </div>
    ),
  },
  {
    id: "portal",
    label: "Patient portal",
    title: "Patient portal",
    pillIcon: IconMobile,
    description:
      "Self-service portal for patients to view records, schedule appointments, and communicate with providers seamlessly.",
    icon: (
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#FA8112]">
        <svg
          className="size-5 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      </div>
    ),
    widget: (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium opacity-80">Appointments</span>
          <select className="rounded bg-white/10 px-2 py-1 text-xs text-white">
            <option>This week</option>
          </select>
        </div>
        <div className="flex justify-center py-2">
          <div className="flex size-20 items-center justify-center rounded-full border-2 border-white text-2xl font-bold text-white">
            3
          </div>
        </div>
        <p className="text-center text-xs opacity-80">Upcoming visits</p>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between rounded bg-white/10 px-2 py-1">
            <span>Video Consult</span>
            <span className="opacity-80">Today</span>
          </div>
          <div className="flex justify-between rounded bg-white/10 px-2 py-1">
            <span>Follow-up</span>
            <span className="opacity-80">Wed</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "video",
    label: "Video consultations",
    title: "Video consultations",
    pillIcon: IconVideo,
    description:
      "HIPAA-compliant video calling with recording, screen sharing, and in-call documentation for virtual care delivery.",
    icon: (
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#FA8112]">
        <svg
          className="size-5 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      </div>
    ),
    widget: (
      <div className="space-y-3">
        <p className="text-xs font-medium opacity-80">Session stats</p>
        <div className="flex h-16 items-end gap-1">
          {[40, 65, 55, 85, 70, 90].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm bg-white/30"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <p className="text-center text-xs opacity-80">Calls this week</p>
        <div className="flex justify-between text-xs">
          <span>Completed: 12</span>
          <span>Avg: 18 min</span>
        </div>
      </div>
    ),
  },
  {
    id: "security",
    label: "HIPAA compliance",
    title: "HIPAA compliance",
    pillIcon: IconShield,
    description:
      "Built-in security controls, audit logging, BAA management, and compliance reporting for PHI protection.",
    icon: (
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#FA8112]">
        <svg
          className="size-5 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      </div>
    ),
    widget: (
      <div className="space-y-3">
        <p className="text-xs font-medium opacity-80">Audit status</p>
        <div className="flex justify-center py-2">
          <div className="flex size-16 items-center justify-center rounded-full border-2 border-emerald-400 text-lg font-bold text-emerald-400">
            ✓
          </div>
        </div>
        <p className="text-center text-xs opacity-80">Compliant</p>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span>PHI encrypted</span>
            <span className="text-emerald-400">Active</span>
          </div>
          <div className="flex justify-between">
            <span>BAA signed</span>
            <span className="text-emerald-400">Active</span>
          </div>
        </div>
      </div>
    ),
  },
];

export function FeaturesSection() {
  const [activeId, setActiveId] = useState(FEATURES[0].id);
  const activeFeature = FEATURES.find((f) => f.id === activeId) ?? FEATURES[0];

  return (
    <section id="features" className="bg-[#FAF3E1] px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <SectionHeader
          label="Core Features"
          title="Core features that set us apart from the competition"
          description="Explore our standout features designed to deliver exceptional performance and value, distinguishing us in the virtual health space."
          align="center"
        />

        <div className="reveal-text scroll-touch mt-12 flex flex-nowrap justify-center gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:gap-3 sm:overflow-visible sm:pb-0">
          {FEATURES.map((feature) => {
            const PillIcon = feature.pillIcon;
            return (
              <button
                key={feature.id}
                type="button"
                onClick={() => setActiveId(feature.id)}
                title={feature.label}
                className={cn(
                  "flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center gap-2 rounded-full text-sm font-semibold text-[#222222] transition-colors focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#FA8112] focus-visible:ring-offset-2 sm:min-h-0 sm:min-w-0 sm:px-5 sm:py-2.5",
                  activeId === feature.id
                    ? "bg-[#F5E7C6] shadow-sm"
                    : "border-2 border-dashed border-[#222222]/30 bg-transparent hover:border-[#222222]/50"
                )}
              >
                <PillIcon />
                <span className="hidden sm:inline">{feature.label}</span>
              </button>
            );
          })}
        </div>

        <div className="reveal-text mt-8 overflow-hidden rounded-2xl bg-[#FA8112] p-4 shadow-lg sm:p-6 lg:flex lg:items-center lg:gap-12 lg:p-8">
          <div className="flex-1">
            <div className="mb-4">{activeFeature.icon}</div>
            <h3 className="text-2xl font-bold text-white sm:text-3xl">
              {activeFeature.title}
            </h3>
            <p className="mt-3 max-w-md text-white/90">
              {activeFeature.description}
            </p>
          </div>
          <div className="mt-6 flex shrink-0 lg:mt-0">
            <div className="w-full min-w-0 max-w-[280px] rounded-xl bg-[#1a1a1a] p-4 text-white">
              {activeFeature.widget}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
