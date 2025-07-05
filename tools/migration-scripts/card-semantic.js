#!/usr/bin/env node

/**
 * Card Component Migration to Semantic-First Approach
 * 
 * This script migrates existing Card component usage to use the new purpose-based API
 * for automatic styling, behavior, and accessibility enhancements.
 * 
 * Usage:
 *   node tools/migration-scripts/card-semantic.js [file-path]
 *   node tools/migration-scripts/card-semantic.js src/healthcare/
 */

import fs from 'fs';
import path from 'path';
import globPkg from 'glob';
const { glob } = globPkg;

// Healthcare context patterns for automatic purpose detection
const healthcarePurposePatterns = {
  'patient-profile': [
    /patient.*profile/i,
    /patient.*info/i,
    /patient.*card/i,
    /demographics/i,
    /patient.*details/i
  ],
  'medical-record': [
    /medical.*record/i,
    /medical.*history/i,
    /lab.*result/i,
    /clinical.*note/i,
    /test.*result/i,
    /report/i
  ],
  'appointment': [
    /appointment/i,
    /schedule/i,
    /booking/i,
    /visit/i,
    /consultation/i
  ],
  'medication': [
    /medication/i,
    /prescription/i,
    /drug/i,
    /pharmacy/i,
    /dosage/i
  ],
  'emergency': [
    /emergency/i,
    /alert/i,
    /urgent/i,
    /critical/i,
    /warning/i
  ],
  'vitals': [
    /vital/i,
    /health.*metric/i,
    /blood.*pressure/i,
    /heart.*rate/i,
    /temperature/i,
    /measurement/i
  ],
  'billing': [
    /billing/i,
    /payment/i,
    /invoice/i,
    /insurance/i,
    /cost/i,
    /financial/i
  ]
};

// General purpose patterns
const generalPurposePatterns = {
  'content': [
    /article/i,
    /content/i,
    /text/i,
    /description/i
  ],
  'navigation': [
    /nav/i,
    /menu/i,
    /sidebar/i,
    /breadcrumb/i
  ],
  'form': [
    /form/i,
    /input/i,
    /field/i,
    /registration/i
  ],
  'data': [
    /table/i,
    /grid/i,
    /list/i,
    /data/i
  ],
  'media': [
    /image/i,
    /video/i,
    /gallery/i,
    /media/i
  ]
};

// Detect purpose from context
function detectPurpose(content, filename) {
  const searchText = (content + ' ' + filename).toLowerCase();
  
  // Check healthcare patterns first (higher priority)
  for (const [purpose, patterns] of Object.entries(healthcarePurposePatterns)) {
    if (patterns.some(pattern => pattern.test(searchText))) {
      return purpose;
    }
  }
  
  // Check general patterns
  for (const [purpose, patterns] of Object.entries(generalPurposePatterns)) {
    if (patterns.some(pattern => pattern.test(searchText))) {
      return purpose;
    }
  }
  
  return null;
}

// Detect manual card configuration patterns
function detectCardConfiguration(cardMatch) {
  const config = {
    variant: null,
    padding: null,
    hoverable: null,
    interactive: null,
    color: null
  };
  
  // Extract variant
  const variantMatch = cardMatch.match(/variant=["']([^"']+)["']/);
  if (variantMatch) {
    config.variant = variantMatch[1];
  }
  
  // Extract padding
  const paddingMatch = cardMatch.match(/padding=["']([^"']+)["']/);
  if (paddingMatch) {
    config.padding = paddingMatch[1];
  }
  
  // Extract boolean props
  config.hoverable = /hoverable(?:=\{true\}|(?!\s*=))/.test(cardMatch);
  config.interactive = /interactive(?:=\{true\}|(?!\s*=))/.test(cardMatch);
  
  // Extract color
  const colorMatch = cardMatch.match(/color=["']([^"']+)["']/);
  if (colorMatch) {
    config.color = colorMatch[1];
  }
  
  return config;
}

// Generate purpose based on manual configuration
function suggestPurposeFromConfig(config) {
  // Emergency patterns
  if (config.color === 'error' || config.variant === 'elevated') {
    return 'emergency';
  }
  
  // Medical record patterns  
  if (config.variant === 'outlined' && !config.hoverable) {
    return 'medical-record';
  }
  
  // Patient profile patterns
  if (config.variant === 'elevated' && config.hoverable && config.interactive) {
    return 'patient-profile';
  }
  
  // Form patterns
  if (config.variant === 'outlined' && config.padding === '6') {
    return 'form';
  }
  
  // Navigation patterns
  if (config.hoverable && config.interactive && config.padding === '3') {
    return 'navigation';
  }
  
  return 'content'; // Default fallback
}

function migrateCardComponent(content, filename) {
  let modifiedContent = content;
  let hasChanges = false;
  
  // Find all Card component usages
  const cardPattern = /<Card\s+([^>]*?)>/g;
  let match;
  
  const changes = [];
  
  while ((match = cardPattern.exec(content)) !== null) {
    const fullMatch = match[0];
    const props = match[1];
    
    // Skip if already has purpose prop
    if (props.includes('purpose=')) {
      continue;
    }
    
    // Detect configuration
    const config = detectCardConfiguration(fullMatch);
    
    // Detect purpose from context
    let suggestedPurpose = detectPurpose(content, filename);
    
    // If no context-based purpose found, suggest based on configuration
    if (!suggestedPurpose) {
      suggestedPurpose = suggestPurposeFromConfig(config);
    }
    
    // Create new Card tag with purpose
    let newCardTag = `<Card purpose="${suggestedPurpose}"`;
    
    // Add any remaining props that aren't covered by purpose
    const propsToKeep = [];
    
    // Keep custom className, style, testId, etc.
    const keepProps = ['className', 'class', 'style', 'testId', 'tabIndex'];
    for (const prop of keepProps) {
      const propMatch = props.match(new RegExp(`${prop}=([^\\s>]+)`));
      if (propMatch) {
        propsToKeep.push(`${prop}=${propMatch[1]}`);
      }
    }
    
    // Check if any props override purpose defaults
    const purposeDefaults = {
      'patient-profile': { variant: 'elevated', padding: '6', hoverable: true, interactive: true },
      'medical-record': { variant: 'outlined', padding: '4', hoverable: false, interactive: true },
      'emergency': { variant: 'elevated', padding: '6', hoverable: false, interactive: true, color: 'error' },
      // ... add other purpose defaults as needed
    };
    
    const defaults = purposeDefaults[suggestedPurpose] || {};
    
    // Keep props that differ from purpose defaults
    if (config.variant && config.variant !== defaults.variant) {
      propsToKeep.push(`variant="${config.variant}"`);
    }
    if (config.padding && config.padding !== defaults.padding) {
      propsToKeep.push(`padding="${config.padding}"`);
    }
    if (config.hoverable !== null && config.hoverable !== defaults.hoverable) {
      propsToKeep.push(config.hoverable ? 'hoverable' : 'hoverable={false}');
    }
    if (config.interactive !== null && config.interactive !== defaults.interactive) {
      propsToKeep.push(config.interactive ? 'interactive' : 'interactive={false}');
    }
    if (config.color && config.color !== defaults.color) {
      propsToKeep.push(`color="${config.color}"`);
    }
    
    if (propsToKeep.length > 0) {
      newCardTag += ' ' + propsToKeep.join(' ');
    }
    
    newCardTag += '>';
    
    changes.push({
      from: fullMatch,
      to: newCardTag,
      purpose: suggestedPurpose,
      reasoning: `Detected ${suggestedPurpose} context from ${filename} content and configuration`
    });
  }
  
  // Apply changes
  for (const change of changes) {
    modifiedContent = modifiedContent.replace(change.from, change.to);
    hasChanges = true;
    
    console.log(`📝 Migrating Card in ${filename}:`);
    console.log(`   Purpose: ${change.purpose}`);
    console.log(`   From: ${change.from}`);
    console.log(`   To: ${change.to}`);
    console.log(`   Reason: ${change.reasoning}\n`);
  }
  
  return { content: modifiedContent, hasChanges, changes };
}

function processFile(filePath) {
  console.log(`🔍 Processing: ${filePath}`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Skip files that don't contain Card components
    if (!content.includes('<Card') && !content.includes('Card.')) {
      return;
    }
    
    const result = migrateCardComponent(content, filePath);
    
    if (result.hasChanges) {
      // Create backup
      const backupPath = filePath + '.backup';
      fs.writeFileSync(backupPath, content);
      
      // Write migrated content
      fs.writeFileSync(filePath, result.content);
      
      console.log(`✅ Migrated ${result.changes.length} Card component(s) in ${filePath}`);
      console.log(`💾 Backup created: ${backupPath}\n`);
    } else {
      console.log(`ℹ️  No migration needed for ${filePath}\n`);
    }
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

function main() {
  console.log('🚀 Starting Card Semantic Migration...\n');
  
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('📋 Usage: node card-semantic.js [file-or-directory-path]');
    console.log('📋 Example: node card-semantic.js src/healthcare/');
    process.exit(1);
  }
  
  const targetPath = args[0];
  
  if (fs.statSync(targetPath).isFile()) {
    // Single file
    processFile(targetPath);
  } else {
    // Directory - find all .tsx files
    const pattern = path.join(targetPath, '**/*.tsx');
    const files = glob.sync(pattern);
    
    console.log(`📁 Found ${files.length} .tsx files in ${targetPath}\n`);
    
    files.forEach(processFile);
  }
  
  console.log('\n✅ Card semantic migration complete!');
  console.log('\nNext steps:');
  console.log('1. Review the migrated Card components for correct purpose assignment');
  console.log('2. Test card functionality and responsive behavior');
  console.log('3. Verify healthcare-specific enhancements are working');
  console.log('4. Update any custom styling that might conflict with new purposes');
  console.log('5. Run accessibility tests to verify improvements');
  console.log('\nFor more information, see:');
  console.log('- docs/components/card/semantic-first-approach.md');
  console.log('- docs/design-system/migration-semantic-first.md');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { migrateCardComponent, detectPurpose };
