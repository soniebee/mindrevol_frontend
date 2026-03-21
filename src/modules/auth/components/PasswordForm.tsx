import React from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowLeft, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePasswordForm } from '../hooks/usePasswordForm';

export const PasswordForm = () => {
  const { 
    form, email, isLoading, error, showPassword, toggleShowPassword, 
    onSubmit, handleBack, handleSwitchToOtp, handleForgotPassword 
  } = usePasswordForm();
  const { register } = form;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: 20 }}
      className="flex flex-col h-full space-y-6"
    >
      <div className="mb-2">
        <button 
          onClick={handleBack} 
          className="text-stone-500 hover:text-red-950 flex items-center text-sm font-sans transition-colors mb-4 group"
          type="button"
        >
          <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" /> 
          Quay lại
        </button>
        
        <div className="flex items-center gap-2 mt-2 text-sm font-sans text-stone-500">
           <span>Đang đăng nhập:</span>
           <span className="text-blue-900 font-medium bg-blue-50 px-3 py-1 rounded-xl">
             {email}
           </span>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-5 flex-1">
        <div className="relative">
          <Input 
            {...register("password")}
            type={showPassword ? "text" : "password"} 
            label="Mật khẩu hiện tại"
            placeholder="Nhập mật khẩu..." 
            autoFocus
            disabled={isLoading}
            className="h-14 rounded-[20px] bg-neutral-100/70 border-none shadow-inner text-lg focus:ring-2 focus:ring-blue-300 font-sans pr-12" 
          />
          <button
            type="button"
            onClick={toggleShowPassword}
            className="absolute right-4 top-[42px] text-stone-400 hover:text-stone-600 transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
          </button>
        </div>
        
        <div className="flex justify-end -mt-2">
            <button 
              type="button"
              onClick={handleForgotPassword}
              className="text-sm font-sans text-stone-500 hover:text-blue-800 transition-colors hover:underline"
            >
              Quên mật khẩu?
            </button>
        </div>

        {error && (
          <div className="text-red-500 text-sm font-sans font-medium bg-red-50 p-3 rounded-2xl border border-red-100 flex items-center justify-center">
            {error}
          </div>
        )}

        <div className="space-y-4 pt-2">
            <Button 
              type="submit" 
              isLoading={isLoading} 
              className="w-full h-14 text-xl font-normal bg-blue-800/80 hover:bg-blue-800 text-white rounded-[20px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] transition-all"
            >
              Đăng nhập
            </Button>

            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-red-950/10" />
                </div>
                <div className="relative flex justify-center text-sm font-normal">
                  <span className="bg-[#fdfdfc] px-4 text-red-950/50">Hoặc</span>
                </div>
            </div>

            <Button 
                type="button" 
                variant="outline" 
                onClick={handleSwitchToOtp}
                className="w-full h-14 text-lg font-normal bg-lime-50/50 hover:bg-lime-100 border-none text-lime-950 rounded-[20px] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.05)]"
            >
                <RefreshCw className="w-5 h-5 mr-2" />
                Đăng nhập bằng mã OTP
            </Button>
        </div>
      </form>
    </motion.div>
  );
};