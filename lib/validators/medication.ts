import { z } from "zod";

export const medicationCreateSchema = z.object({
  name: z.string().min(2).max(200),
  rxnorm_code: z.string().max(50).optional(),
  description: z.string().max(2000).optional()
});
