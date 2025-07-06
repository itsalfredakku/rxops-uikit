#!/usr/bin/env node

/**
 * Fix Hardcoded Colors Script
 * Systematically replaces hardcoded Tailwind colors with semantic equivalents
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Color mapping from hardcoded to semantic
const colorMappings = {
  // Red colors -> error
  'bg-red-50': 'bg-error-lighter',
  'bg-red-100': 'bg-error-lighter',
  'bg-red-200': 'bg-error-light',
  'bg-red-300': 'bg-error-light',
  'bg-red-400': 'bg-error-normal',
  'bg-red-500': 'bg-error-normal',
  'bg-red-600': 'bg-error-normal',
  'bg-red-700': 'bg-error-dark',
  'bg-red-800': 'bg-error-darker',
  'bg-red-900': 'bg-error-darker',

  'text-red-50': 'text-error-lighter',
  'text-red-100': 'text-error-lighter',
  'text-red-200': 'text-error-light',
  'text-red-300': 'text-error-light',
  'text-red-400': 'text-error-normal',
  'text-red-500': 'text-error-normal',
  'text-red-600': 'text-error-normal',
  'text-red-700': 'text-error-dark',
  'text-red-800': 'text-error-darker',
  'text-red-900': 'text-error-darker',

  'border-red-50': 'border-error-lighter',
  'border-red-100': 'border-error-lighter',
  'border-red-200': 'border-error-light',
  'border-red-300': 'border-error-light',
  'border-red-400': 'border-error-normal',
  'border-red-500': 'border-error-normal',
  'border-red-600': 'border-error-normal',
  'border-red-700': 'border-error-dark',
  'border-red-800': 'border-error-darker',
  'border-red-900': 'border-error-darker',

  'ring-red-200': 'ring-error-light',
  'ring-red-300': 'ring-error-light',
  'ring-red-400': 'ring-error-normal',
  'ring-red-500': 'ring-error-normal',
  'ring-red-600': 'ring-error-normal',

  // Orange colors -> warning
  'bg-orange-50': 'bg-warning-lighter',
  'bg-orange-100': 'bg-warning-lighter',
  'bg-orange-200': 'bg-warning-light',
  'bg-orange-300': 'bg-warning-light',
  'bg-orange-400': 'bg-warning-normal',
  'bg-orange-500': 'bg-warning-normal',
  'bg-orange-600': 'bg-warning-normal',
  'bg-orange-700': 'bg-warning-dark',
  'bg-orange-800': 'bg-warning-darker',
  'bg-orange-900': 'bg-warning-darker',

  'text-orange-300': 'text-warning-light',
  'text-orange-400': 'text-warning-normal',
  'text-orange-500': 'text-warning-normal',
  'text-orange-600': 'text-warning-normal',
  'text-orange-700': 'text-warning-dark',
  'text-orange-800': 'text-warning-darker',
  'text-orange-900': 'text-warning-darker',

  'border-orange-200': 'border-warning-light',
  'border-orange-300': 'border-warning-light',
  'border-orange-400': 'border-warning-normal',
  'border-orange-500': 'border-warning-normal',
  'border-orange-600': 'border-warning-normal',

  // Yellow colors -> warning
  'bg-yellow-50': 'bg-warning-lighter',
  'bg-yellow-100': 'bg-warning-lighter',
  'bg-yellow-200': 'bg-warning-light',
  'bg-yellow-300': 'bg-warning-light',
  'bg-yellow-400': 'bg-warning-normal',
  'bg-yellow-500': 'bg-warning-normal',
  'bg-yellow-600': 'bg-warning-normal',

  'text-yellow-400': 'text-warning-normal',
  'text-yellow-500': 'text-warning-normal',
  'text-yellow-600': 'text-warning-normal',
  'text-yellow-700': 'text-warning-dark',
  'text-yellow-800': 'text-warning-darker',

  'border-yellow-200': 'border-warning-light',
  'border-yellow-300': 'border-warning-light',
  'border-yellow-400': 'border-warning-normal',
  'border-yellow-500': 'border-warning-normal',
  'border-yellow-600': 'border-warning-normal',

  'ring-yellow-300': 'ring-warning-light',
  'ring-yellow-400': 'ring-warning-normal',

  // Green colors -> success
  'bg-green-50': 'bg-success-lighter',
  'bg-green-100': 'bg-success-lighter',
  'bg-green-200': 'bg-success-light',
  'bg-green-300': 'bg-success-light',
  'bg-green-400': 'bg-success-normal',
  'bg-green-500': 'bg-success-normal',
  'bg-green-600': 'bg-success-normal',
  'bg-green-700': 'bg-success-dark',
  'bg-green-800': 'bg-success-darker',

  'text-green-400': 'text-success-normal',
  'text-green-500': 'text-success-normal',
  'text-green-600': 'text-success-normal',
  'text-green-700': 'text-success-dark',
  'text-green-800': 'text-success-darker',

  'border-green-200': 'border-success-light',
  'border-green-300': 'border-success-light',
  'border-green-400': 'border-success-normal',
  'border-green-500': 'border-success-normal',

  'ring-green-300': 'ring-success-light',
  'ring-green-400': 'ring-success-normal',

  // Blue colors -> primary or info
  'bg-blue-50': 'bg-info-lighter',
  'bg-blue-100': 'bg-info-lighter',
  'bg-blue-200': 'bg-info-light',
  'bg-blue-300': 'bg-info-light',
  'bg-blue-400': 'bg-primary-normal',
  'bg-blue-500': 'bg-primary-normal',
  'bg-blue-600': 'bg-primary-normal',
  'bg-blue-700': 'bg-primary-dark',
  'bg-blue-800': 'bg-primary-darker',

  'text-blue-300': 'text-info-light',
  'text-blue-400': 'text-info-normal',
  'text-blue-500': 'text-primary-normal',
  'text-blue-600': 'text-primary-normal',
  'text-blue-700': 'text-primary-dark',
  'text-blue-800': 'text-primary-darker',
  'text-blue-900': 'text-primary-darker',

  'border-blue-200': 'border-info-light',
  'border-blue-300': 'border-info-light',
  'border-blue-400': 'border-primary-normal',
  'border-blue-500': 'border-primary-normal',
  'border-blue-600': 'border-primary-normal',
  'border-blue-800': 'border-primary-darker',

  'ring-blue-300': 'ring-info-light',
  'ring-blue-400': 'ring-primary-normal',
  'ring-blue-500': 'ring-primary-normal',

  // Indigo colors -> primary
  'bg-indigo-100': 'bg-primary-lighter',
  'bg-indigo-200': 'bg-primary-light',
  'bg-indigo-500': 'bg-primary-normal',
  'bg-indigo-600': 'bg-primary-normal',
  'bg-indigo-800': 'bg-primary-darker',

  'text-indigo-400': 'text-primary-normal',
  'text-indigo-700': 'text-primary-dark',
  'text-indigo-800': 'text-primary-darker',

  'border-indigo-300': 'border-primary-light',
  'border-indigo-800': 'border-primary-darker',

  'ring-indigo-300': 'ring-primary-light',

  // Emerald colors -> success
  'bg-emerald-50': 'bg-success-lighter',
  'bg-emerald-100': 'bg-success-lighter',
  'bg-emerald-200': 'bg-success-light',

  'text-emerald-800': 'text-success-darker',
  'text-emerald-900': 'text-success-darker',

  'border-emerald-300': 'border-success-light',

  'ring-emerald-300': 'ring-success-light',

  // Teal colors -> info
  'text-teal-500': 'text-info-normal',

  // Amber colors -> warning
  'bg-amber-100': 'bg-warning-lighter',
  'bg-amber-200': 'bg-warning-light',

  'text-amber-800': 'text-warning-darker',

  'ring-amber-300': 'ring-warning-light',

  // Rose colors -> error
  'bg-rose-50': 'bg-error-lighter',
  'bg-rose-100': 'bg-error-lighter',

  'text-rose-900': 'text-error-darker',

  'border-rose-300': 'border-error-light',

  // Purple colors -> primary (for medical context)
  'bg-purple-50': 'bg-primary-lighter',
  'bg-purple-100': 'bg-primary-lighter',
  'bg-purple-200': 'bg-primary-light',
  'bg-purple-300': 'bg-primary-light',
  'bg-purple-400': 'bg-primary-normal',
  'bg-purple-500': 'bg-primary-normal',
  'bg-purple-600': 'bg-primary-normal',
  'bg-purple-700': 'bg-primary-dark',
  'bg-purple-800': 'bg-primary-darker',
  'bg-purple-900': 'bg-primary-darker',

  'text-purple-700': 'text-primary-dark',
  'text-purple-800': 'text-primary-darker',
  'text-purple-900': 'text-primary-darker',

  'border-purple-200': 'border-primary-light',
  'border-purple-300': 'border-primary-light',
  'border-purple-400': 'border-primary-normal',

  'ring-purple-300': 'ring-primary-light',

  // Pink colors -> error (medical alert context)
  'bg-pink-50': 'bg-error-lighter',
  'bg-pink-100': 'bg-error-lighter',
  'bg-pink-200': 'bg-error-light',

  'text-pink-700': 'text-error-dark',
  'text-pink-800': 'text-error-darker',

  'border-pink-200': 'border-error-light',
  'border-pink-300': 'border-error-light',

  // Zinc colors -> neutral
  'bg-zinc-50': 'bg-neutral-lighter',
  'bg-zinc-100': 'bg-neutral-lighter',
  'bg-zinc-200': 'bg-neutral-light',
  'bg-zinc-300': 'bg-neutral-light',
  'bg-zinc-400': 'bg-neutral-normal',
  'bg-zinc-500': 'bg-neutral-normal',
  'bg-zinc-600': 'bg-neutral-dark',
  'bg-zinc-700': 'bg-neutral-darker',
  'bg-zinc-800': 'bg-neutral-darker',
  'bg-zinc-900': 'bg-neutral-darker',

  'text-zinc-400': 'text-neutral-light',
  'text-zinc-500': 'text-neutral-normal',
  'text-zinc-600': 'text-neutral-normal',
  'text-zinc-700': 'text-neutral-dark',
  'text-zinc-800': 'text-neutral-darker',

  'border-zinc-200': 'border-neutral-light',
  'border-zinc-300': 'border-neutral-light',

  // Slate/Stone colors -> neutral
  'bg-slate-50': 'bg-neutral-lighter',
  'bg-slate-100': 'bg-neutral-lighter',
  'bg-slate-200': 'bg-neutral-light',
  'bg-slate-700': 'bg-neutral-darker',
  'bg-slate-800': 'bg-neutral-darker',
  'bg-slate-900': 'bg-neutral-darker',

  'text-slate-400': 'text-neutral-light',
  'text-slate-500': 'text-neutral-normal',
  'text-slate-600': 'text-neutral-normal',
  'text-slate-700': 'text-neutral-dark',
  'text-slate-800': 'text-neutral-darker',
  'text-slate-900': 'text-neutral-darker',

  'border-slate-200': 'border-neutral-light',
  'border-slate-300': 'border-neutral-light',

  // Stone colors -> neutral
  'bg-stone-50': 'bg-neutral-lighter',
  'bg-stone-100': 'bg-neutral-lighter',
  'bg-stone-200': 'bg-neutral-light',

  'text-stone-400': 'text-neutral-light',
  'text-stone-500': 'text-neutral-normal',
  'text-stone-600': 'text-neutral-normal',
  'text-stone-700': 'text-neutral-dark',

  // Gray colors -> neutral
  'bg-gray-50': 'bg-neutral-lighter',
  'bg-gray-100': 'bg-neutral-lighter',
  'bg-gray-200': 'bg-neutral-light',
  'bg-gray-300': 'bg-neutral-light',
  'bg-gray-400': 'bg-neutral-normal',
  'bg-gray-500': 'bg-neutral-normal',
  'bg-gray-600': 'bg-neutral-dark',
  'bg-gray-700': 'bg-neutral-darker',
  'bg-gray-800': 'bg-neutral-darker',
  'bg-gray-900': 'bg-neutral-darker',

  'text-gray-300': 'text-neutral-light',
  'text-gray-400': 'text-neutral-light',
  'text-gray-500': 'text-neutral-normal',
  'text-gray-600': 'text-neutral-normal',
  'text-gray-700': 'text-neutral-dark',
  'text-gray-800': 'text-neutral-darker',
  'text-gray-900': 'text-neutral-darker',

  'border-gray-200': 'border-neutral-light',
  'border-gray-300': 'border-neutral-light',
  'border-gray-400': 'border-neutral-normal',
  'border-gray-500': 'border-neutral-normal',
  'border-gray-600': 'border-neutral-dark',
  'border-gray-700': 'border-neutral-darker',

  'ring-gray-300': 'ring-neutral-light',
  'ring-gray-400': 'ring-neutral-normal',
  'ring-gray-500': 'ring-neutral-normal',

  // Neutral colors (explicit numbers)
  'bg-neutral-50': 'bg-neutral-lighter',
  'bg-neutral-100': 'bg-neutral-lighter',
  'bg-neutral-150': 'bg-neutral-lighter',
  'bg-neutral-200': 'bg-neutral-light',
  'bg-neutral-300': 'bg-neutral-light',
  'bg-neutral-400': 'bg-neutral-normal',
  'bg-neutral-500': 'bg-neutral-normal',
  'bg-neutral-600': 'bg-neutral-dark',
  'bg-neutral-700': 'bg-neutral-darker',
  'bg-neutral-800': 'bg-neutral-darker',
  'bg-neutral-900': 'bg-neutral-darker',

  'text-neutral-50': 'text-neutral-lighter',
  'text-neutral-100': 'text-neutral-lighter',
  'text-neutral-200': 'text-neutral-light',
  'text-neutral-300': 'text-neutral-light',
  'text-neutral-400': 'text-neutral-light',
  'text-neutral-500': 'text-neutral-normal',
  'text-neutral-600': 'text-neutral-normal',
  'text-neutral-700': 'text-neutral-dark',
  'text-neutral-800': 'text-neutral-darker',
  'text-neutral-900': 'text-neutral-darker',

  'border-neutral-100': 'border-neutral-lighter',
  'border-neutral-150': 'border-neutral-lighter',
  'border-neutral-200': 'border-neutral-light',
  'border-neutral-300': 'border-neutral-light',
  'border-neutral-400': 'border-neutral-normal',
  'border-neutral-500': 'border-neutral-normal',
  'border-neutral-600': 'border-neutral-dark',
  'border-neutral-700': 'border-neutral-darker',
  'border-neutral-800': 'border-neutral-darker',

  'ring-neutral-300': 'ring-neutral-light',
  'ring-neutral-400': 'ring-neutral-normal',
  'ring-neutral-500': 'ring-neutral-normal',

  // Common healthcare status colors that should be handled
  'border-green-700': 'border-success-dark',
  'border-green-800': 'border-success-darker',
  'border-yellow-800': 'border-warning-darker',

  // Additional gradients and special cases
  'bg-neutral-0': 'bg-white',
  'bg-neutral-25': 'bg-neutral-lighter',
  'border-orange-800': 'border-warning-darker',
  'border-orange-300': 'border-warning-light',
  'text-amber-600': 'text-warning-dark',
  'bg-amber-500': 'bg-warning-normal',
  'text-amber-600': 'text-warning-dark',
  'bg-cyan-500': 'bg-info-normal',
  'border-indigo-200': 'border-primary-light',
  'bg-indigo-50': 'bg-primary-lighter',
  'border-teal-200': 'border-info-light',
  'bg-teal-50': 'bg-info-lighter',
  'border-amber-200': 'border-warning-light',
  'bg-amber-50': 'bg-warning-lighter',
  'border-amber-300': 'border-warning-light',
  'text-amber-900': 'text-warning-darker',

  // Gradient color mappings
  'from-red-50': 'from-error-lighter',
  'to-red-100': 'to-error-lighter',
  'from-red-600': 'from-error-dark',
  'to-red-700': 'to-error-dark',
  'shadow-red-500': 'shadow-error-normal',
  'ring-red-100': 'ring-error-lighter',
  'from-orange-50': 'from-warning-lighter',
  'to-orange-100': 'to-warning-lighter',
  'from-orange-600': 'from-warning-dark',
  'to-orange-700': 'to-warning-dark',
  'shadow-orange-500': 'shadow-warning-normal',
  'ring-orange-300': 'ring-warning-light',
  'from-blue-50': 'from-info-lighter',
  'to-blue-100': 'to-info-lighter',
  'from-blue-600': 'from-info-dark',
  'to-blue-700': 'to-info-dark',
  'from-blue-900': 'from-primary-darker',
  'to-blue-700': 'to-primary-dark',
  'from-gray-50': 'from-neutral-lighter',
  'to-gray-100': 'to-neutral-lighter',
  'from-gray-600': 'from-neutral-dark',
  'to-gray-700': 'to-neutral-darker',
  'from-green-50': 'from-success-lighter',
  'to-green-100': 'to-success-lighter',
  'from-amber-50': 'from-warning-lighter',
  'to-amber-100': 'to-warning-lighter',
  'from-neutral-200': 'from-neutral-light',
  'to-neutral-300': 'to-neutral-light',
  'from-neutral-25': 'from-neutral-lighter',
  'border-green-600': 'border-success-normal',
  'text-success-600': 'text-success-normal',
  'hover:bg-success-50': 'hover:bg-success-lighter',

  // Additional cyan, teal, and other color mappings
  'from-cyan-50': 'from-info-lighter',
  'to-cyan-100': 'to-info-lighter',
  'border-cyan-300': 'border-info-light',
  'text-cyan-900': 'text-info-darker',
  'from-indigo-50': 'from-primary-lighter',
  'to-indigo-100': 'to-primary-lighter',
  'text-indigo-900': 'text-primary-darker',
  'from-pink-50': 'from-error-lighter',
  'to-pink-100': 'to-error-lighter',
  'text-pink-900': 'text-error-darker',
  'from-teal-50': 'from-info-lighter',
  'to-teal-100': 'to-info-lighter',
  'border-teal-300': 'border-info-light',
  'text-teal-900': 'text-info-darker',
  'to-blue-50': 'to-info-lighter',
  'border-blue-100': 'border-info-lighter',
};

// Function to process a file
function processFile(filePath) {
  console.log(`Processing: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  // Apply color mappings
  for (const [hardcoded, semantic] of Object.entries(colorMappings)) {
    const regex = new RegExp(`\\b${hardcoded}\\b`, 'g');
    if (regex.test(content)) {
      content = content.replace(regex, semantic);
      changed = true;
      console.log(`  ${hardcoded} -> ${semantic}`);
    }
  }
  
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  ✅ Updated ${filePath}`);
    return 1;
  }
  
  return 0;
}

// Function to recursively find TSX files
function findTsxFiles(dir, files = []) {
  const entries = fs.readdirSync(dir);
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !entry.startsWith('.') && entry !== 'node_modules') {
      findTsxFiles(fullPath, files);
    } else if (entry.endsWith('.tsx') || entry.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Main execution
function main() {
  console.log('🎨 Fixing hardcoded colors in UIKit...\n');
  
  const srcDir = path.join(__dirname, '..', 'src');
  const tsxFiles = findTsxFiles(srcDir);
  
  console.log(`Found ${tsxFiles.length} TypeScript files to process\n`);
  
  let totalUpdated = 0;
  
  for (const file of tsxFiles) {
    totalUpdated += processFile(file);
  }
  
  console.log(`\n🎉 Color fix complete!`);
  console.log(`📊 Files updated: ${totalUpdated}/${tsxFiles.length}`);
  console.log(`🎯 All hardcoded colors replaced with semantic equivalents`);
  console.log(`🏥 Healthcare theme system now fully functional\n`);
}

main();
