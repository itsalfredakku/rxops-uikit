#!/usr/bin/env node

/**
 * Touch Target Size Analysis Script
 * 
 * Analyzes UI Kit components for healthcare-compliant touch target sizes.
 * Based on MOBILE_HEALTHCARE_TARGETS requirements: 44px minimum, 48px recommended.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Healthcare touch target requirements
const TOUCH_TARGETS = {
  minimum: 44,      // 44px minimum for medical gloves
  recommended: 48,  // 48px recommended for gloves
  spacing: 8,       // 8px minimum spacing between targets
};

// Interactive elements that need proper touch targets
const INTERACTIVE_ELEMENTS = [
  'button', 'input', 'select', 'textarea', 'checkbox', 'radio', 'switch',
  'link', 'tab', 'pagination', 'dropdown', 'tooltip', 'modal-close',
  'accordion', 'carousel-control'
];

// Size patterns to detect in Tailwind classes
const SIZE_PATTERNS = [
  // Height classes
  { pattern: /h-(\d+)/g, property: 'height', multiplier: 4 },
  { pattern: /h-\[(\d+)px\]/g, property: 'height', multiplier: 1 },
  // Width classes
  { pattern: /w-(\d+)/g, property: 'width', multiplier: 4 },
  { pattern: /w-\[(\d+)px\]/g, property: 'width', multiplier: 1 },
  // Padding classes (affects touch area)
  { pattern: /p-(\d+)/g, property: 'padding', multiplier: 4 },
  { pattern: /py-(\d+)/g, property: 'padding-y', multiplier: 4 },
  { pattern: /px-(\d+)/g, property: 'padding-x', multiplier: 4 },
  { pattern: /pt-(\d+)/g, property: 'padding-top', multiplier: 4 },
  { pattern: /pb-(\d+)/g, property: 'padding-bottom', multiplier: 4 },
  { pattern: /pl-(\d+)/g, property: 'padding-left', multiplier: 4 },
  { pattern: /pr-(\d+)/g, property: 'padding-right', multiplier: 4 },
];

function analyzeComponentTouchTargets(componentPath) {
  try {
    const content = fs.readFileSync(componentPath, 'utf8');
    const touchIssues = [];
    const touchTargets = [];
    
    // Find interactive elements
    const lines = content.split('\n');
    lines.forEach((line, lineNumber) => {
      // Check for interactive HTML elements
      const interactiveMatches = INTERACTIVE_ELEMENTS.some(element => {
        return line.includes(`<${element}`) || line.includes(`<Button`) || line.includes(`onClick$`);
      });
      
      if (interactiveMatches) {
        const sizes = extractSizesFromLine(line);
        const touchTarget = {
          line: lineNumber + 1,
          content: line.trim(),
          sizes,
          compliance: evaluateCompliance(sizes)
        };
        
        touchTargets.push(touchTarget);
        
        if (touchTarget.compliance.status !== 'compliant') {
          touchIssues.push({
            line: lineNumber + 1,
            issue: touchTarget.compliance.issue,
            recommendation: touchTarget.compliance.recommendation,
            content: line.trim().substring(0, 100) + '...'
          });
        }
      }
    });
    
    return {
      path: componentPath,
      touchTargets,
      touchIssues,
      complianceScore: calculateComplianceScore(touchTargets)
    };
  } catch (error) {
    return {
      path: componentPath,
      touchTargets: [],
      touchIssues: [],
      complianceScore: 0,
      error: error.message
    };
  }
}

function extractSizesFromLine(line) {
  const sizes = {};
  
  SIZE_PATTERNS.forEach(({ pattern, property, multiplier }) => {
    const matches = line.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const value = parseInt(match.match(/(\d+)/)[1]) * multiplier;
        sizes[property] = Math.max(sizes[property] || 0, value);
      });
    }
  });
  
  // Check for specific size class patterns
  if (line.includes('h-8')) sizes.height = 32;
  if (line.includes('h-9')) sizes.height = 36;
  if (line.includes('h-10')) sizes.height = 40;
  if (line.includes('h-11')) sizes.height = 44;
  if (line.includes('h-12')) sizes.height = 48;
  
  return sizes;
}

function evaluateCompliance(sizes) {
  const effectiveHeight = (sizes.height || 0) + ((sizes['padding-y'] || sizes.padding || 0) * 2);
  const effectiveWidth = (sizes.width || 0) + ((sizes['padding-x'] || sizes.padding || 0) * 2);
  
  const minSize = Math.min(
    effectiveHeight || TOUCH_TARGETS.minimum,
    effectiveWidth || TOUCH_TARGETS.minimum
  );
  
  if (minSize >= TOUCH_TARGETS.recommended) {
    return {
      status: 'optimal',
      message: `Excellent: ${minSize}px meets recommended 48px`,
      recommendation: 'No changes needed'
    };
  } else if (minSize >= TOUCH_TARGETS.minimum) {
    return {
      status: 'compliant',
      message: `Good: ${minSize}px meets minimum 44px`,
      recommendation: 'Consider increasing to 48px for better glove compatibility'
    };
  } else if (sizes.height || sizes.width) {
    return {
      status: 'non-compliant',
      issue: `Touch target too small: ${minSize}px < 44px minimum`,
      recommendation: `Increase to minimum 44px (recommend 48px) for medical glove compatibility`
    };
  } else {
    return {
      status: 'unknown',
      issue: 'No explicit size classes found',
      recommendation: 'Add explicit height/width classes to ensure 44px minimum'
    };
  }
}

function calculateComplianceScore(touchTargets) {
  if (touchTargets.length === 0) return 100; // No touch targets = no issues
  
  const compliantTargets = touchTargets.filter(t => 
    t.compliance.status === 'compliant' || t.compliance.status === 'optimal'
  ).length;
  
  return Math.round((compliantTargets / touchTargets.length) * 100);
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
        const analysis = analyzeComponentTouchTargets(fullPath);
        if (analysis.touchTargets.length > 0) { // Only include components with touch targets
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
  const componentsWithIssues = results.filter(r => r.touchIssues.length > 0).length;
  const totalTouchTargets = results.reduce((sum, r) => sum + r.touchTargets.length, 0);
  const totalIssues = results.reduce((sum, r) => sum + r.touchIssues.length, 0);
  const avgComplianceScore = Math.round(
    results.reduce((sum, r) => sum + r.complianceScore, 0) / totalComponents
  );
  
  const report = {
    summary: {
      totalComponents,
      componentsWithIssues,
      totalTouchTargets,
      totalIssues,
      avgComplianceScore: `${avgComplianceScore}%`,
      timestamp: new Date().toISOString()
    },
    analysis: {
      criticalIssues: results.filter(r => r.complianceScore < 50),
      needingImprovement: results.filter(r => r.complianceScore >= 50 && r.complianceScore < 80),
      wellOptimized: results.filter(r => r.complianceScore >= 80)
    },
    details: results
  };
  
  return report;
}

function main() {
  console.log('📱 Analyzing touch target sizes for healthcare compliance...\n');
  
  const srcPath = path.join(__dirname, '..', 'src');
  const results = scanDirectory(srcPath);
  const report = generateReport(results);
  
  // Output summary
  console.log('📊 TOUCH TARGET COMPLIANCE SUMMARY');
  console.log('==================================');
  console.log(`Components Analyzed: ${report.summary.totalComponents}`);
  console.log(`Touch Targets Found: ${report.summary.totalTouchTargets}`);
  console.log(`Touch Target Issues: ${report.summary.totalIssues}`);
  console.log(`Average Compliance: ${report.summary.avgComplianceScore}`);
  console.log('');
  
  // Critical issues
  console.log('🚨 CRITICAL TOUCH TARGET ISSUES:');
  console.log('=================================');
  report.analysis.criticalIssues.forEach(comp => {
    const componentName = path.basename(comp.path, '.tsx');
    console.log(`- ${componentName} (${comp.complianceScore}% compliant, ${comp.touchIssues.length} issues)`);
    comp.touchIssues.slice(0, 2).forEach(issue => {
      console.log(`  → Line ${issue.line}: ${issue.issue}`);
    });
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
  
  // Well optimized components
  console.log('✅ WELL-OPTIMIZED COMPONENTS:');
  console.log('=============================');
  report.analysis.wellOptimized.forEach(comp => {
    const componentName = path.basename(comp.path, '.tsx');
    console.log(`- ${componentName} (${comp.complianceScore}% compliant)`);
  });
  
  // Save detailed report
  const reportPath = path.join(__dirname, '..', 'touch-targets-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📋 Detailed report saved to: ${reportPath}`);
  
  // Exit code based on overall compliance
  const exitCode = report.summary.avgComplianceScore >= 80 ? 0 : 1;
  process.exit(exitCode);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { analyzeComponentTouchTargets, generateReport };
