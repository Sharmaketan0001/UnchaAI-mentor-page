import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // base will be set dynamically by GitHub Actions
  // For local dev, use '/'
  base: process.env.GITHUB_ACTIONS ? '/UnchaAI-mentor-page/' : '/',
})
