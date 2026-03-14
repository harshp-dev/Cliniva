import { AppShell } from "@/components/layout/app-shell";

export default function ProviderLayout({ children }: { children: React.ReactNode }) {
  return <AppShell title="Provider Workspace">{children}</AppShell>;
}
