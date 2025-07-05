#!/usr/bin/env node

/**
 * Complete Grid Elimination Script
 * 
 * This script completely removes ALL Grid component usage and replaces it with Row/Column patterns
 * throughout the entire codebase.
 */

const fs = require('fs');
const path = require('path');

// Files that still use Grid
const gridFiles = [
  'src/healthcare/provider/provider-dashboard/provider-dashboard.tsx',
  'src/healthcare/appointments/appointment-calendar/appointment-calendar.tsx',
  'src/healthcare/medical/health-package-card/health-package-card.tsx',
  'src/healthcare/patient/health-dashboard/health-dashboard.tsx',
  'src/healthcare/medical/lab-results/lab-results.tsx',
  'src/healthcare/emergency/emergency-alert/emergency-alert.tsx',
  'src/healthcare/medical/imaging-viewer/imaging-viewer.tsx',
  'src/healthcare/patient/medical-history/medical-history.tsx',
  'src/healthcare/patient/patient-profile/patient-profile.migrated.tsx',
  'src/healthcare/medical/medication-tracker/medication-tracker.tsx',
  'src/healthcare/provider/doctor-card/doctor-card.tsx',
  'src/healthcare/provider/consultation-notes/consultation-notes.tsx',
  'src/healthcare/patient/vitals-signs/vitals-signs.tsx',
  'src/demo.tsx'
];

function removeGridFromFile(filePath) {
  try {
    console.log(`🔧 Processing: ${filePath}`);
    
    if (!fs.existsSync(filePath)) {
      console.log(`   ⚠️  File not found, skipping...`);
      return false;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // 1. Remove Grid imports - be more aggressive
    const originalContent = content;
    
    // Remove standalone Grid imports
    content = content.replace(/import\s*{\s*Grid\s*}\s*from\s*['"][^'"]*['"];\s*\n?/g, '');
    
    // Remove Grid from multiple imports
    content = content.replace(/import\s*{\s*([^}]*),\s*Grid\s*([^}]*)\s*}\s*from\s*(['"][^'"]*['"];\s*)/g, 'import { $1$2 } from $3');
    content = content.replace(/import\s*{\s*Grid\s*,\s*([^}]*)\s*}\s*from\s*(['"][^'"]*['"];\s*)/g, 'import { $1 } from $2');
    
    // Remove GridItem imports too
    content = content.replace(/,\s*GridItem/g, '');
    content = content.replace(/GridItem\s*,\s*/g, '');
    content = content.replace(/import\s*{\s*GridItem\s*}\s*from\s*['"][^'"]*['"];\s*\n?/g, '');
    
    // 2. Add Row and Column imports if not present
    if (content.includes('<Row') || content.includes('<Column')) {
      if (!content.includes('import { Row') && !content.includes('import { Column')) {
        // Find existing layout imports and add Row, Column
        if (content.includes('from "../../../layouts"') || content.includes('from "../../.."')) {
          content = content.replace(
            /import\s*{\s*([^}]*)\s*}\s*from\s*(['"][^'"]*layouts['"])/g,
            'import { $1, Row, Column } from $2'
          );
        } else {
          // Add new import at the top
          const firstImportIndex = content.indexOf('import');
          if (firstImportIndex !== -1) {
            const lines = content.split('\n');
            let insertIndex = 0;
            for (let i = 0; i < lines.length; i++) {
              if (lines[i].startsWith('import')) {
                insertIndex = i + 1;
              } else if (lines[i].trim() === '' && insertIndex > 0) {
                break;
              }
            }
            lines.splice(insertIndex, 0, 'import { Row, Column } from "../../../layouts";');
            content = lines.join('\n');
          }
        }
      }
    }
    
    // 3. Replace Grid elements with Row + Column patterns
    
    // Simple Grid with cols={number} -> Row with Columns
    content = content.replace(
      /<Grid\s+cols={(\d+)}\s+gap="([^"]*)"[^>]*>/g,
      '<Row gap="$2">'
    );
    
    // Grid with responsive cols -> Row (we'll handle columns separately)
    content = content.replace(
      /<Grid\s+cols={{[^}]*}}\s+gap="([^"]*)"[^>]*>/g,
      '<Row gap="$1">'
    );
    
    // Simple Grid without props
    content = content.replace(/<Grid>/g, '<Row>');
    content = content.replace(/<Grid\s+[^>]*>/g, '<Row>');
    
    // Replace closing tags
    content = content.replace(/<\/Grid>/g, '</Row>');
    
    // Replace GridItem with Column
    content = content.replace(/<GridItem\s+colSpan={(\d+)}>/g, '<Column>');
    content = content.replace(/<GridItem\s+colSpan={{[^}]*}}>/g, '<Column>');
    content = content.replace(/<GridItem>/g, '<Column>');
    content = content.replace(/<\/GridItem>/g, '</Column>');
    
    // 4. Clean up any remaining Grid references in comments or text
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      modified = true;
      console.log(`   ✅ Updated successfully`);
    } else {
      console.log(`   ℹ️  No changes needed`);
    }
    
    return modified;
  } catch (error) {
    console.error(`   ❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🚀 Starting Complete Grid Elimination\n');
  
  let totalModified = 0;
  
  gridFiles.forEach(filePath => {
    if (removeGridFromFile(filePath)) {
      totalModified++;
    }
  });
  
  console.log(`\n✨ Complete Grid elimination finished!`);
  console.log(`📊 Files processed: ${gridFiles.length}`);
  console.log(`✅ Files modified: ${totalModified}`);
  
  console.log('\n📋 Next steps:');
  console.log('   1. Manually fix any remaining Grid elements that need specific Column sizing');
  console.log('   2. Test the build: npm run build.lib');
  console.log('   3. Remove any remaining Grid imports');
  console.log('   4. Delete /layouts/grid/ directory completely');
}

if (require.main === module) {
  main();
}

module.exports = { removeGridFromFile };
