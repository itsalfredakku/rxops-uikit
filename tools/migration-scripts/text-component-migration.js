#!/usr/bin/env node

/**
 * Text Component Migration Script
 * 
 * This script helps migrate from the legacy textStyle approach to the new semantic-first approach.
 * It scans files for Text component usages with textStyle prop and suggests improvements.
 * 
 * Usage:
 * node tools/migration-scripts/text-component-migration.js [path-to-scan]
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Default path if not provided
const scanPath = process.argv[2] || './src';

// Mapping from textStyle to recommended HTML element
const textStyleToElement = {
  title: 'h1',
  subtitle: 'h2',
  body: 'p',
  caption: 'span',
  overline: 'span'
};

// Mapping for size overrides for specific cases
const textStyleToSize = {
  caption: 'sm',
  overline: 'xs'
};

// RegExp to find Text component with textStyle prop
const textComponentRegex = /<Text.*?textStyle=["'](\w+)["'].*?>/g;

// Function to scan files recursively
function scanFiles(dirPath) {
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory() && !filePath.includes('node_modules')) {
      scanFiles(filePath);
    } 
    else if (stats.isFile() && (filePath.endsWith('.tsx') || filePath.endsWith('.jsx'))) {
      checkFile(filePath);
    }
  });
}

// Function to check a single file
function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const matches = [...content.matchAll(textComponentRegex)];
  
  if (matches.length > 0) {
    console.log(`\n📄 ${filePath}`);
    console.log('  Required Text component migrations:');
    
    matches.forEach(match => {
      const fullMatch = match[0];
      const textStyle = match[1];
      const recommendedElement = textStyleToElement[textStyle];
      const sizeOverride = textStyleToSize[textStyle];
      
      // Check if as prop is already present
      const hasAsProp = /as=["'](\w+)["']/.test(fullMatch);
      
      if (hasAsProp) {
        // Extract the current as value
        const asMatch = fullMatch.match(/as=["'](\w+)["']/);
        const currentAs = asMatch ? asMatch[1] : 'unknown';
        
        console.log(`  • ${fullMatch.trim()}`);
        console.log(`    ↳ Remove textStyle="${textStyle}" and keep as="${currentAs}"`);
        if (sizeOverride) {
          console.log(`    ↳ Add size="${sizeOverride}" to maintain the same appearance`);
        }
      } else {
        console.log(`  • ${fullMatch.trim()}`);
        console.log(`    ↳ Replace with as="${recommendedElement}"`);
        if (sizeOverride) {
          console.log(`    ↳ Add size="${sizeOverride}" to maintain the same appearance`);
        }
      }
    });
  }
}

// Main execution
console.log('🔍 Scanning for Text component usages...');
console.log(`Starting scan in: ${scanPath}`);

try {
  scanFiles(scanPath);
  console.log('\n✅ Scan complete!');
  console.log('\nMigration Tips:');
  console.log('1. Replace <Text textStyle="title"> with <Text as="h1">');
  console.log('2. Replace <Text textStyle="subtitle"> with <Text as="h2">');
  console.log('3. Replace <Text textStyle="body"> with <Text as="p">');
  console.log('4. Replace <Text textStyle="caption"> with <Text as="span" size="sm">');
  console.log('5. Replace <Text textStyle="overline"> with <Text as="span" transform="uppercase" size="xs">');
} catch (error) {
  console.error('❌ Error scanning files:', error);
}
