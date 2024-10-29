import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    minify: true,
    chunkSizeWarningLimit: 500,
  },
  plugins: [react()],
})
