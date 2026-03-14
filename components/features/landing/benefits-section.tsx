import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/common/card";
import { SectionHeader } from "@/components/common/section-header";

const benefits = [
  {
    title: "Patient Portal & Onboarding",
    description:
      "Digital patient intake with customizable forms, insurance verification, and identity validation. Self-service scheduling and secure messaging.",
    icon: (
      <svg
        className="size-8 text-[#222222]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
  },
  {
    title: "Video Consultations",
    description:
      "HIPAA-compliant video calling with recording, screen sharing, and in-call documentation. Built for virtual-first care delivery.",
    icon: (
      <svg
        className="size-8 text-[#222222]"
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
    ),
  },
  {
    title: "EHR & Clinical Documentation",
    description:
      "Comprehensive patient records with SOAP notes, progress notes, and treatment summaries. Templates and voice-to-text support.",
    icon: (
      <svg
        className="size-8 text-[#222222]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
        />
      </svg>
    ),
  },
  {
    title: "HIPAA Compliance Suite",
    description:
      "Built-in security controls, audit logging, BAA management, and compliance reporting. PHI encryption at rest and in transit.",
    icon: (
      <svg
        className="size-8 text-[#222222]"
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
    ),
  },
];

export function BenefitsSection() {
  return (
    <section className="bg-[#FAF3E1] px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          label="Benefits"
          title="Make virtual care simple, scale with confidence"
          description="Our platform manages patient intake, clinical workflows, and compliance—whether you're optimizing care delivery or scaling your virtual practice, our system integrates the latest technology to help you deliver better care with ease."
          align="center"
        />
        <div className="grid gap-6 sm:grid-cols-2">
          {benefits.map((benefit) => (
            <Card key={benefit.title} className="reveal-text">
              <CardHeader>
                <div className="mb-3">{benefit.icon}</div>
                <CardTitle>{benefit.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#222222]/80">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
