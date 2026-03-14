export interface InteractionWarning {
  severity: "low" | "medium" | "high";
  message: string;
  recommendation: string | null;
  medication_name: string;
  conflicting_medication_name: string;
}

interface InteractionRow {
  severity: "low" | "medium" | "high";
  message: string;
  recommendation: string | null;
  medication_id_1: string;
  medication_id_2: string;
}

interface MedicationRow {
  id: string;
  name: string;
}

export async function checkDrugInteractions(
  supabase: any,
  organizationId: string,
  patientId: string,
  newMedicationId: string
): Promise<InteractionWarning[]> {
  const { data: activePrescriptions } = await supabase
    .from("prescriptions")
    .select("medication_id, medications(name)")
    .eq("organization_id", organizationId)
    .eq("patient_id", patientId)
    .is("discontinued_at", null);

  const existingMedicationIds = (activePrescriptions ?? [])
    .map((entry: any) => entry.medication_id)
    .filter((value: unknown): value is string => typeof value === "string");

  if (existingMedicationIds.length === 0) {
    return [];
  }

  const involvedIds = Array.from(new Set([...existingMedicationIds, newMedicationId]));

  const { data: medications } = await supabase
    .from("medications")
    .select("id, name")
    .eq("organization_id", organizationId)
    .in("id", involvedIds);

  const medicationRows = (medications ?? []) as MedicationRow[];
  const medicationNameMap = new Map<string, string>(medicationRows.map((medication) => [medication.id, medication.name]));
  const newMedicationName = medicationNameMap.get(newMedicationId) ?? "New medication";

  const { data: interactions } = await supabase
    .from("medication_interactions")
    .select("severity, message, recommendation, medication_id_1, medication_id_2")
    .eq("organization_id", organizationId)
    .or(
      existingMedicationIds
        .map(
          (id: string) =>
            `and(medication_id_1.eq.${id},medication_id_2.eq.${newMedicationId}),and(medication_id_1.eq.${newMedicationId},medication_id_2.eq.${id})`
        )
        .join(",")
    );

  const rows = (interactions ?? []) as InteractionRow[];

  return rows.map((entry) => {
    const conflictingId = entry.medication_id_1 === newMedicationId ? entry.medication_id_2 : entry.medication_id_1;
    return {
      severity: entry.severity,
      message: entry.message,
      recommendation: entry.recommendation,
      medication_name: newMedicationName,
      conflicting_medication_name: medicationNameMap.get(conflictingId) ?? "Unknown medication"
    };
  });
}
