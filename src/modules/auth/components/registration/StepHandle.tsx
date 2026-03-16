import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { motion } from 'framer-motion';
import { AtSign, ArrowLeft, Loader } from 'lucide-react';
import { useStepHandle } from '../../hooks/useRegisterSteps';
import { authService } from '../../services/auth.service';

interface Props {
  onFinish: (handle: string) => void;
  onBack: () => void;
  isLoading: boolean;
}

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const StepHandle: React.FC<Props> = ({ onFinish, onBack, isLoading }) => {
  const { form, onSubmit } = useStepHandle(onFinish);
  const { register, formState: { errors }, setError, clearErrors, getValues } = form;
  const [isChecking, setIsChecking] = useState(false);

  const handleHandleBlur = async () => {
    const handle = getValues("handle");
    
    if (!handle || (errors as any).handle) return;

    setIsChecking(true);
    try {
      const { data } = await authService.checkHandle(handle);
      if (data.data === true) {
        setError("handle", { 
          type: "manual", 
          message: "This handle is already taken. Please choose another one." 
        });
      } else {
        if ((errors as any).handle?.type === 'manual') {
          clearErrors("handle");
        }
      }
    } catch (error) {
      console.error("Check handle error", error);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <motion.div 
      initial={{ x: 20, opacity: 0 }} 
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -20, opacity: 0 }}
      transition={{ duration: 0.3, ease: EASE_OUT }}
      className="space-y-5"
    >
      <div className="space-y-1.5">
        <h3 className="text-xl font-bold text-zinc-900">Choose a username</h3>
        <p className="text-sm text-zinc-600">Your unique ID helps friends find you easily.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-700">Username</label>
          <div className="relative group">
            <AtSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-sky-600" />
            <Input 
              placeholder="newuser"
              {...register('handle')} 
              onBlur={handleHandleBlur}
              error={(errors as any).handle?.message} 
              autoFocus
              disabled={isLoading || isChecking}
              className="h-11 rounded-lg border-zinc-200 bg-white pl-10 pr-10 text-sm focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-0 shadow-none disabled:bg-zinc-50 disabled:opacity-75"
            />
            
            {isChecking && (
              <motion.div
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sky-600"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Loader className="h-4 w-4" />
              </motion.div>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onBack} 
            disabled={isLoading} 
            className="h-11 px-3 rounded-lg border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 font-medium text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button 
            type="submit" 
            isLoading={isLoading || isChecking} 
            className="h-11 flex-1 rounded-lg bg-zinc-900 font-semibold text-white text-sm transition-all hover:bg-zinc-800 shadow-[0_4px_12px_rgba(15,23,42,0.15)]"
          >
            Finish
          </Button>
        </div>
      </form>
    </motion.div>
  );
};