import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/predict': 'http://localhost:5000',
      '/login': 'http://localhost:5000',
      '/register': 'http://localhost:5000',
      '/logout': 'http://localhost:5000',
      '/dashboard-data': 'http://localhost:5000',
      '/checklist': 'http://localhost:5000',
      '/theme': 'http://localhost:5000',
      '/chatbot': 'http://localhost:5000',
      '/download_report': 'http://localhost:5000',
      '/uploads': 'http://localhost:5000',
    }
  }
})
