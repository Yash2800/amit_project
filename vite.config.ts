import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  return {
    base: mode === 'production' ? '/aeromodelling/' : '/',
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:10000',
          changeOrigin: true
        }
      }
    }
  }
})
