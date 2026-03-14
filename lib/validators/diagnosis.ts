import { z } from "zod";

export const diagnosisCreateSchema = z.object({
  patient_id: z.string().uuid(),
  provider_id: z.string().uuid().optional(),
  icd10_code: z.string().max(20).optional(),
  description: z.string().min(2).max(1000),
  status: z.string().min(2).max(40).default("active"),
  diagnosed_at: z.string().datetime().optional()
});

export const diagnosisUpdateSchema = z
  .object({
    icd10_code: z.string().max(20).nullable().optional(),
    description: z.string().min(2).max(1000).optional(),
    status: z.string().min(2).max(40).optional(),
    diagnosed_at: z.string().datetime().optional()
  })
  .refine((value) => Object.keys(value).length > 0, "At least one field must be updated");
