import { StatCard } from "@/components/dashboard/stat-card";

export default function DashboardPage() {
  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Active Patients" value="1,284" helper="Across all clinics" />
        <StatCard label="Today Appointments" value="96" helper="12 virtual consultations in progress" />
        <StatCard label="Open Claims" value="42" helper="8 require manual review" />
      </div>

      <article className="card">
        <h2 className="text-lg font-semibold text-slate-900">Operational Summary</h2>
        <p className="mt-2 text-sm text-slate-600">
          This dashboard aggregates scheduling, EHR updates, payment collection, and communication metrics for multi-tenant healthcare organizations.
        </p>
      </article>
    </section>
  );
}
