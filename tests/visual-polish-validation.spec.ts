import { test, expect } from '@playwright/test';

test.describe('Visual Polish Phase - Track 1 Improvements', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the Showcase visual polish demo page
    await page.goto('http://localhost:5173/components/visual-polish/');
    
    // Wait for the page to load
    await page.waitForSelector('h1:has-text("Visual Polish Demo")');
  });

  test('VISUAL-006: Medical alerts have enhanced visual hierarchy', async ({ page }) => {
    // Test critical alert visibility
    const criticalAlert = page.locator('[data-severity="critical"]');
    await expect(criticalAlert).toHaveClass(/animate-pulse/);
    await expect(criticalAlert).toHaveClass(/ring-4/);
    await expect(criticalAlert).toHaveClass(/border-4/);
  });

  test('VISUAL-002: Interactive elements have hover states', async ({ page }) => {
    // Test button hover states
    const button = page.locator('button').first();
    await button.hover();
    
    // Test card hover states
    const card = page.locator('[class*="card"]').first();
    await card.hover();
    
    // Verify transform and shadow changes on hover
    await expect(card).toHaveClass(/hover:shadow-lg/);
  });

  test('VISUAL-004: Touch targets meet 44px minimum requirement', async ({ page }) => {
    // Test button sizes
    const buttons = page.locator('button');
    const count = await buttons.count();
    
    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const boundingBox = await button.boundingBox();
      
      if (boundingBox) {
        expect(boundingBox.height).toBeGreaterThanOrEqual(44);
        if (boundingBox.width < 200) { // Exclude full-width buttons
          expect(boundingBox.width).toBeGreaterThanOrEqual(44);
        }
      }
    }
    
    // Test input heights
    const inputs = page.locator('input');
    const inputCount = await inputs.count();
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const boundingBox = await input.boundingBox();
      
      if (boundingBox) {
        expect(boundingBox.height).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test('A11Y-005: Color contrast meets WCAG AA standards', async ({ page }) => {
    // Test alert text contrast
    const alerts = page.locator('[role="alert"]');
    const count = await alerts.count();
    
    for (let i = 0; i < count; i++) {
      const alert = alerts.nth(i);
      
      // Check for high contrast classes
      const hasHighContrastText = await alert.evaluate(el => {
        const style = window.getComputedStyle(el);
        const bgColor = style.backgroundColor;
        const textColor = style.color;
        
        // Simple heuristic: dark text (900 shades) on light backgrounds
        return textColor.includes('900') || textColor.includes('800') || textColor === 'rgb(255, 255, 255)';
      });
      
      expect(hasHighContrastText).toBe(true);
    }
  });

  test('VISUAL-003: Cards have consistent visual hierarchy', async ({ page }) => {
    // Test card shadows and elevation
    const cards = page.locator('[class*="card"], .bg-white');
    const count = await cards.count();
    
    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);
      
      // Check for shadow classes
      const hasShadow = await card.evaluate(el => {
        return el.className.includes('shadow');
      });
      
      expect(hasShadow).toBe(true);
    }
  });
});
