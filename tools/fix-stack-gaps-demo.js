#!/usr/bin/env node

/**
 * This script updates Stack component gap values from semantic values to numeric values
 * across all files in the demo folder
 * 
 * Mapping:
 * - xs -> 2
 * - sm -> 3
 * - md -> 4
 * - lg -> 8
 * - xl -> 16
 * - none -> 0
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the directory to scan
const BASE_DIR = path.resolve(__dirname, '../demo');

// Define the mapping from semantic to numeric values
const gapMapping = {
  'xs': '2',
  'sm': '3',
  'md': '4',
  'lg': '8',
  'xl': '16',
  'none': '0'
};

// Find all .tsx files in the demo directory
console.log('Finding all .tsx files in the demo directory...');
const tsxFiles = execSync(`find ${BASE_DIR} -type f -name "*.tsx"`)
  .toString()
  .split('\n')
  .filter(Boolean);

console.log(`Found ${tsxFiles.length} .tsx files.`);

// Process each file
let totalReplaced = 0;
let filesModified = 0;

tsxFiles.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  let fileReplaceCount = 0;
  
  // Replace gap values for Stack components
  Object.entries(gapMapping).forEach(([semantic, numeric]) => {
    const stackRegex = new RegExp(`<Stack([^>]*)gap="${semantic}"`, 'g');
    const replacedContent = content.replace(stackRegex, (match, prefix) => {
      fileReplaceCount++;
      return `<Stack${prefix}gap="${numeric}"`;
    });
    
    if (content !== replacedContent) {
      content = replacedContent;
    }
  });
  
  // Replace gap values for Grid components
  Object.entries(gapMapping).forEach(([semantic, numeric]) => {
    const gridRegex = new RegExp(`<Grid([^>]*)gap="${semantic}"`, 'g');
    const replacedContent = content.replace(gridRegex, (match, prefix) => {
      fileReplaceCount++;
      return `<Grid${prefix}gap="${numeric}"`;
    });
    
    if (content !== replacedContent) {
      content = replacedContent;
    }
  });
  
  // Write back if changed
  if (content !== originalContent) {
    console.log(`Updating ${filePath} (${fileReplaceCount} replacements)`);
    fs.writeFileSync(filePath, content, 'utf8');
    filesModified++;
    totalReplaced += fileReplaceCount;
  }
});

console.log(`\nSummary:`);
console.log(`  - ${filesModified} files updated`);
console.log(`  - ${totalReplaced} Stack and Grid gap values replaced`);
console.log(`  - Mappings used: ${Object.entries(gapMapping).map(([k, v]) => `"${k}" -> "${v}"`).join(', ')}`);
