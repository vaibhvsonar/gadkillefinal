import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import fs from 'node:fs';

// Automatically sync public/images from gadkille-web if not already copied
const localPublic = path.resolve(__dirname, 'public');
const candidateSources = [
  path.resolve(__dirname, '../gadkille-web/public'),
  path.resolve(__dirname, '../../gadkille-web/public'),
];

for (const src of candidateSources) {
  if (fs.existsSync(src) && !fs.existsSync(path.join(localPublic, 'images'))) {
    try {
      fs.cpSync(src, localPublic, { recursive: true });
    } catch {
      // Ignore copy errors and fall back to publicDir resolution
    }
    break;
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
