import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for RxOps UI Kit Healthcare Testing
 * 
 * Optimized for medical device compatibility and clinical workflow validation.
 * Includes specialized testing for healthcare environments, accessibility compliance,
 * and medical device viewport compatibility.
 */

// Environment variable helpers
const isCI = typeof globalThis !== 'undefined' && globalThis.process?.env?.CI;

export default defineConfig({
  // Test directory structure
  testDir: './tests',
  
  // Healthcare-specific test patterns
  testMatch: [
    '**/visual-regression.spec.ts',
    '**/accessibility.spec.ts',
    '**/a11y-implementation.spec.ts',
    '**/healthcare-workflows.spec.ts',
    '**/visual/components.spec.ts'
  ],

  // Test execution configuration
  fullyParallel: true,
  forbidOnly: !!isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  timeout: 30000,

  // Enhanced reporting for healthcare compliance
  reporter: [
    ['html', { 
      outputFolder: 'test-results/html-report',
      open: 'never'
    }],
    ['json', { 
      outputFile: 'test-results/test-results.json' 
    }]
  ],

  // Global test configuration
  use: {
    // Base URL for UI Kit showcase
    baseURL: 'http://localhost:5173',
    
    // Browser configuration optimized for medical devices
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 30000,
    
    // Viewport optimized for clinical workflows
    viewport: { width: 1280, height: 720 },
    
    // Healthcare accessibility defaults
    colorScheme: 'light'
  },

  // Healthcare device testing matrix
  projects: [
    // Desktop Medical Workstations
    {
      name: 'medical-workstation-chrome',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }
      },
    },
    
    // Clinical Tablets (Most Common in Healthcare)
    {
      name: 'clinical-tablet-ipad',
      use: {
        ...devices['iPad Pro'],
        viewport: { width: 1024, height: 1366 },
        hasTouch: true
      },
    },

    // Mobile Healthcare Workers
    {
      name: 'mobile-healthcare',
      use: {
        ...devices['iPhone 12'],
        viewport: { width: 390, height: 844 }
      },
    },

    // Accessibility Testing
    {
      name: 'accessibility-testing',
      use: {
        ...devices['Desktop Chrome'],
        colorScheme: 'dark'
      },
    }
  ],

  // Web server configuration for UI Kit testing
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !isCI,
    timeout: 120000
  },

  // Visual comparison configuration
  expect: {
    // Visual comparison thresholds for healthcare UI
    toHaveScreenshot: {
      threshold: 0.1,
      maxDiffPixels: 50
    }
  },

  // Test output directories
  outputDir: 'test-results'
});
