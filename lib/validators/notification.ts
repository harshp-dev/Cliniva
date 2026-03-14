import { z } from "zod";

export const notificationCreateSchema = z.object({
  user_id: z.string().uuid(),
  channel: z.enum(["in_app", "sms", "email"]),
  title: z.string().min(2).max(150),
  body: z.string().min(1).max(2000),
  read_at: z.string().datetime().optional()
});
