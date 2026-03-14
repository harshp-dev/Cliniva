"use client";

import { useEffect, useMemo, useState } from "react";
import { PatientOnboardingForm } from "@/components/forms/patient-onboarding-form";

interface PatientSummary {
  id: string;
  mrn: string;
  date_of_birth: string | null;
  phone: string | null;
  created_at: string;
}

interface PatientDocument {
  id: string;
  file_path: string;
  file_type: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
  signed_url?: string | null;
}

interface PatientDetail extends PatientSummary {
  user_id: string | null;
  insurance_plan_id: string | null;
  emergency_contact: { name?: string; phone?: string } | null;
  documents: PatientDocument[];
}

interface ProfileState {
  mrn: string;
  date_of_birth: string;
  phone: string;
  insurance_plan_id: string;
  emergency_name: string;
  emergency_phone: string;
}

const INITIAL_PROFILE: ProfileState = {
  mrn: "",
  date_of_birth: "",
  phone: "",
  insurance_plan_id: "",
  emergency_name: "",
  emergency_phone: ""
};

export function PatientManagementWorkspace() {
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [detail, setDetail] = useState<PatientDetail | null>(null);
  const [profile, setProfile] = useState<ProfileState>(INITIAL_PROFILE);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [documentType, setDocumentType] = useState("consent_form");
  const [documentDescription, setDocumentDescription] = useState("");
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  const selectedPatient = useMemo(
    () => patients.find((entry) => entry.id === selectedId) ?? null,
    [patients, selectedId]
  );

  async function loadPatients(preferredPatientId?: string) {
    setLoadingPatients(true);
    const response = await fetch("/api/patients?limit=100", { cache: "no-store" });
    const payload = await response.json().catch(() => null);
    const rows = (payload?.data ?? []) as PatientSummary[];
    setPatients(rows);
    setLoadingPatients(false);

    if (rows.length === 0) {
      setSelectedId("");
      return;
    }

    const targetId =
      preferredPatientId && rows.some((row) => row.id === preferredPatientId)
        ? preferredPatientId
        : selectedId && rows.some((row) => row.id === selectedId)
          ? selectedId
          : rows[0].id;
    setSelectedId(targetId);
  }

  async function loadPatientDetail(patientId: string) {
    if (!patientId) {
      return;
    }

    setLoadingDetail(true);
    const response = await fetch(`/api/patients/${patientId}`, { cache: "no-store" });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.data) {
      setDetail(null);
      setLoadingDetail(false);
      return;
    }

    const data = payload.data as PatientDetail;
    setDetail(data);
    setProfile({
      mrn: data.mrn ?? "",
      date_of_birth: data.date_of_birth ?? "",
      phone: data.phone ?? "",
      insurance_plan_id: data.insurance_plan_id ?? "",
      emergency_name: data.emergency_contact?.name ?? "",
      emergency_phone: data.emergency_contact?.phone ?? ""
    });
    setLoadingDetail(false);
  }

  useEffect(() => {
    loadPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedId) {
      loadPatientDetail(selectedId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  async function handleProfileSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedId) {
      return;
    }

    setSavingProfile(true);
    setSaveMessage("Saving patient profile...");

    const emergencyContact =
      profile.emergency_name.trim() || profile.emergency_phone.trim()
        ? {
            name: profile.emergency_name.trim(),
            phone: profile.emergency_phone.trim()
          }
        : null;

    const response = await fetch(`/api/patients/${selectedId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mrn: profile.mrn.trim(),
        date_of_birth: profile.date_of_birth || null,
        phone: profile.phone || null,
        insurance_plan_id: profile.insurance_plan_id || null,
        emergency_contact: emergencyContact
      })
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      setSaveMessage(payload?.error?.message ?? "Unable to update patient profile.");
      setSavingProfile(false);
      return;
    }

    setSaveMessage("Patient profile updated.");
    await loadPatients(selectedId);
    await loadPatientDetail(selectedId);
    setSavingProfile(false);
  }

  async function handleDocumentUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedId || !documentFile) {
      setUploadMessage("Select a patient and file first.");
      return;
    }

    setUploadingDocument(true);
    setUploadMessage("Uploading document...");

    const formData = new FormData();
    formData.append("file", documentFile);
    formData.append("document_type", documentType);
    formData.append("description", documentDescription);

    const response = await fetch(`/api/patients/${selectedId}/documents`, {
      method: "POST",
      body: formData
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      setUploadMessage(payload?.error?.message ?? "Upload failed.");
      setUploadingDocument(false);
      return;
    }

    setUploadMessage("Document uploaded.");
    setDocumentDescription("");
    setDocumentFile(null);
    await loadPatientDetail(selectedId);
    setUploadingDocument(false);
  }

  return (
    <section className="space-y-6">
      <PatientOnboardingForm
        onCreated={async (patient) => {
          await loadPatients(patient.id);
          await loadPatientDetail(patient.id);
        }}
      />

      <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
        <article className="card">
          <h2 className="text-lg font-semibold text-slate-900">Patient Directory</h2>
          <p className="mt-1 text-sm text-slate-600">Select a patient to review profile and documents.</p>
          <div className="mt-4 max-h-[520px] space-y-2 overflow-y-auto">
            {loadingPatients ? <p className="text-sm text-slate-500">Loading patients...</p> : null}
            {!loadingPatients && patients.length === 0 ? (
              <p className="text-sm text-slate-500">No patients yet. Use onboarding form to create one.</p>
            ) : null}
            {patients.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => setSelectedId(entry.id)}
                className={`w-full rounded-md border p-3 text-left ${
                  selectedId === entry.id
                    ? "border-sky-700 bg-sky-50"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <p className="text-sm font-semibold text-slate-900">MRN: {entry.mrn}</p>
                <p className="mt-1 text-xs text-slate-600">
                  DOB: {entry.date_of_birth ?? "N/A"} | Phone: {entry.phone ?? "N/A"}
                </p>
              </button>
            ))}
          </div>
        </article>

        <div className="space-y-6">
          <form className="card space-y-4" onSubmit={handleProfileSave}>
            <h2 className="text-lg font-semibold text-slate-900">Patient Profile</h2>
            {!selectedPatient ? <p className="text-sm text-slate-600">Select a patient from the directory.</p> : null}
            {loadingDetail ? <p className="text-sm text-slate-500">Loading profile...</p> : null}
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm text-slate-700">
                MRN
                <input
                  className="input mt-1"
                  value={profile.mrn}
                  onChange={(event) => setProfile((prev) => ({ ...prev, mrn: event.target.value }))}
                  disabled={!selectedPatient || loadingDetail}
                />
              </label>
              <label className="text-sm text-slate-700">
                Date of Birth
                <input
                  type="date"
                  className="input mt-1"
                  value={profile.date_of_birth}
                  onChange={(event) => setProfile((prev) => ({ ...prev, date_of_birth: event.target.value }))}
                  disabled={!selectedPatient || loadingDetail}
                />
              </label>
              <label className="text-sm text-slate-700">
                Phone
                <input
                  className="input mt-1"
                  value={profile.phone}
                  onChange={(event) => setProfile((prev) => ({ ...prev, phone: event.target.value }))}
                  disabled={!selectedPatient || loadingDetail}
                />
              </label>
              <label className="text-sm text-slate-700">
                Insurance Plan ID
                <input
                  className="input mt-1"
                  value={profile.insurance_plan_id}
                  onChange={(event) => setProfile((prev) => ({ ...prev, insurance_plan_id: event.target.value }))}
                  disabled={!selectedPatient || loadingDetail}
                />
              </label>
              <label className="text-sm text-slate-700">
                Emergency Contact Name
                <input
                  className="input mt-1"
                  value={profile.emergency_name}
                  onChange={(event) => setProfile((prev) => ({ ...prev, emergency_name: event.target.value }))}
                  disabled={!selectedPatient || loadingDetail}
                />
              </label>
              <label className="text-sm text-slate-700">
                Emergency Contact Phone
                <input
                  className="input mt-1"
                  value={profile.emergency_phone}
                  onChange={(event) => setProfile((prev) => ({ ...prev, emergency_phone: event.target.value }))}
                  disabled={!selectedPatient || loadingDetail}
                />
              </label>
            </div>
            <div className="flex items-center gap-4">
              <button type="submit" className="btn-primary" disabled={!selectedPatient || savingProfile || loadingDetail}>
                {savingProfile ? "Saving..." : "Update Profile"}
              </button>
              {saveMessage ? <p className="text-sm text-slate-600">{saveMessage}</p> : null}
            </div>
          </form>

          <form className="card space-y-4" onSubmit={handleDocumentUpload}>
            <h2 className="text-lg font-semibold text-slate-900">Patient Documents</h2>
            <p className="text-sm text-slate-600">Upload consent forms, referrals, and clinical attachments.</p>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm text-slate-700">
                Document Type
                <input
                  className="input mt-1"
                  value={documentType}
                  onChange={(event) => setDocumentType(event.target.value)}
                  disabled={!selectedPatient || loadingDetail}
                />
              </label>
              <label className="text-sm text-slate-700">
                Description
                <input
                  className="input mt-1"
                  value={documentDescription}
                  onChange={(event) => setDocumentDescription(event.target.value)}
                  disabled={!selectedPatient || loadingDetail}
                />
              </label>
              <label className="text-sm text-slate-700 md:col-span-2">
                File
                <input
                  type="file"
                  className="input mt-1"
                  onChange={(event) => setDocumentFile(event.target.files?.[0] ?? null)}
                  disabled={!selectedPatient || loadingDetail}
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
                />
              </label>
            </div>
            <div className="flex items-center gap-4">
              <button type="submit" className="btn-primary" disabled={!selectedPatient || uploadingDocument || loadingDetail}>
                {uploadingDocument ? "Uploading..." : "Upload Document"}
              </button>
              {uploadMessage ? <p className="text-sm text-slate-600">{uploadMessage}</p> : null}
            </div>
            <div className="space-y-2">
              {(detail?.documents ?? []).length === 0 ? (
                <p className="text-sm text-slate-500">No uploaded documents.</p>
              ) : (
                (detail?.documents ?? []).map((doc) => (
                  <div key={doc.id} className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">
                    <p className="font-medium text-slate-900">
                      {(doc.metadata?.["document_type"] as string | undefined) ?? "document"}
                    </p>
                    <p className="mt-1 text-slate-600">{doc.file_type}</p>
                    {doc.signed_url ? (
                      <a className="mt-2 inline-block text-sky-700 underline" href={doc.signed_url} target="_blank" rel="noreferrer">
                        Open file
                      </a>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
