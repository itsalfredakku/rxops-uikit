#!/usr/bin/env node

/**
 * Quick Healthcare Gallery Interface Fix
 * Fixes all remaining TypeScript errors in healthcare-gallery.tsx
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const galleryPath = resolve(process.cwd(), 'src/showcase/healthcare-gallery.tsx');

console.log('🔧 Quick fixing healthcare gallery interfaces...');

try {
  let content = readFileSync(galleryPath, 'utf8');
  
  // Fix Badge components - use color instead of variant for colors
  content = content.replace(
    /<Badge variant="success"/g,
    '<Badge variant="flat" color="success"'
  );
  content = content.replace(
    /<Badge variant="warning"/g,
    '<Badge variant="flat" color="warning"'
  );
  content = content.replace(
    /<Badge variant="destructive"/g,
    '<Badge variant="flat" color="error"'
  );
  content = content.replace(
    /<Badge variant="primary"/g,
    '<Badge variant="flat" color="primary"'
  );
  
  // Fix Input components - remove invalid severity prop
  content = content.replace(/severity="[^"]*"/g, 'type');
  content = content.replace(/type="text"/g, 'type="text"');
  content = content.replace(/type="number"/g, 'type="number"');
  content = content.replace(/type="date"/g, 'type="date"');
  
  // Fix Button components - use intent instead of variant
  content = content.replace(/variant="primary"/g, 'intent="primary"');
  content = content.replace(/variant="secondary"/g, 'intent="secondary"');
  content = content.replace(/variant="neutral"/g, 'intent="neutral"');
  
  // Fix Slider - remove showValues prop
  content = content.replace(/\s+showValues={true}/g, '');
  
  // Fix Stepper - use children instead of steps prop
  const stepperSection = `              <Stepper
                activeStep={2}
              >
                <div class="text-sm space-y-2">
                  <div class="flex items-center gap-2">
                    <span class="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">✓</span>
                    <span>Initial Assessment</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">✓</span>
                    <span>Diagnosis Confirmed</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">2</span>
                    <span class="font-semibold">Treatment Started</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="w-6 h-6 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-xs">3</span>
                    <span class="text-gray-500">Follow-up Scheduled</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="w-6 h-6 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-xs">4</span>
                    <span class="text-gray-500">Recovery Monitoring</span>
                  </div>
                </div>
              </Stepper>`;
  
  content = content.replace(
    /<Stepper\s+activeStep={2}\s+steps={\[[^\]]+\]}\s*\/>/s,
    stepperSection
  );
  
  writeFileSync(galleryPath, content);
  
  console.log('✅ Healthcare gallery interfaces fixed!');
  console.log('📝 Fixed issues:');
  console.log('  - Badge components: variant → color');
  console.log('  - Input components: removed invalid severity prop');
  console.log('  - Button components: variant → intent');
  console.log('  - Slider: removed showValues prop');
  console.log('  - Stepper: converted to children pattern');
  
} catch (error) {
  console.error('❌ Error fixing gallery interfaces:', error.message);
  process.exit(1);
}
