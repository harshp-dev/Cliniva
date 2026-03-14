import type { NextRequest } from "next/server";
import { z } from "zod";
import { error } from "@/lib/api/response";
import { getRequestContext } from "@/lib/auth/request-context";
import { generateVideoToken } from "@/services/video";

const schema = z.object({
  room_name: z.string().min(3).max(120)
});

export async function POST(request: NextRequest) {
  const context = await getRequestContext(request);
  if (!context) {
    return error(401, "unauthorized", "Authentication required");
  }

  if (!["admin", "provider", "staff", "patient"].includes(context.role)) {
    return error(403, "forbidden", "Role cannot access video tokens");
  }

  const payload = await request.json().catch(() => null);
  if (!payload) {
    return error(400, "invalid_json", "Request body must be valid JSON");
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return error(400, "validation_error", "Invalid request body", parsed.error.flatten());
  }

  const identity = `${context.role}:${context.userId}`;
  const token = generateVideoToken(identity, parsed.data.room_name);

  return Response.json({ success: true, data: { token, room_name: parsed.data.room_name } }, { status: 200 });
}
