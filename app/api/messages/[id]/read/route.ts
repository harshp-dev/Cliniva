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
    return error(400, "validation_error", "Invalid message id");
  }

  const { data: message, error: messageError } = await context.supabase
    .from("messages")
    .select("id, sender_id, recipient_id, read_at")
    .eq("organization_id", context.organizationId)
    .eq("id", parsedParams.data.id)
    .single();

  if (messageError || !message) {
    return error(404, "not_found", "Message not found");
  }

  const canMarkRead =
    message.recipient_id === context.userId || context.role === "admin" || context.role === "provider" || context.role === "staff";

  if (!canMarkRead) {
    return error(403, "forbidden", "Insufficient role permissions");
  }

  const { data: updated, error: updateError } = await context.supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("organization_id", context.organizationId)
    .eq("id", message.id)
    .select("id, sender_id, recipient_id, read_at, updated_at")
    .single();

  if (updateError || !updated) {
    return error(500, "update_failed", updateError?.message ?? "Unable to mark message as read");
  }

  return ok(updated);
}
