/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/fixed-float-bidirectional-converter/',
  plugins: [react(), tailwindcss()],
  test: {
    globals: false,
    environment: 'jsdom',
    setupFiles: ['./vitest-setup.ts'],
    coverage: {
      include: ['src'],
      exclude: ['src/main.tsx', 'src/vite-env.d.ts'],
    },
  },
});
