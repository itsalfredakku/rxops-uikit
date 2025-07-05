// Grid Layout Migration Helper
// This script processes TSX files and transforms grid div elements to Grid components

import { promises as fs } from 'fs';
import path from 'path';
import { glob } from 'glob';

// Map of semantic gap values to numeric values
const GAP_MAP = {
  'none': '0',
  'xs': '2',
  'sm': '3',
  'md': '4',
  'lg': '8',
  'xl': '16'
};

async function transformFile(filePath) {
  try {
    console.log(`Processing file: ${filePath}`);
    const content = await fs.readFile(filePath, 'utf8');
    
    // Check if file already imports Grid
    const hasGridImport = /import.*\{.*Grid.*\}.*from/i.test(content);
    
    // Find potential grid divs (simplified approach for demo)
    const regex = /<div[^>]*class="[^"]*grid[^"]*grid-cols-[^"]*"[^>]*>/g;
    const matches = Array.from(content.matchAll(regex));
    
    if (matches.length === 0) {
      console.log(`No grid layouts found in ${filePath}`);
      return null;
    }
    
    let newContent = content;
    let importAdded = false;
    
    // Process each grid div
    for (const match of matches) {
      const originalDiv = match[0];
      
      // Extract grid columns
      const colsMatch = originalDiv.match(/grid-cols-(\d+)/);
      const cols = colsMatch ? colsMatch[1] : '1';
      
      // Extract responsive grid columns
      const mdColsMatch = originalDiv.match(/md:grid-cols-(\d+)/);
      const lgColsMatch = originalDiv.match(/lg:grid-cols-(\d+)/);
      const xlColsMatch = originalDiv.match(/xl:grid-cols-(\d+)/);
      
      // Extract gap
      const gapMatch = originalDiv.match(/gap-(\d+|none|xs|sm|md|lg|xl)/);
      const gap = gapMatch ? GAP_MAP[gapMatch[1]] || gapMatch[1] : '4'; // Default to 4 if not specified
      
      // Build responsive cols object
      let colsValue;
      if (mdColsMatch || lgColsMatch || xlColsMatch) {
        const colsParts = [];
        colsParts.push(`sm: ${cols}`);
        if (mdColsMatch) colsParts.push(`md: ${mdColsMatch[1]}`);
        if (lgColsMatch) colsParts.push(`lg: ${lgColsMatch[1]}`);
        if (xlColsMatch) colsParts.push(`xl: ${xlColsMatch[1]}`);
        colsValue = `{{ ${colsParts.join(', ')} }}`;
      } else {
        colsValue = cols;
      }
      
      // Create new Grid component
      const newGrid = `<Grid cols={${colsValue}} gap="${gap}"`;
      
      // Replace keeping the rest of the div's attributes
      newContent = newContent.replace(originalDiv, 
        originalDiv.replace(/<div/, newGrid)
          .replace(/class="[^"]*grid[^"]*grid-cols-[^"]*[^"]*"/, '')
          .replace(/class=""/, '')
      );
      
      // Add import if needed
      if (!hasGridImport && !importAdded) {
        importAdded = true;
        // Find a good place to add import (after other imports)
        const importMatch = newContent.match(/import.*from.*['"];?\n/g);
        if (importMatch && importMatch.length > 0) {
          const lastImport = importMatch[importMatch.length - 1];
          const lastImportIndex = newContent.lastIndexOf(lastImport) + lastImport.length;
          newContent = newContent.slice(0, lastImportIndex) + 
            'import { Grid } from "../../../layouts/grid/grid";\n' +
            newContent.slice(lastImportIndex);
        } else {
          // No imports found, add at the top
          newContent = 'import { Grid } from "../../../layouts/grid/grid";\n\n' + newContent;
        }
      }
    }
    
    // Don't write file, just return the changes for review
    return {
      filePath,
      originalContent: content,
      newContent,
      changes: matches.length
    };
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return null;
  }
}

async function processFiles() {
  try {
    // Find files with grid layouts
    const files = await glob('src/**/*.tsx');
    console.log(`Found ${files.length} files to scan for grid layouts`);
    
    const results = [];
    
    // Process each file
    for (const file of files) {
      const result = await transformFile(file);
      if (result && result.changes > 0) {
        results.push(result);
      }
    }
    
    console.log(`\nFound ${results.length} files with grid layouts that can be transformed`);
    
    // Output sample before/after for first file
    if (results.length > 0) {
      const sample = results[0];
      console.log(`\nSample transformation for ${sample.filePath}:`);
      console.log('\n--- BEFORE ---');
      console.log(sample.originalContent.substring(0, 500) + '...');
      console.log('\n--- AFTER ---');
      console.log(sample.newContent.substring(0, 500) + '...');
    }
    
    // Save transformation report
    const report = results.map(r => `File: ${r.filePath}\nChanges: ${r.changes}\n\n`).join('');
    await fs.writeFile('grid-transformation-report.txt', report);
    console.log('\nTransformation report saved to grid-transformation-report.txt');
    
    return results;
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

// Process files
processFiles();
