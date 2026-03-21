import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    // Sử dụng nền trắng, font Jua làm chủ đạo
    <div className="min-h-screen w-full flex items-center justify-center bg-white text-stone-800 font-['Jua'] selection:bg-lime-200 selection:text-red-950 relative overflow-hidden">
      
      {/* Background Decorative Blobs */}
      <div className="w-[488px] h-[488px] absolute -top-[10%] -left-[10%] bg-blue-300/80 blur-[125px] rounded-full pointer-events-none" />
      <div className="w-[400px] h-[400px] absolute bottom-[-10%] -right-[5%] bg-lime-200/60 blur-[125px] rounded-full pointer-events-none" />
      <div className="w-[300px] h-[300px] absolute top-[20%] right-[10%] bg-rose-200/50 blur-[100px] rounded-full pointer-events-none" />

      {/* Main Content */}
      <div className="w-full max-w-[440px] px-6 relative z-10">
        <div className="w-full">
           {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;