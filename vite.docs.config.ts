import { defineConfig } from 'vite'
import { qwikVite } from '@builder.io/qwik/optimizer'
import tsconfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(() => {
  return {
    plugins: [qwikVite(), tsconfigPaths(), tailwindcss()],
    build: {
      outDir: 'storybook-static'
    },
    server: {
      port: 3000,
      host: true
    },
    optimizeDeps: {
      include: ['@builder.io/qwik', '@builder.io/qwik/jsx-runtime']
    }
  }
})
