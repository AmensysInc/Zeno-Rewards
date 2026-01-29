import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Production configuration
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json']
  },
  // Set base path if deploying to subdirectory
  // base: '/your-subdirectory/',
})

