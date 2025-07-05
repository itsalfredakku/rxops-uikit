#!/usr/bin/env node

import fs from 'fs';

/**
 * Complete migration script for patient-profile.tsx
 * This script properly handles Grid component migration with correct closing tags
 */
function migratePatientProfile() {
  console.log('🔄 Starting complete patient-profile.tsx Grid migration...\n');

  const filePath = './src/healthcare/patient/patient-profile/patient-profile.tsx';
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Step 1: Add Grid import
    if (!content.includes("import { Grid }")) {
      content = content.replace(
        "import { BaseComponentProps, mergeClasses } from '../../../design-system/props';",
        "import { BaseComponentProps, mergeClasses } from '../../../design-system/props';\nimport { Grid } from '../../../layouts/grid/grid';"
      );
      console.log('✅ Added Grid import');
    }
    
    // Step 2: Define specific grid replacements with their exact context
    const replacements = [
      {
        name: "Summary mode grid (3 column responsive)",
        search: `        {mode === 'summary' && (
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">`,
        replace: `        {mode === 'summary' && (
          <Grid cols={{ sm: 1, md: 2, lg: 3 }} gap="6">`
      },
      {
        name: "Summary mode grid closing",
        search: `            </div>
          </div>
        )}`,
        replace: `            </div>
          </Grid>
        )}`
      },
      {
        name: "Overview tab grid (2 column responsive)",
        search: `            {activeTab.value === 'overview' && (
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">`,
        replace: `            {activeTab.value === 'overview' && (
              <Grid cols={{ sm: 1, lg: 2 }} gap="8">`
      },
      {
        name: "Overview tab grid closing", 
        search: `                </div>
              </div>
            )}`,
        replace: `                </div>
              </Grid>
            )}`
      },
      {
        name: "Vitals tab grid (3 column responsive)",
        search: `              <div class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">`,
        replace: `              <div class="space-y-6">
                <Grid cols={{ sm: 1, md: 2, lg: 3 }} gap="6">`
      },
      {
        name: "Vitals tab grid closing",
        search: `                </div>

                <div class="mt-4 text-sm text-gray-500">`,
        replace: `                </Grid>

                <div class="mt-4 text-sm text-gray-500">`
      },
      {
        name: "Contacts tab grid (2 column responsive)",
        search: `              <div class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">`,
        replace: `              <div class="space-y-6">
                <Grid cols={{ sm: 1, md: 2 }} gap="6">`
      },
      {
        name: "Contacts tab grid closing",
        search: `                  </div>
                </div>
              </div>`,
        replace: `                  </div>
                </Grid>
              </div>`
      },
      {
        name: "Emergency contact grid (3 column responsive)",
        search: `              <h3 class="text-lg font-semibold text-red-900 mb-4">Emergency Contact</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">`,
        replace: `              <h3 class="text-lg font-semibold text-red-900 mb-4">Emergency Contact</h3>
              <Grid cols={{ sm: 1, md: 3 }} gap="4" class="text-sm">`
      },
      {
        name: "Emergency contact grid closing",
        search: `                </div>
              </div>
            </div>`,
        replace: `                </div>
              </Grid>
            </div>`
      },
      {
        name: "Emergency vitals grid (4 column responsive)",
        search: `              <h3 class="text-lg font-semibold text-gray-900 mb-4">Recent Vitals</h3>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">`,
        replace: `              <h3 class="text-lg font-semibold text-gray-900 mb-4">Recent Vitals</h3>
              <Grid cols={{ sm: 2, md: 4 }} gap="4" class="text-sm">`
      },
      {
        name: "Emergency vitals grid closing",
        search: `                </div>
              </div>
            </div>
          </div>`,
        replace: `                </div>
              </Grid>
            </div>
          </div>`
      }
    ];
    
    // Apply all replacements
    let successCount = 0;
    for (const replacement of replacements) {
      if (content.includes(replacement.search)) {
        content = content.replace(replacement.search, replacement.replace);
        console.log(`✅ ${replacement.name}`);
        successCount++;
      } else {
        console.log(`⚠️  ${replacement.name} - pattern not found`);
      }
    }
    
    // Write the result
    const outputPath = './src/healthcare/patient/patient-profile/patient-profile.final.tsx';
    fs.writeFileSync(outputPath, content);
    
    console.log(`\n📊 Migration Summary:`);
    console.log(`   Successful replacements: ${successCount}/${replacements.length}`);
    console.log(`   Output file: ${outputPath}`);
    
    // Verify the result has the expected Grid components
    const gridCount = (content.match(/<Grid[^>]*>/g) || []).length;
    const gridCloseCount = (content.match(/<\/Grid>/g) || []).length;
    
    console.log(`\n🔍 Verification:`);
    console.log(`   Grid opening tags: ${gridCount}`);
    console.log(`   Grid closing tags: ${gridCloseCount}`);
    
    if (gridCount === gridCloseCount && gridCount === 6) {
      console.log(`✅ All Grid components are properly formed!`);
      console.log(`\n🚀 Ready to apply:`);
      console.log(`   cp ${outputPath} ${filePath}`);
      console.log(`   npm run build.lib`);
    } else {
      console.log(`❌ Grid tag mismatch detected. Manual review needed.`);
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migratePatientProfile();
