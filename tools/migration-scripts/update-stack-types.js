#!/usr/bin/env node

/**
 * This script updates the Stack component type definitions to use numeric values
 * instead of semantic values for the gap property.
 */

const fs = require('fs');
const path = require('path');

// Update the Stack types in design-system/types.ts
const designSystemTypesPath = path.resolve(__dirname, '../../src/design-system/types.ts');
console.log(`Updating ${designSystemTypesPath}...`);

// Read the file
let content = fs.readFileSync(designSystemTypesPath, 'utf8');

// Remove the re-export of Spacing as StackGap
content = content.replace(
  /export type \{.*Spacing as StackGap.*\};/,
  (match) => match.replace('Spacing as StackGap, ', '')
);

// Write back the file
fs.writeFileSync(designSystemTypesPath, content, 'utf8');
console.log('Updated design-system/types.ts');

// Update the stack component type file
const stackTypesPath = path.resolve(__dirname, '../../src/core/organisms/stack/stack.tsx');
if (fs.existsSync(stackTypesPath)) {
  console.log(`Updating ${stackTypesPath}...`);
  
  // Read the file
  let stackContent = fs.readFileSync(stackTypesPath, 'utf8');
  
  // Replace StackGap with Spacing
  stackContent = stackContent.replace(
    /export type StackGap = "none" \| "xs" \| "sm" \| "md" \| "lg" \| "xl";/g,
    'import type { Spacing } from "../../../design-system/types";'
  );
  
  // Update the interface to use Spacing instead of StackGap
  stackContent = stackContent.replace(
    /gap\?: StackGap;/g,
    'gap?: Spacing;'
  );
  
  // Write back the file
  fs.writeFileSync(stackTypesPath, stackContent, 'utf8');
  console.log('Updated stack.tsx');
}

console.log('Type definitions updated successfully!');
console.log('Remember to rebuild the library to apply these changes.');
