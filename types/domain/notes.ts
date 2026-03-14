export type SoapNoteRecord = {
  id: string;
  appointmentId: string;
  patientUserId: string;
  providerUserId: string;
  subjective: string | null;
  objective: string | null;
  assessment: string | null;
  plan: string | null;
  isSharedWithPatient: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SharedSoapNoteRecord = SoapNoteRecord & {
  providerName: string;
  appointmentStartAt: string;
  appointmentEndAt: string;
  appointmentReason: string | null;
};

export type SoapNoteFormValues = {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  isSharedWithPatient: boolean;
};
