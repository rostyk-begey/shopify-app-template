import { defineConfig } from 'vite';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

if (
  process.env.npm_lifecycle_event === 'build' &&
  !process.env.CI &&
  !process.env.SHOPIFY_API_KEY
) {
  console.warn(
    '\nBuilding the frontend app without an API key. The frontend build will not run without an API key. Set the SHOPIFY_API_KEY environment variable when running the build command.\n'
  );
}

const proxyOptions = {
  target: `http://127.0.0.1:${process.env.BACKEND_PORT}`,
  changeOrigin: false,
  secure: true,
  ws: false,
};

const host = process.env.HOST
  ? process.env.HOST.replace(/https?:\/\//, '')
  : 'localhost';

let hmrConfig = {
  protocol: 'ws',
  host,
  port: 64999,
  clientPort: 64999,
};

if (host !== 'localhost') {
  hmrConfig = {
    ...hmrConfig,
    protocol: 'wss',
    port: parseInt(process.env.FRONTEND_PORT || '', 10),
    clientPort: 443,
  };
}

// const root = dirname(fileURLToPath(import.meta.url));

console.log(dirname(join(fileURLToPath(import.meta.url), '../../*')));

export default defineConfig({
  root: dirname(fileURLToPath(import.meta.url)),
  plugins: [
    react(),
    tsconfigPaths({
      projects: [
        './tsconfig.json',
        '../../tsconfig.base.json',
        '../../libs/shared/tsconfig.json',
      ],
    }),
  ],
  define: {
    'process.env.SHOPIFY_API_KEY': JSON.stringify(process.env.SHOPIFY_API_KEY),
  },
  resolve: {
    preserveSymlinks: true,
  },
  server: {
    host: 'localhost',
    port: parseInt(process.env.FRONTEND_PORT || '', 10),
    hmr: hmrConfig,
    proxy: {
      '^/(\\?.*)?$': proxyOptions,
      '^/api(/|(\\?.*)?$)': proxyOptions,
    },
  },
});
