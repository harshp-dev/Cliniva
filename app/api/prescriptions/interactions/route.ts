import type { NextRequest } from "next/server";
import { error, ok } from "@/lib/api/response";
import { hasRequiredRole } from "@/lib/auth/guards";
import { getRequestContext } from "@/lib/auth/request-context";
import { prescriptionInteractionSchema } from "@/lib/validators/prescription";
import { checkDrugInteractions } from "@/services/drug-interactions";

const ALLOWED_ROLES = ["admin", "provider", "staff"] as const;

export async function POST(request: NextRequest) {
  const context = await getRequestContext(request);
  if (!context) {
    return error(401, "unauthorized", "Authentication required");
  }

  if (!hasRequiredRole(context.role, [...ALLOWED_ROLES])) {
    return error(403, "forbidden", "Insufficient role permissions");
  }

  const payload = await request.json().catch(() => null);
  if (!payload) {
    return error(400, "invalid_json", "Request body must be valid JSON");
  }

  const parsed = prescriptionInteractionSchema.safeParse(payload);
  if (!parsed.success) {
    return error(400, "validation_error", "Invalid request body", parsed.error.flatten());
  }

  const warnings = await checkDrugInteractions(
    context.supabase,
    context.organizationId,
    parsed.data.patient_id,
    parsed.data.medication_id
  );

  return ok({ warnings });
}
