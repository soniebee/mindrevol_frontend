import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div 
      className="relative min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-[#F4EBE1] to-[#FFFFFF] text-[#1A1A1A] font-quicksand p-6 box-border bg-fixed overflow-hidden transition-colors duration-500"
    >
      {/* KHÔNG CÒN LỚP OVERLAY CHẤM BI NỮA - TẬP TRUNG SỰ TRONG TRẺO */}

      {/* Main Content: Bỏ hoàn toàn khái niệm "Khung/Card", thả trôi nội dung */}
      <div className="w-full max-w-[380px] flex flex-col items-center text-center relative z-10">
        <div className="w-full">
           {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;