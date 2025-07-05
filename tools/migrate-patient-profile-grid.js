#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const PATIENT_PROFILE_PATH = '/Volumes/EXT/RxOps/ui/src/healthcare/patient/patient-profile/patient-profile.tsx';

function migratePatientProfileGrid() {
  console.log('🔄 Migrating patient-profile.tsx grid layouts to Grid component...\n');

  try {
    // Read the original file
    const content = fs.readFileSync(PATIENT_PROFILE_PATH, 'utf8');
    
    // Split into lines for easier processing
    let lines = content.split('\n');
    
    // Find the import section and add Grid import
    let importIndex = -1;
    let hasGridImport = false;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('import') && lines[i].includes('~/core/')) {
        importIndex = i;
      }
      if (lines[i].includes('Grid')) {
        hasGridImport = true;
        break;
      }
      if (!lines[i].startsWith('import') && !lines[i].startsWith('//') && lines[i].trim() !== '') {
        break;
      }
    }
    
    // Add Grid import if not present
    if (!hasGridImport && importIndex >= 0) {
      lines.splice(importIndex + 1, 0, 'import { Grid } from "~/layouts/grid/grid";');
      console.log('✅ Added Grid import');
    }
    
    // Rejoin the lines
    let updatedContent = lines.join('\n');
    
    // Define grid migrations
    const gridMigrations = [
      {
        // Summary mode grid - 3 column responsive
        search: '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">',
        replace: '<Grid cols={{ sm: 1, md: 2, lg: 3 }} gap="6">',
        closing: '</div>',
        newClosing: '</Grid>'
      },
      {
        // Overview tab grid - 2 column responsive
        search: '<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">',
        replace: '<Grid cols={{ sm: 1, lg: 2 }} gap="8">',
        closing: '</div>',
        newClosing: '</Grid>'
      },
      {
        // Vitals tab grid - 3 column responsive
        search: '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">',
        replace: '<Grid cols={{ sm: 1, md: 2, lg: 3 }} gap="6">',
        closing: '</div>',
        newClosing: '</Grid>'
      },
      {
        // Contacts tab grid - 2 column responsive
        search: '<div class="grid grid-cols-1 md:grid-cols-2 gap-6">',
        replace: '<Grid cols={{ sm: 1, md: 2 }} gap="6">',
        closing: '</div>',
        newClosing: '</Grid>'
      },
      {
        // Emergency contact grid - 3 column responsive
        search: '<div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">',
        replace: '<Grid cols={{ sm: 1, md: 3 }} gap="4" class="text-sm">',
        closing: '</div>',
        newClosing: '</Grid>'
      },
      {
        // Emergency vitals grid - 4 column responsive
        search: '<div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">',
        replace: '<Grid cols={{ sm: 2, md: 4 }} gap="4" class="text-sm">',
        closing: '</div>',
        newClosing: '</Grid>'
      }
    ];
    
    // Apply migrations
    let migratedCount = 0;
    
    for (const migration of gridMigrations) {
      if (updatedContent.includes(migration.search)) {
        updatedContent = updatedContent.replace(migration.search, migration.replace);
        migratedCount++;
        console.log(`✅ Migrated grid layout: ${migration.search.substring(0, 50)}...`);
      }
    }
    
    // Handle corresponding closing tags more carefully
    // We need to find the matching closing div for each grid we converted
    const gridPattern = /<Grid[^>]*>/g;
    let matches = [...updatedContent.matchAll(gridPattern)];
    
    console.log(`\n📊 Migration Summary:`);
    console.log(`   Grid layouts found: ${migratedCount}`);
    console.log(`   Grid components created: ${matches.length}`);
    
    // Write the updated content to a new file for review
    const outputPath = PATIENT_PROFILE_PATH.replace('.tsx', '.migrated.tsx');
    fs.writeFileSync(outputPath, updatedContent);
    
    console.log(`\n📁 Migration completed!`);
    console.log(`   Original: ${PATIENT_PROFILE_PATH}`);
    console.log(`   Migrated: ${outputPath}`);
    console.log('\n🔍 Please review the migrated file before applying changes.');
    
    return true;
    
  } catch (error) {
    console.error('❌ Error during migration:', error.message);
    return false;
  }
}

// Run the migration
migratePatientProfileGrid();
