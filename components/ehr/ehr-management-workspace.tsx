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

interface Diagnosis {
  id: string;
  patient_id: string;
  icd10_code: string | null;
  description: string;
  status: string | null;
  diagnosed_at: string;
}

interface CarePlan {
  id: string;
  patient_id: string;
  goal: string;
  interventions: string | null;
  status: string;
  target_date: string | null;
}

export function EhrManagementWorkspace() {
  const [providers, setProviders] = useState<ProviderRow[]>([]);
  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [carePlans, setCarePlans] = useState<CarePlan[]>([]);
  const [diagnosisMessage, setDiagnosisMessage] = useState("");
  const [carePlanMessage, setCarePlanMessage] = useState("");
  const [diagnosisForm, setDiagnosisForm] = useState({
    patient_id: "",
    provider_id: "",
    icd10_code: "",
    description: "",
    status: "active"
  });
  const [carePlanForm, setCarePlanForm] = useState({
    patient_id: "",
    provider_id: "",
    goal: "",
    interventions: "",
    status: "active",
    target_date: ""
  });

  async function loadData() {
    const [providersRes, patientsRes, diagnosisRes, carePlanRes] = await Promise.all([
      fetch("/api/providers?limit=100", { cache: "no-store" }),
      fetch("/api/patients?limit=100", { cache: "no-store" }),
      fetch("/api/diagnoses?limit=20", { cache: "no-store" }),
      fetch("/api/care-plans?limit=20", { cache: "no-store" })
    ]);

    const providersPayload = await providersRes.json().catch(() => null);
    const patientsPayload = await patientsRes.json().catch(() => null);
    const diagnosisPayload = await diagnosisRes.json().catch(() => null);
    const carePlanPayload = await carePlanRes.json().catch(() => null);

    const providerRows = (providersPayload?.data ?? []) as ProviderRow[];
    const patientRows = (patientsPayload?.data ?? []) as PatientRow[];

    setProviders(providerRows);
    setPatients(patientRows);
    setDiagnoses((diagnosisPayload?.data ?? []) as Diagnosis[]);
    setCarePlans((carePlanPayload?.data ?? []) as CarePlan[]);

    if (providerRows.length > 0) {
      setDiagnosisForm((prev) => ({ ...prev, provider_id: prev.provider_id || providerRows[0].id }));
      setCarePlanForm((prev) => ({ ...prev, provider_id: prev.provider_id || providerRows[0].id }));
    }
    if (patientRows.length > 0) {
      setDiagnosisForm((prev) => ({ ...prev, patient_id: prev.patient_id || patientRows[0].id }));
      setCarePlanForm((prev) => ({ ...prev, patient_id: prev.patient_id || patientRows[0].id }));
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function createDiagnosis(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDiagnosisMessage("Saving diagnosis...");

    const response = await fetch("/api/diagnoses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(diagnosisForm)
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      setDiagnosisMessage(payload?.error?.message ?? "Unable to save diagnosis.");
      return;
    }

    setDiagnosisMessage("Diagnosis recorded.");
    setDiagnosisForm((prev) => ({ ...prev, icd10_code: "", description: "" }));
    const diagnosisRes = await fetch("/api/diagnoses?limit=20", { cache: "no-store" });
    const diagnosisPayload = await diagnosisRes.json().catch(() => null);
    setDiagnoses((diagnosisPayload?.data ?? []) as Diagnosis[]);
  }

  async function updateDiagnosisStatus(id: string, status: string) {
    const response = await fetch(`/api/diagnoses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });

    if (response.ok) {
      setDiagnoses((prev) => prev.map((entry) => (entry.id === id ? { ...entry, status } : entry)));
    }
  }

  async function createCarePlan(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCarePlanMessage("Saving care plan...");

    const response = await fetch("/api/care-plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...carePlanForm,
        target_date: carePlanForm.target_date || undefined
      })
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      setCarePlanMessage(payload?.error?.message ?? "Unable to save care plan.");
      return;
    }

    setCarePlanMessage("Care plan recorded.");
    setCarePlanForm((prev) => ({ ...prev, goal: "", interventions: "", target_date: "" }));
    const carePlanRes = await fetch("/api/care-plans?limit=20", { cache: "no-store" });
    const carePlanPayload = await carePlanRes.json().catch(() => null);
    setCarePlans((carePlanPayload?.data ?? []) as CarePlan[]);
  }

  async function updateCarePlanStatus(id: string, status: string) {
    const response = await fetch(`/api/care-plans/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });

    if (response.ok) {
      setCarePlans((prev) => prev.map((entry) => (entry.id === id ? { ...entry, status } : entry)));
    }
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <form className="card space-y-3" onSubmit={createDiagnosis}>
          <h2 className="text-lg font-semibold text-slate-900">Diagnosis Tracking</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm text-slate-700">
              Patient
              <select
                className="input mt-1"
                value={diagnosisForm.patient_id}
                onChange={(event) => setDiagnosisForm((prev) => ({ ...prev, patient_id: event.target.value }))}
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
                value={diagnosisForm.provider_id}
                onChange={(event) => setDiagnosisForm((prev) => ({ ...prev, provider_id: event.target.value }))}
              >
                {providers.map((provider) => (
                  <option key={provider.id} value={provider.id}>{provider.specialty || provider.user_id}</option>
                ))}
              </select>
            </label>
            <label className="text-sm text-slate-700">
              ICD-10 Code
              <input
                className="input mt-1"
                value={diagnosisForm.icd10_code}
                onChange={(event) => setDiagnosisForm((prev) => ({ ...prev, icd10_code: event.target.value }))}
              />
            </label>
            <label className="text-sm text-slate-700">
              Status
              <input
                className="input mt-1"
                value={diagnosisForm.status}
                onChange={(event) => setDiagnosisForm((prev) => ({ ...prev, status: event.target.value }))}
              />
            </label>
            <label className="text-sm text-slate-700 md:col-span-2">
              Description
              <textarea
                className="input mt-1 min-h-[90px]"
                value={diagnosisForm.description}
                onChange={(event) => setDiagnosisForm((prev) => ({ ...prev, description: event.target.value }))}
                required
              />
            </label>
          </div>
          <div className="flex items-center gap-4">
            <button className="btn-primary" type="submit">Add Diagnosis</button>
            {diagnosisMessage ? <p className="text-sm text-slate-600">{diagnosisMessage}</p> : null}
          </div>
        </form>

        <form className="card space-y-3" onSubmit={createCarePlan}>
          <h2 className="text-lg font-semibold text-slate-900">Treatment Plans</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm text-slate-700">
              Patient
              <select
                className="input mt-1"
                value={carePlanForm.patient_id}
                onChange={(event) => setCarePlanForm((prev) => ({ ...prev, patient_id: event.target.value }))}
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
                value={carePlanForm.provider_id}
                onChange={(event) => setCarePlanForm((prev) => ({ ...prev, provider_id: event.target.value }))}
              >
                {providers.map((provider) => (
                  <option key={provider.id} value={provider.id}>{provider.specialty || provider.user_id}</option>
                ))}
              </select>
            </label>
            <label className="text-sm text-slate-700 md:col-span-2">
              Goal
              <textarea
                className="input mt-1 min-h-[90px]"
                value={carePlanForm.goal}
                onChange={(event) => setCarePlanForm((prev) => ({ ...prev, goal: event.target.value }))}
                required
              />
            </label>
            <label className="text-sm text-slate-700 md:col-span-2">
              Interventions
              <textarea
                className="input mt-1 min-h-[90px]"
                value={carePlanForm.interventions}
                onChange={(event) => setCarePlanForm((prev) => ({ ...prev, interventions: event.target.value }))}
              />
            </label>
            <label className="text-sm text-slate-700">
              Status
              <input
                className="input mt-1"
                value={carePlanForm.status}
                onChange={(event) => setCarePlanForm((prev) => ({ ...prev, status: event.target.value }))}
              />
            </label>
            <label className="text-sm text-slate-700">
              Target Date
              <input
                className="input mt-1"
                type="date"
                value={carePlanForm.target_date}
                onChange={(event) => setCarePlanForm((prev) => ({ ...prev, target_date: event.target.value }))}
              />
            </label>
          </div>
          <div className="flex items-center gap-4">
            <button className="btn-primary" type="submit">Add Care Plan</button>
            {carePlanMessage ? <p className="text-sm text-slate-600">{carePlanMessage}</p> : null}
          </div>
        </form>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <article className="card space-y-3">
          <h3 className="text-base font-semibold text-slate-900">Recent Diagnoses</h3>
          <div className="space-y-2">
            {diagnoses.length === 0 ? <p className="text-sm text-slate-500">No diagnoses yet.</p> : null}
            {diagnoses.map((entry) => (
              <div key={entry.id} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <p className="text-sm font-semibold text-slate-900">{entry.description}</p>
                <p className="mt-1 text-xs text-slate-600">ICD-10: {entry.icd10_code || "N/A"}</p>
                <label className="mt-2 block text-xs text-slate-700">
                  Status
                  <select
                    className="input mt-1"
                    value={entry.status || "active"}
                    onChange={(event) => updateDiagnosisStatus(entry.id, event.target.value)}
                  >
                    <option value="active">active</option>
                    <option value="resolved">resolved</option>
                    <option value="monitoring">monitoring</option>
                  </select>
                </label>
              </div>
            ))}
          </div>
        </article>

        <article className="card space-y-3">
          <h3 className="text-base font-semibold text-slate-900">Recent Care Plans</h3>
          <div className="space-y-2">
            {carePlans.length === 0 ? <p className="text-sm text-slate-500">No care plans yet.</p> : null}
            {carePlans.map((entry) => (
              <div key={entry.id} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <p className="text-sm font-semibold text-slate-900">{entry.goal}</p>
                <p className="mt-1 text-xs text-slate-600">Target: {entry.target_date || "N/A"}</p>
                <label className="mt-2 block text-xs text-slate-700">
                  Status
                  <select
                    className="input mt-1"
                    value={entry.status}
                    onChange={(event) => updateCarePlanStatus(entry.id, event.target.value)}
                  >
                    <option value="active">active</option>
                    <option value="paused">paused</option>
                    <option value="completed">completed</option>
                  </select>
                </label>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
