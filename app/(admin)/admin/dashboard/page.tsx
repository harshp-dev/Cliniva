import { AdminDashboard } from "@/components/features/dashboard/admin-dashboard";
import { getAdminDashboardData } from "@/lib/services/dashboards/get-admin-dashboard-data";

export default async function AdminDashboardPage() {
  const data = await getAdminDashboardData();

  return <AdminDashboard data={data} />;
}

