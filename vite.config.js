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
  build: {
    // Настройки сборки (оптимизация, минификация и т.д.)
  },
})