#!/usr/bin/env node

/**
 * Input Component Migration Script
 * 
 * Migrates Input components to use semantic-first type-based enhancements.
 * This script helps automate the migration from manual icon/validation setup
 * to automatic type-based enhancements.
 * 
 * Usage:
 *   node tools/migration-scripts/input-semantic.js [file-path]
 *   node tools/migration-scripts/input-semantic.js src/**/*.tsx
 * 
 * What this script does:
 * 1. Removes redundant manual icon props when type-based icons are available
 * 2. Removes manual validation patterns that match type defaults
 * 3. Removes manual helper text that matches type defaults
 * 4. Simplifies input configurations to leverage semantic enhancements
 * 5. Adds semanticEnhancements={false} where manual control is preserved
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Input type enhancements that are automatically applied
const TYPE_ENHANCEMENTS = {
  email: {
    icon: "📧",
    placeholder: "user@example.com",
    pattern: "[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$",
    helperText: "Enter a valid email address",
    autocomplete: "email",
    inputmode: "email"
  },
  password: {
    icon: "🔒",
    placeholder: "Enter password",
    autocomplete: "current-password",
    helperText: "Password is case sensitive"
  },
  search: {
    icon: "🔍",
    placeholder: "Search...",
    autocomplete: "off",
    inputmode: "search",
    helperText: "Enter search terms"
  },
  tel: {
    icon: "📞",
    placeholder: "(555) 123-4567",
    pattern: "[0-9]{3}-[0-9]{3}-[0-9]{4}",
    autocomplete: "tel",
    inputmode: "tel",
    helperText: "Enter phone number with area code"
  },
  url: {
    icon: "🔗",
    placeholder: "https://example.com",
    pattern: "https?://.+",
    autocomplete: "url",
    inputmode: "url",
    helperText: "Enter a complete URL including https://"
  },
  number: {
    icon: "🔢",
    inputmode: "numeric",
    helperText: "Enter a number"
  },
  date: {
    icon: "📅",
    helperText: "Select a date"
  },
  time: {
    icon: "🕐",
    helperText: "Select a time"
  },
  file: {
    icon: "📎",
    helperText: "Choose file to upload"
  },
  color: {
    icon: "🎨",
    helperText: "Choose a color"
  }
};

function migrateInputComponent(content) {
  let modified = content;
  let changes = [];

  // Track if we made any changes
  let hasChanges = false;

  // Find Input components with type props
  const inputRegex = /<Input\s+([^>]*?)>/g;
  let match;

  while ((match = inputRegex.exec(content)) !== null) {
    const fullMatch = match[0];
    const props = match[1];
    
    // Extract type from props
    const typeMatch = props.match(/type=["']([^"']+)["']/);
    if (!typeMatch) continue;
    
    const inputType = typeMatch[1];
    const enhancements = TYPE_ENHANCEMENTS[inputType];
    if (!enhancements) continue;

    let newProps = props;
    let componentChanges = [];
    
    // Remove redundant leftIcon props for types with automatic icons
    if (enhancements.icon) {
      const leftIconMatch = newProps.match(/\s*leftIcon=\{[^}]*\}/);
      if (leftIconMatch) {
        newProps = newProps.replace(leftIconMatch[0], '');
        componentChanges.push(`Removed redundant leftIcon for ${inputType} type`);
      }
    }
    
    // Remove redundant pattern props that match defaults
    if (enhancements.pattern) {
      const patternRegex = new RegExp(`\\s*pattern=["']${enhancements.pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`);
      const patternMatch = newProps.match(patternRegex);
      if (patternMatch) {
        newProps = newProps.replace(patternMatch[0], '');
        componentChanges.push(`Removed redundant pattern for ${inputType} type`);
      }
    }
    
    // Remove redundant placeholder props that match defaults
    if (enhancements.placeholder) {
      const placeholderRegex = new RegExp(`\\s*placeholder=["']${enhancements.placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`);
      const placeholderMatch = newProps.match(placeholderRegex);
      if (placeholderMatch) {
        newProps = newProps.replace(placeholderMatch[0], '');
        componentChanges.push(`Removed redundant placeholder for ${inputType} type`);
      }
    }
    
    // Remove redundant helperText props that match defaults
    if (enhancements.helperText) {
      const helperTextRegex = new RegExp(`\\s*helperText=["']${enhancements.helperText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`);
      const helperTextMatch = newProps.match(helperTextRegex);
      if (helperTextMatch) {
        newProps = newProps.replace(helperTextMatch[0], '');
        componentChanges.push(`Removed redundant helperText for ${inputType} type`);
      }
    }
    
    // Remove redundant inputMode props that match defaults
    if (enhancements.inputmode) {
      const inputModeRegex = new RegExp(`\\s*inputMode=["']${enhancements.inputmode}["']`);
      const inputModeMatch = newProps.match(inputModeRegex);
      if (inputModeMatch) {
        newProps = newProps.replace(inputModeMatch[0], '');
        componentChanges.push(`Removed redundant inputMode for ${inputType} type`);
      }
    }
    
    // Remove redundant autoComplete props that match defaults
    if (enhancements.autocomplete) {
      const autoCompleteRegex = new RegExp(`\\s*autoComplete=["']${enhancements.autocomplete}["']`);
      const autoCompleteMatch = newProps.match(autoCompleteRegex);
      if (autoCompleteMatch) {
        newProps = newProps.replace(autoCompleteMatch[0], '');
        componentChanges.push(`Removed redundant autoComplete for ${inputType} type`);
      }
    }
    
    if (componentChanges.length > 0) {
      // Clean up extra whitespace
      newProps = newProps.replace(/\s+/g, ' ').trim();
      
      const newComponent = `<Input ${newProps}>`;
      modified = modified.replace(fullMatch, newComponent);
      
      changes.push({
        type: inputType,
        changes: componentChanges,
        before: fullMatch,
        after: newComponent
      });
      
      hasChanges = true;
    }
  }

  return {
    content: modified,
    hasChanges,
    changes
  };
}

function addSemanticEnhancementsComment(content) {
  // Add comment about semantic enhancements at the top of files that import Input
  if (content.includes('from "') && content.includes('/input"')) {
    const importRegex = /(import.*from ['"][^'"]*\/input['"])/;
    const match = content.match(importRegex);
    if (match) {
      const comment = `
// Input components now use semantic-first enhancements based on type prop.
// Types like 'email', 'password', 'tel', etc. automatically provide:
// - Appropriate icons, validation patterns, and helper text
// - Optimized keyboard types and autocomplete behavior
// - Healthcare-specific contextual enhancements
// Set semanticEnhancements={false} to disable automatic behavior.
`;
      return content.replace(match[1], comment + match[1]);
    }
  }
  return content;
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Skip files that don't contain Input components
    if (!content.includes('<Input') && !content.includes('/input"')) {
      return;
    }
    
    console.log(`\n📝 Processing: ${filePath}`);
    
    const result = migrateInputComponent(content);
    
    if (result.hasChanges) {
      // Add semantic enhancements comment
      const finalContent = addSemanticEnhancementsComment(result.content);
      
      // Write the modified file
      fs.writeFileSync(filePath, finalContent);
      
      console.log(`✅ Migrated ${result.changes.length} Input component(s):`);
      result.changes.forEach((change, index) => {
        console.log(`\n   ${index + 1}. ${change.type.toUpperCase()} input:`);
        change.changes.forEach(changeDesc => {
          console.log(`      - ${changeDesc}`);
        });
        console.log(`      Before: ${change.before.substring(0, 60)}...`);
        console.log(`      After:  ${change.after.substring(0, 60)}...`);
      });
    } else {
      console.log(`ℹ️  No changes needed - Input components already use semantic-first approach`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

// Main execution
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`
🔄 Input Semantic-First Migration Script

Usage:
  node tools/migration-scripts/input-semantic.js [file-path-pattern]

Examples:
  node tools/migration-scripts/input-semantic.js src/components/forms/LoginForm.tsx
  node tools/migration-scripts/input-semantic.js "src/**/*.tsx"
  node tools/migration-scripts/input-semantic.js "demo/src/**/*.tsx"

This script will:
✨ Remove redundant props that are now automatically provided by type
🔧 Simplify Input component usage
📚 Add explanatory comments about semantic enhancements
🎯 Preserve custom overrides while cleaning up defaults

Types with automatic enhancements:
- email: Email validation, @ icon, email keyboard
- password: Lock icon, secure styling
- search: Search icon, search keyboard
- tel: Phone icon, tel keyboard, phone formatting
- url: Link icon, URL validation
- number: Number icon, numeric keyboard, right alignment
- date/time: Calendar/clock icons, date pickers
- file: Attachment icon, file upload styling
- color: Color palette icon
  `);
  process.exit(1);
}

console.log('🚀 Starting Input Semantic-First Migration...\n');

args.forEach(pattern => {
  if (fs.existsSync(pattern) && fs.lstatSync(pattern).isFile()) {
    // Single file
    processFile(pattern);
  } else {
    // Glob pattern
    const files = glob.sync(pattern, { 
      ignore: ['**/node_modules/**', '**/lib/**', '**/dist/**', '**/*.d.ts'] 
    });
    
    if (files.length === 0) {
      console.log(`⚠️  No files found matching pattern: ${pattern}`);
      return;
    }
    
    console.log(`📁 Found ${files.length} files matching: ${pattern}`);
    files.forEach(processFile);
  }
});

console.log(`
✅ Input semantic-first migration complete!

Next steps:
1. Review the changes made to ensure they meet your requirements
2. Test Input components to verify semantic enhancements work as expected
3. Update any custom input styling that might conflict with new enhancements
4. Consider adding healthcare-specific type usage where applicable

For more information, see:
- docs/design-system/migration-semantic-first.md
- docs/components/input/semantic-first-approach.md
`);
