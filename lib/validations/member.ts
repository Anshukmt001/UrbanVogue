import { z } from "zod";

export const registerMemberSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters")
    .trim(),
  mobile: z
    .string()
    .min(1, "Mobile number is required")
    .max(20, "Mobile number must be at most 20 characters")
    .trim(),
  email: z
    .string()
    .email("Invalid email address")
    .max(254, "Email must be at most 254 characters")
    .trim()
    .toLowerCase()
    .optional()
    .or(z.literal(""))
});

export type RegisterMemberInput = z.infer<typeof registerMemberSchema>;
