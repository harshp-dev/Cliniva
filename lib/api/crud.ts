import { z } from "zod";
import type { NextRequest } from "next/server";
import { created, error, ok } from "@/lib/api/response";
import { getRequestContext } from "@/lib/auth/request-context";

interface CrudConfig<TSchema extends z.ZodTypeAny> {
  table: string;
  schema: TSchema;
  allowedRoles?: Array<"admin" | "provider" | "staff" | "patient">;
}

export function createCrudHandlers<TSchema extends z.ZodTypeAny>({ table, schema, allowedRoles }: CrudConfig<TSchema>) {
  async function GET(request: NextRequest) {
    const context = await getRequestContext(request);
    if (!context) {
      return error(401, "unauthorized", "Authentication required");
    }

    if (allowedRoles && !allowedRoles.includes(context.role)) {
      return error(403, "forbidden", "Insufficient role permissions");
    }

    const limit = Math.min(Number(request.nextUrl.searchParams.get("limit") ?? 20), 100);
    const offset = Math.max(Number(request.nextUrl.searchParams.get("offset") ?? 0), 0);

    const { data, count, error: queryError } = await context.supabase
      .from(table)
      .select("*", { count: "exact" })
      .eq("organization_id", context.organizationId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (queryError) {
      return error(500, "query_failed", queryError.message);
    }

    return ok(data ?? [], { limit, offset, count: count ?? 0 });
  }

  async function POST(request: NextRequest) {
    const context = await getRequestContext(request);
    if (!context) {
      return error(401, "unauthorized", "Authentication required");
    }

    if (allowedRoles && !allowedRoles.includes(context.role)) {
      return error(403, "forbidden", "Insufficient role permissions");
    }

    const payload = await request.json().catch(() => null);
    if (!payload) {
      return error(400, "invalid_json", "Request body must be valid JSON");
    }

    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      return error(400, "validation_error", "Invalid request body", parsed.error.flatten());
    }

    const record = {
      ...(parsed.data as Record<string, unknown>),
      organization_id: context.organizationId
    };

    const { data, error: insertError } = await context.supabase.from(table).insert(record).select("*").single();

    if (insertError) {
      return error(500, "insert_failed", insertError.message);
    }

    return created(data);
  }

  return { GET, POST };
}


