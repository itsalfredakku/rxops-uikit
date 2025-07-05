#!/usr/bin/env node

/**
 * Playwright Visual Testing Setup for RxOps UI Kit
 * 
 * Captures baseline screenshots for all components and establishes
 * visual regression testing framework for healthcare UI compliance.
 */

import { test, expect } from '@playwright/test';

// Healthcare component categories for systematic testing
const COMPONENT_CATEGORIES = {
  // Core interactive elements
  atoms: [
    'button', 'input', 'checkbox', 'radio', 'switch', 
    'badge', 'avatar', 'spinner', 'alert', 'link'
  ],
  
  // Complex interactive components  
  molecules: [
    'dropdown', 'tabs', 'pagination', 'breadcrumb', 'search-filter',
    'date-time-picker', 'file-upload', 'emergency-alert', 'service-card'
  ],
  
  // Layout and structural components
  organisms: [
    'modal', 'card', 'table', 'data-grid', 'skeleton',
    'header', 'footer', 'navigation'
  ],
  
  // Healthcare-specific components
  healthcare: [
    'patient-profile', 'appointment-calendar', 'medical-record',
    'vitals-signs', 'medication-tracker', 'lab-results',
    'doctor-card', 'health-dashboard'
  ]
};

// Test configuration for healthcare environments
const HEALTHCARE_TEST_CONFIG = {
  // Medical device viewports
  viewports: [
    { name: 'mobile-portrait', width: 375, height: 667 },
    { name: 'tablet-clinical', width: 768, height: 1024 },
    { name: 'desktop-workstation', width: 1440, height: 900 },
    { name: 'large-monitor', width: 1920, height: 1080 }
  ],
  
  // Healthcare-specific color modes
  colorModes: ['light', 'dark', 'high-contrast'],
  
  // Medical device interaction modes
  interactionModes: ['mouse', 'touch', 'keyboard-only'],
  
  // Clinical data states
  dataStates: ['empty', 'loading', 'populated', 'error', 'critical-alert']
};

test.describe('RxOps UI Kit - Visual Regression Testing', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the UI Kit showcase
    await page.goto('http://localhost:5173');
    
    // Wait for all components to load
    await page.waitForLoadState('networkidle');
    
    // Ensure consistent viewport for screenshots
    await page.setViewportSize({ width: 1200, height: 800 });
  });

  // Test Core Atomic Components
  test.describe('Atomic Components', () => {
    for (const component of COMPONENT_CATEGORIES.atoms) {
      test(`${component} - Visual Baseline`, async ({ page }) => {
        await page.goto(`http://localhost:5173/components/core/atoms/${component}`);
        await page.waitForLoadState('networkidle');
        
        // Wait for any animations to complete
        await page.waitForTimeout(500);
        
        // Take full page screenshot
        await expect(page).toHaveScreenshot(`${component}-baseline.png`, {
          fullPage: true,
          animations: 'disabled'
        });
        
        // Test hover states for interactive elements
        const interactiveElements = await page.locator('button, input, [role="button"]').all();
        for (let i = 0; i < Math.min(interactiveElements.length, 3); i++) {
          await interactiveElements[i].hover();
          await expect(page).toHaveScreenshot(`${component}-hover-${i}.png`, {
            fullPage: true,
            animations: 'disabled'
          });
        }
      });
    }
  });

  // Test Molecular Components
  test.describe('Molecular Components', () => {
    for (const component of COMPONENT_CATEGORIES.molecules) {
      test(`${component} - Visual Baseline`, async ({ page }) => {
        await page.goto(`http://localhost:5173/components/core/molecules/${component}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);
        
        await expect(page).toHaveScreenshot(`${component}-baseline.png`, {
          fullPage: true,
          animations: 'disabled'
        });
      });
    }
  });

  // Test Organism Components
  test.describe('Organism Components', () => {
    for (const component of COMPONENT_CATEGORIES.organisms) {
      test(`${component} - Visual Baseline`, async ({ page }) => {
        await page.goto(`http://localhost:5173/components/core/organisms/${component}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);
        
        await expect(page).toHaveScreenshot(`${component}-baseline.png`, {
          fullPage: true,
          animations: 'disabled'
        });
      });
    }
  });

  // Test Healthcare Components
  test.describe('Healthcare Components', () => {
    for (const component of COMPONENT_CATEGORIES.healthcare) {
      test(`${component} - Visual Baseline`, async ({ page }) => {
        await page.goto(`http://localhost:5173/components/healthcare/${component}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);
        
        await expect(page).toHaveScreenshot(`${component}-baseline.png`, {
          fullPage: true,
          animations: 'disabled'
        });
      });
    }
  });

  // Healthcare-Specific Viewport Testing
  test.describe('Medical Device Viewport Testing', () => {
    for (const viewport of HEALTHCARE_TEST_CONFIG.viewports) {
      test(`Emergency Alert - ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('http://localhost:5173/components/core/molecules/emergency-alert');
        await page.waitForLoadState('networkidle');
        
        await expect(page).toHaveScreenshot(`emergency-alert-${viewport.name}.png`, {
          fullPage: true,
          animations: 'disabled'
        });
      });
    }
  });

  // Accessibility Visual Testing
  test.describe('Accessibility Visual States', () => {
    test('Focus States Visibility', async ({ page }) => {
      await page.goto('http://localhost:5173/components/core/atoms/button');
      await page.waitForLoadState('networkidle');
      
      // Test focus visibility on interactive elements
      const buttons = await page.locator('button').all();
      for (let i = 0; i < Math.min(buttons.length, 3); i++) {
        await buttons[i].focus();
        const boundingBox = await buttons[i].boundingBox();
        await expect(page).toHaveScreenshot(`button-focus-${i}.png`, {
          clip: boundingBox || undefined,
          animations: 'disabled'
        });
      }
    });

    test('High Contrast Mode', async ({ page }) => {
      // Simulate high contrast mode
      await page.addStyleTag({
        content: `
          @media (prefers-contrast: high) {
            * {
              background-color: white !important;
              color: black !important;
              border-color: black !important;
            }
          }
        `
      });
      
      await page.goto('http://localhost:5173/components/core/atoms/button');
      await expect(page).toHaveScreenshot('button-high-contrast.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });
  });

  // Medical Data States Testing
  test.describe('Clinical Data States', () => {
    test('Emergency Alert Critical States', async ({ page }) => {
      await page.goto('http://localhost:5173/components/core/molecules/emergency-alert');
      await page.waitForLoadState('networkidle');
      
      // Test different severity levels
      const severities = ['info', 'warning', 'critical', 'life-threatening'];
      for (const severity of severities) {
        // Try to trigger different severity states
        const severityButton = page.locator(`[data-severity="${severity}"]`);
        if (await severityButton.count() > 0) {
          await severityButton.click();
          await page.waitForTimeout(200);
          await expect(page).toHaveScreenshot(`emergency-alert-${severity}.png`, {
            fullPage: true,
            animations: 'disabled'
          });
        }
      }
    });
  });

  // Loading States Testing
  test.describe('Loading States', () => {
    test('Skeleton Components', async ({ page }) => {
      await page.goto('http://localhost:5173/components/core/organisms/skeleton');
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveScreenshot('skeleton-loading-states.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('Spinner Components', async ({ page }) => {
      await page.goto('http://localhost:5173/components/core/atoms/spinner');
      await page.waitForLoadState('networkidle');
      
      // Disable animations for consistent screenshots
      await page.addStyleTag({
        content: `
          *, *::before, *::after {
            animation-duration: 0s !important;
            animation-delay: 0s !important;
            transition-duration: 0s !important;
            transition-delay: 0s !important;
          }
        `
      });
      
      await expect(page).toHaveScreenshot('spinner-variations.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });
  });
});

// Component interaction testing
test.describe('Component Interactions', () => {
  test('Button Click States', async ({ page }) => {
    await page.goto('http://localhost:5173/components/core/atoms/button');
    await page.waitForLoadState('networkidle');
    
    const button = page.locator('button').first();
    
    // Normal state
    await expect(button).toHaveScreenshot('button-normal.png');
    
    // Hover state
    await button.hover();
    await expect(button).toHaveScreenshot('button-hover.png');
    
    // Active state (during click)
    await button.click({ delay: 100 });
    await expect(button).toHaveScreenshot('button-active.png');
  });

  test('Form Component States', async ({ page }) => {
    await page.goto('http://localhost:5173/components/core/atoms/input');
    await page.waitForLoadState('networkidle');
    
    const input = page.locator('input').first();
    
    // Empty state
    await expect(input).toHaveScreenshot('input-empty.png');
    
    // Focused state
    await input.focus();
    await expect(input).toHaveScreenshot('input-focused.png');
    
    // Filled state
    await input.fill('Test medical data');
    await expect(input).toHaveScreenshot('input-filled.png');
  });
});

export {};
