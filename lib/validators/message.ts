import { z } from "zod";

export const messageCreateSchema = z.object({
  recipient_id: z.string().uuid(),
  appointment_id: z.string().uuid().optional(),
  content: z.string().trim().min(1).max(5000)
});

export const messageListQuerySchema = z.object({
  conversation_with: z.string().uuid().optional(),
  appointment_id: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0)
});
