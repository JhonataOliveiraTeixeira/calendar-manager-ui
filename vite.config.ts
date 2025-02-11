import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    hmr: {
      host: 'localhost', // ou o IP que você acessa a aplicação
      port: 5173,
    },
    watch: {
      usePolling: true,
    },
  },
})