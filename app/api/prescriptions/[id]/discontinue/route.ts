import type { NextRequest } from "next/server";
import { z } from "zod";
import { error, ok } from "@/lib/api/response";
import { hasRequiredRole } from "@/lib/auth/guards";
import { getRequestContext } from "@/lib/auth/request-context";

const uuidSchema = z.string().uuid();
const ALLOWED_ROLES = ["admin", "provider", "staff"] as const;

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const context = await getRequestContext(request);
  if (!context) {
    return error(401, "unauthorized", "Authentication required");
  }

  if (!hasRequiredRole(context.role, [...ALLOWED_ROLES])) {
    return error(403, "forbidden", "Insufficient role permissions");
  }

  const { id } = await params;
  const parsedId = uuidSchema.safeParse(id);
  if (!parsedId.success) {
    return error(400, "validation_error", "Invalid prescription id");
  }

  const { data, error: updateError } = await context.supabase
    .from("prescriptions")
    .update({ discontinued_at: new Date().toISOString() })
    .eq("organization_id", context.organizationId)
    .eq("id", parsedId.data)
    .select("id, discontinued_at")
    .single();

  if (updateError || !data) {
    return error(500, "update_failed", updateError?.message ?? "Unable to discontinue prescription");
  }

  return ok(data);
}

