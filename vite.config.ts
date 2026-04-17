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
        theme_color: '#09090b', 
        background_color: '#09090b',
        display: 'standalone', 
        orientation: 'portrait', 
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
            purpose: 'any maskable' 
          }
        ]
      },
      // THÊM ĐOẠN NÀY ĐỂ FIX LỖI: Tăng giới hạn cache lên 5MB (5 * 1024 * 1024 bytes)
      workbox: {
        maximumFileSizeToCacheInBytes: 5242880,
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
            // 1. Tách các thư viện React cốt lõi
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'react-vendor';
            }
            // 2. Tách UI và Animations
            if (id.includes('framer-motion') || id.includes('lucide-react') || id.includes('zod')) {
              return 'ui-vendor';
            }
            // 3. THÊM MỚI: Tách riêng Firebase (rất nặng)
            if (id.includes('firebase')) {
              return 'firebase-vendor';
            }
            // 4. THÊM MỚI: Tách riêng thư viện Emoji (rất nặng)
            if (id.includes('emoji-picker-react')) {
              return 'emoji-vendor';
            }
            // Phần còn lại
            return 'vendor';
          }
        },
      },
    },
  },
});