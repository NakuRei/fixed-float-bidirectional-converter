/// <reference types="vitest" />

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
  },
  test: {
    globals: false,
    environment: 'jsdom',
    setupFiles: ['./vitest-setup.ts'],
    coverage: {
      include: ['src'],
      exclude: ['src/main.tsx'],
    },
  },
});
