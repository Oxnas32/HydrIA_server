import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0', // Allow network access
    allowedHosts: ['hydria.miviro.es'], // Allow external Caddy host
    hmr: {
      host: 'hydria.miviro.es',
      protocol: 'wss', // Secure websockets via Caddy
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
});