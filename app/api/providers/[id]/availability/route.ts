import type { NextRequest } from "next/server";
import { z } from "zod";
import { error, ok } from "@/lib/api/response";
import { hasRequiredRole } from "@/lib/auth/guards";
import { getRequestContext } from "@/lib/auth/request-context";
import { providerAvailabilitySchema } from "@/lib/validators/availability";

const uuidSchema = z.string().uuid();
const ALLOWED_ROLES = ["admin", "provider", "staff"] as const;

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const context = await getRequestContext(request);
  if (!context) {
    return error(401, "unauthorized", "Authentication required");
  }

  if (!hasRequiredRole(context.role, [...ALLOWED_ROLES])) {
    return error(403, "forbidden", "Insufficient role permissions");
  }

  const parsedId = uuidSchema.safeParse(params.id);
  if (!parsedId.success) {
    return error(400, "validation_error", "Invalid provider id");
  }

  const { data, error: queryError } = await context.supabase
    .from("providers")
    .select("id, availability")
    .eq("organization_id", context.organizationId)
    .eq("id", parsedId.data)
    .single();

  if (queryError || !data) {
    return error(404, "not_found", "Provider not found");
  }

  return ok(data);
}

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
    return error(400, "validation_error", "Invalid provider id");
  }

  const payload = await request.json().catch(() => null);
  if (!payload) {
    return error(400, "invalid_json", "Request body must be valid JSON");
  }

  const parsedAvailability = providerAvailabilitySchema.safeParse(payload.availability ?? payload);
  if (!parsedAvailability.success) {
    return error(400, "validation_error", "Invalid availability schema", parsedAvailability.error.flatten());
  }

  const { data, error: updateError } = await context.supabase
    .from("providers")
    .update({ availability: parsedAvailability.data })
    .eq("organization_id", context.organizationId)
    .eq("id", parsedId.data)
    .select("id, availability")
    .single();

  if (updateError || !data) {
    return error(500, "update_failed", updateError?.message ?? "Unable to update provider availability");
  }

  return ok(data);
}
