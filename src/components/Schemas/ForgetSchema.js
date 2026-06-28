import { z } from "zod";

export const forgetPasswordSchema = z.object({
  verificationType: z.string().min(1, "Please select a verification method"),
});

export const forgetStep2Schema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

export const forgetStep3Schema = z
  .object({
    otp: z.string().length(6, "Please enter the 6-digit code"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/\d/, "Password must contain at least 1 number")
      .regex(/[a-zA-Z]/, "Password must contain at least one letter"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
