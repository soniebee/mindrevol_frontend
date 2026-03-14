import React from 'react';
import MainLayout from '@/components/layout/MainLayout';

const HomePage = () => {
  return (
    <MainLayout>
      <div className="flex flex-col flex-1 w-full h-full bg-zinc-50 dark:bg-[#121212] relative transition-colors duration-300 items-center justify-center">
        
        {/* Placeholder cho nội dung trang chủ */}
        <div className="text-center px-4">
          <h1 className="text-2xl md:text-4xl font-bold text-black dark:text-white mb-2" style={{ fontFamily: '"Jua", sans-serif' }}>
            Chào mừng bạn đến với MindRevol!
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Bạn đã đăng nhập thành công. Các tính năng bảng tin, hành trình sẽ được tích hợp sau.
          </p>
        </div>

      </div>
    </MainLayout>
  );
};

export default HomePage;