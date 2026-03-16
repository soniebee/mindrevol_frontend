import { z } from 'zod';

export const emailSchema = z.object({
  email: z.string().email("Invalid email address").min(1, "Please enter your email"),
});

export type EmailFormValues = z.infer<typeof emailSchema>;

export const passwordSchema = z.object({
  password: z.string().min(1, "Please enter your password"),
});

export type PasswordFormValues = z.infer<typeof passwordSchema>;

// --- CONFIG CONSTANTS ---
export const GENDER_VALUES = ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'] as const;

// --- STEP 1: PASSWORD ---
export const registerPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type StepPasswordValues = z.infer<typeof registerPasswordSchema>;

// --- STEP 2: BASIC INFO ---
// This schema is used for form binding (gender as string for select input)
export const basicInfoSchema = z.object({
  fullname: z.string().min(2, "Name must be at least 2 characters"),
  dateOfBirth: z.string().refine((date) => {
    if (!date) return false;
    const age = new Date().getFullYear() - new Date(date).getFullYear();
    return age >= 13;
  }, "You must be at least 13 years old to join"),
  gender: z.string().refine((val) => GENDER_VALUES.includes(val as any), {
    message: "Please select a gender"
  })
});

// Internal form type
export type BasicInfoFormValues = z.infer<typeof basicInfoSchema>;

// Normalized type for server payload (gender as enum)
export type StepBasicInfoValues = Omit<BasicInfoFormValues, 'gender'> & {
  gender: typeof GENDER_VALUES[number];
};

// --- STEP 3: HANDLE ---
export const handleSchema = z.object({
  handle: z.string()
    .min(3, "Username must be at least 3 characters")
    .regex(/^[a-zA-Z0-9._]+$/, "Only letters, numbers, dots, and underscores are allowed")
});

export type StepHandleValues = z.infer<typeof handleSchema>;