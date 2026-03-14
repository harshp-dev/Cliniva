import { z } from "zod";

export const prescriptionCreateSchema = z.object({
  patient_id: z.string().uuid(),
  provider_id: z.string().uuid(),
  medication_id: z.string().uuid(),
  dosage: z.string().min(1).max(120),
  frequency: z.string().min(1).max(120),
  duration_days: z.number().int().positive(),
  notes: z.string().max(500).optional(),
  allow_override: z.boolean().optional().default(false)
});

export const prescriptionInteractionSchema = z.object({
  patient_id: z.string().uuid(),
  medication_id: z.string().uuid()
});
