// Health Dashboard Grid Migration
// This script migrates grid layouts in health-dashboard.tsx to Grid components

import { promises as fs } from 'fs';
import path from 'path';

// Target file to migrate
const TARGET_FILE = '/Volumes/EXT/RxOps/ui/src/healthcare/patient/health-dashboard/health-dashboard.tsx';

// Map of semantic gap values to numeric values
const GAP_MAP = {
  'none': '0',
  'xs': '2',
  'sm': '3',
  'md': '4',
  'lg': '8',
  'xl': '16'
};

async function migrateHealthDashboard() {
  try {
    console.log(`Migrating grid layouts in ${TARGET_FILE}`);
    const content = await fs.readFile(TARGET_FILE, 'utf8');
    
    // Check if file already imports Grid
    const hasGridImport = /import.*\{.*Grid.*\}.*from/i.test(content);
    
    // Find grid divs in the file
    const gridDivRegex = /<div[^>]*class="[^"]*grid[^"]*"[^>]*>/g;
    const matches = Array.from(content.matchAll(gridDivRegex));
    
    if (matches.length === 0) {
      console.log(`No grid layouts found in ${TARGET_FILE}`);
      return;
    }
    
    console.log(`Found ${matches.length} grid layouts to migrate`);
    
    let newContent = content;
    
    // Add Grid import if not already present
    if (!hasGridImport) {
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
      console.log('Added Grid component import');
    }
    
    // Process each grid div
    for (const match of matches) {
      const originalDiv = match[0];
      
      // Extract grid columns
      const colsMatch = originalDiv.match(/grid-cols-(\d+)/);
      const cols = colsMatch ? colsMatch[1] : '1';
      
      // Extract responsive grid columns
      const mdColsMatch = originalDiv.match(/md:grid-cols-(\d+)/);
      const lgColsMatch = originalDiv.match(/lg:grid-cols-(\d+)/);
      
      // Extract gap
      const gapMatch = originalDiv.match(/gap-(\d+|none|xs|sm|md|lg|xl)/);
      const rawGap = gapMatch ? gapMatch[1] : '4'; // Default to 4 if not specified
      const gap = GAP_MAP[rawGap] || rawGap;
      
      // Build responsive cols object
      let colsValue;
      if (mdColsMatch || lgColsMatch) {
        const colsParts = [];
        if (cols !== '1') colsParts.push(`${cols}`); // Default column
        if (mdColsMatch) colsParts.push(`md: ${mdColsMatch[1]}`);
        if (lgColsMatch) colsParts.push(`lg: ${lgColsMatch[1]}`);
        
        if (colsParts.length === 1) {
          // Only one column specification
          colsValue = colsParts[0].includes(':') ? `{{ ${colsParts[0]} }}` : colsParts[0];
        } else {
          colsValue = `{{ ${colsParts.join(', ')} }}`;
        }
      } else {
        colsValue = cols;
      }
      
      // Create new Grid component
      const newGrid = `<Grid cols={${colsValue}} gap="${gap}"`;
      
      // Replace grid div with Grid component
      newContent = newContent.replace(
        originalDiv, 
        originalDiv
          .replace(/<div/, newGrid)
          .replace(/class="[^"]*grid[^"]*grid-cols-[^"]*[^"]*"/, '')
          .replace(/class="[^"]*grid[^"]*"/, '')
          .replace(/class=""/, '')
      );
      
      console.log(`Transformed: ${originalDiv.substring(0, 50)}... -> ${newGrid}...`);
    }
    
    // Write the changes to a new file for review
    const reviewFilePath = TARGET_FILE.replace('.tsx', '.migrated.tsx');
    await fs.writeFile(reviewFilePath, newContent);
    console.log(`\nMigrated content written to ${reviewFilePath} for review`);
    
    console.log('\nBefore applying changes, please review the migrated file and ensure it works correctly.');
    console.log('After verification, you can rename the migrated file to replace the original.');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the migration
migrateHealthDashboard();
