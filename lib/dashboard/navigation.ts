import {
  BellRing,
  CalendarFold,
  CalendarRange,
  ClipboardList,
  FileText,
  LayoutDashboard,
  ShieldCheck,
  Stethoscope,
  UserCog,
  UserRound,
} from "lucide-react";
import type { DashboardShellNavItem } from "@/components/features/dashboard/dashboard-shell";

export function getPatientNavItems(
  upcomingAppointmentsCount: number,
  sharedNotesCount: number,
  unreadNotificationsCount: number,
  completionScore: number
): DashboardShellNavItem[] {
  return [
    {
      label: "Overview",
      href: "/patient/dashboard",
      icon: LayoutDashboard,
      meta: "Workspace summary",
    },
    {
      label: "Appointments",
      href: "/patient/appointments",
      icon: CalendarRange,
      meta: `${upcomingAppointmentsCount} upcoming`,
    },
    {
      label: "Visit notes",
      href: "/patient/records",
      icon: FileText,
      meta: `${sharedNotesCount} shared`,
    },
    {
      label: "Notifications",
      href: "/patient/notifications",
      icon: BellRing,
      meta: `${unreadNotificationsCount} unread`,
    },
    {
      label: "Profile",
      href: "/patient/profile",
      icon: UserRound,
      meta: `${completionScore}% complete`,
    },
  ];
}

export function getProviderNavItems(
  activeQueueCount: number,
  availabilityBlocksCount: number,
  unreadNotificationCount: number,
  specialty: string | null
): DashboardShellNavItem[] {
  return [
    {
      label: "Overview",
      href: "/provider/dashboard",
      icon: LayoutDashboard,
      meta: "Clinical command center",
    },
    {
      label: "Appointments",
      href: "/provider/appointments",
      icon: ClipboardList,
      meta: `${activeQueueCount} active`,
    },
    {
      label: "Availability",
      href: "/provider/availability",
      icon: Stethoscope,
      meta: `${availabilityBlocksCount} blocks`,
    },
    {
      label: "Notifications",
      href: "/provider/notifications",
      icon: BellRing,
      meta: `${unreadNotificationCount} unread`,
    },
    {
      label: "Profile",
      href: "/provider/profile",
      icon: UserRound,
      meta: specialty ?? "Profile setup",
    },
  ];
}

export function getAdminNavItems(
  upcomingAppointmentsCount: number,
  auditEventCount: number,
  providerCount: number
): DashboardShellNavItem[] {
  return [
    {
      label: "Overview",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
      meta: "Operations board",
    },
    {
      label: "Operations",
      href: "/admin/operations",
      icon: CalendarFold,
      meta: `${upcomingAppointmentsCount} upcoming`,
    },
    {
      label: "Audit stream",
      href: "/admin/audit",
      icon: ShieldCheck,
      meta: `${auditEventCount} events`,
    },
    {
      label: "Provider roster",
      href: "/admin/providers",
      icon: UserCog,
      meta: `${providerCount} listed`,
    },
  ];
}
