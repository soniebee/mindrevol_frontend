import React from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { motion } from 'framer-motion';
import { useEmailForm } from '../hooks/useEmailForm';

export const EmailForm = () => {
  const { form, isLoading, error, onSubmit, social } = useEmailForm();
  const { register, formState: { errors } } = form;

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col w-full"
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-5 w-full">
        <div className="w-full">
          <Input 
            {...register('email')} 
            label="Tài khoản"
            placeholder="Nhập email hoặc tên" 
            autoFocus 
            error={errors.email?.message}
            disabled={isLoading}
          />
        </div>
        
        {error && <p className="text-red-500 text-[0.9rem] font-bold text-center -mt-2">{error}</p>}
        
        <Button 
          type="submit" 
          isLoading={isLoading} 
          className="w-full flex items-center justify-center gap-2 group"
        >
          Tiếp tục
          <svg className="transition-transform duration-300 group-hover:translate-x-1" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </Button>
      </form>

      <div className="relative text-center my-[2.5rem] text-[0.95rem] font-semibold text-[#8A8580]">
        <div className="absolute top-1/2 left-0 w-[25%] h-[1px] bg-[#D6CFC7]"></div>
        <span className="relative z-10 px-4">Hoặc tiếp tục bằng</span>
        <div className="absolute top-1/2 right-0 w-[25%] h-[1px] bg-[#D6CFC7]"></div>
      </div>

      <Button 
          variant="outline" 
          type="button" 
          onClick={() => social.google()} 
          className="w-full flex items-center justify-center gap-3"
          isLoading={isLoading} 
      >
        {!isLoading && (
          <img src="https://api.iconify.design/logos:google-icon.svg" alt="Google" width="22" height="22" />
        )}
        <span>Google</span>
      </Button>
    </motion.div>
  );
};