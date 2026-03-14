import { AppShell } from "@/components/layout/app-shell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AppShell title="Organization Dashboard">{children}</AppShell>;
}
