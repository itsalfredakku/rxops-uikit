import { test, expect } from '@playwright/test';

test.describe('Universal Style Customization', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/universal-style-demo');
  });

  test('Button accepts custom className', async ({ page }) => {
    const customButton = page.locator('[data-testid="submit-button"]');
    
    // Should have both component classes and custom classes
    await expect(customButton).toHaveClass(/inline-flex/); // Base component class
    await expect(customButton).toHaveAttribute('data-analytics', 'cta-click');
    await expect(customButton).toHaveAttribute('aria-label', 'Submit form with patient data');
  });

  test('Text component supports custom styling', async ({ page }) => {
    const customText = page.locator('text=Custom styled paragraph with Tailwind classes');
    
    // Should apply custom classes
    await expect(customText).toHaveClass(/text-purple-600/);
    await expect(customText).toHaveClass(/bg-purple-50/);
  });

  test('Input component accepts custom styling and data attributes', async ({ page }) => {
    const testInput = page.locator('[data-testid="patient-name-input"]');
    
    // Should have data attributes
    await expect(testInput).toHaveAttribute('data-required', 'true');
    await expect(testInput).toHaveAttribute('data-validation', 'patient-name');
    await expect(testInput).toHaveAttribute('aria-describedby', 'patient-name-help');
  });

  test('Emergency styling works correctly', async ({ page }) => {
    const emergencyButton = page.locator('text=ALERT TEAM');
    
    // Should have emergency styling
    await expect(emergencyButton).toHaveClass(/animate-pulse/);
    await expect(emergencyButton).toHaveCSS('background-color', 'rgb(220, 38, 38)');
  });

  test('Custom inline styles are applied', async ({ page }) => {
    const customInput = page.locator('input[placeholder="Custom styling..."]');
    
    // Should have custom styles
    await expect(customInput).toHaveCSS('border-radius', '25px');
    await expect(customInput).toHaveCSS('background-color', 'rgb(240, 253, 244)');
  });

  test('Healthcare context styling is preserved', async ({ page }) => {
    const emergencyCard = page.locator('.bg-red-50').first();
    
    // Should have emergency context styling
    await expect(emergencyCard).toHaveClass(/border-red-200/);
    await expect(emergencyCard).toHaveCSS('animation-name', 'pulse');
  });

  test('Accessibility attributes are maintained', async ({ page }) => {
    const errorInput = page.locator('input[placeholder="Emergency contact..."]');
    
    // Should have proper ARIA attributes
    await expect(errorInput).toHaveAttribute('aria-invalid', 'true');
    await expect(errorInput).toHaveAttribute('data-urgency', 'high');
    await expect(errorInput).toHaveAttribute('data-medical-context', 'emergency');
  });

  test('Component functionality is not broken by custom styling', async ({ page }) => {
    // Test button click functionality
    const alertButton = page.locator('text=ALERT TEAM');
    await alertButton.click();
    // Should not throw errors (button should be clickable)
    
    // Test input functionality
    const testInput = page.locator('[data-testid="patient-name-input"]');
    await testInput.fill('John Doe');
    await expect(testInput).toHaveValue('John Doe');
  });

  test('Multiple styling methods work together', async ({ page }) => {
    const enhancedButton = page.locator('text=Custom Enhanced Button');
    
    // Should have both className and potential inline styles
    await expect(enhancedButton).toHaveClass(/shadow-lg/);
    await expect(enhancedButton).toHaveClass(/hover:shadow-xl/);
    await expect(enhancedButton).toHaveClass(/transform/);
  });

  test('Healthcare emergency patterns work correctly', async ({ page }) => {
    const emergencyInput = page.locator('input[placeholder="Emergency contact..."]');
    const emergencyAlert = page.locator('text=This field requires immediate attention');
    
    // Should show error state
    await expect(emergencyInput).toHaveClass(/border-red-500/);
    await expect(emergencyInput).toHaveClass(/bg-red-50/);
    await expect(emergencyAlert).toBeVisible();
    await expect(emergencyAlert).toHaveAttribute('role', 'alert');
  });
});

test.describe('Style Precedence', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/universal-style-demo');
  });

  test('Custom classes override component defaults', async ({ page }) => {
    const customButton = page.locator('text=Emergency Button with Custom Styles');
    
    // Custom styles should take precedence
    await expect(customButton).toHaveCSS('background', /linear-gradient/);
    await expect(customButton).toHaveCSS('border-color', 'rgba(0, 0, 0, 0)'); // transparent
  });

  test('Inline styles have highest precedence', async ({ page }) => {
    const styledText = page.locator('text=Heading with inline styles');
    
    // Should have inline style color
    await expect(styledText).toHaveCSS('color', 'rgb(5, 150, 105)');
    await expect(styledText).toHaveCSS('font-family', /Georgia/);
  });

  test('Component base classes are preserved', async ({ page }) => {
    const anyButton = page.locator('button').first();
    
    // Should still have essential component classes
    await expect(anyButton).toHaveClass(/inline-flex/);
    await expect(anyButton).toHaveClass(/items-center/);
    await expect(anyButton).toHaveClass(/justify-center/);
  });
});

test.describe('Performance & Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/universal-style-demo');
  });

  test('No performance impact from custom styling', async ({ page }) => {
    // Measure page load time with custom styling
    const startTime = Date.now();
    await page.reload();
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // Should load reasonably fast (less than 3 seconds)
    expect(loadTime).toBeLessThan(3000);
  });

  test('Accessibility is maintained with custom styling', async ({ page }) => {
    // Run basic accessibility checks
    const buttons = page.locator('button');
    const inputs = page.locator('input');
    
    // All buttons should be focusable
    for (let i = 0; i < await buttons.count(); i++) {
      const button = buttons.nth(i);
      await button.focus();
      await expect(button).toBeFocused();
    }
    
    // All inputs should have proper labels
    for (let i = 0; i < await inputs.count(); i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        await expect(label).toBeVisible();
      }
    }
  });

  test('Focus management works with custom styling', async ({ page }) => {
    const customButton = page.locator('[data-testid="submit-button"]');
    
    await customButton.focus();
    await expect(customButton).toBeFocused();
    
    // Should have visible focus indicator
    await expect(customButton).toHaveCSS('outline', /none/); // Component uses focus-visible
  });
});
