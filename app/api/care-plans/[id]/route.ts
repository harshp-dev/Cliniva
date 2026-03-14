import type { NextRequest } from "next/server";
import { z } from "zod";
import { error, ok } from "@/lib/api/response";
import { hasRequiredRole } from "@/lib/auth/guards";
import { getRequestContext } from "@/lib/auth/request-context";
import { carePlanUpdateSchema } from "@/lib/validators/care-plan";

const uuidSchema = z.string().uuid();
const ALLOWED_ROLES = ["admin", "provider", "staff"] as const;

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const context = await getRequestContext(request);
  if (!context) {
    return error(401, "unauthorized", "Authentication required");
  }
  if (!hasRequiredRole(context.role, [...ALLOWED_ROLES])) {
    return error(403, "forbidden", "Insufficient role permissions");
  }

  const parsedId = uuidSchema.safeParse(params.id);
  if (!parsedId.success) {
    return error(400, "validation_error", "Invalid care plan id");
  }

  const payload = await request.json().catch(() => null);
  if (!payload) {
    return error(400, "invalid_json", "Request body must be valid JSON");
  }

  const parsed = carePlanUpdateSchema.safeParse(payload);
  if (!parsed.success) {
    return error(400, "validation_error", "Invalid request body", parsed.error.flatten());
  }

  const { data, error: updateError } = await context.supabase
    .from("care_plans")
    .update(parsed.data)
    .eq("organization_id", context.organizationId)
    .eq("id", parsedId.data)
    .select("*")
    .single();

  if (updateError || !data) {
    return error(500, "update_failed", updateError?.message ?? "Unable to update care plan");
  }

  return ok(data);
}
