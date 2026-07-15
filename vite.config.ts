import path from 'path';
import { fileURLToPath } from 'url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('/firebase/')) return 'firebase';
          if (id.includes('/recharts/')) return 'recharts';
          if (id.includes('/react-router')) return 'router';
          if (id.includes('/react-dom/') || id.includes('/react/')) return 'react';
          if (id.includes('/motion/')) return 'motion';
        },
      },
    },
  },
});
