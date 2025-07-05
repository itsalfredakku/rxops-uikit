import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Healthcare Components Visual Tests & Demo Screenshots', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for components to load and animations to settle
    await page.waitForTimeout(1000);
  });

  test('UIKit Overview - Full Demo', async ({ page }) => {
    // Take a full page screenshot for the main README hero image
    await expect(page).toHaveScreenshot('demo-overview.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('Button variants demo', async ({ page }) => {
    // Navigate to button demo
    await page.locator('[data-testid="button-demo"]').scrollIntoViewIfNeeded();
    
    // Take high-quality screenshot for documentation
    await expect(page.locator('[data-testid="button-demo"]')).toHaveScreenshot('demo-buttons.png', {
      animations: 'disabled'
    });
    
    // Also take individual button state screenshots
    await page.hover('[data-testid="button-primary"]');
    await expect(page.locator('[data-testid="button-primary"]')).toHaveScreenshot('demo-button-hover.png');
  });

  test('Healthcare cards demo - Perfect for README', async ({ page }) => {
    // Navigate to healthcare components section
    await page.locator('[data-testid="healthcare-demo"]').scrollIntoViewIfNeeded();
    
    // Take comprehensive healthcare cards screenshot
    await expect(page.locator('[data-testid="healthcare-demo"]')).toHaveScreenshot('demo-healthcare-cards.png', {
      animations: 'disabled'
    });
    
    // Individual component demos
    await expect(page.locator('[data-testid="doctor-card"]')).toHaveScreenshot('demo-doctor-card.png');
    await expect(page.locator('[data-testid="appointment-card"]')).toHaveScreenshot('demo-appointment-card.png');
    await expect(page.locator('[data-testid="service-card"]')).toHaveScreenshot('demo-service-card.png');
    
    // Interactive states for better demos
    await page.hover('[data-testid="doctor-card"]');
    await expect(page.locator('[data-testid="doctor-card"]')).toHaveScreenshot('demo-doctor-card-hover.png');
  });

  test('Form components demo', async ({ page }) => {
    await page.locator('[data-testid="form-demo"]').scrollIntoViewIfNeeded();
    
    // Complete form demo for documentation
    await expect(page.locator('[data-testid="form-demo"]')).toHaveScreenshot('demo-form-components.png', {
      animations: 'disabled'
    });
    
    // Individual form elements with different states
    await page.fill('[data-testid="input-example"]', 'Sample input text');
    await expect(page.locator('[data-testid="input-example"]')).toHaveScreenshot('demo-input-filled.png');
    
    // Show form validation states
    await page.click('[data-testid="submit-form"]');
    await expect(page.locator('[data-testid="form-demo"]')).toHaveScreenshot('demo-form-validation.png');
  });

  test('Data components for documentation', async ({ page }) => {
    await page.locator('[data-testid="data-table"]').scrollIntoViewIfNeeded();
    
    // Desktop data table view
    await expect(page.locator('[data-testid="data-table"]')).toHaveScreenshot('demo-data-table-desktop.png', {
      animations: 'disabled'
    });
    
    // Mobile responsive view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.locator('[data-testid="data-table"]').scrollIntoViewIfNeeded();
    await expect(page.locator('[data-testid="data-table"]')).toHaveScreenshot('demo-data-table-mobile.png');
    
    // Reset viewport for other tests
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('Interactive components demo', async ({ page }) => {
    // Modal component demo
    await page.click('[data-testid="open-modal-btn"]');
    await page.waitForSelector('[data-testid="modal"]');
    
    // Take modal screenshot with backdrop
    await expect(page).toHaveScreenshot('demo-modal-component.png', {
      animations: 'disabled'
    });
    
    // Close modal
    await page.keyboard.press('Escape');
    
    // Tooltip demo
    await page.hover('[data-testid="tooltip-trigger"]');
    await page.waitForSelector('[data-testid="tooltip"]');
    await expect(page.locator('[data-testid="tooltip-container"]')).toHaveScreenshot('demo-tooltip-component.png');
    
    // Toast notification demo
    await page.click('[data-testid="show-toast"]');
    await page.waitForSelector('[data-testid="toast"]');
    await expect(page.locator('[data-testid="toast-container"]')).toHaveScreenshot('demo-toast-notification.png');
  });

  test('Layout components demo', async ({ page }) => {
    await page.locator('[data-testid="layout-demo"]').scrollIntoViewIfNeeded();
    
    // Grid system demo
    await expect(page.locator('[data-testid="grid-demo"]')).toHaveScreenshot('demo-grid-system.png', {
      animations: 'disabled'
    });
    
    // Stack layout demo
    await expect(page.locator('[data-testid="stack-demo"]')).toHaveScreenshot('demo-stack-layout.png');
    
    // Container demo
    await expect(page.locator('[data-testid="container-demo"]')).toHaveScreenshot('demo-container-layout.png');
  });

  test('Color palette and design system', async ({ page }) => {
    await page.locator('[data-testid="design-system"]').scrollIntoViewIfNeeded();
    
    // Color palette demo
    await expect(page.locator('[data-testid="color-palette"]')).toHaveScreenshot('demo-color-palette.png');
    
    // Typography demo
    await expect(page.locator('[data-testid="typography-demo"]')).toHaveScreenshot('demo-typography.png');
    
    // Spacing system
    await expect(page.locator('[data-testid="spacing-demo"]')).toHaveScreenshot('demo-spacing-system.png');
  });
});

test.describe('Accessibility Tests @a11y', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Homepage should be accessible', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Healthcare components should meet WCAG standards', async ({ page }) => {
    await page.locator('[data-testid="healthcare-demo"]').scrollIntoViewIfNeeded();
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('[data-testid="healthcare-demo"]')
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Form components should be keyboard navigable', async ({ page }) => {
    await page.locator('[data-testid="form-demo"]').scrollIntoViewIfNeeded();
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('[data-testid="form-demo"]')
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Color contrast should meet AA standards', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
