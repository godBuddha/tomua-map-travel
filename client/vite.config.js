import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        map: resolve(__dirname, 'map.html'),
        detail: resolve(__dirname, 'detail.html'),
        about: resolve(__dirname, 'about.html'),
        login: resolve(__dirname, 'login.html'),
        admin: resolve(__dirname, 'admin.html'),
        collaborator: resolve(__dirname, 'collaborator.html')
      }
    }
  },
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  css: {
    devSourcemap: true
  }
});
