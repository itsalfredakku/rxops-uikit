#!/usr/bin/env node

/**
 * Button Component Migration Script: Styling-First to Semantic-First
 * 
 * This script automatically migrates Button components from the legacy
 * variant + color approach to the new semantic-first intent approach.
 * 
 * Usage:
 *   node tools/migration-scripts/button-intent.js [directory]
 *   npm run migrate:button-intent [directory]
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Migration mapping from variant+color to intent
const MIGRATION_MAP = {
  // Primary actions
  'variant="elevated" color="primary"': 'intent="primary"',
  'variant="filled" color="primary"': 'intent="primary"',
  'variant="flat" color="primary"': 'intent="primary"',
  
  // Secondary actions
  'variant="outlined" color="primary"': 'intent="secondary"',
  'variant="outlined" color="secondary"': 'intent="secondary"',
  'variant="text" color="primary"': 'intent="secondary"',
  'variant="text" color="secondary"': 'intent="secondary"',
  
  // Destructive actions
  'variant="elevated" color="error"': 'intent="destructive"',
  'variant="filled" color="error"': 'intent="destructive"',
  'variant="outlined" color="error"': 'intent="destructive"',
  'variant="flat" color="error"': 'intent="destructive"',
  
  // Success actions
  'variant="elevated" color="success"': 'intent="success"',
  'variant="filled" color="success"': 'intent="success"',
  'variant="outlined" color="success"': 'intent="success"',
  'variant="flat" color="success"': 'intent="success"',
  
  // Neutral actions
  'variant="text"': 'intent="neutral"',
  'variant="outlined" color="neutral"': 'intent="neutral"',
  'variant="text" color="neutral"': 'intent="neutral"',
  
  // Warning/Urgent actions
  'variant="elevated" color="warning"': 'intent="urgent"',
  'variant="filled" color="warning"': 'intent="urgent"',
  'variant="outlined" color="warning"': 'intent="urgent"',
};

// Reverse order mapping for more specific patterns first
const MIGRATION_PATTERNS = Object.entries(MIGRATION_MAP)
  .sort((a, b) => b[0].length - a[0].length);

/**
 * Process a single file and apply Button component migrations
 */
function migrateFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let modifiedContent = content;
  let changesMade = 0;

  // Apply migration patterns
  MIGRATION_PATTERNS.forEach(([pattern, replacement]) => {
    const regex = new RegExp(pattern.replace(/"/g, '["\'"]'), 'g');
    const newContent = modifiedContent.replace(regex, replacement);
    
    if (newContent !== modifiedContent) {
      const matches = (modifiedContent.match(regex) || []).length;
      changesMade += matches;
      modifiedContent = newContent;
      console.log(`  ✓ Replaced ${matches} instance(s) of: ${pattern} → ${replacement}`);
    }
  });

  // Additional cleanup: remove orphaned color props when variant is removed
  const orphanedColorRegex = /(\s+)color="[^"]*"(?=\s*(?:intent=|>))/g;
  const orphanedColorMatches = (modifiedContent.match(orphanedColorRegex) || []).length;
  if (orphanedColorMatches > 0) {
    modifiedContent = modifiedContent.replace(orphanedColorRegex, '');
    changesMade += orphanedColorMatches;
    console.log(`  ✓ Removed ${orphanedColorMatches} orphaned color prop(s)`);
  }

  // Write back if changes were made
  if (changesMade > 0) {
    fs.writeFileSync(filePath, modifiedContent);
    console.log(`  📝 Updated: ${filePath} (${changesMade} changes)`);
    return changesMade;
  }

  return 0;
}

/**
 * Find all relevant files in the given directory
 */
async function findFiles(directory) {
  const patterns = [
    `${directory}/**/*.tsx`,
    `${directory}/**/*.ts`,
    `${directory}/**/*.jsx`,
    `${directory}/**/*.js`
  ];

  const files = [];
  for (const pattern of patterns) {
    const matches = await glob(pattern, { 
      ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.next/**']
    });
    files.push(...matches);
  }

  return [...new Set(files)]; // Remove duplicates
}

/**
 * Generate migration report
 */
function generateReport(results) {
  const totalFiles = results.length;
  const modifiedFiles = results.filter(r => r.changes > 0).length;
  const totalChanges = results.reduce((sum, r) => sum + r.changes, 0);

  console.log('\n📊 Migration Report:');
  console.log('==================');
  console.log(`Files processed: ${totalFiles}`);
  console.log(`Files modified: ${modifiedFiles}`);
  console.log(`Total changes: ${totalChanges}`);
  
  if (modifiedFiles > 0) {
    console.log('\n✅ Migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Review the changes in your version control system');
    console.log('2. Run your test suite to ensure everything works');
    console.log('3. Update any additional Button usages manually if needed');
  } else {
    console.log('\n💡 No Button components found that need migration.');
  }
}

/**
 * Main migration function
 */
async function migrate(targetDirectory = './src') {
  console.log('🚀 Starting Button Component Migration');
  console.log('=====================================');
  console.log(`Target directory: ${path.resolve(targetDirectory)}`);
  console.log('Migration: variant + color → intent\n');

  try {
    // Find all files
    console.log('📁 Finding files...');
    const files = await findFiles(targetDirectory);
    console.log(`Found ${files.length} files to process\n`);

    // Process each file
    const results = [];
    for (const file of files) {
      console.log(`Processing: ${file}`);
      const changes = migrateFile(file);
      results.push({ file, changes });
      
      if (changes === 0) {
        console.log('  ℹ️  No Button components to migrate\n');
      } else {
        console.log('');
      }
    }

    // Generate report
    generateReport(results);

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run migration if called directly
if (require.main === module) {
  const targetDir = process.argv[2] || './src';
  migrate(targetDir);
}

module.exports = { migrate, migrateFile, MIGRATION_MAP };
