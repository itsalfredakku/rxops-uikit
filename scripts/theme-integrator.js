#!/usr/bin/env node

/**
 * Theme System Integration Script
 * Systematically updates all UIKit components to support the healthcare theme system
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

// Files to skip (already theme-aware or non-component files)
const skipFiles = [
  'theme-provider.tsx',
  'theme-toggle.tsx',
  'theme-demo.tsx',
  'index.ts',
  'types.ts'
];

class ThemeIntegrator {
  constructor() {
    this.processedCount = 0;
    this.errorCount = 0;
    this.skippedCount = 0;
  }

  /**
   * Main integration process
   */
  async integrate() {
    console.log('🎨 Starting Theme System Integration...\n');
    
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
      console.log(`⚠️  Directory not found: ${dirPath}`);
      return;
    }

    console.log(`📂 Processing ${category} components...`);
    
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
      const mainFile = files.find(file => 
        (file === `${componentName}.tsx` || file === 'index.tsx') &&
        !skipFiles.includes(file)
      );

      if (!mainFile) {
        this.skippedCount++;
        return;
      }

      const filePath = path.join(componentDir, mainFile);
      const originalContent = fs.readFileSync(filePath, 'utf8');

      // Check if already has theme integration
      if (this.hasThemeIntegration(originalContent)) {
        console.log(`  ⏭️  ${componentName} - Already integrated`);
        this.skippedCount++;
        return;
      }

      // Apply theme integration
      const updatedContent = this.addThemeIntegration(originalContent, componentName);
      
      if (updatedContent !== originalContent) {
        // Create backup
        fs.writeFileSync(`${filePath}.backup`, originalContent);
        
        // Write updated content
        fs.writeFileSync(filePath, updatedContent);
        
        console.log(`  ✅ ${componentName} - Theme integration added`);
        this.processedCount++;
      } else {
        console.log(`  ⏭️  ${componentName} - No changes needed`);
        this.skippedCount++;
      }

    } catch (error) {
      console.log(`  ❌ ${componentName} - Error: ${error.message}`);
      this.errorCount++;
    }
  }

  /**
   * Check if component already has theme integration
   */
  hasThemeIntegration(content) {
    return content.includes('themed-content') || 
           content.includes('useContext(ThemeContext)') ||
           content.includes('ThemeProvider');
  }

  /**
   * Add theme integration to component content
   */
  addThemeIntegration(content, componentName) {
    // Strategy 1: Wrap the main return content with themed-content
    // Find the main component return statement
    
    // Look for the main return in the component function
    const returnMatch = content.match(/return\s*\(\s*<([^>]+)([^<]*)$/m);
    
    if (returnMatch) {
      // If we find a return with JSX, wrap it
      const updated = content.replace(
        /return\s*\(\s*(<[^>]+[^>]*>)/,
        'return (\n    <div class="themed-content">\n      $1'
      );
      
      // Find the corresponding closing tag and add our closing div
      // This is a simplified approach - for production, use a proper JSX parser
      const lines = updated.split('\n');
      let openTags = 0;
      let returnFound = false;
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('return (') && lines[i].includes('<')) {
          returnFound = true;
          openTags = 1;
          continue;
        }
        
        if (returnFound) {
          // Count opening and closing tags (simplified)
          const openCount = (lines[i].match(/</g) || []).length;
          const closeCount = (lines[i].match(/>/g) || []).length;
          
          if (openCount > 0 || closeCount > 0) {
            // Very simplified tag counting
            if (lines[i].includes('/>')) {
              // Self-closing tag doesn't change count
            } else if (lines[i].includes('</')) {
              openTags--;
            } else if (lines[i].includes('<') && !lines[i].includes('</')) {
              openTags++;
            }
          }
          
          // When we close all tags, add our closing div
          if (openTags === 0 && lines[i].includes(');')) {
            lines[i] = lines[i].replace(');', '\n    </div>\n  );');
            break;
          }
        }
      }
      
      return lines.join('\n');
    }
    
    // Strategy 2: If no clear return pattern, add a comment for manual review
    if (!content.includes('// TODO: Add theme integration')) {
      const importSection = content.indexOf('import');
      if (importSection >= 0) {
        const firstImportEnd = content.indexOf('\n', importSection);
        return content.slice(0, firstImportEnd) + 
               '\n// TODO: Add theme integration - wrap main content with <div class="themed-content">' +
               content.slice(firstImportEnd);
      }
    }
    
    return content;
  }

  /**
   * Print integration summary
   */
  printSummary() {
    console.log('\n🎨 Theme Integration Summary');
    console.log('================================');
    console.log(`✅ Processed: ${this.processedCount} components`);
    console.log(`⏭️  Skipped: ${this.skippedCount} components`);
    console.log(`❌ Errors: ${this.errorCount} components`);
    console.log(`📁 Total: ${this.processedCount + this.skippedCount + this.errorCount} components`);
    
    if (this.processedCount > 0) {
      console.log('\n📝 Next Steps:');
      console.log('1. Run npm run build to verify no TypeScript errors');
      console.log('2. Test theme switching in showcase application');
      console.log('3. Review components with TODO comments for manual integration');
      console.log('4. Remove .backup files after verification');
    }
    
    if (this.errorCount > 0) {
      console.log('\n⚠️  Some components had errors - please review manually');
    }
    
    console.log('\n🚀 Theme integration process complete!');
  }
}

// Run the integration
const integrator = new ThemeIntegrator();
integrator.integrate().catch(console.error);
