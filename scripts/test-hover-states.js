#!/usr/bin/env node

/**
 * Hover States Visual Testing Script
 * 
 * This script analyzes our UI Kit components for hover state coverage
 * and generates a report for VISUAL-002 improvements.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Interactive components that should have hover states
const INTERACTIVE_COMPONENTS = [
  'button', 'link', 'badge', 'card', 'service-card', 'metric-card',
  'dropdown', 'select', 'input', 'textarea', 'checkbox', 'radio',
  'switch', 'tabs', 'pagination', 'breadcrumb', 'alert'
];

// Hover patterns to detect
const HOVER_PATTERNS = [
  /hover:[\w-]+/g,
  /hover:\[[\w\[\].-]+\]/g,
  /@apply.*hover/g,
  /&:hover/g
];

function analyzeComponentHoverStates(componentPath) {
  try {
    const content = fs.readFileSync(componentPath, 'utf8');
    const hoverMatches = [];
    
    HOVER_PATTERNS.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        hoverMatches.push(...matches);
      }
    });
    
    return {
      path: componentPath,
      hasHoverStates: hoverMatches.length > 0,
      hoverClasses: [...new Set(hoverMatches)],
      interactiveElements: detectInteractiveElements(content)
    };
  } catch (error) {
    return {
      path: componentPath,
      hasHoverStates: false,
      hoverClasses: [],
      interactiveElements: [],
      error: error.message
    };
  }
}

function detectInteractiveElements(content) {
  const interactive = [];
  
  // Detect click handlers
  if (content.includes('onClick$') || content.includes('onMouseEnter$')) {
    interactive.push('click-handlers');
  }
  
  // Detect buttons
  if (content.includes('<button') || content.includes('<Button')) {
    interactive.push('buttons');
  }
  
  // Detect links
  if (content.includes('<a ') || content.includes('<Link')) {
    interactive.push('links');
  }
  
  // Detect form elements
  if (content.includes('input') || content.includes('select') || content.includes('textarea')) {
    interactive.push('form-elements');
  }
  
  return interactive;
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
        const analysis = analyzeComponentHoverStates(fullPath);
        results.push(analysis);
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error.message);
  }
  
  return results;
}

function generateReport(results) {
  const totalComponents = results.length;
  const componentsWithHover = results.filter(r => r.hasHoverStates).length;
  const hoverCoverage = Math.round((componentsWithHover / totalComponents) * 100);
  
  const report = {
    summary: {
      totalComponents,
      componentsWithHover,
      hoverCoverage: `${hoverCoverage}%`,
      timestamp: new Date().toISOString()
    },
    analysis: {
      componentsWithGoodHover: results.filter(r => r.hasHoverStates && r.hoverClasses.length >= 2),
      componentsNeedingHover: results.filter(r => !r.hasHoverStates && r.interactiveElements.length > 0),
      componentsWithBasicHover: results.filter(r => r.hasHoverStates && r.hoverClasses.length === 1)
    },
    details: results
  };
  
  return report;
}

function main() {
  console.log('🔍 Analyzing hover states in UI Kit components...\n');
  
  const srcPath = path.join(__dirname, '..', 'src');
  const results = scanDirectory(srcPath);
  const report = generateReport(results);
  
  // Output summary
  console.log('📊 HOVER STATES ANALYSIS SUMMARY');
  console.log('================================');
  console.log(`Total Components: ${report.summary.totalComponents}`);
  console.log(`Components with Hover: ${report.summary.componentsWithHover}`);
  console.log(`Hover Coverage: ${report.summary.hoverCoverage}`);
  console.log('');
  
  // Components needing hover states
  console.log('⚠️  COMPONENTS NEEDING HOVER STATES:');
  console.log('=====================================');
  report.analysis.componentsNeedingHover.forEach(comp => {
    const componentName = path.basename(comp.path, '.tsx');
    console.log(`- ${componentName} (${comp.interactiveElements.join(', ')})`);
  });
  console.log('');
  
  // Components with good hover states
  console.log('✅ COMPONENTS WITH GOOD HOVER STATES:');
  console.log('=====================================');
  report.analysis.componentsWithGoodHover.forEach(comp => {
    const componentName = path.basename(comp.path, '.tsx');
    console.log(`- ${componentName} (${comp.hoverClasses.length} hover states)`);
  });
  
  // Save detailed report
  const reportPath = path.join(__dirname, '..', 'hover-states-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📋 Detailed report saved to: ${reportPath}`);
  
  // Exit code based on coverage
  const hoverCoverage = parseInt(report.summary.hoverCoverage);
  const exitCode = hoverCoverage >= 80 ? 0 : 1;
  process.exit(exitCode);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { analyzeComponentHoverStates, generateReport };
