import { z } from "zod";

export const paymentCreateSchema = z.object({
  patient_id: z.string().uuid(),
  amount_cents: z.number().int().positive(),
  currency: z.string().length(3).default("USD"),
  status: z.enum(["pending", "succeeded", "failed", "refunded"]).default("pending"),
  stripe_payment_intent_id: z.string().optional()
});
