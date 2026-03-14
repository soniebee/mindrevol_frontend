// src/modules/auth/pages/TikTokCallback.tsx
import React from 'react';
import { useTikTokCallback } from '../hooks/useTikTokCallback';

export const TikTokCallback = () => {
  useTikTokCallback(); // Logic nằm hết trong này

  return (
    <div className="flex h-screen items-center justify-center bg-black text-white">
      <div className="text-center">
        <h2 className="text-xl font-bold animate-pulse">Đang xử lý đăng nhập TikTok...</h2>
        <p className="text-zinc-500 text-sm mt-2">Vui lòng không tắt trình duyệt</p>
      </div>
    </div>
  );
};