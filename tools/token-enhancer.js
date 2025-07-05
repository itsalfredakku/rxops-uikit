#!/usr/bin/env node

/**
 * Token Enhancement Tool for RxOps UIkit
 * 
 * Automatically adds missing hover states and ensures proper token usage
 * across all components.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class TokenEnhancer {
  constructor() {
    this.srcDir = path.join(__dirname, '..', 'src');
    this.fixes = [];
    this.stats = {
      totalFiles: 0,
      processedFiles: 0,
      filesFixed: 0,
      hoverStatesAdded: 0,
      tokensImproved: 0
    };
  }

  async enhance() {
    console.log('🎨 Enhancing Design Token Usage in RxOps UIkit...\n');
    
    await this.scanDirectory(this.srcDir);
    this.generateReport();
    
    return this.fixes.length > 0;
  }

  async scanDirectory(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        if (!['node_modules', '.git', 'dist', 'lib', 'lib-types', 'tools', '__tests__'].includes(entry.name)) {
          await this.scanDirectory(fullPath);
        }
      } else if (entry.isFile() && this.isComponentFile(entry.name)) {
        this.stats.totalFiles++;
        await this.enhanceFile(fullPath);
      }
    }
  }

  isComponentFile(filename) {
    return filename.match(/\.(tsx|ts)$/) && 
           !filename.includes('.test.') && 
           !filename.includes('.spec.') &&
           !filename.includes('.d.ts') &&
           !filename.includes('token-utils.ts') &&
           !filename.includes('token-guide.ts');
  }

  async enhanceFile(filePath) {
    try {
      const originalContent = fs.readFileSync(filePath, 'utf8');
      let content = originalContent;
      const relativePath = path.relative(this.srcDir, filePath);
      
      this.stats.processedFiles++;
      let hasChanges = false;
      const appliedFixes = [];

      // Fix 1: Add missing hover states to buttons
      if (this.needsHoverStates(content)) {
        const enhanced = this.addHoverStates(content);
        if (enhanced !== content) {
          content = enhanced;
          hasChanges = true;
          appliedFixes.push('Added missing hover states');
          this.stats.hoverStatesAdded++;
        }
      }

      // Fix 2: Import token utilities if using colors
      if (this.needsTokenUtils(content)) {
        const enhanced = this.addTokenUtilsImport(content);
        if (enhanced !== content) {
          content = enhanced;
          hasChanges = true;
          appliedFixes.push('Added token utilities import');
        }
      }

      // Fix 3: Enhance color usage with proper tokens
      const colorEnhanced = this.enhanceColorUsage(content);
      if (colorEnhanced !== content) {
        content = colorEnhanced;
        hasChanges = true;
        appliedFixes.push('Enhanced color token usage');
        this.stats.tokensImproved++;
      }

      // Fix 4: Add proper interactive classes to clickable elements
      const interactiveEnhanced = this.enhanceInteractiveElements(content);
      if (interactiveEnhanced !== content) {
        content = interactiveEnhanced;
        hasChanges = true;
        appliedFixes.push('Enhanced interactive elements');
      }

      if (hasChanges) {
        fs.writeFileSync(filePath, content, 'utf8');
        this.stats.filesFixed++;
        this.fixes.push({
          file: relativePath,
          fixes: appliedFixes
        });
        console.log(`✅ Enhanced: ${relativePath}`);
      }
      
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
    }
  }

  needsHoverStates(content) {
    // Check if file has interactive elements without proper hover states
    const hasButtons = content.includes('<button') || content.includes('<Button');
    const hasOnClick = content.includes('onClick$');
    const hasHoverStates = content.includes('hover:');
    
    return (hasButtons || hasOnClick) && !hasHoverStates;
  }

  addHoverStates(content) {
    // Add hover states to button elements that are missing them
    let enhanced = content;

    // Pattern 1: Button components without hover classes
    enhanced = enhanced.replace(
      /class="([^"]*)(bg-[a-z]+-\d+)([^"]*)"(?![^>]*hover:)/g,
      (match, before, bgColor, after) => {
        const colorMatch = bgColor.match(/bg-([a-z]+)-(\d+)/);
        if (colorMatch) {
          const [, color, shade] = colorMatch;
          const hoverShade = Math.min(parseInt(shade) + 100, 900);
          const hoverClass = ` hover:bg-${color}-${hoverShade}`;
          return `class="${before}${bgColor}${hoverClass}${after}"`;
        }
        return match;
      }
    );

    // Pattern 2: Add transition classes to interactive elements
    enhanced = enhanced.replace(
      /(class="[^"]*)(cursor-pointer)([^"]*)"(?![^>]*transition)/g,
      '$1$2 transition-colors duration-200$3"'
    );

    return enhanced;
  }

  needsTokenUtils(content) {
    // Check if file would benefit from token utilities
    const hasColorClasses = /bg-[a-z]+-\d+|text-[a-z]+-\d+/.test(content);
    const hasTokenImport = content.includes('token-utils');
    
    return hasColorClasses && !hasTokenImport;
  }

  addTokenUtilsImport(content) {
    // Add token utilities import if not present
    const lines = content.split('\n');
    const importLineIndex = lines.findIndex(line => 
      line.includes('from "@builder.io/qwik"') || 
      line.includes('from "qwik"')
    );
    
    if (importLineIndex !== -1) {
      const tokenImport = 'import { createColorVariant, getInteractiveClasses } from "../../../design-system/token-utils";';
      
      // Check if import already exists
      if (!content.includes('token-utils')) {
        lines.splice(importLineIndex + 1, 0, tokenImport);
        return lines.join('\n');
      }
    }
    
    return content;
  }

  enhanceColorUsage(content) {
    let enhanced = content;

    // Replace common problematic patterns with better token usage
    const replacements = [
      // Legacy color patterns
      {
        pattern: /bg-blue-(\d+)/g,
        replacement: 'bg-primary-$1'
      },
      {
        pattern: /text-blue-(\d+)/g,
        replacement: 'text-primary-$1'
      },
      {
        pattern: /bg-gray-(\d+)/g,
        replacement: 'bg-neutral-$1'
      },
      {
        pattern: /text-gray-(\d+)/g,
        replacement: 'text-neutral-$1'
      },
      {
        pattern: /border-gray-(\d+)/g,
        replacement: 'border-neutral-$1'
      },
      // Add focus rings where missing
      {
        pattern: /(class="[^"]*)(focus:outline-none)([^"]*)"(?![^>]*focus-visible:ring)/g,
        replacement: '$1$2 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2$3"'
      }
    ];

    replacements.forEach(({ pattern, replacement }) => {
      enhanced = enhanced.replace(pattern, replacement);
    });

    return enhanced;
  }

  enhanceInteractiveElements(content) {
    let enhanced = content;

    // Add proper interactive classes to clickable divs
    enhanced = enhanced.replace(
      /(onClick\$.*?class="[^"]*)"(?![^>]*cursor-pointer)/g,
      '$1 cursor-pointer"'
    );

    // Add transition to elements that change color
    enhanced = enhanced.replace(
      /(class="[^"]*)(hover:bg-[^"]+)([^"]*)"(?![^>]*transition)/g,
      '$1transition-colors duration-200 $2$3"'
    );

    return enhanced;
  }

  generateReport() {
    console.log('\n📊 Token Enhancement Report\n');
    console.log('='.repeat(60));
    
    console.log(`📁 Files Processed: ${this.stats.processedFiles}/${this.stats.totalFiles}`);
    console.log(`✅ Files Enhanced: ${this.stats.filesFixed}`);
    console.log(`🖱️  Hover States Added: ${this.stats.hoverStatesAdded}`);
    console.log(`🎨 Token Improvements: ${this.stats.tokensImproved}`);
    
    if (this.fixes.length > 0) {
      console.log('\n📝 Applied Enhancements:');
      this.fixes.forEach(fix => {
        console.log(`\n📄 ${fix.file}`);
        fix.fixes.forEach(applied => {
          console.log(`  ✅ ${applied}`);
        });
      });
    }
    
    console.log('\n🎉 Design token usage has been enhanced!');
    console.log('\n💡 Next steps:');
    console.log('1. Review the changes in your components');
    console.log('2. Test interactive states work correctly');
    console.log('3. Run: npm run color:audit');
    console.log('4. Update any remaining manual styling');
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const enhancer = new TokenEnhancer();
  enhancer.enhance().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Enhancement failed:', error);
    process.exit(1);
  });
}

export default TokenEnhancer;
