#!/usr/bin/env node

/**
 * Color Audit Tool for RxOps UIkit
 * 
 * Analyzes components to find color inconsistencies and fixes them
 * to use our tokenized design system colors properly.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Our tokenized color system from design tokens
const TOKENIZED_COLORS = {
  // Primary colors
  primary: {
    classes: ['bg-primary-', 'text-primary-', 'border-primary-', 'ring-primary-'],
    shades: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950']
  },
  // Neutral colors
  neutral: {
    classes: ['bg-neutral-', 'text-neutral-', 'border-neutral-', 'ring-neutral-'],
    shades: ['0', '50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950']
  },
  // Semantic colors
  success: {
    classes: ['bg-success-', 'text-success-', 'border-success-', 'ring-success-'],
    shades: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900']
  },
  warning: {
    classes: ['bg-warning-', 'text-warning-', 'border-warning-', 'ring-warning-'],
    shades: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900']
  },
  error: {
    classes: ['bg-error-', 'text-error-', 'border-error-', 'ring-error-'],
    shades: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900']
  },
  info: {
    classes: ['bg-info-', 'text-info-', 'border-info-', 'ring-info-'],
    shades: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900']
  }
};

// Common problematic patterns that should be replaced
const PROBLEMATIC_PATTERNS = [
  // Legacy Tailwind colors that should use our tokens
  {
    pattern: /bg-blue-(\d+)/g,
    replacement: (match, shade) => `bg-primary-${shade}`,
    reason: 'Should use primary color token instead of blue'
  },
  {
    pattern: /text-blue-(\d+)/g,
    replacement: (match, shade) => `text-primary-${shade}`,
    reason: 'Should use primary color token instead of blue'
  },
  {
    pattern: /border-blue-(\d+)/g,
    replacement: (match, shade) => `border-primary-${shade}`,
    reason: 'Should use primary color token instead of blue'
  },
  
  // Gray variants
  {
    pattern: /bg-gray-(\d+)/g,
    replacement: (match, shade) => `bg-neutral-${shade}`,
    reason: 'Should use neutral color token instead of gray'
  },
  {
    pattern: /text-gray-(\d+)/g,
    replacement: (match, shade) => `text-neutral-${shade}`,
    reason: 'Should use neutral color token instead of gray'
  },
  {
    pattern: /border-gray-(\d+)/g,
    replacement: (match, shade) => `border-neutral-${shade}`,
    reason: 'Should use neutral color token instead of gray'
  },
  
  // Green variants
  {
    pattern: /bg-green-(\d+)/g,
    replacement: (match, shade) => `bg-success-${shade}`,
    reason: 'Should use success color token instead of green'
  },
  {
    pattern: /text-green-(\d+)/g,
    replacement: (match, shade) => `text-success-${shade}`,
    reason: 'Should use success color token instead of green'
  },
  
  // Red variants
  {
    pattern: /bg-red-(\d+)/g,
    replacement: (match, shade) => `bg-error-${shade}`,
    reason: 'Should use error color token instead of red'
  },
  {
    pattern: /text-red-(\d+)/g,
    replacement: (match, shade) => `text-error-${shade}`,
    reason: 'Should use error color token instead of red'
  },
  
  // Yellow variants
  {
    pattern: /bg-yellow-(\d+)/g,
    replacement: (match, shade) => `bg-warning-${shade}`,
    reason: 'Should use warning color token instead of yellow'
  },
  {
    pattern: /text-yellow-(\d+)/g,
    replacement: (match, shade) => `text-warning-${shade}`,
    reason: 'Should use warning color token instead of yellow'
  },
  
  // Common visibility issues
  {
    pattern: /text-white\s+bg-white/g,
    replacement: 'text-neutral-900 bg-neutral-0',
    reason: 'White text on white background causes invisibility'
  },
  {
    pattern: /text-black\s+bg-black/g,
    replacement: 'text-neutral-0 bg-neutral-900',
    reason: 'Black text on black background causes invisibility'
  },
  
  // Hardcoded colors
  {
    pattern: /#[0-9a-fA-F]{6}/g,
    replacement: '/* USE DESIGN TOKENS INSTEAD */',
    reason: 'Hardcoded hex colors should use design tokens'
  }
];

class ColorAuditor {
  constructor() {
    this.srcDir = path.join(__dirname, '..', 'src');
    this.issues = [];
    this.fixes = [];
    this.stats = {
      totalFiles: 0,
      processedFiles: 0,
      filesWithIssues: 0,
      totalIssues: 0,
      autoFixableIssues: 0,
      visibilityIssues: 0
    };
  }

  async audit(fixMode = false) {
    console.log(`🎨 ${fixMode ? 'Fixing' : 'Auditing'} Color Usage in RxOps UIkit...\n`);
    
    await this.scanDirectory(this.srcDir, fixMode);
    
    if (fixMode) {
      this.generateFixReport();
    } else {
      this.generateAuditReport();
    }
    
    return this.issues.length === 0;
  }

  async scanDirectory(dir, fixMode = false) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        if (!['node_modules', '.git', 'dist', 'lib', 'lib-types', 'tools'].includes(entry.name)) {
          await this.scanDirectory(fullPath, fixMode);
        }
      } else if (entry.isFile() && this.isComponentFile(entry.name)) {
        this.stats.totalFiles++;
        await this.analyzeFile(fullPath, fixMode);
      }
    }
  }

  isComponentFile(filename) {
    return filename.match(/\.(tsx|ts)$/) && 
           !filename.includes('.test.') && 
           !filename.includes('.spec.') &&
           !filename.includes('.d.ts');
  }

  async analyzeFile(filePath, fixMode = false) {
    try {
      const originalContent = fs.readFileSync(filePath, 'utf8');
      let content = originalContent;
      const relativePath = path.relative(this.srcDir, filePath);
      
      this.stats.processedFiles++;
      
      const fileIssues = [];
      const fileFixes = [];
      let hasChanges = false;
      
      // Check for problematic patterns
      PROBLEMATIC_PATTERNS.forEach(({ pattern, replacement, reason }) => {
        const matches = [...content.matchAll(pattern)];
        
        if (matches.length > 0) {
          matches.forEach(match => {
            fileIssues.push({
              type: 'color-token-issue',
              line: this.getLineNumber(originalContent, match.index),
              original: match[0],
              suggested: typeof replacement === 'function' 
                ? replacement(match[0], match[1]) 
                : replacement,
              reason: reason
            });
            
            this.stats.totalIssues++;
            
            if (reason.includes('invisibility')) {
              this.stats.visibilityIssues++;
            }
            
            this.stats.autoFixableIssues++;
          });
          
          if (fixMode) {
            const newContent = content.replace(pattern, replacement);
            if (newContent !== content) {
              content = newContent;
              hasChanges = true;
              fileFixes.push({
                pattern: pattern.toString(),
                replacement: replacement.toString(),
                reason: reason
              });
            }
          }
        }
      });
      
      // Check for specific visibility issues
      const visibilityIssues = this.checkVisibilityIssues(originalContent, relativePath);
      fileIssues.push(...visibilityIssues);
      
      if (fileIssues.length > 0) {
        this.stats.filesWithIssues++;
        this.issues.push({
          file: relativePath,
          issues: fileIssues,
          componentType: this.getComponentType(relativePath)
        });
      }
      
      if (fixMode && hasChanges) {
        fs.writeFileSync(filePath, content, 'utf8');
        this.fixes.push({
          file: relativePath,
          fixes: fileFixes
        });
        console.log(`✅ Fixed: ${relativePath}`);
      }
      
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
    }
  }

  checkVisibilityIssues(content, filePath) {
    const issues = [];
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      // Check for low contrast combinations
      if (line.includes('text-neutral-400') && line.includes('bg-neutral-300')) {
        issues.push({
          type: 'low-contrast',
          line: index + 1,
          original: line.trim(),
          suggested: 'Use higher contrast colors (text-neutral-700 bg-neutral-100)',
          reason: 'Low contrast may cause accessibility issues'
        });
        this.stats.visibilityIssues++;
      }
      
      // Check for missing hover states on interactive elements
      if ((line.includes('onClick') || line.includes('button')) && 
          !line.includes('hover:') && 
          !line.includes('disabled')) {
        issues.push({
          type: 'missing-hover-state',
          line: index + 1,
          original: line.trim(),
          suggested: 'Add hover state (e.g., hover:bg-primary-600)',
          reason: 'Interactive elements should have visible hover states'
        });
      }
    });
    
    return issues;
  }

  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }

  getComponentType(filePath) {
    if (filePath.includes('/atoms/')) return 'atom';
    if (filePath.includes('/molecules/')) return 'molecule';
    if (filePath.includes('/organisms/')) return 'organism';
    if (filePath.includes('/healthcare/')) return 'healthcare';
    if (filePath.includes('/layouts/')) return 'layout';
    return 'other';
  }

  generateAuditReport() {
    console.log('📊 Color Audit Report\n');
    console.log('='.repeat(60));
    
    // Summary
    console.log(`📁 Files Analyzed: ${this.stats.processedFiles}/${this.stats.totalFiles}`);
    console.log(`🚨 Files with Issues: ${this.stats.filesWithIssues}`);
    console.log(`📝 Total Issues: ${this.stats.totalIssues}`);
    console.log(`🔧 Auto-fixable: ${this.stats.autoFixableIssues}`);
    console.log(`👁️  Visibility Issues: ${this.stats.visibilityIssues}`);
    
    // Health score
    const healthScore = this.calculateHealthScore();
    console.log(`\n🏥 Color System Health: ${healthScore}%`);
    this.printHealthBar(healthScore);
    
    console.log('\n='.repeat(60));
    
    // Group issues by component type
    const issuesByType = this.groupByComponentType();
    
    Object.entries(issuesByType).forEach(([type, components]) => {
      if (components.length > 0) {
        console.log(`\n📂 ${type.toUpperCase()} COMPONENTS (${components.length} with issues):`);
        console.log('-'.repeat(40));
        
        components.forEach(component => {
          console.log(`\n📄 ${component.file}`);
          
          component.issues.slice(0, 3).forEach(issue => { // Show first 3 issues
            const icon = this.getIssueIcon(issue.type);
            console.log(`  ${icon} Line ${issue.line}: ${issue.reason}`);
            console.log(`     Found: ${issue.original}`);
            if (issue.suggested) {
              console.log(`     Fix: ${issue.suggested}`);
            }
          });
          
          if (component.issues.length > 3) {
            console.log(`     ... and ${component.issues.length - 3} more issues`);
          }
        });
      }
    });
    
    this.generateRecommendations();
  }

  generateFixReport() {
    console.log('🔧 Color Fix Report\n');
    console.log('='.repeat(60));
    
    console.log(`✅ Files Fixed: ${this.fixes.length}`);
    console.log(`🔧 Total Fixes Applied: ${this.stats.autoFixableIssues}`);
    
    if (this.fixes.length > 0) {
      console.log('\n📝 Applied Fixes:');
      this.fixes.forEach(fix => {
        console.log(`\n📄 ${fix.file}`);
        fix.fixes.forEach(applied => {
          console.log(`  ✅ ${applied.reason}`);
        });
      });
    }
    
    console.log('\n🎉 Color system is now more consistent!');
    console.log('\n💡 Run the audit again to check for remaining issues:');
    console.log('   npm run color:audit');
  }

  groupByComponentType() {
    const grouped = {
      atom: [],
      molecule: [],
      organism: [],
      healthcare: [],
      layout: [],
      other: []
    };
    
    this.issues.forEach(issue => {
      grouped[issue.componentType].push(issue);
    });
    
    return grouped;
  }

  getIssueIcon(type) {
    const icons = {
      'color-token-issue': '🎨',
      'low-contrast': '👁️',
      'missing-hover-state': '🖱️',
      'hardcoded-color': '🔴',
      'visibility-issue': '⚠️'
    };
    return icons[type] || '❓';
  }

  calculateHealthScore() {
    if (this.stats.totalFiles === 0) return 100;
    
    const healthyFiles = this.stats.processedFiles - this.stats.filesWithIssues;
    return Math.round((healthyFiles / this.stats.processedFiles) * 100);
  }

  printHealthBar(score) {
    const barLength = 20;
    const filledLength = Math.round((score / 100) * barLength);
    const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
    
    let color = '';
    if (score >= 80) color = '🟢';
    else if (score >= 60) color = '🟡';
    else color = '🔴';
    
    console.log(`${color} [${bar}] ${score}%`);
  }

  generateRecommendations() {
    console.log('\n💡 Recommendations\n');
    console.log('='.repeat(60));
    
    if (this.stats.autoFixableIssues > 0) {
      console.log('🔧 Quick Fix Available:');
      console.log('   npm run color:fix');
      console.log('   This will automatically fix tokenization issues\n');
    }
    
    if (this.stats.visibilityIssues > 0) {
      console.log('👁️  Manual Review Needed:');
      console.log('   • Check contrast ratios for accessibility');
      console.log('   • Add hover states to interactive elements');
      console.log('   • Test component visibility in different themes\n');
    }
    
    console.log('📋 Best Practices:');
    console.log('1. Always use design tokens (primary, neutral, success, etc.)');
    console.log('2. Avoid hardcoded colors (#ffffff, rgb(), etc.)');
    console.log('3. Test components with different color combinations');
    console.log('4. Use semantic colors for meaning (error-500, success-600)');
    console.log('5. Ensure proper contrast for accessibility');
  }
}

// CLI interface
const args = process.argv.slice(2);
const fixMode = args.includes('--fix') || args.includes('-f');

if (import.meta.url === `file://${process.argv[1]}`) {
  const auditor = new ColorAuditor();
  auditor.audit(fixMode).then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Audit failed:', error);
    process.exit(1);
  });
}

export default ColorAuditor;
