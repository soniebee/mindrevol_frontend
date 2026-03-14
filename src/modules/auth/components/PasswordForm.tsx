import React from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowLeft, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePasswordForm } from '../hooks/usePasswordForm'; // Import Hook

export const PasswordForm = () => {
  // Destructuring tất cả logic từ hook
  const { 
    form, 
    email, 
    isLoading, 
    error, 
    showPassword, 
    toggleShowPassword, 
    onSubmit, 
    handleBack, 
    handleSwitchToOtp, 
    handleForgotPassword 
  } = usePasswordForm();

  const { register } = form; // Lấy hàm register để gắn vào Input

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: 20 }}
      className="flex flex-col h-full"
    >
      {/* HEADER: Nút quay lại & Tiêu đề */}
      <div className="mb-6">
        <button 
          onClick={handleBack} 
          className="text-zinc-500 hover:text-white flex items-center text-sm transition-colors mb-4 group"
          type="button"
        >
          <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" /> 
          Quay lại
        </button>
        
        <h2 className="text-2xl font-bold text-white tracking-tight">Nhập mật khẩu</h2>
        <div className="flex items-center gap-2 mt-2 text-sm text-zinc-400">
           <span>Đang đăng nhập cho:</span>
           <span className="text-[#FFF5C0] font-medium bg-[#FFF5C0]/10 px-2 py-0.5 rounded border border-[#FFF5C0]/20">
             {email}
           </span>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-5 flex-1">
        
        {/* INPUT PASSWORD */}
        <div className="relative">
          <Input 
            {...register("password")}
            type={showPassword ? "text" : "password"} 
            label="Mật khẩu hiện tại"
            placeholder="Nhập mật khẩu..." 
            autoFocus
            disabled={isLoading}
            className="h-12 pr-10" 
          />
          <button
            type="button"
            onClick={toggleShowPassword}
            className="absolute right-3 top-[34px] text-zinc-500 hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
          </button>
        </div>
        
        {/* Nút Quên mật khẩu */}
        <div className="flex justify-end -mt-1">
            <button 
              type="button"
              onClick={handleForgotPassword}
              className="text-xs text-zinc-500 hover:text-[#FFF5C0] transition-colors hover:underline"
            >
              Quên mật khẩu?
            </button>
        </div>

        {/* Hiển thị lỗi */}
        {error && (
          <div className="text-red-500 text-sm font-medium bg-red-500/10 p-3 rounded-xl border border-red-500/20 flex items-center justify-center">
            {error}
          </div>
        )}

        <div className="space-y-3 pt-2">
            {/* Nút Đăng nhập */}
            <Button type="submit" isLoading={isLoading} className="w-full h-12 text-base font-bold shadow-none">
              Đăng nhập
            </Button>

            {/* Phân cách */}
            <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-zinc-800" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                  <span className="bg-[#050505] px-2 text-zinc-600">Hoặc</span>
                </div>
            </div>

            {/* Nút chuyển sang OTP */}
            <Button 
                type="button" 
                variant="outline" 
                onClick={handleSwitchToOtp}
                className="w-full h-12 bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all"
            >
                <RefreshCw className="w-4 h-4 mr-2" />
                Đăng nhập bằng mã OTP
            </Button>
        </div>
      </form>
    </motion.div>
  );
};