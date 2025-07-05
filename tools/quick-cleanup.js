#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Quick fixer to remove malformed comment lines from icon migration
 */

const files = [
  'src/core/atoms/icon/index.tsx',
  'src/healthcare/appointments/video-call/video-call.tsx',
  'src/healthcare/medical/imaging-viewer/imaging-viewer.tsx',
  'src/healthcare/patient/medical-history/medical-history.tsx',
  'src/healthcare/patient/patient-profile/patient-profile.tsx',
  'src/healthcare/provider/consultation-notes/consultation-notes.tsx'
];

files.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove the malformed lines
    content = content.replace(/^} from ['"'][^'"]*utils\/icons['"]; \/\/ Auto-migrated to Icon component\n?/gm, '');
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Cleaned: ${filePath}`);
  }
});

console.log('🎉 Cleanup complete!');
