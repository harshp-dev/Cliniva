import type { NextRequest } from "next/server";
import { error, ok } from "@/lib/api/response";
import { getRequestContext } from "@/lib/auth/request-context";

export async function GET(request: NextRequest) {
  const context = await getRequestContext(request);
  if (!context) {
    return error(401, "unauthorized", "Authentication required");
  }

  const limit = Math.min(Number(request.nextUrl.searchParams.get("limit") ?? 100), 200);
  const offset = Math.max(Number(request.nextUrl.searchParams.get("offset") ?? 0), 0);

  let query = context.supabase
    .from("users")
    .select("id, role, email, first_name, last_name, is_active, created_at", { count: "exact" })
    .eq("organization_id", context.organizationId)
    .eq("is_active", true)
    .neq("id", context.userId)
    .order("created_at", { ascending: true })
    .range(offset, offset + limit - 1);

  if (context.role === "patient") {
    query = query.in("role", ["admin", "provider", "staff"]);
  }

  const { data, count, error: queryError } = await query;
  if (queryError) {
    return error(500, "query_failed", queryError.message);
  }

  return ok(data ?? [], { limit, offset, count: count ?? 0 });
}
