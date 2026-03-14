import { z } from "zod";

export const claimCreateSchema = z.object({
  patient_id: z.string().uuid(),
  appointment_id: z.string().uuid().optional(),
  insurance_plan_id: z.string().uuid(),
  status: z.enum(["submitted", "in_review", "approved", "denied", "paid"]).default("submitted"),
  amount_cents: z.number().int().positive(),
  payer_reference: z.string().max(120).optional()
});
