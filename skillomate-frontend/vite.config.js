import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    allowedHosts: [
      'skillomate.onrender.com',
      'skillomate-backend.onrender.com',
      'skillomate-ai.onrender.com'
    ],
    proxy: {
      '/api/auth': {
        target: 'https://skillomate-backend.onrender.com', // Backend auth server (deployed on Render)
        changeOrigin: true,
        secure: true,
      },
      '/api/chat': {
        target: 'https://skillomate-backend.onrender.com', // Backend chat server (deployed on Render)
        changeOrigin: true,
        secure: true,
      },
      '/api/ai': {
        target: 'https://skillomate.onrender.com', // AI backend server (deployed on Render)
        changeOrigin: true,
        secure: true,
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
