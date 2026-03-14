"use client";

import { useEffect, useMemo, useState } from "react";

interface Provider {
  id: string;
  specialty: string;
  user_id: string;
}

interface Patient {
  id: string;
  mrn: string;
}

interface Appointment {
  id: string;
  patient_id: string;
  provider_id: string;
  starts_at: string;
  ends_at: string;
  status: string;
  reason?: string | null;
}

export function AppointmentsWorkspace() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState("");
  const [availabilityJson, setAvailabilityJson] = useState('{\n  "timezone": "UTC",\n  "weekly": {},\n  "exceptions": []\n}');
  const [availabilityMessage, setAvailabilityMessage] = useState("");
  const [bookingMessage, setBookingMessage] = useState("");
  const [calendarMessage, setCalendarMessage] = useState("");
  const [booking, setBooking] = useState({
    patient_id: "",
    provider_id: "",
    starts_at: "",
    ends_at: "",
    reason: ""
  });

  const patientLabelMap = useMemo(
    () => new Map(patients.map((item) => [item.id, item.mrn])),
    [patients]
  );
  const providerLabelMap = useMemo(
    () => new Map(providers.map((item) => [item.id, item.specialty || item.user_id])),
    [providers]
  );

  async function loadSeedData() {
    const [providersRes, patientsRes, calendarRes] = await Promise.all([
      fetch("/api/providers?limit=100", { cache: "no-store" }),
      fetch("/api/patients?limit=100", { cache: "no-store" }),
      fetch("/api/appointments/calendar", { cache: "no-store" })
    ]);

    const providersPayload = await providersRes.json().catch(() => null);
    const patientsPayload = await patientsRes.json().catch(() => null);
    const calendarPayload = await calendarRes.json().catch(() => null);

    const providerRows = (providersPayload?.data ?? []) as Provider[];
    const patientRows = (patientsPayload?.data ?? []) as Patient[];
    const appointmentRows = (calendarPayload?.data?.appointments ?? []) as Appointment[];

    setProviders(providerRows);
    setPatients(patientRows);
    setAppointments(appointmentRows);

    if (providerRows.length > 0) {
      setSelectedProviderId(providerRows[0].id);
      setBooking((prev) => ({ ...prev, provider_id: providerRows[0].id }));
    }
    if (patientRows.length > 0) {
      setBooking((prev) => ({ ...prev, patient_id: patientRows[0].id }));
    }

    if (!providersRes.ok || !patientsRes.ok || !calendarRes.ok) {
      setCalendarMessage("Some resources failed to load due to role restrictions.");
    }
  }

  async function loadProviderAvailability(providerId: string) {
    if (!providerId) {
      return;
    }

    const response = await fetch(`/api/providers/${providerId}/availability`, { cache: "no-store" });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      setAvailabilityMessage(payload?.error?.message ?? "Unable to load availability");
      return;
    }

    setAvailabilityJson(JSON.stringify(payload.data.availability ?? {}, null, 2));
    setAvailabilityMessage("");
  }

  useEffect(() => {
    loadSeedData();
  }, []);

  useEffect(() => {
    if (selectedProviderId) {
      loadProviderAvailability(selectedProviderId);
    }
  }, [selectedProviderId]);

  async function saveAvailability(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedProviderId) {
      return;
    }

    let parsedAvailability: unknown;
    try {
      parsedAvailability = JSON.parse(availabilityJson);
    } catch {
      setAvailabilityMessage("Availability must be valid JSON.");
      return;
    }

    setAvailabilityMessage("Saving availability...");
    const response = await fetch(`/api/providers/${selectedProviderId}/availability`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ availability: parsedAvailability })
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      setAvailabilityMessage(payload?.error?.message ?? "Unable to save availability.");
      return;
    }

    setAvailabilityJson(JSON.stringify(payload.data.availability ?? {}, null, 2));
    setAvailabilityMessage("Availability updated.");
  }

  async function createAppointment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setBookingMessage("Scheduling appointment...");
    const response = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patient_id: booking.patient_id,
        provider_id: booking.provider_id,
        starts_at: new Date(booking.starts_at).toISOString(),
        ends_at: new Date(booking.ends_at).toISOString(),
        reason: booking.reason,
        status: "scheduled",
        meeting_room: `room-${Date.now()}`
      })
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      setBookingMessage(payload?.error?.message ?? "Unable to schedule appointment.");
      return;
    }

    setBookingMessage("Appointment scheduled.");
    setBooking((prev) => ({ ...prev, reason: "", starts_at: "", ends_at: "" }));

    const refresh = await fetch("/api/appointments/calendar", { cache: "no-store" });
    const refreshPayload = await refresh.json().catch(() => null);
    setAppointments((refreshPayload?.data?.appointments ?? []) as Appointment[]);
  }

  async function sendReminder(appointmentId: string) {
    setCalendarMessage("Sending reminder...");
    const response = await fetch(`/api/appointments/${appointmentId}/reminders`, { method: "POST" });
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      setCalendarMessage(payload?.error?.message ?? "Unable to send reminder.");
      return;
    }

    setCalendarMessage(`Reminder sent to ${payload.data.reminders_created} recipient(s).`);
  }

  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <form className="card space-y-3" onSubmit={saveAvailability}>
        <h2 className="text-lg font-semibold text-slate-900">Provider Availability</h2>
        <p className="text-sm text-slate-600">Persist weekly schedule blocks to provider profile.</p>
        <label className="text-sm text-slate-700">
          Provider
          <select
            className="input mt-1"
            value={selectedProviderId}
            onChange={(event) => setSelectedProviderId(event.target.value)}
          >
            {providers.map((provider) => (
              <option key={provider.id} value={provider.id}>
                {provider.specialty || provider.user_id}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-slate-700">
          Availability JSON
          <textarea
            className="input mt-1 min-h-[220px] font-mono text-xs"
            value={availabilityJson}
            onChange={(event) => setAvailabilityJson(event.target.value)}
          />
        </label>
        <div className="flex items-center gap-4">
          <button className="btn-primary" type="submit">
            Save Availability
          </button>
          {availabilityMessage ? <p className="text-sm text-slate-600">{availabilityMessage}</p> : null}
        </div>
      </form>

      <form className="card space-y-3" onSubmit={createAppointment}>
        <h2 className="text-lg font-semibold text-slate-900">Book Appointment</h2>
        <p className="text-sm text-slate-600">Create appointments using API-backed scheduling.</p>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm text-slate-700">
            Patient
            <select
              className="input mt-1"
              value={booking.patient_id}
              onChange={(event) => setBooking((prev) => ({ ...prev, patient_id: event.target.value }))}
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
              value={booking.provider_id}
              onChange={(event) => setBooking((prev) => ({ ...prev, provider_id: event.target.value }))}
            >
              {providers.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.specialty || provider.user_id}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-slate-700">
            Starts At
            <input
              className="input mt-1"
              type="datetime-local"
              value={booking.starts_at}
              onChange={(event) => setBooking((prev) => ({ ...prev, starts_at: event.target.value }))}
              required
            />
          </label>
          <label className="text-sm text-slate-700">
            Ends At
            <input
              className="input mt-1"
              type="datetime-local"
              value={booking.ends_at}
              onChange={(event) => setBooking((prev) => ({ ...prev, ends_at: event.target.value }))}
              required
            />
          </label>
          <label className="text-sm text-slate-700 md:col-span-2">
            Reason
            <input
              className="input mt-1"
              value={booking.reason}
              onChange={(event) => setBooking((prev) => ({ ...prev, reason: event.target.value }))}
            />
          </label>
        </div>
        <div className="flex items-center gap-4">
          <button className="btn-primary" type="submit">
            Schedule
          </button>
          {bookingMessage ? <p className="text-sm text-slate-600">{bookingMessage}</p> : null}
        </div>
      </form>

      <article className="card lg:col-span-2">
        <h2 className="text-lg font-semibold text-slate-900">Calendar View</h2>
        <p className="mt-1 text-sm text-slate-600">Upcoming appointment feed with reminder trigger.</p>
        <div className="mt-4 space-y-3">
          {appointments.length === 0 ? <p className="text-sm text-slate-500">No appointments scheduled.</p> : null}
          {appointments.map((item) => (
            <div key={item.id} className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="text-sm font-semibold text-slate-900">
                {new Date(item.starts_at).toLocaleString()} - {new Date(item.ends_at).toLocaleTimeString()}
              </p>
              <p className="mt-1 text-xs text-slate-600">
                Patient: {patientLabelMap.get(item.patient_id) ?? item.patient_id} | Provider: {providerLabelMap.get(item.provider_id) ?? item.provider_id}
              </p>
              <p className="mt-1 text-xs text-slate-600">Status: {item.status}</p>
              <button className="btn-secondary mt-2" onClick={() => sendReminder(item.id)}>
                Send Reminder
              </button>
            </div>
          ))}
        </div>
        {calendarMessage ? <p className="mt-3 text-sm text-slate-600">{calendarMessage}</p> : null}
      </article>
    </section>
  );
}
