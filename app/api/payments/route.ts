import type { NextRequest } from "next/server";
import { createCrudHandlers } from "@/lib/api/crud";
import { error } from "@/lib/api/response";
import { getRequestContext } from "@/lib/auth/request-context";
import { paymentCreateSchema } from "@/lib/validators/payment";
import { createPaymentIntent } from "@/services/stripe";

const crud = createCrudHandlers({
  table: "payments",
  schema: paymentCreateSchema,
  allowedRoles: ["admin", "staff", "patient"]
});

export const GET = crud.GET;

export async function POST(request: NextRequest) {
  const context = await getRequestContext(request);
  if (!context) {
    return error(401, "unauthorized", "Authentication required");
  }

  const payload = await request.json().catch(() => null);
  if (!payload) {
    return error(400, "invalid_json", "Request body must be valid JSON");
  }

  const parsed = paymentCreateSchema.safeParse(payload);
  if (!parsed.success) {
    return error(400, "validation_error", "Invalid request body", parsed.error.flatten());
  }

  const intent = await createPaymentIntent(parsed.data.amount_cents, parsed.data.currency, {
    organization_id: context.organizationId,
    patient_id: parsed.data.patient_id
  });

  const { data, error: insertError } = await context.supabase
    .from("payments")
    .insert({
      ...parsed.data,
      organization_id: context.organizationId,
      stripe_payment_intent_id: intent.id,
      status: intent.status === "succeeded" ? "succeeded" : "pending"
    })
    .select("*")
    .single();

  if (insertError) {
    return error(500, "insert_failed", insertError.message);
  }

  return Response.json({ success: true, data, meta: { client_secret: intent.client_secret } }, { status: 201 });
}
