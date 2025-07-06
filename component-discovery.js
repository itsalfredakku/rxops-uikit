#!/usr/bin/env node

// Comprehensive component discovery for remaining 7% keyboard accessibility
import fs from 'fs';
import path from 'path';

console.log('🔍 COMPREHENSIVE COMPONENT DISCOVERY - Final 7% Analysis');
console.log('='.repeat(75));

// All implemented components so far
const implementedComponents = [
  'src/core/atoms/button/button.tsx',
  'src/core/atoms/input/input.tsx', 
  'src/core/atoms/alert/alert.tsx',
  'src/core/organisms/table/table.tsx',
  'src/core/organisms/modal/modal.tsx',
  'src/core/atoms/checkbox/checkbox.tsx',
  'src/core/atoms/radio/radio.tsx',
  'src/core/molecules/select/select.tsx',
  'src/core/molecules/dropdown/dropdown.tsx',
  'src/core/organisms/card/card.tsx',
  'src/core/atoms/slider/slider.tsx',
  'src/core/atoms/progress-bar/progress-bar.tsx',
  'src/core/atoms/tooltip/tooltip.tsx',
  'src/core/atoms/badge/index.tsx'
];

// Find all component files in the project
function findAllComponents(dir, components = []) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      findAllComponents(fullPath, components);
    } else if (file.name.endsWith('.tsx') && !file.name.includes('.spec') && !file.name.includes('.test')) {
      components.push(fullPath);
    }
  }
  
  return components;
}

console.log('📊 DISCOVERING ALL COMPONENTS...');
console.log('');

const srcDir = 'src/core';
const allComponents = findAllComponents(srcDir);

// Filter to get main component files (not index files unless they're the main component)
const mainComponents = allComponents.filter(comp => {
  const fileName = path.basename(comp);
  const dirName = path.basename(path.dirname(comp));
  
  // Include if it's the main component file (same name as directory) or if it's an index.tsx in a component directory
  return fileName === `${dirName}.tsx` || 
         (fileName === 'index.tsx' && comp.includes('/atoms/') || comp.includes('/molecules/') || comp.includes('/organisms/'));
});

console.log('✅ IMPLEMENTED COMPONENTS:');
let implementedCount = 0;
implementedComponents.forEach(comp => {
  if (fs.existsSync(comp)) {
    implementedCount++;
    const name = path.basename(comp).replace('.tsx', '').replace('index', path.basename(path.dirname(comp)));
    console.log(`  ✅ ${name}`);
  }
});

console.log('');
console.log('❌ REMAINING COMPONENTS TO IMPLEMENT:');
let remainingCount = 0;
const remainingComponents = [];

mainComponents.forEach(comp => {
  const isImplemented = implementedComponents.some(impl => {
    const implPath = impl.replace('/index.tsx', `/${path.basename(path.dirname(impl))}.tsx`);
    return comp === impl || comp === implPath || 
           (comp.endsWith('/index.tsx') && impl.includes(path.basename(path.dirname(comp))));
  });
  
  if (!isImplemented) {
    remainingCount++;
    const name = path.basename(comp).replace('.tsx', '').replace('index', path.basename(path.dirname(comp)));
    const category = comp.includes('/atoms/') ? 'ATOM' : 
                    comp.includes('/molecules/') ? 'MOLECULE' : 
                    comp.includes('/organisms/') ? 'ORGANISM' : 'OTHER';
    remainingComponents.push({ path: comp, name, category });
    console.log(`  ❌ ${name.padEnd(20)} - ${category}`);
  }
});

console.log('');
console.log('📈 SUMMARY:');
console.log(`✅ Implemented: ${implementedCount} components`);
console.log(`❌ Remaining: ${remainingCount} components`);
console.log(`📊 Total Discovered: ${implementedCount + remainingCount} components`);
console.log(`🎯 Current Coverage: ${Math.round(implementedCount/(implementedCount + remainingCount)*100)}%`);
console.log(`🏃 Remaining to 100%: ${remainingCount} components (${Math.round(remainingCount/(implementedCount + remainingCount)*100)}%)`);

// Prioritize remaining components
console.log('');
console.log('🎯 PRIORITY RANKING FOR FINAL 7%:');
console.log('');

// High priority - frequently used interactive components
const highPriority = remainingComponents.filter(comp => 
  ['switch', 'toggle', 'tabs', 'avatar', 'spinner', 'icon', 'text', 'link'].some(keyword => 
    comp.name.toLowerCase().includes(keyword)
  )
);

// Medium priority - layout and utility components  
const mediumPriority = remainingComponents.filter(comp => 
  !highPriority.includes(comp) && 
  ['form', 'header', 'footer', 'container', 'list'].some(keyword => 
    comp.name.toLowerCase().includes(keyword)
  )
);

// Lower priority - specialized components
const lowPriority = remainingComponents.filter(comp => 
  !highPriority.includes(comp) && !mediumPriority.includes(comp)
);

if (highPriority.length > 0) {
  console.log('🔥 HIGH PRIORITY (Interactive/Form Components):');
  highPriority.forEach(comp => console.log(`  1️⃣ ${comp.name} - ${comp.category}`));
  console.log('');
}

if (mediumPriority.length > 0) {
  console.log('📋 MEDIUM PRIORITY (Layout/Navigation Components):');
  mediumPriority.forEach(comp => console.log(`  2️⃣ ${comp.name} - ${comp.category}`));
  console.log('');
}

if (lowPriority.length > 0) {
  console.log('📦 LOWER PRIORITY (Specialized Components):');
  lowPriority.forEach(comp => console.log(`  3️⃣ ${comp.name} - ${comp.category}`));
  console.log('');
}

console.log('🚀 RECOMMENDED IMPLEMENTATION ORDER:');
console.log('1. High Priority Interactive Components (immediate accessibility impact)');
console.log('2. Medium Priority Layout Components (workflow accessibility)');  
console.log('3. Lower Priority Specialized Components (complete coverage)');

console.log('');
console.log('🎉 TARGET: Achieve 100% keyboard accessibility coverage!');
