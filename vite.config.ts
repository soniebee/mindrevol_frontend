import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
// 1. Import plugin PWA
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    // 2. Cấu hình PWA
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'MindRevol',
        short_name: 'MindRevol',
        description: 'Nơi lưu giữ những hành trình kỷ niệm thân mật.',
        theme_color: '#09090b', // Màu nền (trùng với bg-zinc-950)
        background_color: '#09090b',
        display: 'standalone', // Quan trọng: Chế độ full màn hình như App
        orientation: 'portrait', // Khóa màn hình dọc
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable' // Icon cho Android mới (bo tròn)
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  
  // [FIX LỖI]: Định nghĩa biến global là window để các thư viện cũ không bị crash
  define: {
    global: 'window',
  },

  esbuild: {
    drop: ['console', 'debugger'] as any,
  },
  
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'react-vendor';
            }
            if (id.includes('framer-motion') || id.includes('lucide-react') || id.includes('zod')) {
              return 'ui-vendor';
            }
            return 'vendor';
          }
        },
      },
    },
  },
});