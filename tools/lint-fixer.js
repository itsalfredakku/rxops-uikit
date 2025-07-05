#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Lint Fixer for RxOps UIKit
 * 
 * This tool fixes common linting issues:
 * 1. Removes unused imports from createColorVariant and getInteractiveClasses
 * 2. Fixes deprecated React props in Qwik components
 * 3. Removes unused variables
 */

class LintFixer {
  constructor() {
    this.fixedFiles = [];
    this.issues = [];
  }

  /**
   * Fix unused imports in a file
   */
  fixUnusedImports(filePath, content) {
    let modified = false;
    let newContent = content;

    // Pattern 1: Remove unused createColorVariant and getInteractiveClasses imports
    const importPattern = /import\s*{\s*([^}]*)\s*}\s*from\s*['"][^'"]*design-system\/token-utils['"];?\n?/g;
    
    newContent = newContent.replace(importPattern, (match, imports) => {
      const importList = imports.split(',').map(imp => imp.trim());
      const usedImports = [];

      importList.forEach(imp => {
        const cleanImport = imp.trim();
        
        // Check if the import is actually used in the file
        const usagePattern = new RegExp(`\\b${cleanImport}\\b`, 'g');
        const usageMatches = content.match(usagePattern) || [];
        
        // If used more than once (once for import, other times for actual usage)
        if (usageMatches.length > 1) {
          usedImports.push(cleanImport);
        }
      });

      if (usedImports.length === 0) {
        modified = true;
        return ''; // Remove entire import line
      } else if (usedImports.length !== importList.length) {
        modified = true;
        return `import { ${usedImports.join(', ')} } from '../../../design-system/token-utils';\n`;
      }

      return match; // No changes needed
    });

    return { content: newContent, modified };
  }

  /**
   * Fix deprecated React props
   */
  fixDeprecatedProps(filePath, content) {
    let modified = false;
    let newContent = content;

    // Fix htmlFor -> for
    const htmlForPattern = /\bhtmlFor=/g;
    if (htmlForPattern.test(content)) {
      newContent = newContent.replace(htmlForPattern, 'for=');
      modified = true;
    }

    return { content: newContent, modified };
  }

  /**
   * Fix unused variables
   */
  fixUnusedVariables(filePath, content) {
    let modified = false;
    let newContent = content;

    // Fix unused $ import in health-dashboard
    if (filePath.includes('health-dashboard.tsx')) {
      const unusedDollarPattern = /import\s*{\s*([^}]*),\s*\$\s*([^}]*)\s*}\s*from\s*['"]@builder\.io\/qwik['"]/;
      newContent = newContent.replace(unusedDollarPattern, (match, before, after) => {
        modified = true;
        const cleanBefore = before.trim();
        const cleanAfter = after.trim();
        
        if (cleanAfter) {
          return `import { ${cleanBefore}, ${cleanAfter} } from '@builder.io/qwik'`;
        } else {
          return `import { ${cleanBefore} } from '@builder.io/qwik'`;
        }
      });
    }

    return { content: newContent, modified };
  }

  /**
   * Fix TypeScript any usage
   */
  fixAnyUsage(filePath, content) {
    let modified = false;
    let newContent = content;

    // Fix specific any usage in token-utils.ts
    if (filePath.includes('token-utils.ts')) {
      const anyPattern = /: any\b/g;
      if (anyPattern.test(content)) {
        // Replace with unknown for better type safety
        newContent = newContent.replace(anyPattern, ': unknown');
        modified = true;
      }
    }

    return { content: newContent, modified };
  }

  /**
   * Process a single file
   */
  async processFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      let currentContent = content;
      let totalModified = false;

      // Apply all fixes
      const fixes = [
        this.fixUnusedImports.bind(this),
        this.fixDeprecatedProps.bind(this),
        this.fixUnusedVariables.bind(this),
        this.fixAnyUsage.bind(this)
      ];

      for (const fix of fixes) {
        const result = fix(filePath, currentContent);
        if (result.modified) {
          currentContent = result.content;
          totalModified = true;
        }
      }

      // Write back if modified
      if (totalModified) {
        fs.writeFileSync(filePath, currentContent, 'utf8');
        this.fixedFiles.push(filePath);
        console.log(`✅ Fixed: ${path.relative(process.cwd(), filePath)}`);
      }

    } catch (error) {
      this.issues.push({ file: filePath, error: error.message });
      console.error(`❌ Error processing ${filePath}: ${error.message}`);
    }
  }

  /**
   * Scan directory for TypeScript/JavaScript files
   */
  scanDirectory(dirPath) {
    const files = [];
    
    function traverse(currentPath) {
      const items = fs.readdirSync(currentPath);
      
      for (const item of items) {
        const fullPath = path.join(currentPath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          // Skip node_modules, lib, dist, etc.
          if (!['node_modules', 'lib', 'lib-types', 'dist', '.git'].includes(item)) {
            traverse(fullPath);
          }
        } else if (stat.isFile() && /\.(ts|tsx|js|jsx)$/.test(item)) {
          files.push(fullPath);
        }
      }
    }
    
    traverse(dirPath);
    return files;
  }

  /**
   * Run the fixer
   */
  async run(targetDir = './src') {
    console.log('🔧 RxOps UIKit - Lint Fixer');
    console.log('================================================================================');
    
    const scriptDir = path.dirname(__filename);
    const workingDir = path.join(scriptDir, '..');
    const srcDir = path.resolve(workingDir, targetDir);
    
    if (!fs.existsSync(srcDir)) {
      console.error(`❌ Directory ${srcDir} not found`);
      process.exit(1);
    }

    console.log(`📂 Scanning: ${srcDir}`);
    
    const files = this.scanDirectory(srcDir);
    console.log(`📄 Found ${files.length} files to process`);
    console.log('');

    // Process files
    for (const file of files) {
      await this.processFile(file);
    }

    // Summary
    console.log('');
    console.log('📊 Lint Fix Summary:');
    console.log('================================================================================');
    console.log(`✅ Files Fixed: ${this.fixedFiles.length}`);
    console.log(`❌ Errors: ${this.issues.length}`);
    
    if (this.fixedFiles.length > 0) {
      console.log('');
      console.log('🔧 Fixed Files:');
      this.fixedFiles.forEach(file => {
        console.log(`   ${path.relative(process.cwd(), file)}`);
      });
    }

    if (this.issues.length > 0) {
      console.log('');
      console.log('❌ Issues:');
      this.issues.forEach(issue => {
        console.log(`   ${issue.file}: ${issue.error}`);
      });
    }

    console.log('');
    console.log('💡 Next Steps:');
    console.log('   1. Run: npm run lint');
    console.log('   2. Fix any remaining issues manually');
    console.log('   3. Run: npm run test');
  }
}

// Run the fixer
const fixer = new LintFixer();
const targetDir = process.argv[2] || './src';
fixer.run(targetDir).catch(console.error);
