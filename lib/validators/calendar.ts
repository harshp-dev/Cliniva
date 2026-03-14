import { z } from "zod";

export const calendarQuerySchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional()
});
