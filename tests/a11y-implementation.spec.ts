import { test, expect } from '@playwright/test';
import { 
  HealthcareAccessibilityTester, 
  quickHealthcareAccessibilityCheck,
  MEDICAL_DEVICE_VIEWPORTS,
  HEALTHCARE_PRIORITY_RULES
} from './utils/accessibility';

/**
 * A11Y-001 Implementation: Accessibility Testing Setup
 * 
 * Comprehensive healthcare accessibility testing framework with:
 * - WCAG 2.1 AA compliance validation
 * - Medical device compatibility testing  
 * - Healthcare workflow accessibility
 * - Clinical environment considerations
 */

test.describe('A11Y-001: Healthcare Accessibility Testing Framework', () => {
  let accessibilityTester: HealthcareAccessibilityTester;

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(1000);
    accessibilityTester = new HealthcareAccessibilityTester(page);
  });

  test.describe('WCAG 2.1 AA Compliance Suite', () => {
    test('Complete WCAG 2.1 AA compliance check', async ({ page }) => {
      const audit = await accessibilityTester.runHealthcareAudit({
        tags: ['wcag2a', 'wcag2aa', 'wcag21aa']
      });

      // Log detailed results for transparency
      if (!audit.overallCompliance) {
        console.log('WCAG Violations:', audit.violations.map(v => ({
          rule: v.id,
          impact: v.impact,
          description: v.description
        })));
        console.log('Recommendations:', audit.recommendations);
      }

      expect(audit.wcagAACompliance).toBe(true);
      expect(audit.colorContrastCompliance).toBe(true);
    });

    test('Critical healthcare accessibility patterns', async ({ page }) => {
      const passed = await accessibilityTester.testCriticalHealthcarePatterns();
      
      expect(passed).toBe(true);
    });

    test('Healthcare priority rules compliance', async ({ page }) => {
      const audit = await accessibilityTester.runHealthcareAudit({
        rules: HEALTHCARE_PRIORITY_RULES
      });

      // These are the most critical rules for healthcare
      expect(audit.overallCompliance).toBe(true);
    });
  });

  test.describe('Medical Device Compatibility', () => {
    test('Clinical tablet accessibility', async ({ page }) => {
      await page.setViewportSize(MEDICAL_DEVICE_VIEWPORTS.clinicalTablet);
      
      const audit = await accessibilityTester.runHealthcareAudit();
      expect(audit.medicalDeviceCompliance).toBe(true);
    });

    test('Mobile healthcare device accessibility', async ({ page }) => {
      await page.setViewportSize(MEDICAL_DEVICE_VIEWPORTS.mobileHealthcare);
      
      const audit = await accessibilityTester.runHealthcareAudit();
      expect(audit.medicalDeviceCompliance).toBe(true);
    });

    test('Medical workstation accessibility', async ({ page }) => {
      await page.setViewportSize(MEDICAL_DEVICE_VIEWPORTS.medicalWorkstation);
      
      const audit = await accessibilityTester.runHealthcareAudit();
      expect(audit.medicalDeviceCompliance).toBe(true);
    });

    test('All medical device viewports', async ({ page }) => {
      const passed = await accessibilityTester.testMedicalDeviceCompatibility();
      expect(passed).toBe(true);
    });
  });

  test.describe('Healthcare Keyboard Navigation', () => {
    test('Healthcare workflow keyboard navigation', async ({ page }) => {
      const passed = await accessibilityTester.testHealthcareKeyboardNavigation();
      expect(passed).toBe(true);
    });

    test('Emergency alert keyboard accessibility', async ({ page }) => {
      // Test emergency alert can be reached and activated via keyboard
      await page.locator('[data-testid*="emergency"]').first().scrollIntoViewIfNeeded();
      
      let emergencyReached = false;
      for (let i = 0; i < 20; i++) {
        await page.keyboard.press('Tab');
        const focused = await page.locator(':focus').getAttribute('data-testid');
        if (focused?.includes('emergency') || focused?.includes('alert')) {
          emergencyReached = true;
          break;
        }
      }

      expect(emergencyReached).toBe(true);
      
      // Should be activatable with Enter or Space
      await page.keyboard.press('Enter');
      
      // Quick accessibility check on the result
      const passed = await quickHealthcareAccessibilityCheck(page, '[data-testid*="emergency"]');
      expect(passed).toBe(true);
    });

    test('Medical form keyboard navigation', async ({ page }) => {
      const formSelector = '[data-testid*="form"]';
      const formExists = await page.locator(formSelector).count() > 0;
      
      if (formExists) {
        await page.locator(formSelector).first().scrollIntoViewIfNeeded();
        
        // Navigate through form with keyboard
        await page.keyboard.press('Tab'); // First field
        await page.keyboard.type('Test'); // Enter data
        await page.keyboard.press('Tab'); // Next field
        
        const passed = await quickHealthcareAccessibilityCheck(page, formSelector);
        expect(passed).toBe(true);
      } else {
        test.skip();
      }
    });
  });

  test.describe('Clinical Environment Considerations', () => {
    test('High contrast mode compatibility', async ({ page }) => {
      const passed = await accessibilityTester.testHighContrastMode();
      expect(passed).toBe(true);
    });

    test('Reduced motion compliance', async ({ page }) => {
      const passed = await accessibilityTester.testReducedMotionCompliance();
      expect(passed).toBe(true);
    });

    test('Touch target sizes for medical gloves', async ({ page }) => {
      const audit = await accessibilityTester.runHealthcareAudit({
        rules: ['target-size']
      });
      
      expect(audit.overallCompliance).toBe(true);
    });
  });

  test.describe('Screen Reader Compatibility', () => {
    test('ARIA landmarks and structure', async ({ page }) => {
      const audit = await accessibilityTester.runHealthcareAudit({
        rules: ['landmark-one-main', 'page-has-heading-one', 'bypass']
      });
      
      expect(audit.overallCompliance).toBe(true);
    });

    test('Medical terminology pronunciation support', async ({ page }) => {
      // Check for proper aria-label or pronunciation hints on medical terms
      const medicalElements = await page.locator('[data-testid*="medical"], [data-testid*="patient"], [data-testid*="health"]').count();
      
      if (medicalElements > 0) {
        const audit = await accessibilityTester.runHealthcareAudit({
          includeSelectors: ['[data-testid*="medical"]', '[data-testid*="patient"]', '[data-testid*="health"]'],
          rules: ['aria-label', 'label']
        });
        
        expect(audit.overallCompliance).toBe(true);
      }
    });

    test('Alert and live region announcements', async ({ page }) => {
      const audit = await accessibilityTester.runHealthcareAudit({
        rules: ['aria-live-region-polite']
      });
      
      expect(audit.overallCompliance).toBe(true);
    });
  });

  test.describe('A11Y-001 Completion Report', () => {
    test('Generate comprehensive accessibility report', async ({ page }) => {
      console.log('\n=== A11Y-001 Healthcare Accessibility Testing Report ===\n');
      
      // Run comprehensive audit
      const audit = await accessibilityTester.runHealthcareAudit();
      
      console.log('📊 Overall Results:');
      console.log(`✅ WCAG 2.1 AA Compliance: ${audit.wcagAACompliance ? 'PASS' : 'FAIL'}`);
      console.log(`✅ Medical Device Compliance: ${audit.medicalDeviceCompliance ? 'PASS' : 'FAIL'}`);
      console.log(`✅ Keyboard Accessibility: ${audit.keyboardAccessibility ? 'PASS' : 'FAIL'}`);
      console.log(`✅ Color Contrast: ${audit.colorContrastCompliance ? 'PASS' : 'FAIL'}`);
      
      // Test additional healthcare criteria
      const keyboardNav = await accessibilityTester.testHealthcareKeyboardNavigation();
      const deviceCompat = await accessibilityTester.testMedicalDeviceCompatibility();
      const highContrast = await accessibilityTester.testHighContrastMode();
      const reducedMotion = await accessibilityTester.testReducedMotionCompliance();
      
      console.log(`✅ Healthcare Keyboard Navigation: ${keyboardNav ? 'PASS' : 'FAIL'}`);
      console.log(`✅ Medical Device Compatibility: ${deviceCompat ? 'PASS' : 'FAIL'}`);
      console.log(`✅ High Contrast Mode: ${highContrast ? 'PASS' : 'FAIL'}`);
      console.log(`✅ Reduced Motion: ${reducedMotion ? 'PASS' : 'FAIL'}`);
      
      if (audit.violations.length > 0) {
        console.log('\n🚨 Violations Found:');
        audit.violations.forEach((violation, index) => {
          console.log(`${index + 1}. ${violation.id} (${violation.impact})`);
          console.log(`   ${violation.description}`);
        });
      }
      
      if (audit.recommendations.length > 0) {
        console.log('\n💡 Healthcare-Specific Recommendations:');
        audit.recommendations.forEach((rec, index) => {
          console.log(`${index + 1}. ${rec}`);
        });
      }
      
      const overallScore = [
        audit.wcagAACompliance,
        audit.medicalDeviceCompliance,
        audit.keyboardAccessibility,
        audit.colorContrastCompliance,
        keyboardNav,
        deviceCompat,
        highContrast,
        reducedMotion
      ].filter(Boolean).length;
      
      console.log(`\n🎯 Healthcare Accessibility Score: ${overallScore}/8 (${Math.round(overallScore/8*100)}%)`);
      
      if (overallScore === 8) {
        console.log('🎉 EXCELLENT! Full healthcare accessibility compliance achieved!');
        console.log('✅ A11Y-001 Implementation: COMPLETE');
      } else if (overallScore >= 6) {
        console.log('👍 GOOD! Most accessibility requirements met, minor improvements needed.');
      } else {
        console.log('⚠️  NEEDS WORK: Significant accessibility improvements required for healthcare compliance.');
      }
      
      console.log('\n=== End A11Y-001 Report ===\n');
      
      // For A11Y-001 completion, we expect high compliance
      expect(overallScore).toBeGreaterThanOrEqual(6);
    });
  });
});
