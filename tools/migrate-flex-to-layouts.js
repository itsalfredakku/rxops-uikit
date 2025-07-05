#!/usr/bin/env node

/**
 * Flex to Layout Migration Script
 * 
 * This script systematically converts flex CSS patterns to our Row/Column/Stack layout components.
 * 
 * Patterns to migrate:
 * 1. class="flex justify-end space-x-3" → <Row justifyContent="end" gap="3">
 * 2. class="flex items-center" → <Row alignItems="center">
 * 3. class="flex items-center space-x-2" → <Row alignItems="center" gap="2">
 * 4. class="flex justify-between" → <Row justifyContent="between">
 * 5. class="flex-1" → use with layout components
 * 6. div with only flex → convert to Row/Column based on context
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const srcDir = path.join(__dirname, '../src');
const patterns = [
  {
    // Pattern: flex justify-end space-x-3
    search: /class="([^"]*\s)?flex\s+justify-end\s+space-x-(\d+)([^"]*)"/g,
    replace: 'justifyContent="end" gap="$2"',
    wrapTag: 'Row'
  },
  {
    // Pattern: flex items-center space-x-2
    search: /class="([^"]*\s)?flex\s+items-center\s+space-x-(\d+)([^"]*)"/g,
    replace: 'alignItems="center" gap="$2"',
    wrapTag: 'Row'
  },
  {
    // Pattern: flex items-center
    search: /class="([^"]*\s)?flex\s+items-center([^"]*)"/g,
    replace: 'alignItems="center"',
    wrapTag: 'Row'
  },
  {
    // Pattern: flex justify-between
    search: /class="([^"]*\s)?flex\s+justify-between([^"]*)"/g,
    replace: 'justifyContent="between"',
    wrapTag: 'Row'
  }
];

// Files to process (healthcare components with flex usage)
const filesToProcess = [
  'src/healthcare/billing/billing-card/billing-card.tsx',
  'src/healthcare/medical/medical-record/medical-record.tsx',
  'src/healthcare/medical/lab-results/lab-results.tsx',
  'src/healthcare/medical/imaging-viewer/imaging-viewer.tsx',
  'src/healthcare/medical/medication-tracker/medication-tracker.tsx',
  'src/healthcare/patient/medical-history/medical-history.tsx',
  'src/demo.tsx'
];

function migrateFile(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let hasChanges = false;
  const changes = [];

  // Check if Row/Column imports exist
  const hasRowImport = content.includes('import { Row }') || content.includes('import {Row}');
  const hasColumnImport = content.includes('import { Column }') || content.includes('import {Column}');
  
  // Process each pattern
  patterns.forEach(pattern => {
    const matches = [...content.matchAll(pattern.search)];
    if (matches.length > 0) {
      hasChanges = true;
      matches.forEach(match => {
        changes.push({
          pattern: match[0],
          replacement: pattern.replace,
          wrapTag: pattern.wrapTag
        });
      });
    }
  });

  if (hasChanges) {
    console.log(`🔄 Processing: ${filePath}`);
    console.log(`   Found ${changes.length} flex patterns to migrate`);
    
    // Add imports if needed
    if (!hasRowImport && changes.some(c => c.wrapTag === 'Row')) {
      // Find existing layout imports or add new ones
      if (content.includes('from \'../../../layouts/')) {
        content = content.replace(
          /(import {[^}]*)} from '\.\.\/\.\.\/\.\.\/layouts\/([^']+)'/,
          '$1, Row} from \'../../../layouts/$2\''
        );
      } else {
        // Add new import after other imports
        const importMatch = content.match(/^import[^;]+;$/gm);
        if (importMatch) {
          const lastImport = importMatch[importMatch.length - 1];
          content = content.replace(
            lastImport,
            lastImport + '\nimport { Row } from \'../../../layouts/row\';'
          );
        }
      }
    }
    
    // Apply pattern replacements (manual guidance needed for complex cases)
    console.log(`   Manual migration needed for these patterns:`);
    changes.forEach(change => {
      console.log(`     - ${change.pattern}`);
      console.log(`       → <${change.wrapTag} ${change.replacement}>`);
    });
  } else {
    console.log(`✅ Clean: ${filePath} (no flex patterns found)`);
  }
}

function main() {
  console.log('🚀 Starting Flex to Layout Migration\n');
  
  filesToProcess.forEach(filePath => {
    migrateFile(filePath);
  });
  
  console.log('\n✨ Migration analysis complete!');
  console.log('\n📋 Next Steps:');
  console.log('   1. Review the patterns identified above');
  console.log('   2. Manually convert div elements to Row/Column components');
  console.log('   3. Update class attributes to use layout props');
  console.log('   4. Test components after migration');
  console.log('   5. Run: npm run build && npm run lint');
}

main();
