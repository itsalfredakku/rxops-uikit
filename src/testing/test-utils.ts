/**
 * UIKit Component Testing Infrastructure
 * Comprehensive testing utilities for healthcare-focused Qwik components
 */

import { createDOM } from '@builder.io/qwik/testing';
import { HIPAA_REQUIREMENTS } from '../utils/hipaa';
import { MOBILE_HEALTHCARE_TARGETS } from '../utils/mobile-healthcare';

// Test environment setup for healthcare compliance
export const HEALTHCARE_TEST_CONFIG = {
  // HIPAA compliance testing requirements
  hipaa: {
    auditLogging: true,
    sessionTimeout: HIPAA_REQUIREMENTS.phi.sessionTimeout,
    encryptionRequired: true,
    minPasswordLength: 12,
  },
  
  // Accessibility testing (WCAG 2.1 AA)
  accessibility: {
    level: 'AA',
    tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
    rules: {
      'color-contrast': { enabled: true },
      'keyboard-navigation': { enabled: true },
      'screen-reader': { enabled: true },
      'focus-management': { enabled: true },
    },
  },
  
  // Mobile healthcare testing
  mobile: {
    touchTargets: MOBILE_HEALTHCARE_TARGETS.touch,
    viewports: {
      mobile: { width: 375, height: 667 },
      tablet: { width: 768, height: 1024 },
      desktop: { width: 1024, height: 768 },
    },
    gestures: ['tap', 'swipe', 'pinch', 'long-press'],
  },
  
  // Performance testing
  performance: {
    loadTime: 3000, // 3 seconds max for 3G
    bundleSize: 250000, // 250KB max
    renderTime: 100, // 100ms max initial render
    memoryUsage: 50 * 1024 * 1024, // 50MB max
  },
} as const;

// Base test utilities for UIKit components
export class UIKitTestUtils {
  // Create test DOM environment for Qwik components
  static async createTestEnvironment() {
    const dom = await createDOM();
    return {
      screen: dom.screen,
      render: async (component: any) => {
        const result = await dom.render(component);
        return {
          ...result,
          container: dom.screen
        };
      },
      userEvent: {
        click: async (element: Element) => {
          await dom.userEvent(element, 'click');
        }
      }
    };
  }
  
  // Accessibility testing for healthcare components
  static testAccessibility(container: HTMLElement, customRules?: Record<string, unknown>) {
    const _rules = {
      ...HEALTHCARE_TEST_CONFIG.accessibility.rules,
      ...customRules,
    };
    
    // Basic accessibility checks
    const results = {
      hasProperLabels: this.checkLabels(container),
      hasProperHeadingStructure: this.checkHeadingStructure(container),
      hasKeyboardSupport: this.checkKeyboardSupport(container),
      hasColorContrast: this.checkColorContrast(container),
    };
    
    return results;
  }
  
  // Touch target testing for healthcare workers
  static testTouchTargets(container: HTMLElement): { passed: boolean; failures: string[] } {
    const interactive = container.querySelectorAll(
      'button, a, input, select, textarea, [role="button"], [tabindex]'
    );
    
    const failures: string[] = [];
    const minSize = HEALTHCARE_TEST_CONFIG.mobile.touchTargets.minimumSize;
    
    interactive.forEach((element, index) => {
      const rect = element.getBoundingClientRect();
      
      if (rect.width < minSize || rect.height < minSize) {
        failures.push(`Element ${index} (${element.tagName}) is ${rect.width}x${rect.height}px, below minimum ${minSize}px`);
      }
    });
    
    return {
      passed: failures.length === 0,
      failures,
    };
  }
  
  // HIPAA audit logging test
  static testHIPAAAuditLogging(auditLogs: Array<{action: string}>, expectedEvents: string[]): { passed: boolean; missing: string[] } {
    const missing = expectedEvents.filter((event) => {
      return !auditLogs.some(log => log.action === event);
    });
    
    return {
      passed: missing.length === 0,
      missing,
    };
  }
  
  // Performance testing
  static async testPerformance(renderFunction: () => Promise<void>): Promise<{ renderTime: number; passed: boolean }> {
    const startTime = performance.now();
    await renderFunction();
    const endTime = performance.now();
    
    const renderTime = endTime - startTime;
    const passed = renderTime < HEALTHCARE_TEST_CONFIG.performance.renderTime;
    
    return { renderTime, passed };
  }
  
  // Keyboard navigation testing
  static testKeyboardNavigation(container: HTMLElement): { passed: boolean; issues: string[] } {
    const focusableElements = container.querySelectorAll(
      'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const issues: string[] = [];
    
    // Check if elements are properly focusable
    focusableElements.forEach((element, index) => {
      if (!element.hasAttribute('tabindex') && 
          !['button', 'a', 'input', 'select', 'textarea'].includes(element.tagName.toLowerCase())) {
        issues.push(`Element ${index} may not be properly focusable`);
      }
    });
    
    return {
      passed: issues.length === 0,
      issues,
    };
  }
  
  // Screen reader compatibility testing
  static testScreenReaderCompatibility(container: HTMLElement): { passed: boolean; issues: string[] } {
    const interactive = container.querySelectorAll(
      'button, a, input, select, textarea'
    );
    
    const issues: string[] = [];
    
    interactive.forEach((element, index) => {
      const hasLabel = 
        element.getAttribute('aria-label') ||
        element.getAttribute('aria-labelledby') ||
        element.getAttribute('title') ||
        (element as HTMLElement).innerText?.trim();
      
      if (!hasLabel) {
        issues.push(`Element ${index} (${element.tagName}) lacks proper labeling`);
      }
    });
    
    return {
      passed: issues.length === 0,
      issues,
    };
  }
  
  // Color contrast testing
  static checkColorContrast(container: HTMLElement): boolean {
    const elements = container.querySelectorAll('*');
    let passed = true;
    
    elements.forEach((element) => {
      const computedStyle = window.getComputedStyle(element);
      const color = computedStyle.color;
      const backgroundColor = computedStyle.backgroundColor;
      
      // Check that semantic colors are used (CSS custom properties)
      if (color && color !== 'rgba(0, 0, 0, 0)' && !color.includes('var(--')) {
        passed = false;
      }
      
      if (backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)' && !backgroundColor.includes('var(--')) {
        passed = false;
      }
    });
    
    return passed;
  }
  
  // Check proper labeling
  static checkLabels(container: HTMLElement): boolean {
    const interactive = container.querySelectorAll(
      'button, a, input, select, textarea, [role="button"]'
    );
    
    return Array.from(interactive).every((element) => {
      return element.getAttribute('aria-label') ||
             element.getAttribute('aria-labelledby') ||
             element.getAttribute('title') ||
             (element as HTMLElement).innerText?.trim();
    });
  }
  
  // Check heading structure
  static checkHeadingStructure(container: HTMLElement): boolean {
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6, [role="heading"]');
    let lastLevel = 0;
    let valid = true;
    
    headings.forEach((heading) => {
      const level = parseInt(heading.tagName.charAt(1)) || 
                   parseInt(heading.getAttribute('aria-level') || '1');
      
      if (lastLevel > 0 && level > lastLevel + 1) {
        valid = false;
      }
      lastLevel = level;
    });
    
    return valid;
  }
  
  // Check keyboard support
  static checkKeyboardSupport(container: HTMLElement): boolean {
    const interactive = container.querySelectorAll(
      'button, a, input, select, textarea, [role="button"], [tabindex]'
    );
    
    return Array.from(interactive).every((element) => {
      const tabindex = element.getAttribute('tabindex');
      return tabindex !== '-1' || element.tagName.toLowerCase() === 'div';
    });
  }
  
  // Mobile viewport testing helper
  static simulateViewport(viewport: { width: number; height: number }) {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: viewport.width,
    });
    
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: viewport.height,
    });
    
    // Dispatch resize event
    window.dispatchEvent(new Event('resize'));
  }
}

// Qwik test renderer function
export const createTestRenderer = async () => {
  const domResult = await createDOM();
  
  // Create a testing-library-like interface
  const screen = {
    getByText: (text: string) => {
      const elements = Array.from(domResult.screen.querySelectorAll('*'));
      for (const element of elements) {
        if (element.textContent?.includes(text)) {
          return element;
        }
      }
      throw new Error(`Unable to find element with text: ${text}`);
    },
    queryByText: (text: string) => {
      const elements = Array.from(domResult.screen.querySelectorAll('*'));
      for (const element of elements) {
        if (element.textContent?.includes(text)) {
          return element;
        }
      }
      return null;
    },
    getByRole: (role: string) => {
      const element = domResult.screen.querySelector(`[role="${role}"]`);
      if (!element) {
        throw new Error(`Unable to find element with role: ${role}`);
      }
      return element;
    }
  };
  
  return {
    screen,
    container: domResult.screen,
    render: domResult.render
  };
};

// Mock implementations for testing
export const mockHIPAAAuditor = {
  logPHIAccess: () => {},
  logSecurityEvent: () => {},
  logAccess: (_userId: string, _resource: string) => {},
  logProgress: () => {},
  verifyCompliance: (_action: string) => true,
  generateComplianceReport: () => ({ summary: {}, recommendations: [] }),
};

// Mock HIPAA auditor functions
export const createMockHipaaAuditor = () => mockHIPAAAuditor;

export const mockPerformanceMonitor = {
  trackRender: () => {},
  trackInteraction: () => {},
  trackBundleSize: () => {},
  startTiming: (_operation: string) => {},
  endTiming: (_operation: string) => 0,
  getMetrics: () => ({}),
  generateReport: () => ({}),
};

// Test case templates for different component types
export const COMPONENT_TEST_TEMPLATES = {
  atom: {
    accessibility: true,
    touchTargets: true,
    performance: true,
    keyboard: true,
    screenReader: true,
  },
  molecule: {
    accessibility: true,
    touchTargets: true,
    performance: true,
    keyboard: true,
    screenReader: true,
    hipaaAudit: true,
  },
  organism: {
    accessibility: true,
    touchTargets: true,
    performance: true,
    keyboard: true,
    screenReader: true,
    hipaaAudit: true,
    mobileViewports: true,
  },
};

// Healthcare-specific test helpers
export const HealthcareTestHelpers = {
  // Create test patient data
  createTestPatient: (overrides: Record<string, unknown> = {}) => ({
    id: 'test-patient-001',
    name: 'John Doe',
    mrn: 'MRN123456',
    dob: '1980-01-01',
    ...overrides,
  }),
  
  // Create test provider data
  createTestProvider: (overrides: Record<string, unknown> = {}) => ({
    id: 'test-provider-001',
    name: 'Dr. Jane Smith',
    title: 'Primary Care Physician',
    department: 'Internal Medicine',
    ...overrides,
  }),
  
  // Create test user context
  createTestUser: (overrides: Record<string, unknown> = {}) => ({
    id: 'test-user-001',
    role: 'provider' as const,
    permissions: ['read', 'write'],
    ...overrides,
  }),
};

export default UIKitTestUtils;
