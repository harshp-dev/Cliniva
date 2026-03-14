"use client";

import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";

const TESTIMONIALS = [
  {
    quote:
      "Cliniva has been a game-changer for our telehealth startup. With its comprehensive EHR and video consultation tools, we've been able to launch our MVP in under 60 days. The API-first approach and HIPAA compliance out of the box saved us months of development.",
    name: "Sarah Chen",
    title: "CTO at HealthFlow",
  },
  {
    quote:
      "I've been using Cliniva for our virtual mental health practice, and I can't imagine managing our operations without it. From patient onboarding to clinical documentation, Cliniva has simplified every aspect of our care delivery. The customer support team is also top-notch.",
    name: "Dr. Michael Torres",
    title: "CMO at MindfulCare",
  },
  {
    quote:
      "We evaluated several EHR platforms before choosing Cliniva. The white-label capability and developer-friendly APIs made it the clear winner. We went from procurement to live in 45 days—something that would have taken 18+ months with traditional vendors.",
    name: "Jennifer Walsh",
    title: "Innovation Lead at Metro Health",
  },
  {
    quote:
      "The patient portal and appointment scheduling have transformed how we engage with our chronic care patients. Engagement rates are up 40% since we switched. Cliniva delivers exactly what it promises—compliant, scalable, virtual-first infrastructure.",
    name: "David Park",
    title: "CEO at CareConnect",
  },
];

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#F5E7C6] text-sm font-semibold text-[#222222]"
      aria-hidden
    >
      {initials}
    </div>
  );
}

function TestimonialCard({
  quote,
  name,
  title,
}: {
  quote: string;
  name: string;
  title: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-md">
      <blockquote className="text-[#222222] leading-relaxed">
        &ldquo;{quote}&rdquo;
      </blockquote>
      <div className="mt-4 flex items-center gap-3">
        <Avatar name={name} />
        <div>
          <p className="font-semibold text-[#222222]">{name}</p>
          <p className="text-sm text-[#222222]/70">{title}</p>
        </div>
      </div>
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <section className="bg-[#FAF3E1] px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr] lg:gap-16">
          <div className="reveal-text lg:pt-4">
            <span className="mb-3 inline-block rounded-full bg-[#FA8112]/20 px-4 py-1.5 text-sm font-medium text-[#FA8112]">
              Testimonials
            </span>
            <h2 className="text-2xl font-bold text-[#222222] sm:text-3xl lg:text-4xl">
              What{" "}
              <span className="relative inline-block">
                Our Clients Are Saying
                <svg
                  className="absolute -bottom-1 left-0 w-full"
                  viewBox="0 0 200 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden
                >
                  <path
                    d="M2 6C20 2 40 2 60 6C80 10 100 2 120 6C140 10 160 2 180 6C190 8 198 6 200 6"
                    stroke="#FA8112"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h2>
            <p className="mt-4 max-w-md text-[#222222]/80 sm:text-lg">
              Our users love how Cliniva simplifies their clinical workflows and
              streamlines virtual care operations.
            </p>
          </div>

          <div className="reveal-text">
            <InfiniteMovingCards
              items={TESTIMONIALS}
              direction="up"
              speed="fast"
              pauseOnHover={true}
              renderItem={(item) => (
                <TestimonialCard
                  quote={item.quote}
                  name={item.name}
                  title={item.title}
                />
              )}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
