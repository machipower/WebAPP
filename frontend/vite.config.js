import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 🔽 加這一段
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';

import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // 補 Node.js 內建模組
      buffer: 'buffer',
      process: 'process/browser',
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      // Node.js 全域 polyfill
      define: {
        global: 'globalThis',
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          process: true,
          buffer: true,
        }),
        NodeModulesPolyfillPlugin(),
      ],
    },
  },
});

