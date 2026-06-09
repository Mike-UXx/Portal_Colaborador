import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serves this project at https://<user>.github.io/Portal_Colaborador/
// so the production build needs that sub-path as its base. Local dev stays at "/".
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/Portal_Colaborador/' : '/',
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
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('pdfjs-dist')) return 'pdfjs';
            if (id.includes('antd') || id.includes('@ant-design')) return 'antd';
          }
        },
      },
    },
  },
}));
