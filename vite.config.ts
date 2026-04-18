import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    manifest: true,
    sourcemap: true,
    rollupOptions: {
      input: [resolve(__dirname, 'client-entry.tsx')],
    },
  },
});
