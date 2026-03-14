import type { UserRole } from "@/types/domain/auth";

export type DashboardUser = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: UserRole;
};

export type DashboardNotification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  isRead: boolean;
  createdAt: string;
};

export type PatientDashboardAppointment = {
  id: string;
  providerName: string;
  providerSpecialty: string | null;
  status: string;
  startAt: string;
  endAt: string;
  reason: string | null;
};

export type PatientVisitNote = {
  id: string;
  providerName: string;
  assessment: string | null;
  plan: string | null;
  createdAt: string;
};

export type PatientDashboardData = {
  user: DashboardUser;
  completionScore: number;
  upcomingAppointmentsCount: number;
  sharedNotesCount: number;
  unreadNotificationsCount: number;
  nextAppointment: PatientDashboardAppointment | null;
  upcomingAppointments: PatientDashboardAppointment[];
  recentNotes: PatientVisitNote[];
  notifications: DashboardNotification[];
};

export type ProviderDashboardAppointment = {
  id: string;
  patientName: string;
  status: string;
  startAt: string;
  endAt: string;
  reason: string | null;
};

export type ProviderDashboardNote = {
  id: string;
  patientName: string;
  assessment: string | null;
  plan: string | null;
  createdAt: string;
  isSharedWithPatient: boolean;
};

export type ProviderAvailabilityBlock = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  timezone: string;
};

export type ProviderDashboardData = {
  user: DashboardUser;
  specialty: string | null;
  licenseNumber: string | null;
  yearsExperience: number | null;
  todayAppointmentsCount: number;
  activeQueueCount: number;
  notesCreatedCount: number;
  availabilityBlocksCount: number;
  unreadNotificationsCount: number;
  upcomingAppointments: ProviderDashboardAppointment[];
  recentNotes: ProviderDashboardNote[];
  availability: ProviderAvailabilityBlock[];
  notifications: DashboardNotification[];
};

export type AdminDashboardAppointment = {
  id: string;
  patientUserId: string;
  providerUserId: string;
  patientName: string;
  providerName: string;
  status: string;
  startAt: string;
  endAt: string;
  reason: string | null;
};

export type AdminAuditEvent = {
  id: string;
  action: string;
  entityType: string;
  actorUserId: string | null;
  actorName: string | null;
  createdAt: string;
};

export type AdminProviderSummary = {
  id: string;
  userId: string;
  fullName: string;
  email: string | null;
  specialty: string | null;
  yearsExperience: number | null;
  licenseNumber: string | null;
};

export type AdminDashboardData = {
  user: DashboardUser;
  totalUsersCount: number;
  providersCount: number;
  patientsCount: number;
  upcomingAppointmentsCount: number;
  recentAppointments: AdminDashboardAppointment[];
  recentAuditEvents: AdminAuditEvent[];
  providerRoster: AdminProviderSummary[];
};
