import { z } from "zod";

export const soapNoteSchema = z.object({
  subjective: z.string().trim().min(10, "Add at least 10 characters for the subjective section."),
  objective: z.string().trim().min(10, "Add at least 10 characters for the objective section."),
  assessment: z.string().trim().min(10, "Add at least 10 characters for the assessment section."),
  plan: z.string().trim().min(10, "Add at least 10 characters for the plan section."),
  isSharedWithPatient: z.boolean().default(false),
});

export type SoapNoteFormInput = z.input<typeof soapNoteSchema>;
export type SoapNoteInput = z.output<typeof soapNoteSchema>;
