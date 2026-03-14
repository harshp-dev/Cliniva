import { z } from "zod";

export const carePlanCreateSchema = z.object({
  patient_id: z.string().uuid(),
  provider_id: z.string().uuid().optional(),
  goal: z.string().min(2).max(2000),
  interventions: z.string().max(5000).optional(),
  status: z.string().min(2).max(40).default("active"),
  target_date: z.string().date().optional()
});

export const carePlanUpdateSchema = z
  .object({
    goal: z.string().min(2).max(2000).optional(),
    interventions: z.string().max(5000).nullable().optional(),
    status: z.string().min(2).max(40).optional(),
    target_date: z.string().date().nullable().optional()
  })
  .refine((value) => Object.keys(value).length > 0, "At least one field must be updated");
