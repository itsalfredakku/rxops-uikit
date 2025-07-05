/**
 * Performance Monitoring & Bundle Size Tracking
 * Healthcare-focused performance metrics for UIKit components
 */

// Bundle size targets for healthcare applications
export const PERFORMANCE_TARGETS = {
  // Critical for medical devices with limited resources
  bundleSize: {
    core: 100 * 1024, // 100KB for core components
    individual: 10 * 1024, // 10KB per component
    total: 500 * 1024, // 500KB total application bundle
  },
  
  // Performance targets for clinical environments
  timing: {
    firstContentfulPaint: 1000, // 1 second
    largestContentfulPaint: 2500, // 2.5 seconds
    firstInputDelay: 100, // 100ms
    cumulativeLayoutShift: 0.1, // 0.1 CLS score
  },
  
  // Accessibility targets for healthcare compliance
  accessibility: {
    wcagScore: 100, // 100% WCAG 2.1 AA compliance
    contrastRatio: 4.5, // Minimum contrast ratio
    screenReaderCompatibility: 100, // 100% screen reader support
  },
  
  // Mobile performance for healthcare workers
  mobile: {
    loadTime3G: 3000, // 3 seconds on 3G
    touchTargetSize: 44, // 44px minimum touch target
    gloveCompatibility: 100, // 100% glove-friendly interface
  },
} as const;

// Performance monitoring utilities
export interface PerformanceMetrics {
  bundleSize: number;
  loadTime: number;
  renderTime: number;
  interactiveTime: number;
  accessibilityScore: number;
  componentCount: number;
  errorCount: number;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, PerformanceMetrics> = new Map();
  
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }
  
  // Track component performance
  trackComponent(name: string, startTime: number): void {
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    const existing = this.metrics.get(name) || {
      bundleSize: 0,
      loadTime: 0,
      renderTime: 0,
      interactiveTime: 0,
      accessibilityScore: 0,
      componentCount: 0,
      errorCount: 0,
    };
    
    this.metrics.set(name, {
      ...existing,
      renderTime,
      componentCount: existing.componentCount + 1,
    });
  }
  
  // Track bundle size
  trackBundleSize(componentName: string, size: number): void {
    const existing = this.metrics.get(componentName);
    if (existing) {
      this.metrics.set(componentName, {
        ...existing,
        bundleSize: size,
      });
    }
  }
  
  // Get performance report
  getReport(): Record<string, PerformanceMetrics> {
    return Object.fromEntries(this.metrics);
  }
  
  // Check if targets are met
  checkTargets(): {
    bundleSize: boolean;
    performance: boolean;
    accessibility: boolean;
    mobile: boolean;
  } {
    const totalBundleSize = Array.from(this.metrics.values())
      .reduce((sum, metric) => sum + metric.bundleSize, 0);
    
    return {
      bundleSize: totalBundleSize <= PERFORMANCE_TARGETS.bundleSize.total,
      performance: true, // TODO: Implement performance checks
      accessibility: true, // TODO: Implement accessibility checks
      mobile: true, // TODO: Implement mobile checks
    };
  }
  
  // Log performance warning for healthcare contexts
  logHealthcareWarning(component: string, issue: string): void {
    console.warn(`[Healthcare Performance Warning] ${component}: ${issue}`);
    
    // Track error for reporting
    const existing = this.metrics.get(component);
    if (existing) {
      this.metrics.set(component, {
        ...existing,
        errorCount: existing.errorCount + 1,
      });
    }
  }
}

// Core Web Vitals tracking for healthcare applications
export function measureCoreWebVitals(): Promise<{
  fcp: number;
  lcp: number;
  fid: number;
  cls: number;
}> {
  return new Promise((resolve) => {
    const metrics = {
      fcp: 0,
      lcp: 0,
      fid: 0,
      cls: 0,
    };
    
    // First Contentful Paint
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          metrics.fcp = entry.startTime;
        }
      });
    }).observe({ entryTypes: ['paint'] });
    
    // Largest Contentful Paint
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      metrics.lcp = lastEntry.startTime;
    }).observe({ entryTypes: ['largest-contentful-paint'] });
    
    // First Input Delay
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry: any) => {
        metrics.fid = entry.processingStart - entry.startTime;
      });
    }).observe({ entryTypes: ['first-input'] });
    
    // Cumulative Layout Shift
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          metrics.cls += entry.value;
        }
      });
    }).observe({ entryTypes: ['layout-shift'] });
    
    // Resolve after a reasonable time
    setTimeout(() => resolve(metrics), 5000);
  });
}

// Bundle size analyzer
export async function analyzeBundleSize(componentPath: string): Promise<number> {
  try {
    // This would integrate with your build process
    // For now, we'll simulate bundle size analysis
    const response = await fetch(`/api/bundle-size?component=${componentPath}`);
    if (!response.ok) {
      throw new Error('Failed to analyze bundle size');
    }
    const data = await response.json();
    return data.size;
  } catch (error) {
    console.error('Bundle size analysis failed:', error);
    return 0;
  }
}

// Healthcare-specific performance decorator
export function withPerformanceTracking<T extends any[]>(
  componentName: string,
  fn: (...args: T) => any
) {
  return (...args: T) => {
    const startTime = performance.now();
    const monitor = PerformanceMonitor.getInstance();
    
    try {
      const result = fn(...args);
      monitor.trackComponent(componentName, startTime);
      return result;
    } catch (error) {
      monitor.logHealthcareWarning(componentName, `Execution error: ${error}`);
      throw error;
    }
  };
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();
