import { z } from "zod";

export const providerCreateSchema = z.object({
  user_id: z.string().uuid(),
  npi_number: z.string().min(5).max(20),
  specialty: z.string().min(2).max(120),
  availability: z.record(z.unknown()).default({})
});
