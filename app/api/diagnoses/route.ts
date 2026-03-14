import type { NextRequest } from "next/server";
import { created, error, ok } from "@/lib/api/response";
import { hasRequiredRole } from "@/lib/auth/guards";
import { getRequestContext } from "@/lib/auth/request-context";
import { diagnosisCreateSchema } from "@/lib/validators/diagnosis";

const ALLOWED_ROLES = ["admin", "provider", "staff"] as const;

export async function GET(request: NextRequest) {
  const context = await getRequestContext(request);
  if (!context) {
    return error(401, "unauthorized", "Authentication required");
  }
  if (!hasRequiredRole(context.role, [...ALLOWED_ROLES])) {
    return error(403, "forbidden", "Insufficient role permissions");
  }

  const patientId = request.nextUrl.searchParams.get("patient_id");
  const limit = Math.min(Number(request.nextUrl.searchParams.get("limit") ?? 100), 100);
  const offset = Math.max(Number(request.nextUrl.searchParams.get("offset") ?? 0), 0);

  let query = context.supabase
    .from("diagnoses")
    .select("*", { count: "exact" })
    .eq("organization_id", context.organizationId)
    .order("diagnosed_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (patientId) {
    query = query.eq("patient_id", patientId);
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
  if (!hasRequiredRole(context.role, [...ALLOWED_ROLES])) {
    return error(403, "forbidden", "Insufficient role permissions");
  }

  const payload = await request.json().catch(() => null);
  if (!payload) {
    return error(400, "invalid_json", "Request body must be valid JSON");
  }

  const parsed = diagnosisCreateSchema.safeParse(payload);
  if (!parsed.success) {
    return error(400, "validation_error", "Invalid request body", parsed.error.flatten());
  }

  const { data, error: insertError } = await context.supabase
    .from("diagnoses")
    .insert({
      ...parsed.data,
      organization_id: context.organizationId,
      diagnosed_at: parsed.data.diagnosed_at ?? new Date().toISOString()
    })
    .select("*")
    .single();

  if (insertError || !data) {
    return error(500, "insert_failed", insertError?.message ?? "Unable to create diagnosis");
  }

  return created(data);
}
