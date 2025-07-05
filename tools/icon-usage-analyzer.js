#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Icon Usage Analyzer for RxOps UIKit
 * 
 * This tool analyzes all Icon usage patterns in the codebase to identify:
 * 1. Correct usage: <Icon icon="name" />
 * 2. Incorrect usage: Direct icon imports like <UserIcon />
 * 3. Missing imports: Files that use icons without importing them
 * 4. Inconsistent patterns: Mixed usage within same file
 */

class IconAnalyzer {
  constructor() {
    this.results = {
      correctUsage: [],
      incorrectUsage: [],
      mixedUsage: [],
      missingImports: [],
      stats: {
        totalFiles: 0,
        filesWithIcons: 0,
        correctFiles: 0,
        incorrectFiles: 0,
        mixedFiles: 0
      }
    };
    
    this.iconPattern = /<([A-Z][a-zA-Z]*Icon)\s/g;
    this.iconComponentPattern = /<Icon\s+icon="([^"]+)"/g;
    this.importIconPattern = /import.*\{.*Icon.*\}.*from.*['"].*icon/;
    this.importDirectIconPattern = /import.*\{.*([A-Z][a-zA-Z]*Icon).*\}.*from.*['"].*utils\/icons/;
  }

  analyzeFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(process.cwd(), filePath);
    
    // Skip if not TypeScript/JavaScript file
    if (!/\.(tsx?|jsx?)$/.test(filePath)) return;
    
    this.results.stats.totalFiles++;
    
    const analysis = {
      file: relativePath,
      hasIcons: false,
      correctUsage: [],
      incorrectUsage: [],
      hasIconImport: false,
      hasDirectIconImports: [],
      usageType: 'none'
    };

    // Check for Icon component import
    analysis.hasIconImport = this.importIconPattern.test(content);
    
    // Check for direct icon imports
    const directImportMatches = content.match(/import.*\{([^}]+)\}.*from.*['"].*utils\/icons/g);
    if (directImportMatches) {
      directImportMatches.forEach(importLine => {
        const iconMatches = importLine.match(/([A-Z][a-zA-Z]*Icon)/g);
        if (iconMatches) {
          analysis.hasDirectIconImports.push(...iconMatches);
        }
      });
    }
    
    // Find correct Icon component usage
    let match;
    this.iconComponentPattern.lastIndex = 0;
    while ((match = this.iconComponentPattern.exec(content)) !== null) {
      analysis.correctUsage.push({
        iconName: match[1],
        line: content.substr(0, match.index).split('\n').length,
        usage: match[0]
      });
      analysis.hasIcons = true;
    }
    
    // Find direct icon usage (potentially incorrect)
    this.iconPattern.lastIndex = 0;
    while ((match = this.iconPattern.exec(content)) !== null) {
      const iconName = match[1];
      // Skip if it's part of an import statement
      const lineStart = content.lastIndexOf('\n', match.index) + 1;
      const lineEnd = content.indexOf('\n', match.index);
      const line = content.slice(lineStart, lineEnd);
      
      if (!line.includes('import') && iconName.endsWith('Icon')) {
        analysis.incorrectUsage.push({
          iconName: iconName,
          line: content.substr(0, match.index).split('\n').length,
          usage: match[0],
          fullLine: line.trim()
        });
        analysis.hasIcons = true;
      }
    }
    
    // Determine usage type
    if (analysis.correctUsage.length > 0 && analysis.incorrectUsage.length > 0) {
      analysis.usageType = 'mixed';
      this.results.mixedUsage.push(analysis);
      this.results.stats.mixedFiles++;
    } else if (analysis.correctUsage.length > 0) {
      analysis.usageType = 'correct';
      this.results.correctUsage.push(analysis);
      this.results.stats.correctFiles++;
    } else if (analysis.incorrectUsage.length > 0) {
      analysis.usageType = 'incorrect';
      this.results.incorrectUsage.push(analysis);
      this.results.stats.incorrectFiles++;
    }
    
    // Check for missing imports
    if (analysis.hasIcons && !analysis.hasIconImport && analysis.hasDirectIconImports.length === 0) {
      this.results.missingImports.push(analysis);
    }
    
    if (analysis.hasIcons) {
      this.results.stats.filesWithIcons++;
    }
  }

  scanDirectory(dirPath) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        // Skip node_modules, .git, build directories
        if (!['node_modules', '.git', 'lib', 'lib-types', 'target', 'dist'].includes(entry.name)) {
          this.scanDirectory(fullPath);
        }
      } else {
        this.analyzeFile(fullPath);
      }
    }
  }

  generateReport() {
    console.log('🔍 RxOps UIKit - Icon Usage Analysis Report');
    console.log('=' .repeat(80));
    
    // Overall Statistics
    console.log('\n📊 Overall Statistics:');
    console.log(`📁 Total Files Analyzed: ${this.results.stats.totalFiles}`);
    console.log(`🎨 Files with Icons: ${this.results.stats.filesWithIcons}`);
    console.log(`✅ Correct Usage Files: ${this.results.stats.correctFiles}`);
    console.log(`❌ Incorrect Usage Files: ${this.results.stats.incorrectFiles}`);
    console.log(`⚠️  Mixed Usage Files: ${this.results.stats.mixedFiles}`);
    
    // Health Score
    const healthScore = this.results.stats.filesWithIcons > 0 
      ? Math.round((this.results.stats.correctFiles / this.results.stats.filesWithIcons) * 100)
      : 100;
    console.log(`\n🏥 Icon Usage Health Score: ${healthScore}%`);
    
    // Incorrect Usage Details
    if (this.results.incorrectUsage.length > 0) {
      console.log('\n❌ Files with INCORRECT Icon Usage:');
      console.log('-'.repeat(60));
      this.results.incorrectUsage.forEach(file => {
        console.log(`\n📄 ${file.file}`);
        console.log(`   Direct Icon Imports: ${file.hasDirectIconImports.join(', ')}`);
        file.incorrectUsage.forEach(usage => {
          console.log(`   ❌ Line ${usage.line}: ${usage.iconName} (should use <Icon icon="...">)`);
        });
      });
    }
    
    // Mixed Usage Details
    if (this.results.mixedUsage.length > 0) {
      console.log('\n⚠️  Files with MIXED Icon Usage:');
      console.log('-'.repeat(60));
      this.results.mixedUsage.forEach(file => {
        console.log(`\n📄 ${file.file}`);
        console.log(`   ✅ Correct: ${file.correctUsage.length} usages`);
        console.log(`   ❌ Incorrect: ${file.incorrectUsage.length} usages`);
        file.incorrectUsage.forEach(usage => {
          console.log(`      Line ${usage.line}: ${usage.iconName}`);
        });
      });
    }
    
    // Recommendations
    console.log('\n💡 Recommendations:');
    console.log('-'.repeat(40));
    
    if (this.results.incorrectUsage.length > 0) {
      console.log('1. ❌ Fix Incorrect Usage:');
      console.log('   Replace direct icon imports with Icon component:');
      console.log('   - WRONG: import { UserIcon } from "utils/icons"; <UserIcon />');
      console.log('   - RIGHT: import { Icon } from "core/atoms/icon"; <Icon icon="user" />');
    }
    
    if (this.results.mixedUsage.length > 0) {
      console.log('2. ⚠️  Standardize Mixed Usage:');
      console.log('   Use Icon component consistently throughout each file');
    }
    
    console.log('3. ✅ Best Practices:');
    console.log('   - Always use <Icon icon="name" /> syntax');
    console.log('   - Import Icon from "core/atoms/icon"');
    console.log('   - Use kebab-case icon names (e.g., "user", "alert-triangle")');
    console.log('   - Add size prop for consistent sizing: <Icon icon="user" size={24} />');
    
    // Export detailed results
    console.log('\n📋 Detailed Analysis:');
    console.log(`   Correct files: ${this.results.correctUsage.length}`);
    console.log(`   Incorrect files: ${this.results.incorrectUsage.length}`);
    console.log(`   Mixed files: ${this.results.mixedUsage.length}`);
    
    return this.results;
  }

  generateFixSuggestions() {
    console.log('\n🔧 Automated Fix Suggestions:');
    console.log('=' .repeat(50));
    
    const iconNameMap = {
      'UserIcon': 'user',
      'AlertTriangleIcon': 'alert-triangle',
      'CalendarIcon': 'calendar',
      'ClockIcon': 'clock',
      'EditIcon': 'edit',
      'EyeIcon': 'eye',
      'HeartIcon': 'heart',
      'MailIcon': 'mail',
      'PhoneIcon': 'phone',
      'PillIcon': 'pill',
      'SettingsIcon': 'settings',
      'VideoIcon': 'video',
      'VideoOffIcon': 'video-off',
      'MicIcon': 'mic',
      'MicOffIcon': 'mic-off',
      'HandIcon': 'hand',
      'XCircleIcon': 'x-circle',
      'CheckIcon': 'check',
      'PlusIcon': 'plus',
      'TrashIcon': 'trash',
      'DownloadIcon': 'download',
      'UploadIcon': 'upload',
      'SearchIcon': 'search',
      'FilterIcon': 'filter',
      'InfoIcon': 'info',
      'StarIcon': 'star',
      'LockIcon': 'lock',
      'MonitorIcon': 'monitor'
    };
    
    [...this.results.incorrectUsage, ...this.results.mixedUsage].forEach(file => {
      if (file.incorrectUsage.length > 0) {
        console.log(`\n📄 ${file.file}:`);
        console.log('   Replace these patterns:');
        file.incorrectUsage.forEach(usage => {
          const iconName = iconNameMap[usage.iconName] || usage.iconName.toLowerCase().replace('icon', '');
          console.log(`   Line ${usage.line}: <${usage.iconName} → <Icon icon="${iconName}"`);
        });
      }
    });
  }
}

// Run the analyzer
const analyzer = new IconAnalyzer();
// Get the directory where the script is located and go up one level to uikit root
const scriptDir = path.dirname(__filename);
const workingDir = path.join(scriptDir, '..');
const rootDir = process.argv[2] || path.join(workingDir, 'src');

if (fs.existsSync(rootDir)) {
  analyzer.scanDirectory(rootDir);
  const results = analyzer.generateReport();
  analyzer.generateFixSuggestions();
  
  // Save results to file
  fs.writeFileSync('icon-analysis-results.json', JSON.stringify(results, null, 2));
  console.log('\n💾 Detailed results saved to icon-analysis-results.json');
} else {
  console.error(`❌ Directory ${rootDir} not found`);
  process.exit(1);
}
