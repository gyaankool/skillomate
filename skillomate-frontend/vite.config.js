import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api/auth': {
        target: 'http://localhost:5000', // Backend auth server
        changeOrigin: true,
        secure: false,
      },
      '/api/chat': {
        target: 'http://localhost:5000', // Backend chat server
        changeOrigin: true,
        secure: false,
      },
      '/api/ai': {
        target: 'http://localhost:8000', // AI backend server
        changeOrigin: true,
        secure: false,
      },
      '/socket.io/': {
        target: 'https://salesy.ai.anonimo.one',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
})
