import type { NextRequest } from "next/server";
import { created, error, ok } from "@/lib/api/response";
import { hasRequiredRole } from "@/lib/auth/guards";
import { getRequestContext } from "@/lib/auth/request-context";
import { prescriptionCreateSchema } from "@/lib/validators/prescription";
import { checkDrugInteractions } from "@/services/drug-interactions";

const READ_ROLES = ["admin", "provider", "staff", "patient"] as const;
const WRITE_ROLES = ["admin", "provider", "staff"] as const;

export async function GET(request: NextRequest) {
  const context = await getRequestContext(request);
  if (!context) {
    return error(401, "unauthorized", "Authentication required");
  }

  if (!hasRequiredRole(context.role, [...READ_ROLES])) {
    return error(403, "forbidden", "Insufficient role permissions");
  }

  const limit = Math.min(Number(request.nextUrl.searchParams.get("limit") ?? 50), 100);
  const offset = Math.max(Number(request.nextUrl.searchParams.get("offset") ?? 0), 0);
  const patientId = request.nextUrl.searchParams.get("patient_id");

  let query = context.supabase
    .from("prescriptions")
    .select("id, patient_id, provider_id, medication_id, dosage, frequency, duration_days, notes, start_date, end_date, discontinued_at, created_at, medications(name, rxnorm_code)", { count: "exact" })
    .eq("organization_id", context.organizationId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (patientId) {
    query = query.eq("patient_id", patientId);
  }

  if (context.role === "patient") {
    const { data: patientProfile } = await context.supabase
      .from("patients")
      .select("id")
      .eq("organization_id", context.organizationId)
      .eq("user_id", context.userId)
      .single();

    if (!patientProfile) {
      return ok([], { count: 0, limit, offset });
    }

    query = query.eq("patient_id", patientProfile.id);
  }

  const { data, count, error: queryError } = await query;
  if (queryError) {
    return error(500, "query_failed", queryError.message);
  }

  return ok(data ?? [], { count: count ?? 0, limit, offset });
}

export async function POST(request: NextRequest) {
  const context = await getRequestContext(request);
  if (!context) {
    return error(401, "unauthorized", "Authentication required");
  }

  if (!hasRequiredRole(context.role, [...WRITE_ROLES])) {
    return error(403, "forbidden", "Insufficient role permissions");
  }

  const payload = await request.json().catch(() => null);
  if (!payload) {
    return error(400, "invalid_json", "Request body must be valid JSON");
  }

  const parsed = prescriptionCreateSchema.safeParse(payload);
  if (!parsed.success) {
    return error(400, "validation_error", "Invalid request body", parsed.error.flatten());
  }

  const warnings = await checkDrugInteractions(
    context.supabase,
    context.organizationId,
    parsed.data.patient_id,
    parsed.data.medication_id
  );

  const highWarnings = warnings.filter((entry) => entry.severity === "high");
  if (highWarnings.length > 0 && !parsed.data.allow_override) {
    return error(409, "interaction_override_required", "High-severity interaction warning. Set allow_override=true to proceed.", {
      warnings: highWarnings
    });
  }

  const { allow_override, ...record } = parsed.data;

  const { data, error: insertError } = await context.supabase
    .from("prescriptions")
    .insert({ ...record, organization_id: context.organizationId })
    .select("*")
    .single();

  if (insertError || !data) {
    return error(500, "insert_failed", insertError?.message ?? "Unable to create prescription");
  }

  return created({ ...data, warnings });
}
