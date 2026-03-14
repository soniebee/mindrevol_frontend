import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    // 'dark' class kích hoạt chế độ tối cho các component con
    <div className="dark min-h-screen w-full flex items-center justify-center bg-[#050505] text-white font-sans selection:bg-[#FFF5C0] selection:text-black relative overflow-hidden">
      
      {/* Background: Gradient Spotlight nhẹ từ trên xuống */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-[#FFF5C0]/5 to-transparent blur-3xl pointer-events-none" />
      
      {/* Background: Noise Texture rất mờ để tạo độ nhám */}
      <div className="absolute inset-0 opacity-[0.15] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150 mix-blend-overlay pointer-events-none"></div>

      {/* Main Content */}
      <div className="w-full max-w-[440px] px-6 relative z-10">
        
        {/* Không cần Card bao quanh nữa, để Form "thở" trên nền đen sẽ sang hơn */}
        <div className="w-full">
           {children}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
           {/* <p className="text-xs text-zinc-600 font-medium">
             © 2024 MindRevol Inc.
           </p> */}
        </div>

      </div>
    </div>
  );
};

export default AuthLayout;