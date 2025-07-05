#!/usr/bin/env node

/**
 * Fix Theme Integration Script
 * Fixes JSX formatting issues caused by the theme integrator script
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(__dirname, '../src');

// Component directories to process
const componentDirs = [
  'core/atoms',
  'core/molecules', 
  'core/organisms',
  'healthcare',
  'layouts'
];

class ThemeFixer {
  constructor() {
    this.fixedCount = 0;
    this.errorCount = 0;
  }

  /**
   * Main fixing process
   */
  async fix() {
    console.log('🔧 Fixing Theme Integration Issues...\n');
    
    for (const dir of componentDirs) {
      await this.processDirectory(path.join(srcDir, dir), dir);
    }
    
    this.printSummary();
  }

  /**
   * Process a directory of components
   */
  async processDirectory(dirPath, category) {
    if (!fs.existsSync(dirPath)) {
      return;
    }

    console.log(`📂 Fixing ${category} components...`);
    
    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const item of items) {
      if (item.isDirectory()) {
        const componentDir = path.join(dirPath, item.name);
        await this.processComponent(componentDir, item.name, category);
      }
    }
  }

  /**
   * Process a single component
   */
  async processComponent(componentDir, componentName, category) {
    try {
      // Find the main component file
      const files = fs.readdirSync(componentDir);
      const possibleFiles = [
        `${componentName}.tsx`,
        'index.tsx'
      ];

      for (const fileName of possibleFiles) {
        if (files.includes(fileName)) {
          const filePath = path.join(componentDir, fileName);
          const fixed = await this.fixComponentFile(filePath, componentName);
          if (fixed) break;
        }
      }

    } catch (error) {
      console.log(`  ❌ ${componentName} - Error: ${error.message}`);
      this.errorCount++;
    }
  }

  /**
   * Fix a single component file
   */
  async fixComponentFile(filePath, componentName) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Only process files that have theme integration but might have formatting issues
    if (!content.includes('themed-content')) {
      return false;
    }

    let fixed = false;
    let updatedContent = content;

    // Fix 1: Ensure proper JSX formatting after themed-content div
    // Match patterns like:
    // return (
    //   <div class="themed-content">
    //     <span class={...} {...rest}>
    //     <Slot />
    //   </span>
    // );
    
    // Fix JSX indentation issues
    updatedContent = updatedContent.replace(
      /(<div class="themed-content">\s*\n\s*)(<[^>]+[^>]*>\s*\n)/g,
      '$1  $2'
    );

    // Fix missing closing div for themed-content
    const themedContentCount = (updatedContent.match(/<div class="themed-content">/g) || []).length;
    const themedContentCloseCount = (updatedContent.match(/<\/div>/g) || []).length;
    
    if (themedContentCount > 0) {
      // Look for the pattern where we need to add closing div
      // Before the final }); of the component
      updatedContent = updatedContent.replace(
        /(\s+)(<\/[^>]+>\s*\n\s*\);)/g,
        (match, indent, ending) => {
          // Count if we need an extra closing div
          const beforeMatch = updatedContent.substring(0, updatedContent.indexOf(match));
          const openDivs = (beforeMatch.match(/<div class="themed-content">/g) || []).length;
          const closeDivs = (beforeMatch.match(/<\/div>/g) || []).length;
          
          if (openDivs > closeDivs) {
            return `${indent}${ending.replace('  );', '    </div>\n  );')}`;
          }
          return match;
        }
      );

      // Additional pattern for components ending with </span> or similar
      updatedContent = updatedContent.replace(
        /(\s+)(<\/(?:span|div|button|a|input|textarea|select)[^>]*>\s*\n\s*\);)/g,
        (match, indent, ending) => {
          const beforeMatch = updatedContent.substring(0, updatedContent.indexOf(match));
          const openThemedDivs = (beforeMatch.match(/<div class="themed-content">/g) || []).length;
          const closeThemedDivs = (beforeMatch.match(/<\/div>/g) || []).length;
          
          if (openThemedDivs > closeThemedDivs) {
            return `${indent}${ending.replace('  );', '    </div>\n  );')}`;
          }
          return match;
        }
      );
    }

    // Write the fixed content if it changed
    if (updatedContent !== content) {
      fs.writeFileSync(filePath, updatedContent);
      console.log(`  ✅ ${componentName} - JSX formatting fixed`);
      this.fixedCount++;
      fixed = true;
    }

    return fixed;
  }

  /**
   * Print fixing summary
   */
  printSummary() {
    console.log('\n🔧 Theme Integration Fix Summary');
    console.log('================================');
    console.log(`✅ Fixed: ${this.fixedCount} components`);
    console.log(`❌ Errors: ${this.errorCount} components`);
    
    if (this.fixedCount > 0) {
      console.log('\n📝 Next Steps:');
      console.log('1. Run npm run build.lib to verify fixes');
      console.log('2. Manually review any remaining build errors');
    }
    
    console.log('\n🚀 Theme integration fix process complete!');
  }
}

// Run the fixer
const fixer = new ThemeFixer();
fixer.fix().catch(console.error);
