#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Icon Usage Fixer for RxOps UIKit
 * 
 * This tool automatically fixes incorrect Icon usage patterns by:
 * 1. Replacing direct icon imports with Icon component imports
 * 2. Converting <IconName /> syntax to <Icon icon="name" />
 * 3. Preserving all attributes and styling
 */

class IconFixer {
  constructor() {
    // Map direct icon names to kebab-case icon names
    this.iconNameMap = {
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
      'CheckCircleIcon': 'check-circle',
      'PlusIcon': 'plus',
      'TrashIcon': 'trash',
      'DownloadIcon': 'download',
      'UploadIcon': 'upload',
      'SearchIcon': 'search',
      'FilterIcon': 'filter',
      'InfoIcon': 'info',
      'StarIcon': 'star',
      'LockIcon': 'lock',
      'MonitorIcon': 'monitor',
      'BellIcon': 'bell',
      'FileTextIcon': 'file-text',
      'ChevronUpIcon': 'chevron-up',
      'ChevronDownIcon': 'chevron-down',
      'MapPinIcon': 'map-pin',
      'ActivityIcon': 'activity',
      'StethoscopeIcon': 'stethoscope',
      'TrendingUpIcon': 'trending-up',
      'PenToolIcon': 'pen-tool',
      'ZoomInIcon': 'zoom-in',
      'RotateCwIcon': 'rotate-cw',
      'SkipBackIcon': 'skip-back',
      'SkipForwardIcon': 'skip-forward',
      'ScreenShareIcon': 'screen-share',
      'StopCircleIcon': 'stop-circle',
      'RecordIcon': 'record'
    };
    
    this.results = {
      filesProcessed: 0,
      filesModified: 0,
      iconsFixed: 0,
      importsFixed: 0,
      errors: []
    };
  }

  fixFile(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;
      const originalContent = content;
      
      // Step 1: Fix imports
      const importFix = this.fixImports(content);
      if (importFix.modified) {
        content = importFix.content;
        modified = true;
        this.results.importsFixed++;
      }
      
      // Step 2: Fix icon usage
      const usageFix = this.fixIconUsage(content);
      if (usageFix.modified) {
        content = usageFix.content;
        modified = true;
        this.results.iconsFixed += usageFix.fixCount;
      }
      
      // Step 3: Write back if modified
      if (modified) {
        // Create backup
        const backupPath = filePath + '.backup';
        fs.writeFileSync(backupPath, originalContent);
        
        // Write fixed content
        fs.writeFileSync(filePath, content);
        this.results.filesModified++;
        
        console.log(`✅ Fixed: ${path.relative(process.cwd(), filePath)}`);
        console.log(`   📦 Backup saved: ${path.basename(backupPath)}`);
        if (importFix.modified) {
          console.log(`   🔄 Import updated`);
        }
        if (usageFix.fixCount > 0) {
          console.log(`   🎨 ${usageFix.fixCount} icon(s) converted`);
        }
      }
      
      this.results.filesProcessed++;
      
    } catch (error) {
      this.results.errors.push({
        file: filePath,
        error: error.message
      });
      console.error(`❌ Error processing ${filePath}: ${error.message}`);
    }
  }

  fixImports(content) {
    let modified = false;
    let newContent = content;
    
    // Check if Icon is already imported
    const hasIconImport = /import.*\{[^}]*Icon[^}]*\}.*from.*['"].*core\/atoms\/icon/.test(content);
    
    // Find direct icon imports from utils/icons
    const directIconImportMatches = content.match(/import\s*\{([^}]+)\}\s*from\s*['"][^'"]*utils\/icons['"];?\n?/g);
    
    if (directIconImportMatches && !hasIconImport) {
      // Add Icon import after the last import statement
      const lastImportMatch = content.match(/import[^;]+;?\n?/g);
      if (lastImportMatch) {
        const lastImport = lastImportMatch[lastImportMatch.length - 1];
        const lastImportIndex = content.lastIndexOf(lastImport) + lastImport.length;
        
        // Insert Icon import
        const iconImport = "import { Icon } from '../../../core/atoms/icon';\n";
        newContent = content.slice(0, lastImportIndex) + iconImport + content.slice(lastImportIndex);
        modified = true;
      }
      
      // Remove direct icon imports (comment them out for safety)
      directIconImportMatches.forEach(importStatement => {
        newContent = newContent.replace(importStatement, `// ${importStatement.trim()} // Auto-migrated to Icon component\n`);
      });
    }
    
    return { content: newContent, modified };
  }

  fixIconUsage(content) {
    let newContent = content;
    let fixCount = 0;
    
    // Pattern to match icon usage: <IconName props... />
    const iconUsagePattern = /<([A-Z][a-zA-Z]*Icon)(\s+[^>]*)?(\s*\/?>)/g;
    
    let match;
    const replacements = [];
    
    while ((match = iconUsagePattern.exec(content)) !== null) {
      const fullMatch = match[0];
      const iconName = match[1];
      const attributes = match[2] || '';
      const closing = match[3];
      
      // Skip if it's in an import statement or comment
      const lineStart = content.lastIndexOf('\n', match.index) + 1;
      const lineEnd = content.indexOf('\n', match.index);
      const line = content.slice(lineStart, lineEnd);
      
      if (line.includes('import') || line.trim().startsWith('//') || line.trim().startsWith('*')) {
        continue;
      }
      
      // Get the kebab-case icon name
      const kebabIconName = this.iconNameMap[iconName];
      if (kebabIconName) {
        // Convert to Icon component usage
        const iconAttribute = `icon="${kebabIconName}"`;
        const newIconUsage = attributes.trim() 
          ? `<Icon ${iconAttribute} ${attributes.trim()}${closing}`
          : `<Icon ${iconAttribute}${closing}`;
        
        replacements.push({
          original: fullMatch,
          replacement: newIconUsage,
          index: match.index
        });
        
        fixCount++;
      }
    }
    
    // Apply replacements in reverse order to maintain indices
    replacements.reverse().forEach(replacement => {
      newContent = newContent.slice(0, replacement.index) + 
                   replacement.replacement + 
                   newContent.slice(replacement.index + replacement.original.length);
    });
    
    return { 
      content: newContent, 
      modified: fixCount > 0, 
      fixCount 
    };
  }

  processDirectory(dirPath) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        // Skip build directories
        if (!['node_modules', '.git', 'lib', 'lib-types', 'target', 'dist'].includes(entry.name)) {
          this.processDirectory(fullPath);
        }
      } else if (/\.(tsx?)$/.test(entry.name)) {
        this.fixFile(fullPath);
      }
    }
  }

  generateReport() {
    console.log('\n🎉 Icon Usage Fix Complete!');
    console.log('=' .repeat(50));
    console.log(`📁 Files Processed: ${this.results.filesProcessed}`);
    console.log(`✏️  Files Modified: ${this.results.filesModified}`);
    console.log(`🎨 Icons Fixed: ${this.results.iconsFixed}`);
    console.log(`📦 Imports Fixed: ${this.results.importsFixed}`);
    
    if (this.results.errors.length > 0) {
      console.log(`❌ Errors: ${this.results.errors.length}`);
      this.results.errors.forEach(error => {
        console.log(`   ${error.file}: ${error.error}`);
      });
    }
    
    console.log('\n✅ Benefits:');
    console.log('   - Consistent Icon usage across all components');
    console.log('   - Better TypeScript support with icon name validation');
    console.log('   - Smaller bundle size (tree-shaking friendly)');
    console.log('   - Easier maintenance and updates');
    
    console.log('\n📋 Next Steps:');
    console.log('   1. Test your components to ensure everything works');
    console.log('   2. Remove .backup files once you\'re satisfied');
    console.log('   3. Run your build process to verify no errors');
    console.log('   4. Update any custom icon names in the iconNameMap if needed');
  }

  restoreBackups() {
    console.log('🔄 Restoring all backups...');
    const restoreFile = (dirPath) => {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        if (entry.isDirectory()) {
          if (!['node_modules', '.git', 'lib', 'lib-types', 'target', 'dist'].includes(entry.name)) {
            restoreFile(fullPath);
          }
        } else if (entry.name.endsWith('.backup')) {
          const originalPath = fullPath.replace('.backup', '');
          fs.copyFileSync(fullPath, originalPath);
          fs.unlinkSync(fullPath);
          console.log(`   Restored: ${path.relative(process.cwd(), originalPath)}`);
        }
      }
    };
    
    restoreFile('./src');
    console.log('✅ All backups restored and removed');
  }
}

// CLI handling
const args = process.argv.slice(2);
const command = args[0];

const fixer = new IconFixer();

if (command === 'restore') {
  fixer.restoreBackups();
} else if (command === 'fix' || !command) {
  const targetDir = args[1] || './src';
  
  if (!fs.existsSync(targetDir)) {
    console.error(`❌ Directory ${targetDir} not found`);
    process.exit(1);
  }
  
  console.log('🔧 RxOps UIKit - Icon Usage Fixer');
  console.log('=' .repeat(50));
  console.log(`📂 Processing directory: ${targetDir}`);
  console.log('⚠️  Backup files will be created (.backup extension)');
  
  fixer.processDirectory(targetDir);
  fixer.generateReport();
} else {
  console.log('Usage:');
  console.log('  node tools/icon-usage-fixer.js [fix] [directory]  - Fix icon usage (default)');
  console.log('  node tools/icon-usage-fixer.js restore           - Restore all backups');
}
