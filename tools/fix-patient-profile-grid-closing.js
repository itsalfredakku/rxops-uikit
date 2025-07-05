#!/usr/bin/env node

import fs from 'fs';

/**
 * Fix closing tags for Grid components in patient-profile.migrated.tsx
 */
function fixGridClosingTags() {
  console.log('🔧 Fixing Grid closing tags in patient-profile.migrated.tsx...\n');

  const filePath = './src/healthcare/patient/patient-profile/patient-profile.migrated.tsx';
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    // Find Grid opening tags and their corresponding closing divs
    const gridLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('<Grid cols=')) {
        gridLines.push({
          openLine: i,
          openContent: lines[i].trim(),
          depth: 0,
          closeLine: -1
        });
      }
    }
    
    // For each Grid, find its corresponding closing </div>
    for (const grid of gridLines) {
      let depth = 0;
      let found = false;
      
      for (let i = grid.openLine + 1; i < lines.length && !found; i++) {
        const line = lines[i];
        
        // Count div openings and closings
        const divOpens = (line.match(/<div[^>]*>/g) || []).length;
        const divCloses = (line.match(/<\/div>/g) || []).length;
        
        depth += divOpens - divCloses;
        
        // If we're at depth -1 and find a closing div, this is our match
        if (depth === -1 && line.includes('</div>')) {
          grid.closeLine = i;
          found = true;
          console.log(`✅ Found closing tag for Grid at line ${grid.openLine + 1} -> line ${i + 1}`);
        }
      }
    }
    
    // Replace closing tags (work backwards to maintain line numbers)
    gridLines.reverse().forEach(grid => {
      if (grid.closeLine !== -1) {
        lines[grid.closeLine] = lines[grid.closeLine].replace('</div>', '</Grid>');
        console.log(`🔄 Replaced closing tag at line ${grid.closeLine + 1}`);
      }
    });
    
    const fixedContent = lines.join('\n');
    const outputPath = './src/healthcare/patient/patient-profile/patient-profile.fixed.tsx';
    fs.writeFileSync(outputPath, fixedContent);
    
    console.log(`\n✅ Grid closing tags fixed!`);
    console.log(`📁 Fixed file: ${outputPath}`);
    console.log(`\n🔍 Review the file and then apply:`);
    console.log(`   cp ${outputPath} ./src/healthcare/patient/patient-profile/patient-profile.tsx`);
    
  } catch (error) {
    console.error('❌ Error fixing closing tags:', error);
    process.exit(1);
  }
}

fixGridClosingTags();
