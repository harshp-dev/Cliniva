import type { NextRequest } from "next/server";
import { created, error, ok } from "@/lib/api/response";
import { hasRequiredRole } from "@/lib/auth/guards";
import { getRequestContext } from "@/lib/auth/request-context";
import { medicationCreateSchema } from "@/lib/validators/medication";

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
  const q = request.nextUrl.searchParams.get("q")?.trim();

  let query = context.supabase
    .from("medications")
    .select("id, name, rxnorm_code, description, created_at", { count: "exact" })
    .eq("organization_id", context.organizationId)
    .order("name", { ascending: true })
    .range(offset, offset + limit - 1);

  if (q) {
    query = query.or(`name.ilike.%${q}%,rxnorm_code.ilike.%${q}%`);
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

  const parsed = medicationCreateSchema.safeParse(payload);
  if (!parsed.success) {
    return error(400, "validation_error", "Invalid request body", parsed.error.flatten());
  }

  const { data, error: insertError } = await context.supabase
    .from("medications")
    .insert({ ...parsed.data, organization_id: context.organizationId })
    .select("*")
    .single();

  if (insertError || !data) {
    return error(500, "insert_failed", insertError?.message ?? "Unable to create medication");
  }

  return created(data);
}
