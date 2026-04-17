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
      workbox: {
        // Tăng giới hạn lên 10MB
        maximumFileSizeToCacheInBytes: 10485760, 
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
    chunkSizeWarningLimit: 1500, 
    rollupOptions: {
      output: {
        // Tách file an toàn dựa theo đường dẫn, không gây lỗi Circular
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('firebase') || id.includes('@firebase')) return 'firebase-vendor';
            if (id.includes('emoji-picker-react')) return 'emoji-vendor';
            if (id.includes('mapbox') || id.includes('leaflet') || id.includes('@mapbox')) return 'map-vendor';
            if (id.includes('framer-motion')) return 'motion-vendor';
          }
        }
      }
    }
  },
});