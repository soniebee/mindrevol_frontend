import React from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { motion } from 'framer-motion';
import { useStepBasicInfo } from '../../hooks/useRegisterSteps';
import { StepBasicInfoValues } from '../../schemas/auth.schema';
import { ArrowLeft } from 'lucide-react';

interface Props {
  onNext: (data: StepBasicInfoValues) => void;
  onBack: () => void;
}

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const StepBasicInfo: React.FC<Props> = ({ onNext, onBack }) => {
  const { form, onSubmit } = useStepBasicInfo(onNext);
  const { register, formState: { errors } } = form;

  return (
    <motion.div 
      initial={{ x: 20, opacity: 0 }} 
      animate={{ x: 0, opacity: 1 }} 
      exit={{ x: -20, opacity: 0 }}
      transition={{ duration: 0.3, ease: EASE_OUT }}
      className="space-y-5"
    >
      <div className="space-y-1.5">
        <h3 className="text-xl font-bold text-zinc-900">Tell us about yourself</h3>
        <p className="text-sm text-zinc-600">We need a few basic details.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        {/* Display name */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-700">Display name</label>
          <Input 
            placeholder="Example: Son Tran"
            {...register('fullname')} 
            error={errors.fullname?.message} 
            autoFocus
            className="h-11 rounded-lg border-zinc-200 bg-white pl-4 pr-4 text-sm focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-0 shadow-none"
          />
        </div>

        {/* Date of birth */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-700">Date of birth</label>
          <Input 
            type="date"
            {...register('dateOfBirth')} 
            error={errors.dateOfBirth?.message} 
            className="h-11 rounded-lg border-zinc-200 bg-white pl-4 pr-4 text-sm focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-0 shadow-none"
          />
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-700">Gender</label>
          <select
            {...register('gender')}
            defaultValue=""
            className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900 outline-none transition-all cursor-pointer focus:border-sky-500 focus:ring-2 focus:ring-sky-200 hover:border-zinc-300 shadow-none"
          >
            <option value="" disabled>Select gender...</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
            <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
          </select>
          {errors.gender && <span className="text-xs text-red-600 font-medium">{errors.gender.message}</span>}
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-3 pt-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onBack} 
            className="h-11 px-3 rounded-lg border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 font-medium text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button 
            type="submit" 
            className="h-11 flex-1 rounded-lg bg-zinc-900 font-semibold text-white text-sm transition-all hover:bg-zinc-800 shadow-[0_4px_12px_rgba(15,23,42,0.15)]"
          >
            Continue
          </Button>
        </div>
      </form>
    </motion.div>
  );
};