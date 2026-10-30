// Cau hinh Vitest cho React Testing Library
// File: vitest.config.js

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    // Su dung jsdom de gia lap trinh duyet trong terminal
    environment: 'jsdom',

    // Tu dong import @testing-library/jest-dom matchers (toBeInTheDocument, etc.)
    setupFiles: ['./src/__tests__/setup.js'],

    // Hien thi ket qua dep trong terminal khi demo
    reporters: ['verbose'],

    globals: true,
  },
});
