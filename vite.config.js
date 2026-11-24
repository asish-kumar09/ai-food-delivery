import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')

  return {
    base: './',
    plugins: [
      react(),
      {
        name: 'quickbite-service-urls',
        transform(code) {
          return code
            .replaceAll('http://localhost:8080', env.VITE_API_URL || 'http://localhost:8080')
            .replaceAll('http://localhost:8000', env.VITE_ML_URL || 'http://localhost:8000')
        },
      },
    ],
  }
})
