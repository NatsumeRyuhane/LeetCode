import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

import { coachData } from './plugins/coachData.ts';

export default defineConfig({
  plugins: [react(), tailwindcss(), coachData()],
  server: {
    port: 5273,
    strictPort: false,
    open: false,
  },
  preview: { port: 5273 },
  build: { outDir: 'dist', emptyOutDir: true },
});
