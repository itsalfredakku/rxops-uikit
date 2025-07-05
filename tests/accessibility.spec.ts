import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * A11Y-001: Comprehensive Accessibility Testing Setup
 * 
 * This test suite provides automated accessibility testing with axe-core
 * for healthcare compliance including WCAG 2.1 AA and medical device standards.
 */

test.describe('Healthcare Accessibility Testing @a11y', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to demo page
    await page.goto('http://localhost:3000');
    // Wait for components to load
    await page.waitForTimeout(1000);
  });

  test.describe('WCAG 2.1 AA Compliance', () => {
    test('Homepage should meet WCAG 2.1 AA standards', async ({ page }) => {
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('Color contrast should meet AA standards (4.5:1 normal, 3:1 large)', async ({ page }) => {
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2aa'])
        .include('*') // Test all elements
        .analyze();

      // Filter for color contrast violations specifically
      const colorContrastViolations = accessibilityScanResults.violations.filter(
        violation => violation.id === 'color-contrast'
      );

      expect(colorContrastViolations).toEqual([]);
    });

    test('All images should have alternative text', async ({ page }) => {
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withRules(['image-alt'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('All form elements should have labels', async ({ page }) => {
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withRules(['label'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });

  test.describe('Healthcare-Specific Accessibility', () => {
    test('Emergency alerts should be properly announced', async ({ page }) => {
      // Test emergency alert accessibility
      await page.locator('[data-testid="emergency-demo"]').scrollIntoViewIfNeeded();
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .include('[data-testid="emergency-demo"]')
        .withRules(['aria-live-region-polite'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
      
      // Check for aria-live regions
      const ariaLiveElements = await page.locator('[aria-live]').count();
      expect(ariaLiveElements).toBeGreaterThan(0);
    });

    test('Medical forms should support screen readers', async ({ page }) => {
      await page.locator('[data-testid="form-demo"]').scrollIntoViewIfNeeded();
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .include('[data-testid="form-demo"]')
        .withTags(['wcag2aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('Patient profile cards should be accessible', async ({ page }) => {
      await page.locator('[data-testid="patient-profile"]').scrollIntoViewIfNeeded();
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .include('[data-testid="patient-profile"]')
        .withTags(['wcag2aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('Medical data tables should support screen readers', async ({ page }) => {
      await page.locator('[data-testid="data-table"]').scrollIntoViewIfNeeded();
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .include('[data-testid="data-table"]')
        .withRules(['table-headers'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('All interactive elements should be keyboard accessible', async ({ page }) => {
      // Test tab navigation through the page
      await page.keyboard.press('Tab');
      
      const focusedElement = await page.locator(':focus').count();
      expect(focusedElement).toBeGreaterThan(0);
      
      // Test keyboard access to critical healthcare components
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withRules(['focusable-content'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('Emergency alerts should be reachable via keyboard', async ({ page }) => {
      // Navigate to emergency alert with keyboard
      await page.locator('[data-testid="emergency-demo"]').scrollIntoViewIfNeeded();
      
      // Use Tab to navigate to emergency button
      let attempts = 0;
      while (attempts < 20) {
        await page.keyboard.press('Tab');
        const focused = await page.locator(':focus').getAttribute('data-testid');
        if (focused?.includes('emergency')) {
          break;
        }
        attempts++;
      }
      
      // Should be able to activate with Enter or Space
      await page.keyboard.press('Enter');
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withRules(['keyboard'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('Form navigation should work with keyboard only', async ({ page }) => {
      await page.locator('[data-testid="form-demo"]').scrollIntoViewIfNeeded();
      
      // Navigate through form elements
      await page.keyboard.press('Tab'); // First input
      await page.keyboard.type('Test input');
      await page.keyboard.press('Tab'); // Next element
      await page.keyboard.press('Space'); // Activate if checkbox/radio
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .include('[data-testid="form-demo"]')
        .withRules(['keyboard'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });

  test.describe('Focus Management', () => {
    test('Focus indicators should be visible', async ({ page }) => {
      // Navigate with keyboard and check focus visibility
      await page.keyboard.press('Tab');
      
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
      
      // Check focus styles are applied
      const focusOutline = await focusedElement.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          outline: styles.outline,
          boxShadow: styles.boxShadow,
          border: styles.border
        };
      });
      
      // Should have some form of focus indication
      const hasFocusStyle = focusOutline.outline !== 'none' || 
                           focusOutline.boxShadow !== 'none' ||
                           focusOutline.border.includes('focus');
      
      expect(hasFocusStyle).toBe(true);
    });

    test('Modal focus should be trapped', async ({ page }) => {
      // Open modal if it exists
      const modalTrigger = page.locator('[data-testid="open-modal-btn"]');
      if (await modalTrigger.isVisible()) {
        await modalTrigger.click();
        
        // Test focus trap
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');
        
        const accessibilityScanResults = await new AxeBuilder({ page })
          .include('[data-testid="modal"]')
          .withRules(['focus-order-semantics'])
          .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
      }
    });
  });

  test.describe('Medical Device Compatibility', () => {
    test('Touch targets should meet 44px minimum for medical gloves', async ({ page }) => {
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withRules(['target-size'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('High contrast mode should work properly', async ({ page }) => {
      // Simulate high contrast mode
      await page.emulateMedia({ media: 'screen', colorScheme: 'dark' });
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('Reduced motion should be respected', async ({ page }) => {
      // Simulate prefers-reduced-motion
      await page.emulateMedia({ media: 'screen', reducedMotion: 'reduce' });
      
      // Check that animations are disabled or reduced
      const animations = await page.evaluate(() => {
        const elements = document.querySelectorAll('*');
        let hasAnimations = false;
        
        elements.forEach(el => {
          const styles = window.getComputedStyle(el);
          if (styles.animationDuration !== '0s' && styles.animationDuration !== '') {
            hasAnimations = true;
          }
        });
        
        return hasAnimations;
      });
      
      // In reduced motion mode, animations should be minimal
      expect(animations).toBe(false);
    });
  });

  test.describe('Screen Reader Compatibility', () => {
    test('ARIA landmarks should be properly structured', async ({ page }) => {
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withRules(['landmark-one-main', 'landmark-complementary-is-top-level'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('ARIA labels should be meaningful', async ({ page }) => {
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withRules(['aria-label', 'aria-labelledby', 'aria-describedby'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('Medical terminology should be properly announced', async ({ page }) => {
      // Check for aria-label or aria-describedby on medical terms
      const medicalTerms = await page.locator('[data-testid*="medical"], [data-testid*="health"]').count();
      
      if (medicalTerms > 0) {
        const accessibilityScanResults = await new AxeBuilder({ page })
          .include('[data-testid*="medical"], [data-testid*="health"]')
          .withRules(['aria-label'])
          .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
      }
    });
  });
});

test.describe('Accessibility Error Reporting', () => {
  test('Generate comprehensive accessibility report', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .analyze();

    // Log detailed results for debugging
    if (accessibilityScanResults.violations.length > 0) {
      console.log('Accessibility Violations Found:');
      accessibilityScanResults.violations.forEach((violation, index) => {
        console.log(`${index + 1}. ${violation.id}: ${violation.description}`);
        console.log(`   Impact: ${violation.impact}`);
        console.log(`   Help URL: ${violation.helpUrl}`);
        violation.nodes.forEach((node, nodeIndex) => {
          console.log(`   Node ${nodeIndex + 1}: ${node.target[0]}`);
          console.log(`   HTML: ${node.html}`);
        });
        console.log('---');
      });
    }

    // The test should pass for a complete accessibility setup
    // Comment this out during development to see all violations
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
