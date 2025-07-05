// Implement the health-dashboard Grid migration manually
// This script replaces the auto-generated file with a hand-edited one

import { promises as fs } from 'fs';
import path from 'path';

const sourceFilePath = '/Volumes/EXT/RxOps/ui/src/healthcare/patient/health-dashboard/health-dashboard.tsx';
const migratedFilePath = '/Volumes/EXT/RxOps/ui/src/healthcare/patient/health-dashboard/health-dashboard.migrated.tsx';
const finalFilePath = '/Volumes/EXT/RxOps/ui/src/healthcare/patient/health-dashboard/health-dashboard.fixed.tsx';

async function manuallyFixGridMigration() {
  try {
    console.log('Reading source and migrated files...');
    const sourceContent = await fs.readFile(sourceFilePath, 'utf8');
    const migratedContent = await fs.readFile(migratedFilePath, 'utf8');
    
    // Add Grid import if not present
    let fixedContent = migratedContent;
    if (!fixedContent.includes("import { Grid } from ")) {
      fixedContent = fixedContent.replace(
        "import { Row, Column, Stack } from '../../../layouts';", 
        "import { Row, Column, Stack } from '../../../layouts';\nimport { Grid } from '../../../layouts/grid/grid';"
      );
    }
    
    // Fix the first grid (Summary Stats)
    fixedContent = fixedContent.replace(
      /<Grid cols=\{.*?\} gap="4" >([\s\S]*?)<\/div>/m,
      '<Grid cols={{ md: 4 }} gap="4">\n$1\n        </Grid>'
    );
    
    // Fix the second grid (Main Content Grid)
    fixedContent = fixedContent.replace(
      /<Grid cols=\{.*?\} gap="6" >([\s\S]*?)<\/div>\s+<\/div>/m,
      '<Grid cols={{ lg: 3 }} gap="6">\n$1\n      </Grid>'
    );
    
    // Fix the third grid (Health Metrics)
    fixedContent = fixedContent.replace(
      /<Grid cols=\{.*?\} gap="4" >([\s\S]*?)<\/div>\s+\)/m,
      '<Grid cols={{ md: 2 }} gap="4">\n$1\n              </Grid>\n            )'
    );
    
    // Write the fixed content to a new file
    await fs.writeFile(finalFilePath, fixedContent);
    console.log(`Manually fixed Grid implementation written to ${finalFilePath}`);
    
  } catch (error) {
    console.error('Error in manual Grid migration fix:', error);
  }
}

manuallyFixGridMigration();
