import { z } from "zod";

export const clinicalNoteCreateSchema = z.object({
  appointment_id: z.string().uuid().optional(),
  patient_id: z.string().uuid(),
  provider_id: z.string().uuid(),
  note_type: z.string().min(2).max(30).default("SOAP"),
  subjective: z.string().max(5000).optional(),
  objective: z.string().max(5000).optional(),
  assessment: z.string().max(5000).optional(),
  plan: z.string().max(5000).optional()
});

export const clinicalNoteUpdateSchema = z
  .object({
    note_type: z.string().min(2).max(30).optional(),
    subjective: z.string().max(5000).nullable().optional(),
    objective: z.string().max(5000).nullable().optional(),
    assessment: z.string().max(5000).nullable().optional(),
    plan: z.string().max(5000).nullable().optional()
  })
  .refine((value) => Object.keys(value).length > 0, "At least one field must be updated");
