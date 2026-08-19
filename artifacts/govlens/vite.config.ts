import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { prepareStaticData } from './scripts/prepare-static-data.mjs';

const rawPort = process.env.PORT;
const port = rawPort ? Number(rawPort) : 3000;
const basePath = process.env.BASE_PATH ?? '/';

export default defineConfig({
  base: basePath,
  plugins: [
    {
      name: 'prepare-static-data',
      async buildStart() {
        await prepareStaticData();
      },
    },
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
    },
    dedupe: ['react', 'react-dom'],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, 'dist/public'),
    emptyOutDir: true,
    target: 'es2022',
    minify: 'esbuild',
    cssMinify: true,
    sourcemap: false,
    reportCompressedSize: true,
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 600,
    modulePreload: { polyfill: false },
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('state-facts-hi')) return 'data-sf-hi';
          if (id.includes('state-facts-scores')) return 'data-state-scores';
          if (id.includes('scheme-detail-hi')) return 'data-scheme-hi';
          if (id.includes('national-indicators-data')) return 'data-national-indicators';
          if (id.includes('manifesto-data')) return 'data-manifesto';
          // Vendor splitting — ALL React-dependent packages must be co-located
          // with react-dom/scheduler to guarantee initialisation order.
          // Separate chunks cause "Cannot set properties of undefined" crashes.
          if (id.includes('node_modules')) {
            if (id.includes('recharts') || id.includes('d3-') || id.includes('victory'))
              return 'vendor-charts';
            if (id.includes('i18next')) return 'vendor-i18n';
            if (id.includes('@tanstack')) return 'vendor-query';
            if (id.includes('lucide-react')) return 'vendor-icons';
            return 'vendor-react';
          }
        },
      },
    },
  },
  server: {
    port,
    strictPort: true,
    host: '0.0.0.0',
    allowedHosts: true,
    fs: {
      strict: true,
    },
    proxy: {
      '/api': {
        target: process.env.API_ORIGIN ?? 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
      '/data': {
        target: process.env.API_ORIGIN ?? 'http://127.0.0.1:8080',
        changeOrigin: true,
        rewrite: (path: string) => `/api/static${path.slice('/data'.length)}`,
      },
    },
    headers: {
      'Cache-Control': 'public, max-age=600',
    },
  },
  preview: {
    port,
    host: '0.0.0.0',
    allowedHosts: true,
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  },
});
