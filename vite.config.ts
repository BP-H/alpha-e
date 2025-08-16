import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Base path for serving the app; should align with BrowserRouter basename
  base: '/',
  build: {
    outDir: 'dist',    // ← ADD THIS (tells Vercel where built files are)
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
