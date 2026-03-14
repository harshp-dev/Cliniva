import { z } from "zod";

export const notificationCreateSchema = z.object({
  user_id: z.string().uuid(),
  channel: z.enum(["in_app", "sms", "email"]),
  title: z.string().min(2).max(150),
  body: z.string().min(1).max(2000)
});

export const notificationListQuerySchema = z.object({
  user_id: z.string().uuid().optional(),
  unread_only: z.coerce.boolean().default(false),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0)
});
