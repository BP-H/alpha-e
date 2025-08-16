import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // ensures relative asset paths for Vercel
  build: {
    outDir: 'dist', // Vercel serves files from this directory
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'react';
            if (id.includes('three')) return 'three';
            return 'vendor';
          }
        }
      }
    }
  }
});
