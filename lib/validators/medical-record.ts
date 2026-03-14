import { z } from "zod";

export const medicalRecordCreateSchema = z.object({
  patient_id: z.string().uuid(),
  provider_id: z.string().uuid(),
  record_type: z.string().min(2).max(50),
  summary: z.string().min(2),
  payload: z.record(z.string(), z.unknown()).default({})
});

