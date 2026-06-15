import { z } from "zod";

// ── Login ─────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "L'email est requis")
    .email("Format d'email invalide")
    .refine((v) => v.endsWith(".ac.ma") || v.includes("@"), "Email universitaire recommandé"),
  password: z
    .string()
    .min(1, "Le mot de passe est requis")
    .min(8, "Minimum 8 caractères"),
  rememberMe: z.boolean().optional(),
});
export type LoginSchema = z.infer<typeof loginSchema>;

// ── Register ──────────────────────────────────────────────────
export const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(1, "Le prénom est requis")
      .min(2, "Minimum 2 caractères")
      .max(50, "Maximum 50 caractères"),
    lastName: z
      .string()
      .min(1, "Le nom est requis")
      .min(2, "Minimum 2 caractères")
      .max(50, "Maximum 50 caractères"),
    email: z
      .string()
      .min(1, "L'email est requis")
      .email("Format d'email invalide"),
    password: z
      .string()
      .min(1, "Le mot de passe est requis")
      .min(8, "Minimum 8 caractères")
      .regex(/[A-Z]/, "Au moins une majuscule")
      .regex(/[0-9]/, "Au moins un chiffre"),
    confirmPassword: z.string().min(1, "Confirmez votre mot de passe"),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: "Vous devez accepter les conditions" }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });
export type RegisterSchema = z.infer<typeof registerSchema>;

// ── Forgot Password ───────────────────────────────────────────
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "L'email est requis")
    .email("Format d'email invalide"),
});
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;

// ── Verify Email OTP ──────────────────────────────────────────
export const verifyEmailSchema = z.object({
  otp: z
    .string()
    .length(6, "Le code doit contenir 6 chiffres")
    .regex(/^\d{6}$/, "Le code doit être numérique"),
});
export type VerifyEmailSchema = z.infer<typeof verifyEmailSchema>;
