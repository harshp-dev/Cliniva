import { z } from "zod";

export const appointmentCreateSchema = z
  .object({
    patient_id: z.string().uuid(),
    provider_id: z.string().uuid(),
    starts_at: z.string().datetime(),
    ends_at: z.string().datetime(),
    status: z.enum(["scheduled", "completed", "cancelled", "no_show"]).default("scheduled"),
    reason: z.string().max(500).optional(),
    meeting_room: z.string().max(120).optional()
  })
  .refine((data) => new Date(data.ends_at).getTime() > new Date(data.starts_at).getTime(), {
    message: "ends_at must be after starts_at",
    path: ["ends_at"]
  });
