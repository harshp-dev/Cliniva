import type { NextRequest } from "next/server";
import { error, ok } from "@/lib/api/response";
import { getRequestContext } from "@/lib/auth/request-context";

export async function GET(request: NextRequest) {
  const context = await getRequestContext(request);
  if (!context) {
    return error(401, "unauthorized", "Authentication required");
  }

  return ok({
    user_id: context.userId,
    organization_id: context.organizationId,
    role: context.role
  });
}
