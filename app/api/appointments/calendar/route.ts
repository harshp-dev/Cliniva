import type { NextRequest } from "next/server";
import { error, ok } from "@/lib/api/response";
import { hasRequiredRole } from "@/lib/auth/guards";
import { getRequestContext } from "@/lib/auth/request-context";
import { calendarQuerySchema } from "@/lib/validators/calendar";

const ALLOWED_ROLES = ["admin", "provider", "staff", "patient"] as const;

export async function GET(request: NextRequest) {
  const context = await getRequestContext(request);
  if (!context) {
    return error(401, "unauthorized", "Authentication required");
  }

  if (!hasRequiredRole(context.role, [...ALLOWED_ROLES])) {
    return error(403, "forbidden", "Insufficient role permissions");
  }

  const parsedQuery = calendarQuerySchema.safeParse({
    from: request.nextUrl.searchParams.get("from") ?? undefined,
    to: request.nextUrl.searchParams.get("to") ?? undefined
  });

  if (!parsedQuery.success) {
    return error(400, "validation_error", "Invalid calendar query", parsedQuery.error.flatten());
  }

  let query = context.supabase
    .from("appointments")
    .select("id, patient_id, provider_id, starts_at, ends_at, status, reason")
    .eq("organization_id", context.organizationId)
    .order("starts_at", { ascending: true });

  if (parsedQuery.data.from) {
    query = query.gte("starts_at", parsedQuery.data.from);
  }

  if (parsedQuery.data.to) {
    query = query.lte("starts_at", parsedQuery.data.to);
  }

  const { data: appointments, error: queryError } = await query;
  if (queryError) {
    return error(500, "query_failed", queryError.message);
  }

  const grouped = (appointments ?? []).reduce<Record<string, typeof appointments>>((acc, item) => {
    const key = new Date(item.starts_at).toISOString().slice(0, 10);
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {});

  return ok({ appointments: appointments ?? [], grouped_by_day: grouped });
}
