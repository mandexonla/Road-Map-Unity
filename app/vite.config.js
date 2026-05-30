import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/Road-Map-Unity/',
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    open: true,
  },
});
