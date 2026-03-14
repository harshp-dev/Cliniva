import { PatientDashboard } from "@/components/features/dashboard/patient-dashboard";
import { getPatientDashboardData } from "@/lib/services/dashboards/get-patient-dashboard-data";

export default async function PatientDashboardPage() {
  const data = await getPatientDashboardData();

  return <PatientDashboard data={data} />;
}

