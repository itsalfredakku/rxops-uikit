import { defineConfig } from 'vitest/config';
import { qwikVite } from '@builder.io/qwik/optimizer';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    qwikVite({
      client: {
        outDir: 'lib'
      },
      ssr: {
        outDir: 'lib-types'
      }
    }), 
    tsconfigPaths()
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts', './__tests__/setup/test-utils.ts'],
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      '__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
    exclude: [
      'node_modules/**',
      'dist/**',
      'lib/**',
      'lib-types/**',
      'demo/**',
      'demo/**'
    ],
    testTimeout: 10000,
    hookTimeout: 10000,
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true
      }
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'lib/',
        'lib-types/',
        'dist/',
        '**/*.d.ts',
        'src/test-setup.ts',
        '**/*.config.*',
      ],
      thresholds: {
        global: {
          branches: 60,
          functions: 60,
          lines: 60,
          statements: 60,
        },
      },
    },
  },
  resolve: {
    alias: {
      '~': new URL('./src', import.meta.url).pathname
    }
  },
  esbuild: {
    target: 'esnext'
  }
});
