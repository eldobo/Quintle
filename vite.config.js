import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.js'],
    globals: true,
  },
  clearScreen: false,       // let Tauri own the terminal output
  server: {
    strictPort: true,       // Tauri must know the exact port
    port: 5173,
    watch: {
      ignored: ['**/src-tauri/**'],   // don't trigger Vite reloads on Rust changes
    },
  },
})
