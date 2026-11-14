import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import path from "path"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
      "redux-persist/integration/react": "redux-persist/es/integration/react.js",
    },
  },
  optimizeDeps: {
    include: ['redux-persist'],
  },
  build: {
    target: 'esnext',
    chunkSizeWarningLimit: 1200,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            if (id.includes('@reduxjs') || id.includes('react-redux') || id.includes('redux')) {
              return 'vendor-redux';
            }
            if (id.includes('firebase')) {
              return 'vendor-firebase';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-lucide';
            }
            if (id.includes('recharts') || id.includes('chart.js') || id.includes('d3')) {
              return 'vendor-charts';
            }
            if (id.includes('axios')) {
              return 'vendor-axios';
            }
            return 'vendor-others';
          }
          if (id.includes('pages/supplier')) {
            return 'panel-supplier';
          }
          if (id.includes('pages/delivery') || id.includes('driver logistics')) {
            return 'panel-logistics';
          }
          if (id.includes('pages/dropshipper')) {
            return 'panel-dropshipper';
          }
          if (id.includes('pages/admin_panel')) {
            return 'panel-admin';
          }
          if (id.includes('Design_Ecosystem')) {
            return 'panel-themes';
          }
        }
      }
    }
  }
})
