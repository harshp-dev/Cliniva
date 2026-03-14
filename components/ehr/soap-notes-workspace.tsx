"use client";

import { useEffect, useState } from "react";

interface ProviderRow {
  id: string;
  specialty: string;
  user_id: string;
}

interface PatientRow {
  id: string;
  mrn: string;
}

interface ClinicalNote {
  id: string;
  patient_id: string;
  note_type: string;
  created_at: string;
  subjective: string | null;
  objective: string | null;
  assessment: string | null;
  plan: string | null;
}

export function SoapNotesWorkspace() {
  const [providers, setProviders] = useState<ProviderRow[]>([]);
  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [notes, setNotes] = useState<ClinicalNote[]>([]);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    patient_id: "",
    provider_id: "",
    appointment_id: "",
    subjective: "",
    objective: "",
    assessment: "",
    plan: ""
  });

  async function loadSeedData() {
    const [providersRes, patientsRes, notesRes] = await Promise.all([
      fetch("/api/providers?limit=100", { cache: "no-store" }),
      fetch("/api/patients?limit=100", { cache: "no-store" }),
      fetch("/api/clinical-notes?limit=20", { cache: "no-store" })
    ]);

    const providersPayload = await providersRes.json().catch(() => null);
    const patientsPayload = await patientsRes.json().catch(() => null);
    const notesPayload = await notesRes.json().catch(() => null);

    const providerRows = (providersPayload?.data ?? []) as ProviderRow[];
    const patientRows = (patientsPayload?.data ?? []) as PatientRow[];

    setProviders(providerRows);
    setPatients(patientRows);
    setNotes((notesPayload?.data ?? []) as ClinicalNote[]);

    if (providerRows.length > 0) {
      setForm((prev) => ({ ...prev, provider_id: prev.provider_id || providerRows[0].id }));
    }
    if (patientRows.length > 0) {
      setForm((prev) => ({ ...prev, patient_id: prev.patient_id || patientRows[0].id }));
    }
  }

  useEffect(() => {
    loadSeedData();
  }, []);

  async function saveNote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("Saving clinical note...");

    const response = await fetch("/api/clinical-notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patient_id: form.patient_id,
        provider_id: form.provider_id,
        appointment_id: form.appointment_id || undefined,
        note_type: "SOAP",
        subjective: form.subjective,
        objective: form.objective,
        assessment: form.assessment,
        plan: form.plan
      })
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      setMessage(payload?.error?.message ?? "Unable to save clinical note.");
      setSaving(false);
      return;
    }

    setMessage("Clinical note saved.");
    setForm((prev) => ({ ...prev, subjective: "", objective: "", assessment: "", plan: "", appointment_id: "" }));

    const notesRes = await fetch("/api/clinical-notes?limit=20", { cache: "no-store" });
    const notesPayload = await notesRes.json().catch(() => null);
    setNotes((notesPayload?.data ?? []) as ClinicalNote[]);
    setSaving(false);
  }

  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <form className="card space-y-4" onSubmit={saveNote}>
        <h2 className="text-lg font-semibold text-slate-900">Provider Notes (SOAP)</h2>
        <p className="text-sm text-slate-600">Capture subjective, objective, assessment, and plan details.</p>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm text-slate-700">
            Patient
            <select
              className="input mt-1"
              value={form.patient_id}
              onChange={(event) => setForm((prev) => ({ ...prev, patient_id: event.target.value }))}
            >
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.mrn}
                </option>
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
                <option key={provider.id} value={provider.id}>
                  {provider.specialty || provider.user_id}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-slate-700 md:col-span-2">
            Appointment ID (optional)
            <input
              className="input mt-1"
              value={form.appointment_id}
              onChange={(event) => setForm((prev) => ({ ...prev, appointment_id: event.target.value }))}
            />
          </label>
          <label className="text-sm text-slate-700 md:col-span-2">
            Subjective
            <textarea
              className="input mt-1 min-h-[90px]"
              value={form.subjective}
              onChange={(event) => setForm((prev) => ({ ...prev, subjective: event.target.value }))}
              required
            />
          </label>
          <label className="text-sm text-slate-700 md:col-span-2">
            Objective
            <textarea
              className="input mt-1 min-h-[90px]"
              value={form.objective}
              onChange={(event) => setForm((prev) => ({ ...prev, objective: event.target.value }))}
            />
          </label>
          <label className="text-sm text-slate-700 md:col-span-2">
            Assessment
            <textarea
              className="input mt-1 min-h-[90px]"
              value={form.assessment}
              onChange={(event) => setForm((prev) => ({ ...prev, assessment: event.target.value }))}
            />
          </label>
          <label className="text-sm text-slate-700 md:col-span-2">
            Plan
            <textarea
              className="input mt-1 min-h-[90px]"
              value={form.plan}
              onChange={(event) => setForm((prev) => ({ ...prev, plan: event.target.value }))}
            />
          </label>
        </div>
        <div className="flex items-center gap-4">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Saving..." : "Save Clinical Notes"}
          </button>
          {message ? <p className="text-sm text-slate-600">{message}</p> : null}
        </div>
      </form>

      <article className="card space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Recent Notes</h2>
        <p className="text-sm text-slate-600">Latest SOAP notes for this organization.</p>
        <div className="space-y-3">
          {notes.length === 0 ? <p className="text-sm text-slate-500">No clinical notes recorded yet.</p> : null}
          {notes.map((note) => (
            <div key={note.id} className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="text-sm font-semibold text-slate-900">{new Date(note.created_at).toLocaleString()}</p>
              <p className="mt-1 text-xs text-slate-600">Type: {note.note_type}</p>
              <p className="mt-2 text-sm text-slate-700">S: {note.subjective || "-"}</p>
              <p className="mt-1 text-sm text-slate-700">A: {note.assessment || "-"}</p>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
