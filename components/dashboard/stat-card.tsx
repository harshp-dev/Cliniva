export function StatCard({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <article className="card">
      <p className="text-sm font-medium text-slate-600">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
      <p className="mt-2 text-xs text-slate-500">{helper}</p>
    </article>
  );
}
