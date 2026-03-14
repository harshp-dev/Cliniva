"use client";

import { useState } from "react";

interface FormState {
  mrn: string;
  date_of_birth: string;
  phone: string;
  emergency_name: string;
  emergency_phone: string;
}

const initialState: FormState = {
  mrn: "",
  date_of_birth: "",
  phone: "",
  emergency_name: "",
  emergency_phone: ""
};

export function PatientOnboardingForm({
  onCreated
}: {
  onCreated?: (patient: {
    id: string;
    mrn: string;
    date_of_birth: string | null;
    phone: string | null;
    created_at: string;
  }) => void;
}) {
  const [state, setState] = useState<FormState>(initialState);
  const [message, setMessage] = useState<string>("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Saving patient profile...");

    const response = await fetch("/api/patients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mrn: state.mrn,
        date_of_birth: state.date_of_birth,
        phone: state.phone,
        emergency_contact: {
          name: state.emergency_name,
          phone: state.emergency_phone
        }
      })
    });

    if (response.ok) {
      const payload = await response.json();
      setState(initialState);
      setMessage("Patient onboarded successfully.");
      onCreated?.(payload.data);
    } else {
      const payload = await response.json().catch(() => null);
      setMessage(payload?.error?.message ?? "Unable to onboard patient. Verify auth and required fields.");
    }
  }

  return (
    <form className="card space-y-4" onSubmit={onSubmit}>
      <h2 className="text-lg font-semibold text-slate-900">Patient Onboarding</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm text-slate-700">
          MRN
          <input className="input mt-1" value={state.mrn} onChange={(e) => setState((s) => ({ ...s, mrn: e.target.value }))} required />
        </label>
        <label className="text-sm text-slate-700">
          Date of Birth
          <input type="date" className="input mt-1" value={state.date_of_birth} onChange={(e) => setState((s) => ({ ...s, date_of_birth: e.target.value }))} required />
        </label>
        <label className="text-sm text-slate-700">
          Phone
          <input className="input mt-1" value={state.phone} onChange={(e) => setState((s) => ({ ...s, phone: e.target.value }))} required />
        </label>
        <label className="text-sm text-slate-700">
          Emergency Contact Name
          <input className="input mt-1" value={state.emergency_name} onChange={(e) => setState((s) => ({ ...s, emergency_name: e.target.value }))} required />
        </label>
        <label className="text-sm text-slate-700 md:col-span-2">
          Emergency Contact Phone
          <input className="input mt-1" value={state.emergency_phone} onChange={(e) => setState((s) => ({ ...s, emergency_phone: e.target.value }))} required />
        </label>
      </div>
      <div className="flex items-center gap-4">
        <button type="submit" className="btn-primary">Create Patient</button>
        {message ? <p className="text-sm text-slate-600">{message}</p> : null}
      </div>
    </form>
  );
}
