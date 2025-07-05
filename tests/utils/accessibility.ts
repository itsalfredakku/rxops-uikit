import { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Healthcare Accessibility Testing Utilities
 * 
 * Utilities for comprehensive healthcare accessibility testing
 * including WCAG 2.1 AA, medical device, and clinical workflow standards.
 */

export interface AccessibilityTestOptions {
  includeSelectors?: string[];
  excludeSelectors?: string[];
  rules?: string[];
  tags?: string[];
  disableRules?: string[];
}

export interface HealthcareAccessibilityReport {
  overallCompliance: boolean;
  wcagAACompliance: boolean;
  medicalDeviceCompliance: boolean;
  keyboardAccessibility: boolean;
  colorContrastCompliance: boolean;
  violations: any[];
  recommendations: string[];
}

/**
 * Healthcare-specific accessibility test helper
 */
export class HealthcareAccessibilityTester {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Run comprehensive healthcare accessibility audit
   */
  async runHealthcareAudit(options: AccessibilityTestOptions = {}): Promise<HealthcareAccessibilityReport> {
    const builder = new AxeBuilder({ page: this.page });

    // Apply healthcare-specific rules
    if (options.tags) {
      builder.withTags(options.tags);
    } else {
      builder.withTags(['wcag2a', 'wcag2aa', 'wcag21aa']);
    }

    if (options.rules) {
      builder.withRules(options.rules);
    }

    if (options.includeSelectors) {
      options.includeSelectors.forEach(selector => builder.include(selector));
    }

    if (options.excludeSelectors) {
      options.excludeSelectors.forEach(selector => builder.exclude(selector));
    }

    if (options.disableRules) {
      builder.disableRules(options.disableRules);
    }

    const results = await builder.analyze();

    // Healthcare-specific analysis
    const wcagAACompliance = !results.violations.some(v => 
      v.tags.includes('wcag2aa') || v.tags.includes('wcag21aa')
    );

    const colorContrastCompliance = !results.violations.some(v => 
      v.id === 'color-contrast'
    );

    const keyboardAccessibility = !results.violations.some(v => 
      v.id.includes('keyboard') || v.id.includes('focus')
    );

    // Generate healthcare-specific recommendations
    const recommendations = this.generateHealthcareRecommendations(results.violations);

    return {
      overallCompliance: results.violations.length === 0,
      wcagAACompliance,
      medicalDeviceCompliance: wcagAACompliance && keyboardAccessibility && colorContrastCompliance,
      keyboardAccessibility,
      colorContrastCompliance,
      violations: results.violations,
      recommendations
    };
  }

  /**
   * Test critical healthcare UI patterns
   */
  async testCriticalHealthcarePatterns(): Promise<boolean> {
    const patterns = [
      { selector: '[data-testid*="emergency"]', description: 'Emergency alerts' },
      { selector: '[data-testid*="patient"]', description: 'Patient information' },
      { selector: '[data-testid*="medical"]', description: 'Medical data' },
      { selector: '[data-testid*="form"]', description: 'Medical forms' },
      { selector: '[role="alert"]', description: 'Alert regions' },
      { selector: '[aria-live]', description: 'Live regions' }
    ];

    let allPassed = true;

    for (const pattern of patterns) {
      const elements = await this.page.locator(pattern.selector).count();
      if (elements > 0) {
        const audit = await this.runHealthcareAudit({
          includeSelectors: [pattern.selector]
        });

        if (!audit.overallCompliance) {
          console.warn(`${pattern.description} failed accessibility tests:`, audit.violations);
          allPassed = false;
        }
      }
    }

    return allPassed;
  }

  /**
   * Test keyboard navigation for healthcare workflows
   */
  async testHealthcareKeyboardNavigation(): Promise<boolean> {
    // Test critical keyboard interactions
    const criticalInteractions = [
      { keys: ['Tab'], description: 'Tab navigation' },
      { keys: ['Shift+Tab'], description: 'Reverse tab navigation' },
      { keys: ['Enter'], description: 'Activation' },
      { keys: ['Space'], description: 'Selection' },
      { keys: ['Escape'], description: 'Cancel/close' },
      { keys: ['ArrowDown'], description: 'List navigation' },
      { keys: ['ArrowUp'], description: 'Reverse list navigation' }
    ];

    try {
      for (const interaction of criticalInteractions) {
        for (const key of interaction.keys) {
          await this.page.keyboard.press(key);
          await this.page.waitForTimeout(100); // Allow for focus changes
        }
      }
      return true;
    } catch (error) {
      console.error('Keyboard navigation test failed:', error);
      return false;
    }
  }

  /**
   * Test medical device compatibility
   */
  async testMedicalDeviceCompatibility(): Promise<boolean> {
    const deviceTests = [
      { 
        name: 'Clinical Tablet', 
        viewport: { width: 1024, height: 768 },
        description: 'Standard clinical tablet size'
      },
      { 
        name: 'Mobile Healthcare', 
        viewport: { width: 375, height: 667 },
        description: 'Mobile healthcare worker device'
      },
      { 
        name: 'Medical Workstation', 
        viewport: { width: 1920, height: 1080 },
        description: 'Large medical workstation monitor'
      }
    ];

    let allPassed = true;

    for (const device of deviceTests) {
      await this.page.setViewportSize(device.viewport);
      await this.page.waitForTimeout(500); // Allow layout to settle

      const audit = await this.runHealthcareAudit();
      if (!audit.medicalDeviceCompliance) {
        console.warn(`${device.name} failed medical device compatibility:`, audit.violations);
        allPassed = false;
      }
    }

    return allPassed;
  }

  /**
   * Test high contrast mode for clinical environments
   */
  async testHighContrastMode(): Promise<boolean> {
    try {
      await this.page.emulateMedia({ media: 'screen', colorScheme: 'dark' });
      await this.page.waitForTimeout(500);

      const audit = await this.runHealthcareAudit({
        rules: ['color-contrast']
      });

      return audit.colorContrastCompliance;
    } catch (error) {
      console.error('High contrast mode test failed:', error);
      return false;
    }
  }

  /**
   * Test reduced motion for medical safety
   */
  async testReducedMotionCompliance(): Promise<boolean> {
    try {
      await this.page.emulateMedia({ media: 'screen', reducedMotion: 'reduce' });
      await this.page.waitForTimeout(500);

      // Check that animations respect reduced motion
      const hasProblematicAnimations = await this.page.evaluate(() => {
        const elements = document.querySelectorAll('*');
        let problematicAnimations = 0;

        elements.forEach(el => {
          const styles = window.getComputedStyle(el);
          const animationDuration = parseFloat(styles.animationDuration.replace('s', ''));
          const transitionDuration = parseFloat(styles.transitionDuration.replace('s', ''));

          // Check for animations longer than 0.2s when reduced motion is preferred
          if (animationDuration > 0.2 || transitionDuration > 0.2) {
            problematicAnimations++;
          }
        });

        return problematicAnimations;
      });

      return hasProblematicAnimations === 0;
    } catch (error) {
      console.error('Reduced motion test failed:', error);
      return false;
    }
  }

  /**
   * Generate healthcare-specific accessibility recommendations
   */
  private generateHealthcareRecommendations(violations: any[]): string[] {
    const recommendations: string[] = [];
    const violationTypes = new Set(violations.map(v => v.id));

    if (violationTypes.has('color-contrast')) {
      recommendations.push('Improve color contrast to at least 4.5:1 for normal text and 3:1 for large text to ensure readability in clinical lighting conditions.');
    }

    if (violationTypes.has('keyboard')) {
      recommendations.push('Ensure all interactive elements are keyboard accessible for healthcare workers using medical keyboards or assistive devices.');
    }

    if (violationTypes.has('aria-label') || violationTypes.has('label')) {
      recommendations.push('Add proper labels and ARIA attributes to support screen readers used by healthcare professionals with visual impairments.');
    }

    if (violationTypes.has('focus-order-semantics')) {
      recommendations.push('Improve focus order to match the logical flow of medical workflows and data entry patterns.');
    }

    if (violationTypes.has('landmark-one-main')) {
      recommendations.push('Add proper landmark roles to help screen reader users navigate complex medical interfaces efficiently.');
    }

    if (violationTypes.has('target-size')) {
      recommendations.push('Increase touch target sizes to at least 44px x 44px to accommodate medical gloves and motor impairments.');
    }

    if (violations.length === 0) {
      recommendations.push('Excellent! All accessibility tests passed. Consider periodic retesting as components are updated.');
    }

    return recommendations;
  }
}

/**
 * Quick healthcare accessibility check utility
 */
export async function quickHealthcareAccessibilityCheck(
  page: Page, 
  selector?: string
): Promise<boolean> {
  const tester = new HealthcareAccessibilityTester(page);
  const options: AccessibilityTestOptions = {};
  
  if (selector) {
    options.includeSelectors = [selector];
  }

  const audit = await tester.runHealthcareAudit(options);
  return audit.overallCompliance;
}

/**
 * Medical device viewport sizes for testing
 */
export const MEDICAL_DEVICE_VIEWPORTS = {
  clinicalTablet: { width: 1024, height: 768 },
  mobileHealthcare: { width: 375, height: 667 },
  medicalWorkstation: { width: 1920, height: 1080 },
  largeMonitor: { width: 2560, height: 1440 }
};

/**
 * Healthcare-specific WCAG rules for prioritized testing
 */
export const HEALTHCARE_PRIORITY_RULES = [
  'color-contrast', // Critical for clinical readability
  'keyboard', // Essential for assistive devices
  'focus-order-semantics', // Important for workflow efficiency
  'aria-live-region-polite', // Critical for emergency alerts
  'label', // Essential for form accessibility
  'target-size' // Important for medical gloves/motor impairments
];
