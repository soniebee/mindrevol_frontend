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
      className="flex flex-col h-full space-y-6 w-full"
    >
      <div className="mb-2">
        <button 
          onClick={handleBack} 
          className="text-[#8A8580] hover:text-[#1A1A1A] flex items-center text-[0.95rem] font-bold transition-colors mb-4 group"
          type="button"
        >
          <ArrowLeft className="w-4 h-4 mr-1 transition-transform duration-300 group-hover:-translate-x-1" /> 
          Quay lại
        </button>
        
        {/* Khung email: Giữ nguyên viền và nền vàng nhạt, chỉ loại bỏ box-shadow cứng */}
        <div className="flex items-center gap-2 mt-2 text-[0.95rem] font-bold text-[#8A8580]">
           <span>Đang đăng nhập:</span>
           <span className="text-cute-dark bg-cute-yellow/60 border-2 border-cute-dark px-3 py-1 rounded-[10px]">
             {email}
           </span>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-5 flex-1 w-full">
        <div className="relative">
          <Input 
            {...register("password")}
            type={showPassword ? "text" : "password"} 
            label="Mật khẩu"
            placeholder="••••••••" 
            autoFocus
            disabled={isLoading}
            className="pr-12" 
          />
          <button
            type="button"
            onClick={toggleShowPassword}
            className="absolute right-[20px] top-[46px] text-[#A09D9A] hover:text-[#1A1A1A] transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
          </button>
        </div>
        
        <div className="flex justify-end -mt-3 mb-5">
            <button 
              type="button"
              onClick={handleForgotPassword}
              className="text-[0.95rem] font-bold text-[#8A8580] hover:text-[#1A1A1A] transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:w-full after:bg-[#1A1A1A] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left"
            >
              Quên mật khẩu hả?
            </button>
        </div>

        {error && (
          <div className="text-red-500 text-[0.9rem] bg-white shadow-[0_4px_12px_rgba(239,68,68,0.1)] font-bold p-3 rounded-[16px] flex items-center justify-center mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4 pt-2 w-full">
            <Button 
              type="submit" 
              isLoading={isLoading} 
              className="w-full flex items-center justify-center gap-2 group"
            >
              Mở cửa bước vào
              <svg className="transition-transform duration-300 group-hover:translate-x-1" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Button>

            <div className="relative text-center my-[1.5rem] text-[0.95rem] font-semibold text-[#8A8580]">
              <div className="absolute top-1/2 left-0 w-[25%] h-[1px] bg-[#D6CFC7]"></div>
              <span className="relative z-10 px-4">Hoặc là</span>
              <div className="absolute top-1/2 right-0 w-[25%] h-[1px] bg-[#D6CFC7]"></div>
            </div>

            <Button 
                type="button" 
                variant="outline" 
                onClick={handleSwitchToOtp}
                className="w-full"
            >
                <RefreshCw className="w-5 h-5 mr-2" />
                Dùng mã OTP cho nhanh
            </Button>
        </div>
      </form>
    </motion.div>
  );
};