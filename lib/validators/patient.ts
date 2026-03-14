import { z } from "zod";

const emergencyContactSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(8)
});

export const patientCreateSchema = z.object({
  user_id: z.string().uuid().optional(),
  mrn: z.string().min(3).max(32),
  date_of_birth: z.string().date().optional(),
  phone: z.string().min(8).max(20).optional(),
  emergency_contact: emergencyContactSchema.optional(),
  insurance_plan_id: z.string().uuid().optional()
});

export const patientUpdateSchema = z
  .object({
    mrn: z.string().min(3).max(32).optional(),
    date_of_birth: z.string().date().nullable().optional(),
    phone: z.string().min(8).max(20).nullable().optional(),
    emergency_contact: emergencyContactSchema.nullable().optional(),
    insurance_plan_id: z.string().uuid().nullable().optional()
  })
  .refine((value) => Object.keys(value).length > 0, "At least one field must be updated");
