import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
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
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      },
      // BẮT BUỘC PWA CHẤP NHẬN FILE LÊN ĐẾN 10MB
      workbox: {
        maximumFileSizeToCacheInBytes: 10485760, // 10 * 1024 * 1024
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  
  define: {
    global: 'window',
  },

  esbuild: {
    drop: ['console', 'debugger'] as any,
  },
  
  build: {
    // Tăng giới hạn cảnh báo lên 3MB để Vercel không cằn nhằn
    chunkSizeWarningLimit: 3000, 
    // Đã xóa bỏ phần manualChunks gây lỗi vòng lặp
  },
});