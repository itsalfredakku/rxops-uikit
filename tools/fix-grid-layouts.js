// Grid Layout Migration Script
// This script will analyze and find all HTML div elements using grid classes in the codebase
// and output a report on potential migrations to the Grid component

import { promises as fs } from 'fs';
import path from 'path';
import { glob } from 'glob';

// Define patterns to look for in grid layouts
const GRID_PATTERN = /class="[^"]*grid[^"]*"/;
const GRID_COLS_PATTERN = /grid-cols-(\d+)/;
const GRID_RESPONSIVE_PATTERN = /(sm|md|lg|xl):grid-cols-(\d+)/g;
const GRID_GAP_PATTERN = /gap-(\d+|none|xs|sm|md|lg|xl)/;

// Map of semantic gap values to numeric values
const GAP_MAP = {
  'none': '0',
  'xs': '2',
  'sm': '3',
  'md': '4',
  'lg': '8',
  'xl': '16'
};

async function findGridLayouts() {
  try {
    // Find all TSX files in src directory
    const files = await glob('src/**/*.tsx');
    console.log(`Scanning ${files.length} files for grid layouts...`);
    
    let totalGrids = 0;
    const gridLayouts = [];

    // Process each file
    for (const file of files) {
      const content = await fs.readFile(file, 'utf8');
      
      // Skip if no grid classes found
      if (!GRID_PATTERN.test(content)) continue;
      
      // Find all grid layouts
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (GRID_PATTERN.test(line) && line.includes('grid-cols')) {
          totalGrids++;
          
          // Extract grid details
          const colsMatch = line.match(GRID_COLS_PATTERN);
          const cols = colsMatch ? colsMatch[1] : 'unknown';
          
          // Extract responsive classes
          const responsiveClasses = [];
          let responsiveMatch;
          const lineCopy = line.slice();
          while ((responsiveMatch = GRID_RESPONSIVE_PATTERN.exec(lineCopy)) !== null) {
            responsiveClasses.push(`${responsiveMatch[1]}:${responsiveMatch[2]}`);
          }
          
          // Extract gap
          const gapMatch = line.match(GRID_GAP_PATTERN);
          const gap = gapMatch ? gapMatch[1] : 'unknown';
          
          // Format gap value (convert semantic to numeric if needed)
          const formattedGap = GAP_MAP[gap] || gap;
          
          gridLayouts.push({
            file,
            line: i + 1,
            code: line.trim(),
            cols,
            responsiveClasses,
            gap,
            formattedGap,
            suggestedMigration: generateMigrationCode(cols, responsiveClasses, formattedGap)
          });
        }
      }
    }
    
    // Output results
    console.log(`\nFound ${totalGrids} grid layouts in ${files.length} files`);
    console.log('\nGrid Layout Migration Report:');
    console.log('============================\n');
    
    gridLayouts.forEach((layout, index) => {
      console.log(`[${index + 1}] ${layout.file}:${layout.line}`);
      console.log(`Original: ${layout.code}`);
      console.log(`Suggested: ${layout.suggestedMigration}`);
      console.log('----------------------------------------------------\n');
    });
    
    // Save report to file
    const report = gridLayouts.map((layout, index) => {
      return `[${index + 1}] ${layout.file}:${layout.line}\nOriginal: ${layout.code}\nSuggested: ${layout.suggestedMigration}\n`;
    }).join('\n');
    
    await fs.writeFile('grid-migration-report.txt', report);
    console.log('Migration report saved to grid-migration-report.txt');
    
    return gridLayouts;
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

function generateMigrationCode(cols, responsiveClasses, gap) {
  // Handle responsive classes
  if (responsiveClasses.length > 0) {
    const colsObj = responsiveClasses.reduce((acc, cls) => {
      const [breakpoint, cols] = cls.split(':');
      acc[breakpoint] = cols;
      return acc;
    }, {});
    
    // Include base columns if available
    if (cols !== 'unknown') {
      colsObj.base = cols;
    }
    
    return `<Grid cols={{ ${Object.entries(colsObj).map(([bp, val]) => 
      bp === 'base' ? `${val}` : `${bp}: ${val}`).join(', ')} }} gap="${gap}">`;
  }
  
  // Simple non-responsive grid
  return `<Grid cols={${cols}} gap="${gap}">`;
}

// Run the script
findGridLayouts();
