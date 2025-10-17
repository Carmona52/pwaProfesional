import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
  VitePWA({
    registerType: 'autoUpdate',
    srcDir:'src',
    filename:"sw.ts",
    strategies: 'injectManifest',
    injectRegister: 'auto',
    includeAssets: ['favicon.ico', 'robots.txt','offline.html', 'icons/*.png'],
    manifest: {
      "name": "Aplicacion Web Progresiva de Mensajes",
      "short_name": "App Mensajes",
      "description": "Una aplicacion web progresiva de Mensajeria",
      "start_url": "/",
      "display": "standalone",
      "background_color": "#ffffff",
      "theme_color": "#0d6efd",
      "icons": [
        {
          "src": "/icons/Icon512x512.png",
          "sizes": "512x512",
          "type": "image/png"
        },
        {
          "src": "/icons/Icon256x256.png",
          "sizes": "256x256",
          "type": "image/png"
        },
        {
          "src": "/icons/Icon128x128.png",
          "sizes": "128x128",
          "type": "image/png"
        },
        {
          "src": "/icons/Icon64x64.png",
          "sizes": "64x64",
          "type": "image/png"
        }
      ]
    },
    workbox:{
      globPatterns: ['**/*.{js,css,html,png,svg,ico,json}'],
      runtimeCaching:[
        {
          urlPattern: ({ request }) => request.destination === 'document',
          handler: 'NetworkFirst',
          options: {
            cacheName: 'html-cache',
          },
        },
        {
          urlPattern: ({ request }) => request.destination === 'script' || request.destination === 'style',
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'static-resources',
          },
        },

      ]
    }
  })],
})
