import type { NextRequest } from "next/server";
import { z } from "zod";
import { error, ok } from "@/lib/api/response";
import { getRequestContext } from "@/lib/auth/request-context";

const paramsSchema = z.object({
  id: z.string().uuid()
});

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const context = await getRequestContext(request);
  if (!context) {
    return error(401, "unauthorized", "Authentication required");
  }

  const parsedParams = paramsSchema.safeParse(params);
  if (!parsedParams.success) {
    return error(400, "validation_error", "Invalid notification id");
  }

  const { data: notification, error: notificationError } = await context.supabase
    .from("notifications")
    .select("id, user_id")
    .eq("organization_id", context.organizationId)
    .eq("id", parsedParams.data.id)
    .single();

  if (notificationError || !notification) {
    return error(404, "not_found", "Notification not found");
  }

  const canMarkRead =
    notification.user_id === context.userId || context.role === "admin" || context.role === "provider" || context.role === "staff";

  if (!canMarkRead) {
    return error(403, "forbidden", "Insufficient role permissions");
  }

  const { data: updated, error: updateError } = await context.supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString(), delivery_status: "sent" })
    .eq("organization_id", context.organizationId)
    .eq("id", notification.id)
    .select("id, user_id, read_at, delivery_status, updated_at")
    .single();

  if (updateError || !updated) {
    return error(500, "update_failed", updateError?.message ?? "Unable to mark notification as read");
  }

  return ok(updated);
}
