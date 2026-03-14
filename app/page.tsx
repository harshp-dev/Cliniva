import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-12">
      <section className="mb-10 rounded-2xl border border-sky-100 bg-white/90 p-10 shadow-sm">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">Virtual Health Platform</p>
        <h1 className="mb-4 text-4xl font-bold text-slate-900 md:text-5xl">Multi-tenant telehealth SaaS</h1>
        <p className="max-w-3xl text-slate-700">
          End-to-end platform for patient onboarding, scheduling, virtual consultations, EHR, prescriptions, messaging, and billing.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/login" className="btn-primary">Login</Link>
          <Link href="/signup" className="btn-secondary">Create Account</Link>
          <Link href="/dashboard" className="btn-secondary">Open Dashboard</Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          "Patient onboarding + profiles",
          "Scheduling + video consultations",
          "EHR + billing + claims"
        ].map((item) => (
          <article key={item} className="card">
            <h2 className="font-semibold text-slate-900">{item}</h2>
            <p className="mt-2 text-sm text-slate-600">Production-ready scaffolding with Supabase RLS, API validation, and role-based middleware.</p>
          </article>
        ))}
      </section>
    </main>
  );
}
