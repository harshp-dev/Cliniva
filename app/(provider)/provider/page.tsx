import { EhrManagementWorkspace } from "@/components/ehr/ehr-management-workspace";
import { PrescriptionWorkspace } from "@/components/prescriptions/prescription-workspace";

export default function ProviderPage() {
  return (
    <section className="space-y-6">
      <EhrManagementWorkspace />
      <PrescriptionWorkspace />
    </section>
  );
}
