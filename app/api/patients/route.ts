import type { NextRequest } from "next/server";
import { created, error, ok } from "@/lib/api/response";
import { hasRequiredRole } from "@/lib/auth/guards";
import { getRequestContext } from "@/lib/auth/request-context";
import { patientCreateSchema } from "@/lib/validators/patient";

export async function GET(request: NextRequest) {
  const context = await getRequestContext(request);
  if (!context) {
    return error(401, "unauthorized", "Authentication required");
  }

  if (!hasRequiredRole(context.role, ["admin", "provider", "staff", "patient"])) {
    return error(403, "forbidden", "Insufficient role permissions");
  }

  const limit = Math.min(Number(request.nextUrl.searchParams.get("limit") ?? 100), 100);
  const offset = Math.max(Number(request.nextUrl.searchParams.get("offset") ?? 0), 0);

  let query = context.supabase
    .from("patients")
    .select("*", { count: "exact" })
    .eq("organization_id", context.organizationId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (context.role === "patient") {
    query = query.eq("user_id", context.userId);
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

  if (!hasRequiredRole(context.role, ["admin", "provider", "staff"])) {
    return error(403, "forbidden", "Insufficient role permissions");
  }

  const payload = await request.json().catch(() => null);
  if (!payload) {
    return error(400, "invalid_json", "Request body must be valid JSON");
  }

  const parsed = patientCreateSchema.safeParse(payload);
  if (!parsed.success) {
    return error(400, "validation_error", "Invalid request body", parsed.error.flatten());
  }

  const { data, error: insertError } = await context.supabase
    .from("patients")
    .insert({ ...parsed.data, organization_id: context.organizationId })
    .select("*")
    .single();

  if (insertError || !data) {
    return error(500, "insert_failed", insertError?.message ?? "Unable to create patient");
  }

  return created(data);
}
