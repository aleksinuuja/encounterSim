import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy D&D Beyond character API requests to avoid CORS
      '/api/dndbeyond': {
        target: 'https://character-service.dndbeyond.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/dndbeyond/, ''),
      }
    }
  }
})
