import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base path must match the GitHub repo name for GitHub Pages deployment
export default defineConfig({
  plugins: [react()],
  base: '/Axiom-EMS/',
  server: {
    port: 5173,
  },
})
