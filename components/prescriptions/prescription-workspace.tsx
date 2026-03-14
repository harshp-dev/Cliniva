"use client";

import { useCallback, useEffect, useState } from "react";

interface PatientRow {
  id: string;
  mrn: string;
}

interface ProviderRow {
  id: string;
  specialty: string;
  user_id: string;
}

interface MedicationRow {
  id: string;
  name: string;
  rxnorm_code?: string | null;
}

interface PrescriptionRow {
  id: string;
  medication_id: string;
  dosage: string;
  frequency: string;
  duration_days: number;
  notes?: string | null;
  created_at: string;
  discontinued_at?: string | null;
  medications?: { name?: string; rxnorm_code?: string | null } | null;
}

interface WarningRow {
  severity: "low" | "medium" | "high";
  message: string;
  recommendation: string | null;
  conflicting_medication_name: string;
}

export function PrescriptionWorkspace() {
  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [providers, setProviders] = useState<ProviderRow[]>([]);
  const [medications, setMedications] = useState<MedicationRow[]>([]);
  const [prescriptions, setPrescriptions] = useState<PrescriptionRow[]>([]);
  const [warnings, setWarnings] = useState<WarningRow[]>([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    patient_id: "",
    provider_id: "",
    medication_id: "",
    dosage: "",
    frequency: "",
    duration_days: "7",
    notes: "",
    allow_override: false
  });

  const loadPrescriptions = useCallback(async (patientId: string) => {
    const response = await fetch(`/api/prescriptions?patient_id=${patientId}&limit=50`, { cache: "no-store" });
    const payload = await response.json().catch(() => null);
    setPrescriptions((payload?.data ?? []) as PrescriptionRow[]);
  }, []);

  const checkInteractions = useCallback(async (patientId: string, medicationId: string) => {
    if (!patientId || !medicationId) {
      setWarnings([]);
      return;
    }

    const response = await fetch("/api/prescriptions/interactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patient_id: patientId, medication_id: medicationId })
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      setWarnings([]);
      return;
    }

    setWarnings((payload?.data?.warnings ?? []) as WarningRow[]);
  }, []);

  const loadSeedData = useCallback(async () => {
    const [patientsRes, providersRes, medsRes] = await Promise.all([
      fetch("/api/patients?limit=100", { cache: "no-store" }),
      fetch("/api/providers?limit=100", { cache: "no-store" }),
      fetch("/api/medications?limit=100", { cache: "no-store" })
    ]);

    const patientsPayload = await patientsRes.json().catch(() => null);
    const providersPayload = await providersRes.json().catch(() => null);
    const medsPayload = await medsRes.json().catch(() => null);

    const patientRows = (patientsPayload?.data ?? []) as PatientRow[];
    const providerRows = (providersPayload?.data ?? []) as ProviderRow[];
    const medicationRows = (medsPayload?.data ?? []) as MedicationRow[];

    setPatients(patientRows);
    setProviders(providerRows);
    setMedications(medicationRows);

    setForm((prev) => ({
      ...prev,
      patient_id: prev.patient_id || patientRows[0]?.id || "",
      provider_id: prev.provider_id || providerRows[0]?.id || "",
      medication_id: prev.medication_id || medicationRows[0]?.id || ""
    }));

    if (patientRows[0]?.id) {
      await loadPrescriptions(patientRows[0].id);
    }
  }, [loadPrescriptions]);

  useEffect(() => {
    loadSeedData();
  }, [loadSeedData]);

  useEffect(() => {
    if (form.patient_id) {
      loadPrescriptions(form.patient_id);
    }
  }, [form.patient_id, loadPrescriptions]);

  useEffect(() => {
    if (form.patient_id && form.medication_id) {
      checkInteractions(form.patient_id, form.medication_id);
    }
  }, [checkInteractions, form.medication_id, form.patient_id]);

  async function createPrescription(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusMessage("Creating prescription...");

    const response = await fetch("/api/prescriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patient_id: form.patient_id,
        provider_id: form.provider_id,
        medication_id: form.medication_id,
        dosage: form.dosage,
        frequency: form.frequency,
        duration_days: Number(form.duration_days),
        notes: form.notes || undefined,
        allow_override: form.allow_override
      })
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      if (response.status === 409) {
        const overrideWarnings = (payload?.error?.details?.warnings ?? []) as WarningRow[];
        setWarnings(overrideWarnings);
      }
      setStatusMessage(payload?.error?.message ?? "Unable to create prescription.");
      return;
    }

    setStatusMessage("Prescription created.");
    setForm((prev) => ({ ...prev, dosage: "", frequency: "", duration_days: "7", notes: "", allow_override: false }));
    await loadPrescriptions(form.patient_id);
  }

  async function discontinuePrescription(id: string) {
    const response = await fetch(`/api/prescriptions/${id}/discontinue`, { method: "POST" });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      setStatusMessage(payload?.error?.message ?? "Unable to discontinue prescription.");
      return;
    }

    setStatusMessage("Prescription discontinued.");
    await loadPrescriptions(form.patient_id);
  }

  async function searchMedications(query: string) {
    setSearch(query);
    const response = await fetch(`/api/medications?limit=100&q=${encodeURIComponent(query)}`, { cache: "no-store" });
    const payload = await response.json().catch(() => null);
    const rows = (payload?.data ?? []) as MedicationRow[];
    setMedications(rows);
    if (rows.length > 0 && !rows.some((row) => row.id === form.medication_id)) {
      setForm((prev) => ({ ...prev, medication_id: rows[0].id }));
    }
  }

  return (
    <section className="space-y-6">
      <form className="card space-y-4" onSubmit={createPrescription}>
        <h2 className="text-lg font-semibold text-slate-900">Prescription Generation</h2>
        <p className="text-sm text-slate-600">Generate prescriptions with live drug-interaction warnings.</p>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm text-slate-700">
            Patient
            <select
              className="input mt-1"
              value={form.patient_id}
              onChange={(event) => setForm((prev) => ({ ...prev, patient_id: event.target.value }))}
            >
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>{patient.mrn}</option>
              ))}
            </select>
          </label>

          <label className="text-sm text-slate-700">
            Provider
            <select
              className="input mt-1"
              value={form.provider_id}
              onChange={(event) => setForm((prev) => ({ ...prev, provider_id: event.target.value }))}
            >
              {providers.map((provider) => (
                <option key={provider.id} value={provider.id}>{provider.specialty || provider.user_id}</option>
              ))}
            </select>
          </label>

          <label className="text-sm text-slate-700 md:col-span-2">
            Medication Search
            <input
              className="input mt-1"
              value={search}
              onChange={(event) => searchMedications(event.target.value)}
              placeholder="Search by name or RxNorm code"
            />
          </label>

          <label className="text-sm text-slate-700 md:col-span-2">
            Medication
            <select
              className="input mt-1"
              value={form.medication_id}
              onChange={(event) => setForm((prev) => ({ ...prev, medication_id: event.target.value }))}
            >
              {medications.map((medication) => (
                <option key={medication.id} value={medication.id}>
                  {medication.name} {medication.rxnorm_code ? `(${medication.rxnorm_code})` : ""}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm text-slate-700">
            Dosage
            <input
              className="input mt-1"
              value={form.dosage}
              onChange={(event) => setForm((prev) => ({ ...prev, dosage: event.target.value }))}
              required
            />
          </label>

          <label className="text-sm text-slate-700">
            Frequency
            <input
              className="input mt-1"
              value={form.frequency}
              onChange={(event) => setForm((prev) => ({ ...prev, frequency: event.target.value }))}
              required
            />
          </label>

          <label className="text-sm text-slate-700">
            Duration (days)
            <input
              className="input mt-1"
              type="number"
              min={1}
              value={form.duration_days}
              onChange={(event) => setForm((prev) => ({ ...prev, duration_days: event.target.value }))}
              required
            />
          </label>

          <label className="text-sm text-slate-700 md:col-span-2">
            Notes
            <textarea
              className="input mt-1 min-h-[90px]"
              value={form.notes}
              onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
            />
          </label>

          <label className="flex items-center gap-2 text-sm text-slate-700 md:col-span-2">
            <input
              type="checkbox"
              checked={form.allow_override}
              onChange={(event) => setForm((prev) => ({ ...prev, allow_override: event.target.checked }))}
            />
            Allow override when high-severity warning exists
          </label>
        </div>

        <div className="flex items-center gap-4">
          <button type="submit" className="btn-primary">Create Prescription</button>
          {statusMessage ? <p className="text-sm text-slate-600">{statusMessage}</p> : null}
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-900">Interaction Warnings</h3>
          {warnings.length === 0 ? <p className="text-sm text-slate-500">No interaction warnings.</p> : null}
          {warnings.map((warning, index) => (
            <div key={`${warning.message}-${index}`} className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm">
              <p className="font-semibold text-amber-900">{warning.severity.toUpperCase()} interaction</p>
              <p className="mt-1 text-amber-800">{warning.message}</p>
              <p className="mt-1 text-amber-800">Conflicts with: {warning.conflicting_medication_name}</p>
              {warning.recommendation ? <p className="mt-1 text-amber-800">Recommendation: {warning.recommendation}</p> : null}
            </div>
          ))}
        </div>
      </form>

      <article className="card space-y-3">
        <h3 className="text-base font-semibold text-slate-900">Prescription History</h3>
        {prescriptions.length === 0 ? <p className="text-sm text-slate-500">No prescriptions for selected patient.</p> : null}
        {prescriptions.map((entry) => (
          <div key={entry.id} className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <p className="text-sm font-semibold text-slate-900">{entry.medications?.name || entry.medication_id}</p>
            <p className="mt-1 text-xs text-slate-600">{entry.dosage} | {entry.frequency} | {entry.duration_days} days</p>
            <p className="mt-1 text-xs text-slate-600">Created: {new Date(entry.created_at).toLocaleString()}</p>
            {entry.discontinued_at ? (
              <p className="mt-1 text-xs text-rose-700">Discontinued: {new Date(entry.discontinued_at).toLocaleString()}</p>
            ) : (
              <button className="btn-secondary mt-2" onClick={() => discontinuePrescription(entry.id)}>
                Discontinue
              </button>
            )}
          </div>
        ))}
      </article>
    </section>
  );
}
