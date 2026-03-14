import { SectionHeader } from "@/components/common/section-header";
import { Button } from "@/components/common/button";
import { cn } from "@/lib/utils/cn";

const PLANS = [
  {
    id: "starter",
    name: "Starter Plan",
    price: "99",
    period: "/month",
    description:
      "Perfect for digital health startups and small teams launching their first virtual care MVP.",
    highlighted: false,
  },
  {
    id: "professional",
    name: "Professional Plan",
    price: "249",
    period: "/month",
    description:
      "Perfect for growing virtual care organizations ready to scale their operations.",
    highlighted: true,
  },
  {
    id: "enterprise",
    name: "Enterprise Plan",
    price: "499",
    period: "/month",
    description:
      "Comprehensive and scalable solutions for large health systems and care networks.",
    highlighted: false,
  },
];

export function PricingSection() {
  return (
    <section
      id="pricing"
      className="bg-[#FAF3E1] px-4 py-16 sm:px-6 sm:py-24 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          label="Pricing"
          title="Simple, Transparent Pricing"
          description="Explore our standout features designed to deliver exceptional performance and value, distinguishing us in the virtual health space."
          align="center"
        />

        <div className="reveal-text mt-12 grid gap-6 md:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "flex flex-col rounded-2xl p-5 shadow-md transition-shadow hover:shadow-lg sm:p-6 lg:p-8",
                plan.highlighted
                  ? "bg-[#222222] text-white"
                  : "bg-[#F5E7C6] text-[#222222]",
              )}
            >
              <p className="text-sm font-semibold uppercase tracking-wider opacity-80">
                {plan.name}
              </p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-bold sm:text-4xl">${plan.price}</span>
                <span className="text-sm opacity-80">{plan.period}</span>
              </div>
              <p className="mt-4 flex-1 text-sm leading-relaxed opacity-90">
                {plan.description}
              </p>
              <div className="mt-8">
                <Button variant="primary" href="/sign-up" className="w-full">
                  Get Started
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
