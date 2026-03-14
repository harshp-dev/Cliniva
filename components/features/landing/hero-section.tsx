import Image from "next/image";
import Link from "next/link";

const HERO_STATS = [
  { label: "API Uptime SLA", value: "99.9%" },
  { label: "Time to Launch", value: "30 days" },
  { label: "Provider Orgs", value: "200+" },
];

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] bg-[#FAF3E1] px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:min-h-[80vh] lg:grid-cols-2 lg:gap-16">
        <div className="order-2 lg:order-1">
          <Link
            href="#"
            className="reveal-text mb-6 inline-flex items-center gap-2 rounded-lg bg-[#F5E7C6] px-4 py-2 transition-colors hover:bg-[#F5E7C6]/80"
          >
            <span className="rounded bg-[#FA8112] px-2 py-0.5 text-xs font-semibold text-white">
              NEW
            </span>
            <span className="text-xs font-medium text-[#222222] sm:text-sm">
              How Cliniva is helping virtual care organizations
            </span>
            <span className="text-[#222222]">▸</span>
          </Link>

          <h1 className="reveal-text text-3xl font-bold leading-tight text-[#222222] sm:text-4xl lg:text-5xl xl:text-6xl">
            Virtual care infrastructure
            <br />
            in the palm of your hand
          </h1>

          <div className="reveal-text mt-8 flex flex-col items-stretch gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
            <Link
              href="/sign-up"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#222222] px-6 py-3.5 font-semibold text-white transition-colors hover:bg-[#222222]/90"
            >
              Get Started
              <svg
                className="size-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
            <Link
              href="#features"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 text-[#222222] transition-colors hover:text-[#FA8112] sm:justify-start"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-[#222222]">
                <svg
                  className="size-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </span>
              See why
            </Link>
          </div>

          <p className="reveal-text mt-6 max-w-md text-[#222222]/70">
            The modern virtual health platform, built for the age of acceleration.
          </p>

          <div className="reveal-text mt-12 flex justify-center lg:justify-start">
            <a
              href="#stats"
              className="animate-bounce text-[#222222]/60"
              aria-label="Scroll down"
            >
              <svg
                className="size-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </a>
          </div>
        </div>

        <div className="relative order-1 lg:order-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl lg:aspect-square">
            <Image
              src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80"
              alt="Healthcare professional in modern clinical setting"
              fill
              className="object-cover grayscale"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>
          <div className="reveal-text mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4">
            {HERO_STATS.map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-bold text-[#222222] sm:text-3xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-[#222222]/70">{stat.label}</p>
              </div>
            ))}
          </div>
          <p className="reveal-text mt-4 flex items-center gap-2 text-sm text-[#222222]/60">
            <span className="flex size-5 items-center justify-center rounded-full border border-[#222222]/40 text-xs">
              i
            </span>
            See disclosures
          </p>
        </div>
      </div>
    </section>
  );
}
