// src/modules/auth/pages/TikTokCallback.tsx
import React from 'react';
import { useTikTokCallback } from '../hooks/useTikTokCallback';

export const TikTokCallback = () => {
  useTikTokCallback(); // Callback logic lives in the hook

  return (
    <div className="flex h-screen items-center justify-center bg-black text-white">
      <div className="text-center">
        <h2 className="text-xl font-bold animate-pulse">Processing TikTok sign-in...</h2>
        <p className="text-zinc-500 text-sm mt-2">Please keep this tab open</p>
      </div>
    </div>
  );
};