export type AppRole = "admin" | "provider" | "staff" | "patient";

export interface BaseEntity {
  id: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface Organization extends BaseEntity {
  name: string;
  slug: string;
  metadata: Record<string, unknown> | null;
}

export interface UserProfile extends BaseEntity {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: AppRole;
  is_active: boolean;
}

export interface Patient extends BaseEntity {
  user_id: string | null;
  mrn: string;
  date_of_birth: string | null;
  phone: string | null;
  emergency_contact: Record<string, unknown> | null;
}

export interface Provider extends BaseEntity {
  user_id: string;
  npi_number: string;
  specialty: string;
  availability: Record<string, unknown>;
}

export interface Appointment extends BaseEntity {
  patient_id: string;
  provider_id: string;
  starts_at: string;
  ends_at: string;
  status: "scheduled" | "completed" | "cancelled" | "no_show";
  meeting_room: string | null;
}
