/**
 * Jest Test Setup for Healthcare UIKit
 * Configures testing environment with healthcare-specific requirements
 */

import '@testing-library/jest-dom';
import { mockHIPAAAuditor, mockPerformanceMonitor } from './test-utils';

// Mock HIPAA auditor globally
(global as any).mockHIPAAAuditor = mockHIPAAAuditor;
(global as any).mockPerformanceMonitor = mockPerformanceMonitor;

// Mock browser APIs that may not be available in test environment
Object.defineProperty(window, 'navigator', {
  value: {
    ...window.navigator,
    vibrate: jest.fn(),
    userAgent: 'Mozilla/5.0 (compatible; Jest Test Environment)',
  },
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
  root: null,
  rootMargin: '',
  thresholds: [],
}));

// Healthcare-specific test setup
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
  
  // Reset HIPAA audit logs
  mockHIPAAAuditor.logPHIAccess = jest.fn();
  mockHIPAAAuditor.logSecurityEvent = jest.fn();
  mockHIPAAAuditor.logAccess = jest.fn();
  mockHIPAAAuditor.logProgress = jest.fn();
  
  // Reset performance monitoring
  mockPerformanceMonitor.trackRender = jest.fn();
  mockPerformanceMonitor.trackInteraction = jest.fn();
  
  // Mock console methods for cleaner test output
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  // Restore console methods
  jest.restoreAllMocks();
});

// Global test utilities
(global as any).testUtils = {
  // Wait for next tick
  nextTick: () => new Promise(resolve => setTimeout(resolve, 0)),
  
  // Wait for multiple ticks
  waitTicks: (ticks: number) => {
    return new Promise(resolve => {
      let count = 0;
      const tick = () => {
        count++;
        if (count >= ticks) {
          resolve(void 0);
        } else {
          setTimeout(tick, 0);
        }
      };
      tick();
    });
  },
  
  // Create test element with healthcare attributes
  createHealthcareElement: (tag: string, attributes: Record<string, string> = {}) => {
    const element = document.createElement(tag);
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
    element.setAttribute('data-test-element', 'healthcare');
    return element;
  },
};

// Extend global types
declare global {
  let mockHIPAAAuditor: {
    logAccess: (userId: string, resource: string) => void;
    verifyCompliance: (action: string) => boolean;
  };
  let mockPerformanceMonitor: {
    startTiming: (operation: string) => void;
    endTiming: (operation: string) => number;
    getMetrics: () => Record<string, unknown>;
  };
  let testUtils: {
    nextTick: () => Promise<void>;
    waitTicks: (ticks: number) => Promise<void>;
    createHealthcareElement: (tag: string, attributes?: Record<string, string>) => HTMLElement;
  };
}

export {};
