#!/usr/bin/env node

/**
 * Healthcare Component Interface Fixer
 * Quickly fixes component prop interface mismatches for immediate development
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';

const rootDir = resolve(process.cwd());

// Common interface fixes needed across healthcare components
const INTERFACE_FIXES = {
  // Badge component - standardize to variant instead of intent
  badge: {
    find: /intent=["']([^"']+)["']/g,
    replace: 'variant="$1"',
    description: 'Badge: intent → variant'
  },
  
  // Alert component - standardize variants
  alert: {
    find: /variant=["'](success|warning|error)["']/g,
    replace: (match, variant) => {
      const variantMap = {
        'success': 'success',
        'warning': 'warning', 
        'error': 'destructive'
      };
      return `variant="${variantMap[variant] || variant}"`;
    },
    description: 'Alert: standardize variant names'
  },
  
  // Button component - size standardization
  button: {
    find: /size=["'](large|medium)["']/g,
    replace: (match, size) => {
      const sizeMap = {
        'large': 'lg',
        'medium': 'md'
      };
      return `size="${sizeMap[size] || size}"`;
    },
    description: 'Button: large/medium → lg/md'
  },
  
  // Emergency Alert - standardize props
  emergencyAlert: {
    find: /type=["']([^"']+)["']/g,
    replace: 'severity="$1"',
    description: 'EmergencyAlert: type → severity'
  }
};

class ComponentInterfaceFixer {
  constructor() {
    this.fixCount = 0;
    this.fileCount = 0;
    this.results = [];
  }

  async fixAllInterfaces() {
    console.log('🔧 Healthcare Component Interface Fixer Starting...\n');
    
    const showcaseDir = join(rootDir, 'src', 'showcase');
    const testDir = join(rootDir, '__tests__');
    
    // Fix showcase files
    await this.fixDirectory(showcaseDir, '📱 Showcase');
    
    // Fix test files  
    await this.fixDirectory(testDir, '🧪 Tests');
    
    this.generateReport();
  }

  async fixDirectory(dirPath, label) {
    console.log(`${label} Directory: ${dirPath}`);
    
    try {
      const items = readdirSync(dirPath, { withFileTypes: true });
      
      for (const item of items) {
        const itemPath = join(dirPath, item.name);
        
        if (item.isDirectory()) {
          await this.fixDirectory(itemPath, `${label}/${item.name}`);
        } else if (item.name.endsWith('.tsx') || item.name.endsWith('.ts')) {
          await this.fixFile(itemPath);
        }
      }
    } catch (error) {
      console.log(`  ⚠️  Directory not found or inaccessible: ${dirPath}`);
    }
  }

  async fixFile(filePath) {
    try {
      let content = readFileSync(filePath, 'utf8');
      let modified = false;
      let fixes = [];

      // Apply all interface fixes
      for (const [name, fix] of Object.entries(INTERFACE_FIXES)) {
        const originalContent = content;
        
        if (typeof fix.replace === 'function') {
          content = content.replace(fix.find, fix.replace);
        } else {
          content = content.replace(fix.find, fix.replace);
        }
        
        if (content !== originalContent) {
          fixes.push(fix.description);
          modified = true;
          this.fixCount++;
        }
      }

      if (modified) {
        writeFileSync(filePath, content);
        this.fileCount++;
        
        const relativePath = filePath.replace(rootDir, '');
        console.log(`  ✅ Fixed: ${relativePath}`);
        fixes.forEach(fix => console.log(`     - ${fix}`));
        
        this.results.push({
          file: relativePath,
          fixes: fixes
        });
      }
    } catch (error) {
      console.log(`  ❌ Error fixing ${filePath}: ${error.message}`);
    }
  }

  generateReport() {
    console.log('\n📊 Interface Fix Results:');
    console.log(`  Files Modified: ${this.fileCount}`);
    console.log(`  Total Fixes Applied: ${this.fixCount}`);
    
    if (this.results.length > 0) {
      console.log('\n📝 Detailed Fix Report:');
      this.results.forEach(result => {
        console.log(`\n  📄 ${result.file}:`);
        result.fixes.forEach(fix => console.log(`    ✅ ${fix}`));
      });
    }
    
    // Generate summary for tracking
    const summary = {
      timestamp: new Date().toISOString(),
      filesModified: this.fileCount,
      totalFixes: this.fixCount,
      fixDetails: this.results
    };
    
    writeFileSync(join(rootDir, 'interface-fix-report.json'), JSON.stringify(summary, null, 2));
    
    console.log('\n🎉 Interface fixes complete!');
    console.log('📄 Detailed report saved to: interface-fix-report.json');
    
    if (this.fixCount > 0) {
      console.log('\n⚡ Next Steps:');
      console.log('1. Run `npm run test` to verify fixes');
      console.log('2. Run `npm run lint` to check for remaining issues');
      console.log('3. Test component gallery with `npm run dev`');
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const fixer = new ComponentInterfaceFixer();
  fixer.fixAllInterfaces();
}

export { ComponentInterfaceFixer };
