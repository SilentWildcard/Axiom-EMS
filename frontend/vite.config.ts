import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Supports GitHub Pages (/Axiom-EMS/) while maintaining compatibility with Vercel and local root serving (/)
const basePath = process.env.VITE_BASE_PATH || (process.env.VERCEL ? '/' : '/Axiom-EMS/')

export default defineConfig({
  plugins: [react()],
  base: basePath,
  server: {
    port: 5173,
  },
})
