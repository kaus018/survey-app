import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Настройки dev-сервера (например, проксирование)
    // proxy: {
    //   '/api': {
    //     target: 'http://localhost:8000',
    //     changeOrigin: true,
    //   },
    // },
  },
  preview: {
    host: '0.0.0.0',
    allowedHosts: [
      'survey-app-8h2c.onrender.com',
      '.onrender.com'
    ]
  },
  build: {
    // Настройки сборки (оптимизация, минификация и т.д.)
  },
})
