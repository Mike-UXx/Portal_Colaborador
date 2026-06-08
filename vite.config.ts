import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: false, // fallback to next port if 3000 is taken
    open: true,        // auto-opens Chrome on npm run dev
  },
  optimizeDeps: {
    include: ['react-pdf', 'pdfjs-dist'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          pdfjs: ['pdfjs-dist'],
          antd: ['antd', '@ant-design/icons'],
        },
      },
    },
  },
});
