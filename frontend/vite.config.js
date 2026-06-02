import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    // Silence the chunk-size warning — lucide-react is large but tree-shaken at runtime
    chunkSizeWarningLimit: 1000,
  },
})
