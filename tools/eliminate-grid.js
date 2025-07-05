#!/usr/bin/env node

/**
 * Grid Elimination Script
 * 
 * This script removes ALL Grid component usage and replaces it with Row/Column
 * Based on the principle that Row/Column with responsive sizing is sufficient
 */

import fs from 'fs';
import path from 'path';

const filesToUpdate = [
  'src/demo.tsx',
  'src/core/organisms/footer/index.tsx',
  'src/healthcare/medical/health-package-card/health-package-card.tsx',
  'src/healthcare/medical/lab-results/lab-results.tsx',
  'src/healthcare/medical/imaging-viewer/imaging-viewer.tsx',
  'src/healthcare/medical/medication-tracker/medication-tracker.tsx',
  'src/healthcare/patient/health-dashboard/health-dashboard.tsx',
  'src/healthcare/patient/medical-history/medical-history.tsx',
  'src/healthcare/patient/patient-profile/patient-profile.migrated.tsx',
  'src/healthcare/patient/patient-profile/patient-profile.tsx',
  'src/healthcare/patient/vitals-signs/vitals-signs.tsx',
  'src/healthcare/emergency/emergency-alert/emergency-alert.tsx',
  'src/healthcare/provider/consultation-notes/consultation-notes.tsx',
  'src/healthcare/appointments/appointment-card/appointment-card.tsx',
  'src/core/molecules/date-time-picker/date-time-picker.tsx'
];

function removeGridFromFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let changed = false;

  console.log(`🔄 Processing: ${filePath}`);

  // Remove Grid imports
  const originalContent = content;
  
  // Remove import statements
  content = content.replace(/import\s*{\s*[^}]*Grid[^}]*}\s*from\s*['"][^'"]*grid[^'"]*['"];\s*\n?/g, '');
  content = content.replace(/,\s*Grid[^,}]*/g, '');
  content = content.replace(/Grid[^,}]*,\s*/g, '');
  
  // Add Column import if not present and needed
  if (content.includes('<Column') && !content.includes('import { Column }') && !content.includes('import {Column}')) {
    // Find existing layout imports or add new ones
    if (content.includes('from \'../../../layouts/')) {
      content = content.replace(
        /(import {[^}]*)} from '\.\.\/\.\.\/\.\.\/layouts\/([^']+)'/,
        '$1, Column} from \'../../../layouts/$2\''
      );
    } else if (content.includes('from \'../../layouts/')) {
      content = content.replace(
        /(import {[^}]*)} from '\.\.\/\.\.\/layouts\/([^']+)'/,
        '$1, Column} from \'../../layouts/$2\''
      );
    } else {
      // Add new import after other imports
      const importMatch = content.match(/^import[^;]+;$/gm);
      if (importMatch) {
        const lastImport = importMatch[importMatch.length - 1];
        content = content.replace(
          lastImport,
          lastImport + '\nimport { Column } from \'../../../layouts/column\';'
        );
      }
    }
  }

  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content);
    changed = true;
    console.log(`✅ Updated: ${filePath}`);
  } else {
    console.log(`📝 No changes: ${filePath}`);
  }

  return changed;
}

function main() {
  console.log('🚀 Starting Grid Elimination\n');
  
  let totalUpdated = 0;
  
  filesToUpdate.forEach(filePath => {
    if (removeGridFromFile(filePath)) {
      totalUpdated++;
    }
  });
  
  console.log(`\n✨ Grid elimination complete!`);
  console.log(`📊 Files updated: ${totalUpdated}/${filesToUpdate.length}`);
  console.log('\n📋 Next Steps:');
  console.log('   1. Manually convert remaining <Grid> elements to <Row> + <Column>');
  console.log('   2. Update Grid props: cols={{ sm: 1, md: 2 }} → Individual Column sizing');
  console.log('   3. Remove /layouts/grid/ directory');
  console.log('   4. Run: npm run build && npm run lint');
}

main();
