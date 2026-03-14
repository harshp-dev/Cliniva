import { ProviderDashboard } from "@/components/features/dashboard/provider-dashboard";
import { getProviderDashboardData } from "@/lib/services/dashboards/get-provider-dashboard-data";

export default async function ProviderDashboardPage() {
  const data = await getProviderDashboardData();

  return <ProviderDashboard data={data} />;
}

