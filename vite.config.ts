import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',                           // keep SPA at root
  resolve: {
    // 🔧 critical: force ONE copy of 'three' in the bundle
    dedupe: ['three'],
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'react';
            if (id.includes('three')) return 'three';
            return 'vendor';
          }
        },
      },
    },
  },
});
