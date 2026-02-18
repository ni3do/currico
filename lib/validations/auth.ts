import { z } from "zod";

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
});

// 2FA schemas
export const loginCheckSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const twoFactorVerifySchema = z.object({
  token: z
    .string()
    .min(6)
    .max(6)
    .regex(/^\d{6}$/),
});

export const twoFactorDisableSchema = z.object({
  password: z.string().min(1),
});

export const twoFactorRegenerateSchema = z.object({
  password: z.string().min(1),
});
