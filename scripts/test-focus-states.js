#!/usr/bin/env node

/**
 * Focus States Accessibility Analysis Script
 * 
 * Analyzes UI Kit components for healthcare-compliant keyboard focus states.
 * Critical for accessibility and healthcare workers using keyboards/assistive devices.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Focus state patterns to detect
const FOCUS_PATTERNS = [
  /focus:[\w-]+/g,
  /focus-visible:[\w-]+/g,
  /focus-within:[\w-]+/g,
  /focus:\[[\w\[\].-]+\]/g,
  /:focus/g,
  /focus-visible:/g
];

// Interactive elements that need focus states
const FOCUSABLE_ELEMENTS = [
  'button', 'input', 'select', 'textarea', 'checkbox', 'radio', 'switch',
  'link', 'tab', 'modal', 'dropdown', 'accordion', 'pagination'
];

function analyzeComponentFocusStates(componentPath) {
  try {
    const content = fs.readFileSync(componentPath, 'utf8');
    const focusMatches = [];
    const focusableElements = [];
    
    FOCUS_PATTERNS.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        focusMatches.push(...matches);
      }
    });
    
    // Check for focusable elements
    const lines = content.split('\n');
    lines.forEach((line, lineNumber) => {
      FOCUSABLE_ELEMENTS.forEach(element => {
        if (line.includes(`<${element}`) || line.includes(`<Button`) || line.includes('onClick$')) {
          focusableElements.push({
            line: lineNumber + 1,
            element: element,
            content: line.trim().substring(0, 100) + '...'
          });
        }
      });
    });
    
    return {
      path: componentPath,
      hasFocusStates: focusMatches.length > 0,
      focusClasses: [...new Set(focusMatches)],
      focusableElements,
      complianceScore: calculateFocusCompliance(focusMatches, focusableElements)
    };
  } catch (error) {
    return {
      path: componentPath,
      hasFocusStates: false,
      focusClasses: [],
      focusableElements: [],
      complianceScore: 0,
      error: error.message
    };
  }
}

function calculateFocusCompliance(focusMatches, focusableElements) {
  if (focusableElements.length === 0) return 100; // No focusable elements = no issues
  
  // Good compliance if we have focus states and focusable elements
  if (focusMatches.length > 0 && focusableElements.length > 0) {
    return Math.min(100, Math.round((focusMatches.length / focusableElements.length) * 100));
  }
  
  return focusMatches.length > 0 ? 100 : 0;
}

function scanDirectory(dirPath) {
  const results = [];
  
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        results.push(...scanDirectory(fullPath));
      } else if (item.endsWith('.tsx') && !item.includes('.test.') && !item.includes('.spec.')) {
        const analysis = analyzeComponentFocusStates(fullPath);
        if (analysis.focusableElements.length > 0) { // Only include components with focusable elements
          results.push(analysis);
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error.message);
  }
  
  return results;
}

function generateReport(results) {
  const totalComponents = results.length;
  const componentsWithFocus = results.filter(r => r.hasFocusStates).length;
  const totalFocusableElements = results.reduce((sum, r) => sum + r.focusableElements.length, 0);
  const avgComplianceScore = Math.round(
    results.reduce((sum, r) => sum + r.complianceScore, 0) / totalComponents
  );
  const focusCoverage = Math.round((componentsWithFocus / totalComponents) * 100);
  
  const report = {
    summary: {
      totalComponents,
      componentsWithFocus,
      focusCoverage: `${focusCoverage}%`,
      totalFocusableElements,
      avgComplianceScore: `${avgComplianceScore}%`,
      timestamp: new Date().toISOString()
    },
    analysis: {
      excellentCompliance: results.filter(r => r.complianceScore >= 80),
      needingImprovement: results.filter(r => r.complianceScore >= 50 && r.complianceScore < 80),
      poorCompliance: results.filter(r => r.complianceScore < 50)
    },
    details: results
  };
  
  return report;
}

function main() {
  console.log('♿ Analyzing focus states for accessibility compliance...\n');
  
  const srcPath = path.join(__dirname, '..', 'src');
  const results = scanDirectory(srcPath);
  const report = generateReport(results);
  
  // Output summary
  console.log('📊 FOCUS STATES ACCESSIBILITY SUMMARY');
  console.log('=====================================');
  console.log(`Components Analyzed: ${report.summary.totalComponents}`);
  console.log(`Components with Focus States: ${report.summary.componentsWithFocus}`);
  console.log(`Focus Coverage: ${report.summary.focusCoverage}`);
  console.log(`Focusable Elements: ${report.summary.totalFocusableElements}`);
  console.log(`Average Compliance: ${report.summary.avgComplianceScore}`);
  console.log('');
  
  // Poor compliance
  console.log('🚨 COMPONENTS NEEDING FOCUS STATES:');
  console.log('===================================');
  report.analysis.poorCompliance.forEach(comp => {
    const componentName = path.basename(comp.path, '.tsx');
    console.log(`- ${componentName} (${comp.complianceScore}% compliant, ${comp.focusableElements.length} focusable elements)`);
  });
  console.log('');
  
  // Components needing improvement
  console.log('⚠️  COMPONENTS NEEDING IMPROVEMENT:');
  console.log('==================================');
  report.analysis.needingImprovement.forEach(comp => {
    const componentName = path.basename(comp.path, '.tsx');
    console.log(`- ${componentName} (${comp.complianceScore}% compliant)`);
  });
  console.log('');
  
  // Excellent compliance
  console.log('✅ EXCELLENT FOCUS ACCESSIBILITY:');
  console.log('=================================');
  report.analysis.excellentCompliance.forEach(comp => {
    const componentName = path.basename(comp.path, '.tsx');
    console.log(`- ${componentName} (${comp.complianceScore}% compliant, ${comp.focusClasses.length} focus states)`);
  });
  
  // Save detailed report
  const reportPath = path.join(__dirname, '..', 'focus-states-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📋 Detailed report saved to: ${reportPath}`);
  
  // Exit code based on coverage
  const exitCode = report.summary.focusCoverage >= 80 ? 0 : 1;
  process.exit(exitCode);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { analyzeComponentFocusStates, generateReport };
