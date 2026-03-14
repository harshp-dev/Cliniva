import type { NextRequest } from "next/server";
import { created, error, ok } from "@/lib/api/response";
import { hasRequiredRole } from "@/lib/auth/guards";
import { getRequestContext } from "@/lib/auth/request-context";
import { notificationCreateSchema, notificationListQuerySchema } from "@/lib/validators/notification";

const CREATOR_ROLES = ["admin", "provider", "staff"] as const;

export async function GET(request: NextRequest) {
  const context = await getRequestContext(request);
  if (!context) {
    return error(401, "unauthorized", "Authentication required");
  }

  const parsedQuery = notificationListQuerySchema.safeParse({
    user_id: request.nextUrl.searchParams.get("user_id") ?? undefined,
    unread_only: request.nextUrl.searchParams.get("unread_only") ?? undefined,
    limit: request.nextUrl.searchParams.get("limit") ?? undefined,
    offset: request.nextUrl.searchParams.get("offset") ?? undefined
  });

  if (!parsedQuery.success) {
    return error(400, "validation_error", "Invalid query params", parsedQuery.error.flatten());
  }

  const { user_id, unread_only, limit, offset } = parsedQuery.data;

  let query = context.supabase
    .from("notifications")
    .select("id, user_id, channel, title, body, read_at, delivery_status, created_at, updated_at", { count: "exact" })
    .eq("organization_id", context.organizationId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (context.role === "patient") {
    query = query.eq("user_id", context.userId);
  } else if (user_id) {
    query = query.eq("user_id", user_id);
  }

  if (unread_only) {
    query = query.is("read_at", null);
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

  const payload = await request.json().catch(() => null);
  if (!payload) {
    return error(400, "invalid_json", "Request body must be valid JSON");
  }

  const parsed = notificationCreateSchema.safeParse(payload);
  if (!parsed.success) {
    return error(400, "validation_error", "Invalid request body", parsed.error.flatten());
  }

  if (context.role === "patient" && parsed.data.user_id !== context.userId) {
    return error(403, "forbidden", "Patients can only create self notifications");
  }

  if (context.role !== "patient" && !hasRequiredRole(context.role, [...CREATOR_ROLES])) {
    return error(403, "forbidden", "Insufficient role permissions");
  }

  const { data: recipient, error: recipientError } = await context.supabase
    .from("users")
    .select("id")
    .eq("organization_id", context.organizationId)
    .eq("id", parsed.data.user_id)
    .single();

  if (recipientError || !recipient) {
    return error(404, "not_found", "Notification recipient not found");
  }

  const { data, error: insertError } = await context.supabase
    .from("notifications")
    .insert({
      ...parsed.data,
      organization_id: context.organizationId,
      delivery_status: "pending"
    })
    .select("id, user_id, channel, title, body, read_at, delivery_status, created_at, updated_at")
    .single();

  if (insertError || !data) {
    return error(500, "insert_failed", insertError?.message ?? "Unable to create notification");
  }

  return created(data);
}
