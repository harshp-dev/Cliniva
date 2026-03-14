export default function PatientPortalPage() {
  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <article className="card">
        <h2 className="text-lg font-semibold text-slate-900">Upcoming Appointments</h2>
        <p className="mt-2 text-sm text-slate-600">View visits, join virtual rooms, and receive reminders.</p>
      </article>

      <article className="card">
        <h2 className="text-lg font-semibold text-slate-900">Medical Records</h2>
        <p className="mt-2 text-sm text-slate-600">Secure access to clinical notes, labs, prescriptions, and care plans.</p>
      </article>
    </section>
  );
}
