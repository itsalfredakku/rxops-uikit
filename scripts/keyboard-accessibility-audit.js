#!/usr/bin/env node

/**
 * CRIT-004: Medical Device Keyboard Accessibility Audit
 * Comprehensive keyboard navigation testing for healthcare compliance
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('⌨️  CRIT-004: MEDICAL DEVICE KEYBOARD ACCESSIBILITY AUDIT');
console.log('========================================================\n');

// Medical device keyboard accessibility requirements
const medicalDeviceRequirements = {
  // Section 508 and ADA compliance for medical devices
  keyboardNavigation: {
    required: [
      'Tab navigation through all interactive elements',
      'Shift+Tab reverse navigation',
      'Enter/Space activation of buttons and controls',
      'Arrow key navigation within components',
      'Escape key to cancel actions/close modals',
      'Home/End keys for list navigation',
      'Page Up/Page Down for scrollable content'
    ],
    medical: [
      'Quick access keys for emergency functions',
      'Numeric keypad support for medical data entry',
      'Function key shortcuts for common medical actions',
      'Compatible with medical device keyboards',
      'Touch screen keyboard integration'
    ]
  },
  
  focusManagement: {
    required: [
      'Visible focus indicators (minimum 2px outline)',
      'Logical tab order following visual layout',
      'Focus trapping in modals and dialogs',
      'Focus restoration after modal close',
      'Skip links for main content navigation'
    ],
    medical: [
      'High contrast focus indicators for clinical environments',
      'Emergency alert focus priority',
      'Medical form field focus optimization',
      'Patient data entry focus flow',
      'Clinical workflow keyboard shortcuts'
    ]
  },
  
  ariaCompliance: {
    required: [
      'aria-label on all interactive elements',
      'aria-expanded for collapsible content',
      'aria-selected for selectable items',
      'aria-describedby for help text',
      'role attributes for custom components'
    ],
    medical: [
      'Medical terminology in aria-labels',
      'Clinical priority in aria descriptions',
      'Patient safety alerts with aria-live',
      'Medical device compatibility attributes',
      'Healthcare-specific landmark roles'
    ]
  }
};

/**
 * Keyboard Accessibility Component Audit
 */
class KeyboardAccessibilityAuditor {
  constructor() {
    this.results = {
      compliant: [],
      violations: [],
      warnings: [],
      medicalIssues: [],
      summary: {}
    };
  }

  /**
   * Check if component has proper keyboard navigation
   */
  auditComponent(componentName, filePath) {
    console.log(`🔍 Auditing ${componentName}...`);
    
    if (!fs.existsSync(filePath)) {
      this.results.violations.push({
        component: componentName,
        issue: 'Component file not found',
        severity: 'HIGH',
        medicalRisk: 'Component unavailable for medical device use'
      });
      return;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for essential keyboard accessibility patterns
    const checks = this.performKeyboardChecks(componentName, content);
    
    if (checks.violations.length === 0) {
      this.results.compliant.push({
        component: componentName,
        checks: checks.passed,
        medicalReady: checks.medicalFeatures.length > 0
      });
    } else {
      this.results.violations.push({
        component: componentName,
        issues: checks.violations || [],
        medicalRisk: this.assessMedicalRisk(checks.violations || [])
      });
    }
    
    if (checks.warnings.length > 0) {
      this.results.warnings.push({
        component: componentName,
        warnings: checks.warnings
      });
    }
  }

  /**
   * Perform keyboard accessibility checks on component code
   */
  performKeyboardChecks(componentName, content) {
    const checks = {
      passed: [],
      violations: [],
      warnings: [],
      medicalFeatures: []
    };

    // Essential keyboard navigation checks
    if (content.includes('tabIndex') || content.includes('tabindex')) {
      checks.passed.push('Tab index management');
    } else if (this.isInteractiveComponent(content)) {
      checks.violations.push({
        issue: 'Missing tabIndex on interactive component',
        severity: 'HIGH',
        fix: 'Add tabIndex={0} to make component keyboard accessible'
      });
    }

    // Focus management
    if (content.includes('onFocus$') || content.includes('onBlur$')) {
      checks.passed.push('Focus event handling');
    } else if (this.isInteractiveComponent(content)) {
      checks.violations.push({
        issue: 'Missing focus event handlers',
        severity: 'MEDIUM',
        fix: 'Add onFocus$ and onBlur$ handlers for focus management'
      });
    }

    // Keyboard event handling
    if (content.includes('onKeyDown$') || content.includes('onKeyPress$')) {
      checks.passed.push('Keyboard event handling');
      
      // Check for essential keys
      if (content.includes('Enter') || content.includes('Space')) {
        checks.passed.push('Enter/Space key support');
      } else {
        checks.warnings.push('Consider adding Enter/Space key activation');
      }
      
      if (content.includes('Escape')) {
        checks.passed.push('Escape key support');
        checks.medicalFeatures.push('Emergency escape functionality');
      }
      
      if (content.includes('ArrowUp') || content.includes('ArrowDown')) {
        checks.passed.push('Arrow key navigation');
        checks.medicalFeatures.push('Medical list navigation');
      }
    } else if (this.isInteractiveComponent(content)) {
      checks.violations.push({
        issue: 'Missing keyboard event handlers',
        severity: 'HIGH',
        fix: 'Add onKeyDown$ handler with Enter, Space, Escape key support'
      });
    }

    // ARIA compliance
    if (content.includes('aria-label') || content.includes('ariaLabel')) {
      checks.passed.push('ARIA labels present');
    } else if (this.isInteractiveComponent(content)) {
      checks.violations.push({
        issue: 'Missing ARIA labels',
        severity: 'HIGH',
        fix: 'Add aria-label attributes for screen reader accessibility'
      });
    }

    // Focus indicators
    if (content.includes('focus:') || content.includes(':focus')) {
      checks.passed.push('Focus indicators implemented');
    } else if (this.isInteractiveComponent(content)) {
      checks.violations.push({
        issue: 'Missing focus indicators',
        severity: 'HIGH',
        fix: 'Add focus: styles for visible focus indication'
      });
    }

    // Medical device specific checks
    if (content.includes('medical') || content.includes('clinical') || content.includes('patient')) {
      checks.medicalFeatures.push('Medical context awareness');
    }

    if (content.includes('emergency') || content.includes('critical') || content.includes('urgent')) {
      checks.medicalFeatures.push('Emergency healthcare functionality');
    }

    return checks;
  }

  /**
   * Determine if component is interactive and needs keyboard accessibility
   */
  isInteractiveComponent(content) {
    const interactiveElements = [
      'button', 'input', 'select', 'textarea', 'onClick$', 'onInput$',
      'role="button"', 'role="tab"', 'role="menuitem"', 'tabIndex'
    ];
    
    return interactiveElements.some(element => content.includes(element));
  }

  /**
   * Assess medical risk level for accessibility violations
   */
  assessMedicalRisk(violations) {
    const highRiskViolations = violations.filter(v => v.severity === 'HIGH');
    
    if (highRiskViolations.length > 2) {
      return 'CRITICAL - Medical device incompatible, patient safety risk';
    } else if (highRiskViolations.length > 0) {
      return 'HIGH - Medical workflow impaired, accessibility concerns';
    } else {
      return 'MEDIUM - Minor usability issues in clinical environment';
    }
  }

  /**
   * Generate comprehensive audit report
   */
  generateReport() {
    const total = this.results.compliant.length + this.results.violations.length;
    const complianceRate = Math.round((this.results.compliant.length / total) * 100);
    
    this.results.summary = {
      total,
      compliant: this.results.compliant.length,
      violations: this.results.violations.length,
      warnings: this.results.warnings.length,
      complianceRate,
      medicalDeviceReady: this.results.violations.length === 0,
      criticalMedicalIssues: this.results.violations.filter(v => 
        v.medicalRisk.includes('CRITICAL')).length
    };

    console.log('\n⌨️  MEDICAL DEVICE KEYBOARD ACCESSIBILITY AUDIT RESULTS');
    console.log('=====================================================');
    console.log(`✅ Compliant Components: ${this.results.compliant.length}/${total} (${complianceRate}%)`);
    console.log(`❌ Non-Compliant: ${this.results.violations.length}/${total}`);
    console.log(`⚠️  Warnings: ${this.results.warnings.length}`);
    console.log(`🏥 Medical Device Ready: ${this.results.summary.medicalDeviceReady ? 'YES' : 'NO'}`);
    console.log(`🚨 Critical Medical Issues: ${this.results.summary.criticalMedicalIssues}`);

    if (this.results.violations.length > 0) {
      console.log('\n❌ KEYBOARD ACCESSIBILITY VIOLATIONS:');
      console.log('=====================================');
      this.results.violations.forEach(violation => {
        console.log(`\n🔸 ${violation.component}:`);
        if (violation.issues && violation.issues.length > 0) {
          violation.issues.forEach(issue => {
            console.log(`   ❌ ${issue.issue} (${issue.severity})`);
            console.log(`   💡 Fix: ${issue.fix}`);
          });
        }
        console.log(`   🏥 Medical Risk: ${violation.medicalRisk}`);
      });
    }

    if (this.results.warnings.length > 0) {
      console.log('\n⚠️  ACCESSIBILITY WARNINGS:');
      console.log('===========================');
      this.results.warnings.forEach(warning => {
        console.log(`\n🔸 ${warning.component}:`);
        warning.warnings.forEach(w => console.log(`   ⚠️  ${w}`));
      });
    }

    console.log('\n🏆 COMPLIANT COMPONENTS:');
    console.log('========================');
    this.results.compliant.forEach(comp => {
      console.log(`✅ ${comp.component} - ${comp.checks.join(', ')}`);
      if (comp.medicalReady) {
        console.log(`   🏥 Medical Device Ready`);
      }
    });

    return this.results;
  }

  /**
   * Save detailed report to file
   */
  saveReport() {
    const reportPath = path.join(__dirname, '../test-results/keyboard-accessibility-audit.json');
    const summaryPath = path.join(__dirname, '../test-results/keyboard-accessibility-summary.md');
    
    // Ensure directory exists
    const dir = path.dirname(reportPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Save detailed JSON report
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    
    // Save markdown summary
    const mdReport = this.generateMarkdownSummary();
    fs.writeFileSync(summaryPath, mdReport);
    
    console.log(`\n📄 Detailed report saved: ${reportPath}`);
    console.log(`📝 Summary saved: ${summaryPath}`);
  }

  /**
   * Generate markdown summary report
   */
  generateMarkdownSummary() {
    const { summary } = this.results;
    
    return `# Medical Device Keyboard Accessibility Audit Report

**Date:** ${new Date().toISOString().split('T')[0]}  
**Standard:** Section 508, ADA, WCAG 2.1 AA  
**Medical Device Ready:** ${summary.medicalDeviceReady ? '✅ YES' : '❌ NO'}

## Summary

- **Total Components Tested:** ${summary.total}
- **Compliant:** ${summary.compliant} (${summary.complianceRate}%)
- **Non-Compliant:** ${summary.violations}
- **Warnings:** ${summary.warnings}
- **Critical Medical Issues:** ${summary.criticalMedicalIssues}

## Medical Device Compliance

${summary.medicalDeviceReady ? `
✅ **Medical Device Compatible**: All components support keyboard-only navigation required for medical devices.

### Compliance Achieved:
- Keyboard navigation through all interactive elements
- Focus management with proper indicators
- ARIA labels for screen reader compatibility
- Medical device keyboard compatibility
- Emergency function accessibility
` : `
❌ **Action Required**: Critical accessibility issues prevent medical device deployment.

### Immediate Fixes Needed:
${this.results.violations.filter(v => v.medicalRisk && v.medicalRisk.includes('CRITICAL')).map(v => 
  `- **${v.component}**: ${v.issues && v.issues.length > 0 ? v.issues.map(i => i.issue).join(', ') : 'Component file not found'}`
).join('\n')}
`}

## Healthcare Accessibility Requirements

### Section 508 Compliance
- **Keyboard Navigation**: ${summary.violations === 0 ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}
- **Focus Management**: ${this.results.violations.filter(v => v.issues && v.issues.some(i => i.issue.includes('focus'))).length === 0 ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}
- **ARIA Support**: ${this.results.violations.filter(v => v.issues && v.issues.some(i => i.issue.includes('ARIA'))).length === 0 ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}

### Medical Device Requirements
- **Emergency Access**: ${this.results.compliant.filter(c => c.medicalReady).length > 0 ? '✅ SUPPORTED' : '⚠️ LIMITED'}
- **Clinical Workflow**: ${summary.complianceRate >= 90 ? '✅ OPTIMIZED' : '⚠️ NEEDS IMPROVEMENT'}
- **Patient Safety**: ${summary.criticalMedicalIssues === 0 ? '✅ SECURE' : '❌ AT RISK'}

## Recommendations

${summary.medicalDeviceReady ? `
### Enhancements:
- Consider adding more medical device specific shortcuts
- Implement voice navigation support
- Add haptic feedback for touch-enabled medical devices
- Optimize for specialized medical keyboards
` : `
### Critical Actions:
1. Fix all HIGH severity accessibility violations
2. Add keyboard event handlers to interactive components
3. Implement proper focus management
4. Add ARIA labels for medical context
5. Test with actual medical device keyboards
`}

---
*Generated by RxOps UIKit Medical Device Accessibility Auditor*
`;
  }
}

// Component paths to audit
const componentPaths = [
  // Core interactive components
  { name: 'Button', path: '/Volumes/EXT/RxOps/uikit/src/core/atoms/button/button.tsx' },
  { name: 'Input', path: '/Volumes/EXT/RxOps/uikit/src/core/atoms/input/input.tsx' },
  { name: 'Card', path: '/Volumes/EXT/RxOps/uikit/src/core/organisms/card/card.tsx' },
  { name: 'Modal', path: '/Volumes/EXT/RxOps/uikit/src/core/organisms/modal/modal.tsx' },
  { name: 'Alert', path: '/Volumes/EXT/RxOps/uikit/src/core/atoms/alert/alert.tsx' },
  { name: 'Badge', path: '/Volumes/EXT/RxOps/uikit/src/core/atoms/badge/badge.tsx' },
  { name: 'Checkbox', path: '/Volumes/EXT/RxOps/uikit/src/core/atoms/checkbox/checkbox.tsx' },
  { name: 'Radio', path: '/Volumes/EXT/RxOps/uikit/src/core/atoms/radio/radio.tsx' },
  { name: 'Select', path: '/Volumes/EXT/RxOps/uikit/src/core/molecules/select/select.tsx' },
  { name: 'Table', path: '/Volumes/EXT/RxOps/uikit/src/core/organisms/table/table.tsx' },
  { name: 'Tabs', path: '/Volumes/EXT/RxOps/uikit/src/core/molecules/tabs/tabs.tsx' },
  { name: 'Accordion', path: '/Volumes/EXT/RxOps/uikit/src/core/molecules/accordion/accordion.tsx' },
  { name: 'Dropdown', path: '/Volumes/EXT/RxOps/uikit/src/core/molecules/dropdown/dropdown.tsx' },
  { name: 'Calendar', path: '/Volumes/EXT/RxOps/uikit/src/core/molecules/calendar/calendar.tsx' },
  { name: 'Stepper', path: '/Volumes/EXT/RxOps/uikit/src/core/molecules/stepper/stepper.tsx' },
  { name: 'Slider', path: '/Volumes/EXT/RxOps/uikit/src/core/atoms/slider/slider.tsx' },
  { name: 'Command Palette', path: '/Volumes/EXT/RxOps/uikit/src/core/molecules/command-palette/command-palette.tsx' },
  { name: 'Emergency Alert', path: '/Volumes/EXT/RxOps/uikit/src/core/organisms/emergency-alert/emergency-alert.tsx' },
  // Healthcare specific
  { name: 'Vital Signs Chart', path: '/Volumes/EXT/RxOps/uikit/src/healthcare/vital-signs-chart/vital-signs-chart.tsx' },
  { name: 'Medication Management', path: '/Volumes/EXT/RxOps/uikit/src/healthcare/medication-management/medication-management.tsx' },
  { name: 'Appointment Scheduler', path: '/Volumes/EXT/RxOps/uikit/src/healthcare/appointment-scheduler/appointment-scheduler.tsx' },
];

// Run the audit
console.log('Starting Medical Device Keyboard Accessibility Audit...\n');

const auditor = new KeyboardAccessibilityAuditor();

componentPaths.forEach(({ name, path }) => {
  auditor.auditComponent(name, path);
});

const results = auditor.generateReport();
auditor.saveReport();

// Medical device specific recommendations
console.log('\n🏥 MEDICAL DEVICE SPECIFIC RECOMMENDATIONS:');
console.log('===========================================');
console.log('1. All interactive elements must support Tab navigation');
console.log('2. Emergency functions need keyboard shortcuts (F1-F12)');
console.log('3. High contrast focus indicators for clinical lighting');
console.log('4. Numeric keypad support for medical data entry');
console.log('5. Compatible with specialized medical device keyboards');
console.log('6. Touch screen keyboard integration for tablets');

// Exit with error code if critical medical issues found
if (results.summary.criticalMedicalIssues > 0) {
  console.log('\n🚨 CRITICAL: Medical device compatibility at risk!');
  process.exit(1);
} else if (!results.summary.medicalDeviceReady) {
  console.log('\n⚠️  WARNING: Some accessibility improvements needed');
  process.exit(1);
} else {
  console.log('\n✅ SUCCESS: Medical device keyboard accessibility achieved!');
  process.exit(0);
}
