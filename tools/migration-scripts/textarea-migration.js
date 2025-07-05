#!/usr/bin/env node

/**
 * TextArea Component Migration Script
 * 
 * Migrates raw <textarea> HTML elements to semantic TextArea components.
 * This script helps automate the migration from raw HTML textareas to the
 * purpose-driven TextArea component with healthcare-specific enhancements.
 * 
 * Usage:
 *   node tools/migration-scripts/textarea-migration.js [file-path]
 *   node tools/migration-scripts/textarea-migration.js src/healthcare/
 * 
 * What this script does:
 * 1. Finds raw <textarea> HTML elements in TSX files
 * 2. Converts them to semantic <TextArea> components
 * 3. Maps appropriate healthcare-specific purposes based on context
 * 4. Adds proper imports and updates event handlers
 * 5. Preserves existing functionality while adding semantic enhancements
 */

import fs from 'fs';
import path from 'path';
import globPkg from 'glob';
const { glob } = globPkg;

// Healthcare context mapping for automatic purpose detection
const HEALTHCARE_CONTEXT_MAPPING = {
  // Clinical documentation
  'clinical': 'notes',
  'notes': 'notes',
  'observation': 'notes',
  'finding': 'notes',
  
  // Patient symptoms and conditions
  'symptom': 'symptoms',
  'complaint': 'symptoms',
  'presentation': 'symptoms',
  
  // Medical history
  'history': 'history',
  'background': 'history',
  'past': 'history',
  
  // Treatment and care
  'treatment': 'treatment',
  'care': 'treatment',
  'plan': 'treatment',
  'therapy': 'treatment',
  
  // Medications
  'medication': 'medication',
  'drug': 'medication',
  'prescription': 'medication',
  'dosage': 'medication',
  'instruction': 'medication',
  
  // Consultations
  'consultation': 'consultation',
  'review': 'consultation',
  'assessment': 'consultation',
  
  // Emergency contexts
  'emergency': 'emergency',
  'urgent': 'emergency',
  'critical': 'emergency',
  'alert': 'emergency',
  
  // Discharge and follow-up
  'discharge': 'discharge',
  'followup': 'discharge',
  'summary': 'discharge',
  
  // Diagnosis
  'diagnosis': 'diagnosis',
  'condition': 'diagnosis',
  'assessment': 'diagnosis',
  
  // General purposes
  'comment': 'comments',
  'description': 'description',
  'reason': 'reason',
  'general': 'general'
};

// Purpose-specific configurations
const PURPOSE_CONFIGS = {
  notes: { rows: 4, maxLength: 2000 },
  symptoms: { rows: 4, maxLength: 2000 },
  history: { rows: 5, maxLength: 3000 },
  treatment: { rows: 5, maxLength: 3000 },
  medication: { rows: 4, maxLength: 2000 },
  consultation: { rows: 6, maxLength: 4000 },
  emergency: { rows: 4, maxLength: 2000 },
  discharge: { rows: 5, maxLength: 3000 },
  diagnosis: { rows: 4, maxLength: 2500 },
  comments: { rows: 3, maxLength: 1000 },
  description: { rows: 3, maxLength: 1500 },
  reason: { rows: 3, maxLength: 1000 },
  instructions: { rows: 4, maxLength: 2500 },
  general: { rows: 4, maxLength: 1500 }
};

function detectPurposeFromContext(textareaContent, surroundingContent) {
  const content = (textareaContent + ' ' + surroundingContent).toLowerCase();
  
  // Look for healthcare-specific keywords
  for (const [keyword, purpose] of Object.entries(HEALTHCARE_CONTEXT_MAPPING)) {
    if (content.includes(keyword)) {
      return purpose;
    }
  }
  
  // Default fallback based on common patterns
  if (content.includes('note') || content.includes('clinical')) return 'notes';
  if (content.includes('instruct')) return 'instructions';
  if (content.includes('comment')) return 'comments';
  if (content.includes('describ')) return 'description';
  if (content.includes('reason') || content.includes('explain')) return 'reason';
  
  return 'general'; // Default purpose
}

function extractTextareaProps(textareaMatch) {
  const props = {};
  
  // Extract common properties
  const valueMatch = textareaMatch.match(/value=(?:\{([^}]+)\}|"([^"]+)")/);
  if (valueMatch) {
    props.value = valueMatch[1] || valueMatch[2];
  }
  
  const placeholderMatch = textareaMatch.match(/placeholder=(?:\{([^}]+)\}|"([^"]+)")/);
  if (placeholderMatch) {
    props.placeholder = placeholderMatch[1] || placeholderMatch[2];
  }
  
  const rowsMatch = textareaMatch.match(/rows=(?:\{([^}]+)\}|(\d+))/);
  if (rowsMatch) {
    props.rows = rowsMatch[1] || rowsMatch[2];
  }
  
  const disabledMatch = textareaMatch.match(/disabled(?:=\{([^}]+)\})?/);
  if (disabledMatch) {
    props.disabled = disabledMatch[1] || 'true';
  }
  
  const requiredMatch = textareaMatch.match(/required(?:=\{([^}]+)\})?/);
  if (requiredMatch) {
    props.required = requiredMatch[1] || 'true';
  }
  
  const maxLengthMatch = textareaMatch.match(/maxLength=(?:\{([^}]+)\}|(\d+))/);
  if (maxLengthMatch) {
    props.maxLength = maxLengthMatch[1] || maxLengthMatch[2];
  }
  
  // Extract event handlers
  const onInputMatch = textareaMatch.match(/onInput\$=\{([^}]+)\}/);
  if (onInputMatch) {
    props.onInput = onInputMatch[1];
  }
  
  const onChangeMatch = textareaMatch.match(/onChange\$=\{([^}]+)\}/);
  if (onChangeMatch) {
    props.onChange = onChangeMatch[1];
  }
  
  return props;
}

function findNearbyLabel(content, textareaIndex) {
  // Look for label elements before the textarea
  const beforeContent = content.substring(Math.max(0, textareaIndex - 500), textareaIndex);
  const labelMatch = beforeContent.match(/<label[^>]*>([^<]+)<\/label>/);
  if (labelMatch) {
    return labelMatch[1].trim();
  }
  
  // Look for label text in nearby content
  const nearbyContent = content.substring(Math.max(0, textareaIndex - 200), textareaIndex + 200);
  const textMatches = nearbyContent.match(/"([^"]+)"/g);
  if (textMatches) {
    for (const match of textMatches) {
      const text = match.replace(/"/g, '');
      if (text.length > 3 && text.length < 50 && /^[A-Za-z\s]+$/.test(text)) {
        return text;
      }
    }
  }
  
  return null;
}

function buildTextareaComponent(purpose, label, props) {
  const config = PURPOSE_CONFIGS[purpose] || PURPOSE_CONFIGS.general;
  
  let componentProps = [];
  
  // Add purpose
  componentProps.push(`purpose="${purpose}"`);
  
  // Add label if found
  if (label) {
    componentProps.push(`label="${label}"`);
  }
  
  // Add value binding
  if (props.value) {
    componentProps.push(`value={${props.value}}`);
  }
  
  // Add change handler (convert from onInput to onChange)
  if (props.onInput) {
    // Convert onInput pattern to onChange pattern
    const handler = props.onInput.replace(/onInput\$=\{([^}]+)\}/, '$1');
    const convertedHandler = handler.replace(
      /\([^)]+\)\s*=>\s*([^=]+)\s*=\s*\([^)]+target[^)]+\)\.value/,
      '(value) => $1 = value'
    );
    componentProps.push(`onChange$={${convertedHandler}}`);
  } else if (props.onChange) {
    componentProps.push(`onChange$={${props.onChange}}`);
  }
  
  // Add other props
  if (props.placeholder && !props.placeholder.includes('...')) {
    componentProps.push(`placeholder={${props.placeholder}}`);
  }
  
  if (props.disabled) {
    componentProps.push(`disabled={${props.disabled}}`);
  }
  
  if (props.required) {
    componentProps.push(`required={${props.required}}`);
  }
  
  // Only add rows if different from purpose default
  if (props.rows && parseInt(props.rows) !== config.rows) {
    componentProps.push(`rows={${props.rows}}`);
  }
  
  if (props.maxLength) {
    componentProps.push(`maxLength={${props.maxLength}}`);
  }
  
  return `<Textarea ${componentProps.join(' ')} />`;
}

function migrateTextareasInFile(content) {
  let modified = content;
  let changes = [];
  let hasChanges = false;
  
  // Find all textarea elements
  const textareaRegex = /<textarea[^>]*>[\s\S]*?<\/textarea>/g;
  let match;
  
  const textareas = [];
  while ((match = textareaRegex.exec(content)) !== null) {
    textareas.push({
      match: match[0],
      index: match.index
    });
  }
  
  // Process textareas in reverse order to maintain indices
  for (let i = textareas.length - 1; i >= 0; i--) {
    const textarea = textareas[i];
    const textareaContent = textarea.match;
    
    // Get surrounding content for context detection
    const surroundingStart = Math.max(0, textarea.index - 300);
    const surroundingEnd = Math.min(content.length, textarea.index + textareaContent.length + 300);
    const surroundingContent = content.substring(surroundingStart, surroundingEnd);
    
    // Detect purpose from context
    const purpose = detectPurposeFromContext(textareaContent, surroundingContent);
    
    // Find nearby label
    const label = findNearbyLabel(content, textarea.index);
    
    // Extract props
    const props = extractTextareaProps(textareaContent);
    
    // Build replacement component
    const replacement = buildTextareaComponent(purpose, label, props);
    
    // Replace in content
    modified = modified.substring(0, textarea.index) + 
               replacement + 
               modified.substring(textarea.index + textareaContent.length);
    
    changes.push({
      purpose,
      label,
      before: textareaContent,
      after: replacement,
      location: `Line ~${content.substring(0, textarea.index).split('\\n').length}`
    });
    
    hasChanges = true;
  }
  
  return {
    content: modified,
    hasChanges,
    changes
  };
}

function addTextareaImport(content) {
  // Check if Textarea is already imported
  if (content.includes('Textarea') && content.includes('from')) {
    return content;
  }
  
  // Find existing imports from the same path
  const textareaImportRegex = /import\s*\{([^}]+)\}\s*from\s*['"]([^'"]*textarea[^'"]*)['"]/;
  const match = content.match(textareaImportRegex);
  
  if (match) {
    // Add to existing import
    const imports = match[1];
    if (!imports.includes('Textarea')) {
      const newImports = imports.trim() + ', Textarea';
      return content.replace(match[0], `import { ${newImports} } from "${match[2]}"`);
    }
  } else {
    // Add new import - find the right path based on file location
    const importPath = '../../../core/atoms/textarea/textarea'; // Adjust based on typical file structure
    const importStatement = `import { Textarea } from "${importPath}";\n`;
    
    // Add after other imports
    const lastImportMatch = content.match(/^import.*$/gm);
    if (lastImportMatch) {
      const lastImport = lastImportMatch[lastImportMatch.length - 1];
      const insertIndex = content.indexOf(lastImport) + lastImport.length;
      return content.substring(0, insertIndex) + '\n' + importStatement + content.substring(insertIndex);
    } else {
      // Add at the beginning
      return importStatement + '\n' + content;
    }
  }
  
  return content;
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Skip files that don't contain textarea elements
    if (!content.includes('<textarea')) {
      return;
    }
    
    console.log(`\n📝 Processing: ${filePath}`);
    
    const result = migrateTextareasInFile(content);
    
    if (result.hasChanges) {
      // Add Textarea import
      const finalContent = addTextareaImport(result.content);
      
      // Write the modified file
      fs.writeFileSync(filePath, finalContent);
      
      console.log(`✅ Migrated ${result.changes.length} textarea element(s):`);
      result.changes.forEach((change, index) => {
        console.log(`\n   ${index + 1}. ${change.purpose.toUpperCase()} textarea at ${change.location}:`);
        if (change.label) {
          console.log(`      Label: "${change.label}"`);
        }
        console.log(`      Before: ${change.before.substring(0, 80)}...`);
        console.log(`      After:  ${change.after}`);
      });
    } else {
      console.log(`ℹ️  No textarea elements found or already using Textarea component`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

// Main execution
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`
🔄 TextArea Component Migration Script

Usage:
  node tools/migration-scripts/textarea-migration.js [file-path-pattern]

Examples:
  node tools/migration-scripts/textarea-migration.js src/healthcare/billing/billing-card.tsx
  node tools/migration-scripts/textarea-migration.js "src/healthcare/**/*.tsx"
  node tools/migration-scripts/textarea-migration.js "src/**/*.tsx"

This script will:
✨ Replace raw <textarea> elements with semantic <Textarea> components
🏥 Detect healthcare context and assign appropriate purposes
🎯 Preserve existing functionality while adding semantic enhancements
📚 Add proper imports and update event handlers
♿ Improve accessibility through component features

Healthcare purposes detected:
- notes: Clinical observations and findings
- symptoms: Patient symptom documentation
- history: Medical history and background
- treatment: Treatment plans and therapy notes
- medication: Medication instructions and dosages
- consultation: Consultation and review notes
- emergency: Emergency communications and alerts
- diagnosis: Diagnostic assessments
- And more...
  `);
  process.exit(1);
}

console.log('🚀 Starting TextArea Migration...\n');

args.forEach(pattern => {
  if (fs.existsSync(pattern) && fs.lstatSync(pattern).isFile()) {
    // Single file
    processFile(pattern);
  } else {
    // Glob pattern
    const files = glob.sync(pattern, { 
      ignore: ['**/node_modules/**', '**/lib/**', '**/dist/**', '**/*.d.ts'] 
    });
    
    if (files.length === 0) {
      console.log(`⚠️  No files found matching pattern: ${pattern}`);
      return;
    }
    
    console.log(`📁 Found ${files.length} files matching: ${pattern}`);
    files.forEach(processFile);
  }
});

console.log(`
✅ TextArea migration complete!

Next steps:
1. Review the changes to ensure proper purpose assignment
2. Test textarea functionality and form submissions
3. Verify healthcare-specific enhancements are working
4. Update any custom styling that might conflict
5. Run accessibility tests to verify improvements

For more information, see:
- docs/components/textarea/semantic-first-approach.md
- docs/design-system/migration-semantic-first.md
`);
