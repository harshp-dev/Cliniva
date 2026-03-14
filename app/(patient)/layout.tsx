import { AppShell } from "@/components/layout/app-shell";

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return <AppShell title="Patient Portal">{children}</AppShell>;
}
