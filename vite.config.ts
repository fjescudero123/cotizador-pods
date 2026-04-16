import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    dedupe: ['react', 'react-dom', 'firebase'],
    alias: {
      '@mayu/hooks': fileURLToPath(new URL('./src/hooks/shared/index.ts', import.meta.url))
    }
  }
})

