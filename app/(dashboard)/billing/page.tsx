export default function BillingPage() {
  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <article className="card space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Billing & Invoices</h2>
        <p className="text-sm text-slate-600">Stripe integration uses payment intents via <code>/api/payments</code>.</p>
        <ul className="list-disc pl-5 text-sm text-slate-700">
          <li>Generate invoices after appointment completion</li>
          <li>Track copays and full claim balances</li>
          <li>Reconcile Stripe payouts with claims status</li>
        </ul>
      </article>

      <article className="card space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Insurance Claims</h2>
        <p className="text-sm text-slate-600">Claims API endpoint: <code>/api/claims</code></p>
        <div className="grid gap-3">
          <input className="input" placeholder="Insurance Plan ID" />
          <input className="input" placeholder="Claim Amount (cents)" />
          <button className="btn-primary">Submit Claim</button>
        </div>
      </article>

      <article className="card space-y-3 lg:col-span-2">
        <h2 className="text-lg font-semibold text-slate-900">Care Coordination</h2>
        <p className="text-sm text-slate-600">
          Use <code>/messages</code> for secure patient-provider chat and notification workflows linked to billing follow-ups.
        </p>
      </article>
    </section>
  );
}
