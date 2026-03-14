import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  registerPasswordSchema, StepPasswordValues,
  basicInfoSchema, BasicInfoFormValues, StepBasicInfoValues,
  handleSchema, StepHandleValues
} from '../schemas/auth.schema';

// --- HOOK CHO BƯỚC 1: PASSWORD ---
export const useStepPassword = (onNext: (password: string) => void) => {
  const form = useForm<StepPasswordValues>({
    resolver: zodResolver(registerPasswordSchema)
  });

  const onSubmit = (data: StepPasswordValues) => {
    onNext(data.password);
  };

  return { form, onSubmit: form.handleSubmit(onSubmit) };
};

// --- HOOK CHO BƯỚC 2: BASIC INFO ---
export const useStepBasicInfo = (onNext: (data: StepBasicInfoValues) => void) => {
  const form = useForm<BasicInfoFormValues>({
    resolver: zodResolver(basicInfoSchema)
  });

  const onSubmit = (data: BasicInfoFormValues) => {
    // Ép kiểu an toàn từ string sang enum (vì schema đã validate rồi)
    onNext(data as unknown as StepBasicInfoValues);
  };

  return { form, onSubmit: form.handleSubmit(onSubmit) };
};

// --- HOOK CHO BƯỚC 3: HANDLE ---
export const useStepHandle = (onFinish: (handle: string) => void) => {
  const form = useForm<StepHandleValues>({
    resolver: zodResolver(handleSchema)
  });

  const onSubmit = (data: StepHandleValues) => {
    onFinish(data.handle);
  };

  return { form, onSubmit: form.handleSubmit(onSubmit) };
};