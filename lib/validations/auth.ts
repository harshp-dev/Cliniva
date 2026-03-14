import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const signUpSchema = z.object({
  fullName: z.string().min(2, "Enter your full name."),
  email: z.string().email("Enter a valid email address."),
  phone: z
    .string()
    .optional()
    .refine(
      (value) => !value || value.trim().length >= 7,
      "Enter a valid phone number."
    ),
  password: z.string().min(8, "Password must be at least 8 characters."),
  role: z.enum(["patient", "provider"] as const, {
    message: "Select a role to continue.",
  }),
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
