import { z } from "zod";

export const patientProfileSchema = z.object({
  fullName: z.string().trim().min(2, "Enter the patient's full name.").max(120),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number.")
    .max(30, "Phone number is too long."),
  dateOfBirth: z.string().trim().optional(),
  gender: z.string().trim().max(50).optional(),
  address: z.string().trim().max(240).optional(),
  emergencyContactName: z.string().trim().max(120).optional(),
  emergencyContactPhone: z.string().trim().max(30).optional(),
  emergencyContactRelation: z.string().trim().max(80).optional(),
});

export const providerProfileSchema = z.object({
  fullName: z.string().trim().min(2, "Enter the provider's full name.").max(120),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number.")
    .max(30, "Phone number is too long."),
  specialty: z.string().trim().min(2, "Enter the provider specialty.").max(120),
  licenseNumber: z.string().trim().min(3, "Enter the license number.").max(80),
  yearsExperience: z.coerce.number().int().min(0, "Years of experience cannot be negative.").max(60, "Years of experience looks too high."),
  bio: z.string().trim().max(1200, "Bio is too long.").optional(),
});

export type PatientProfileInput = z.output<typeof patientProfileSchema>;
export type ProviderProfileInput = z.output<typeof providerProfileSchema>;
