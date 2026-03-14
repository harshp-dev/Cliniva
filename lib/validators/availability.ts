import { z } from "zod";

const slotSchema = z.object({
  start: z.string().regex(/^\d{2}:\d{2}$/),
  end: z.string().regex(/^\d{2}:\d{2}$/)
});

export const providerAvailabilitySchema = z.object({
  timezone: z.string().min(2).max(64).default("UTC"),
  weekly: z.record(z.string(), z.array(slotSchema)).default({}),
  exceptions: z
    .array(
      z.object({
        date: z.string().date(),
        unavailable: z.boolean().default(true),
        slots: z.array(slotSchema).optional()
      })
    )
    .default([])
});

