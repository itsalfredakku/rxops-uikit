#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const PATIENT_PROFILE_PATH = '/Volumes/EXT/RxOps/ui/src/healthcare/patient/patient-profile/patient-profile.tsx';

function createFixedPatientProfile() {
  console.log('🔧 Creating manually fixed patient-profile.tsx with proper Grid components...\n');

  try {
    // Read the original file
    const content = fs.readFileSync(PATIENT_PROFILE_PATH, 'utf8');
    
    // Step 1: Add Grid import
    let updatedContent = content.replace(
      `import { BaseComponentProps, mergeClasses } from '../../../design-system/props';`,
      `import { BaseComponentProps, mergeClasses } from '../../../design-system/props';
import { Grid } from '../../../layouts/grid/grid';`
    );
    
    // Step 2: Replace grid layouts with proper opening and closing tags
    
    // 1. Summary mode grid (line ~308)
    updatedContent = updatedContent.replace(
      `          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">`,
      `          <Grid cols={{ sm: 1, md: 2, lg: 3 }} gap="6">`
    );
    
    // Find and replace the corresponding closing div for summary mode (after the contact info, vitals, and medical alerts sections)
    updatedContent = updatedContent.replace(
      `            </div>
          </div>
        )}`,
      `            </div>
          </Grid>
        )}`
    );
    
    // 2. Overview tab grid (line ~374)
    updatedContent = updatedContent.replace(
      `              <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">`,
      `              <Grid cols={{ sm: 1, lg: 2 }} gap="8">`
    );
    
    // Find the corresponding closing for overview tab (after the two main columns)
    updatedContent = updatedContent.replace(
      `                </div>
              </div>`,
      `                </div>
              </Grid>`
    );
    
    // 3. Vitals tab grid (line ~548)
    updatedContent = updatedContent.replace(
      `                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">`,
      `                <Grid cols={{ sm: 1, md: 2, lg: 3 }} gap="6">`
    );
    
    // Find the corresponding closing for vitals grid (after all vital cards)
    updatedContent = updatedContent.replace(
      `                </div>

                <div class="mt-4 text-sm text-neutral-light">`,
      `                </Grid>

                <div class="mt-4 text-sm text-neutral-light">`
    );
    
    // 4. Contacts tab grid (line ~621)
    updatedContent = updatedContent.replace(
      `                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">`,
      `                <Grid cols={{ sm: 1, md: 2 }} gap="6">`
    );
    
    // Find the corresponding closing for contacts grid (after the two contact cards)
    updatedContent = updatedContent.replace(
      `                  </div>
                </div>`,
      `                  </div>
                </Grid>`
    );
    
    // 5. Emergency contact grid (line ~674)
    updatedContent = updatedContent.replace(
      `              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">`,
      `              <Grid cols={{ sm: 1, md: 3 }} gap="4" class="text-sm">`
    );
    
    // Find the corresponding closing for emergency contact grid
    updatedContent = updatedContent.replace(
      `              </div>
            </div>

            {/* Critical Allergies */}`,
      `              </Grid>
            </div>

            {/* Critical Allergies */}`
    );
    
    // 6. Emergency vitals grid (line ~729)
    updatedContent = updatedContent.replace(
      `              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">`,
      `              <Grid cols={{ sm: 2, md: 4 }} gap="4" class="text-sm">`
    );
    
    // Find the corresponding closing for emergency vitals grid
    updatedContent = updatedContent.replace(
      `              </div>
            </div>
          </div>
        )}`,
      `              </Grid>
            </div>
          </div>
        )}`
    );
    
    // Write the fixed content
    const outputPath = PATIENT_PROFILE_PATH.replace('.tsx', '.fixed.tsx');
    fs.writeFileSync(outputPath, updatedContent);
    
    console.log('✅ Created fixed patient-profile component');
    console.log(`📁 Fixed file: ${outputPath}`);
    
    // Verify the changes
    const gridCount = (updatedContent.match(/<Grid/g) || []).length;
    const gridCloseCount = (updatedContent.match(/<\/Grid>/g) || []).length;
    
    console.log(`\n📊 Verification:`);
    console.log(`   <Grid> tags: ${gridCount}`);
    console.log(`   </Grid> tags: ${gridCloseCount}`);
    console.log(`   Tags balanced: ${gridCount === gridCloseCount ? '✅' : '❌'}`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Error creating fixed file:', error.message);
    return false;
  }
}

// Run the fix
createFixedPatientProfile();
