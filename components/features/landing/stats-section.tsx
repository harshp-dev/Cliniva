const stats = [
  {
    value: "99.9%",
    label: "API Uptime SLA",
    description: "Sub-200ms response times",
  },
  {
    value: "30 days",
    label: "Time to launch",
    description: "From months to under 30 days",
  },
  {
    value: "200+",
    label: "Provider orgs",
    description: "Target within 12 months",
  },
  {
    value: "10M+",
    label: "Patient records",
    description: "36-month target capacity",
  },
];

export function StatsSection() {
  return (
    <section id="stats" className="bg-[#FAF3E1] px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <h2 className="stagger-container mb-12 text-center text-2xl font-bold text-[#222222] sm:text-3xl lg:text-4xl">
          Empowering you to deliver compliant, high-quality digital care
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="stagger-item rounded-xl bg-[#FA8112] p-6 text-white shadow-md"
            >
              <p className="text-sm font-medium opacity-90">{stat.label}</p>
              <p className="mt-2 text-3xl font-bold sm:text-4xl">{stat.value}</p>
              <p className="mt-1 text-sm opacity-90">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

