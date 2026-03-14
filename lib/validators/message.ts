import { z } from "zod";

export const messageCreateSchema = z.object({
  sender_id: z.string().uuid(),
  recipient_id: z.string().uuid(),
  appointment_id: z.string().uuid().optional(),
  content: z.string().min(1).max(5000)
});
