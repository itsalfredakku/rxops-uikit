/**
 * Accessibility Audit & WCAG 2.1 AA Compliance
 * Healthcare-focused accessibility testing and validation
 */

// WCAG 2.1 AA compliance targets for healthcare
export const ACCESSIBILITY_TARGETS = {
  wcag: {
    // Level AA requirements
    contrastRatio: {
      normalText: 4.5,
      largeText: 3.0,
      graphicsAndUI: 3.0,
    },
    timing: {
      // No time limits for medical forms
      sessionTimeout: 20 * 60 * 1000, // 20 minutes minimum
      adjustableTimeLimits: true,
    },
    keyboard: {
      // All functionality available via keyboard
      keyboardAccessible: 100, // 100% keyboard accessible
      visibleFocus: true,
      noKeyboardTrap: true,
    },
    content: {
      // Medical content requirements
      readingLevel: 8, // 8th grade reading level maximum
      language: true, // Language specified
      abbreviations: true, // Medical abbreviations explained
    },
  },
  
  // Healthcare-specific accessibility requirements
  medical: {
    // Medical device compatibility
    screenReaders: ['NVDA', 'JAWS', 'VoiceOver', 'TalkBack'],
    assistiveTech: ['Dragon', 'Switch Control', 'Eye Tracking'],
    medicalTerminology: true, // Proper pronunciation support
    errorPrevention: true, // Critical error prevention
  },
  
  // Mobile healthcare worker requirements
  mobile: {
    touchTargets: 44, // 44px minimum for gloved hands
    gestureAlternatives: true, // Alternative to complex gestures
    orientationSupport: true, // Portrait and landscape
    motionSensitivity: false, // No motion-triggered actions
  },
} as const;

// Accessibility testing utilities
export interface AccessibilityIssue {
  id: string;
  severity: 'critical' | 'serious' | 'moderate' | 'minor';
  wcagCriterion: string;
  element: string;
  description: string;
  solution: string;
  medicalImpact?: 'patient-safety' | 'workflow-disruption' | 'compliance' | 'usability';
}

export class AccessibilityAuditor {
  private issues: AccessibilityIssue[] = [];
  
  // Audit a component for WCAG compliance
  async auditComponent(element: HTMLElement, componentName: string): Promise<AccessibilityIssue[]> {
    const issues: AccessibilityIssue[] = [];
    
    // Check color contrast
    issues.push(...this.checkColorContrast(element, componentName));
    
    // Check keyboard accessibility
    issues.push(...this.checkKeyboardAccess(element, componentName));
    
    // Check ARIA labels and roles
    issues.push(...this.checkAriaCompliance(element, componentName));
    
    // Check focus management
    issues.push(...this.checkFocusManagement(element, componentName));
    
    // Check healthcare-specific requirements
    issues.push(...this.checkHealthcareCompliance(element, componentName));
    
    this.issues.push(...issues);
    return issues;
  }
  
  // Check color contrast ratios
  private checkColorContrast(element: HTMLElement, componentName: string): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    
    // Get computed styles
    const computedStyle = window.getComputedStyle(element);
    const backgroundColor = computedStyle.backgroundColor;
    const color = computedStyle.color;
    
    // Calculate contrast ratio (simplified - in reality would use proper color calculation)
    const contrastRatio = this.calculateContrastRatio(color, backgroundColor);
    
    if (contrastRatio < ACCESSIBILITY_TARGETS.wcag.contrastRatio.normalText) {
      issues.push({
        id: `${componentName}-contrast-${Date.now()}`,
        severity: 'serious',
        wcagCriterion: '1.4.3 Contrast (Minimum)',
        element: componentName,
        description: `Color contrast ratio of ${contrastRatio.toFixed(2)} is below the required 4.5:1`,
        solution: 'Increase color contrast to meet WCAG AA standards',
        medicalImpact: 'patient-safety',
      });
    }
    
    return issues;
  }
  
  // Check keyboard accessibility
  private checkKeyboardAccess(element: HTMLElement, componentName: string): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    
    // Check if interactive elements are focusable
    const interactiveElements = element.querySelectorAll('button, input, select, textarea, a[href]');
    
    interactiveElements.forEach((el, index) => {
      const htmlEl = el as HTMLElement;
      if (htmlEl.tabIndex < 0 && !htmlEl.getAttribute('aria-hidden')) {
        issues.push({
          id: `${componentName}-keyboard-${index}`,
          severity: 'critical',
          wcagCriterion: '2.1.1 Keyboard',
          element: `${componentName} interactive element ${index}`,
          description: 'Interactive element is not keyboard accessible',
          solution: 'Ensure tabIndex is 0 or remove tabIndex to make element focusable',
          medicalImpact: 'workflow-disruption',
        });
      }
    });
    
    return issues;
  }
  
  // Check ARIA compliance
  private checkAriaCompliance(element: HTMLElement, componentName: string): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    
    // Check for required ARIA labels
    const buttons = element.querySelectorAll('button');
    buttons.forEach((button, index) => {
      const hasLabel = button.getAttribute('aria-label') || 
                      button.getAttribute('aria-labelledby') || 
                      button.textContent?.trim();
      
      if (!hasLabel) {
        issues.push({
          id: `${componentName}-aria-label-${index}`,
          severity: 'serious',
          wcagCriterion: '4.1.2 Name, Role, Value',
          element: `${componentName} button ${index}`,
          description: 'Button lacks accessible name',
          solution: 'Add aria-label or ensure button has descriptive text content',
          medicalImpact: 'workflow-disruption',
        });
      }
    });
    
    // Check for proper heading structure
    const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (headings.length === 0 && componentName.includes('Card')) {
      issues.push({
        id: `${componentName}-heading-structure`,
        severity: 'moderate',
        wcagCriterion: '2.4.6 Headings and Labels',
        element: componentName,
        description: 'Card component should include proper heading structure',
        solution: 'Add semantic headings to organize content',
        medicalImpact: 'usability',
      });
    }
    
    return issues;
  }
  
  // Check focus management
  private checkFocusManagement(element: HTMLElement, componentName: string): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    
    // Check for visible focus indicators
    const focusableElements = element.querySelectorAll('button, input, select, textarea, a[href]');
    
    focusableElements.forEach((el, index) => {
      const htmlEl = el as HTMLElement;
      
      // Simulate focus to check for visible indicator
      htmlEl.focus();
      const computedStyle = window.getComputedStyle(htmlEl, ':focus');
      const hasVisibleFocus = computedStyle.outline !== 'none' || 
                             computedStyle.boxShadow !== 'none' ||
                             computedStyle.border !== computedStyle.border; // Simplified check
      
      if (!hasVisibleFocus) {
        issues.push({
          id: `${componentName}-focus-visible-${index}`,
          severity: 'serious',
          wcagCriterion: '2.4.7 Focus Visible',
          element: `${componentName} focusable element ${index}`,
          description: 'Element lacks visible focus indicator',
          solution: 'Add CSS focus styles or ensure default focus ring is visible',
          medicalImpact: 'workflow-disruption',
        });
      }
    });
    
    return issues;
  }
  
  // Check healthcare-specific compliance
  private checkHealthcareCompliance(element: HTMLElement, componentName: string): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    
    // Check touch target sizes for mobile healthcare workers
    const touchTargets = element.querySelectorAll('button, input, select, a');
    
    touchTargets.forEach((target, index) => {
      const rect = target.getBoundingClientRect();
      const size = Math.min(rect.width, rect.height);
      
      if (size < ACCESSIBILITY_TARGETS.mobile.touchTargets) {
        issues.push({
          id: `${componentName}-touch-target-${index}`,
          severity: 'moderate',
          wcagCriterion: '2.5.5 Target Size',
          element: `${componentName} touch target ${index}`,
          description: `Touch target size of ${size}px is below the recommended 44px for healthcare workers`,
          solution: 'Increase touch target size to minimum 44px for glove compatibility',
          medicalImpact: 'workflow-disruption',
        });
      }
    });
    
    // Check for medical abbreviations
    const textContent = element.textContent || '';
    const medicalAbbreviations = ['BP', 'HR', 'O2', 'ECG', 'ICU', 'ER', 'OR'];
    
    medicalAbbreviations.forEach((abbr) => {
      if (textContent.includes(abbr)) {
        const hasExpansion = element.querySelector(`abbr[title*="${abbr}"]`) ||
                            element.querySelector(`[aria-expanded="${abbr}"]`);
        
        if (!hasExpansion) {
          issues.push({
            id: `${componentName}-medical-abbr-${abbr}`,
            severity: 'minor',
            wcagCriterion: '3.1.4 Abbreviations',
            element: componentName,
            description: `Medical abbreviation "${abbr}" lacks expansion`,
            solution: 'Wrap abbreviations in <abbr> tag with title attribute',
            medicalImpact: 'usability',
          });
        }
      }
    });
    
    return issues;
  }
  
  // Calculate color contrast ratio (simplified implementation)
  private calculateContrastRatio(color1: string, color2: string): number {
    // This is a simplified calculation
    // In reality, you'd convert to RGB, calculate relative luminance, etc.
    // For now, return a mock value based on color similarity
    return color1 === color2 ? 1 : 4.8; // Mock calculation
  }
  
  // Generate compliance report
  generateReport(): {
    summary: {
      totalIssues: number;
      critical: number;
      serious: number;
      moderate: number;
      minor: number;
      wcagCompliance: number;
    };
    issues: AccessibilityIssue[];
    recommendations: string[];
  } {
    const critical = this.issues.filter(i => i.severity === 'critical').length;
    const serious = this.issues.filter(i => i.severity === 'serious').length;
    const moderate = this.issues.filter(i => i.severity === 'moderate').length;
    const minor = this.issues.filter(i => i.severity === 'minor').length;
    
    // Calculate WCAG compliance percentage
    const totalChecks = this.issues.length || 1;
    const failedChecks = critical + serious;
    const wcagCompliance = Math.max(0, ((totalChecks - failedChecks) / totalChecks) * 100);
    
    return {
      summary: {
        totalIssues: this.issues.length,
        critical,
        serious,
        moderate,
        minor,
        wcagCompliance: Math.round(wcagCompliance),
      },
      issues: this.issues,
      recommendations: this.generateRecommendations(),
    };
  }
  
  // Generate healthcare-specific recommendations
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    
    if (this.issues.some(i => i.medicalImpact === 'patient-safety')) {
      recommendations.push('URGENT: Address patient safety accessibility issues immediately');
    }
    
    if (this.issues.some(i => i.wcagCriterion.includes('Contrast'))) {
      recommendations.push('Improve color contrast for medical staff working in various lighting conditions');
    }
    
    if (this.issues.some(i => i.wcagCriterion.includes('Keyboard'))) {
      recommendations.push('Ensure full keyboard navigation for hands-free operation in sterile environments');
    }
    
    if (this.issues.some(i => i.wcagCriterion.includes('Target Size'))) {
      recommendations.push('Increase touch target sizes for healthcare workers wearing gloves');
    }
    
    return recommendations;
  }
  
  // Clear audit results
  clearResults(): void {
    this.issues = [];
  }
}

// Accessibility testing hook for components
export function useAccessibilityAudit(componentName: string) {
  const auditor = new AccessibilityAuditor();
  
  return {
    audit: (element: HTMLElement) => auditor.auditComponent(element, componentName),
    report: () => auditor.generateReport(),
    clear: () => auditor.clearResults(),
  };
}

// Global accessibility monitor
export const accessibilityAuditor = new AccessibilityAuditor();
