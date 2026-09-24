import { z } from "zod";

export const registerMemberSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters")
    .trim(),
  mobile: z
    .string()
    .max(20, "Mobile number must be at most 20 characters")
    .trim()
    .optional()
    .or(z.literal("")),
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

export function normalizeMobile(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("0")) {
    digits = digits.slice(1);
  }
  if (digits.length === 12 && digits.startsWith("91")) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith("91")) {
    digits = digits.slice(2);
  }
  return `+91${digits.slice(0, 10)}`;
}
