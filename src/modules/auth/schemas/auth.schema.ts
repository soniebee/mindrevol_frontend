import { z } from 'zod';

export const emailSchema = z.object({
  email: z.string().email("Email không hợp lệ").min(1, "Vui lòng nhập email"),
});

export type EmailFormValues = z.infer<typeof emailSchema>;

export const passwordSchema = z.object({
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

export type PasswordFormValues = z.infer<typeof passwordSchema>;

// --- CONFIG CONSTANTS ---
export const GENDER_VALUES = ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'] as const;

// --- STEP 1: PASSWORD ---
export const registerPasswordSchema = z.object({
  password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu nhập lại không khớp",
  path: ["confirmPassword"],
});

export type StepPasswordValues = z.infer<typeof registerPasswordSchema>;

// --- STEP 2: BASIC INFO ---
// Schema này dùng cho Form (Gender là string để bind vào thẻ select)
export const basicInfoSchema = z.object({
  fullname: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  dateOfBirth: z.string().refine((date) => {
    if (!date) return false;
    const age = new Date().getFullYear() - new Date(date).getFullYear();
    return age >= 13;
  }, "Bạn phải trên 13 tuổi để tham gia"),
  gender: z.string().refine((val) => GENDER_VALUES.includes(val as any), {
    message: "Vui lòng chọn giới tính"
  })
});

// Type nội bộ cho Form
export type BasicInfoFormValues = z.infer<typeof basicInfoSchema>;

// Type chuẩn để gửi lên Server (Gender là Enum)
export type StepBasicInfoValues = Omit<BasicInfoFormValues, 'gender'> & {
  gender: typeof GENDER_VALUES[number];
};

// --- STEP 3: HANDLE ---
export const handleSchema = z.object({
  handle: z.string()
    .min(3, "Handle tối thiểu 3 ký tự")
    .regex(/^[a-zA-Z0-9._]+$/, "Chỉ chứa chữ, số, dấu chấm và gạch dưới")
});

export type StepHandleValues = z.infer<typeof handleSchema>;