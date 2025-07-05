#!/usr/bin/env node

/**
 * Component Analyzer for RxOps UI Restructuring
 * 
 * This script analyzes the current components and categorizes them
 * according to atomic design principles and healthcare domains.
 */

const fs = require('fs');
const path = require('path');

// Component categorization rules
const ATOMIC_CATEGORIES = {
  atoms: [
    'button', 'input', 'badge', 'avatar', 'spinner', 'alert', 
    'checkbox', 'radio', 'switch', 'divider', 'logo'
  ],
  molecules: [
    'form-field', 'search-filter', 'date-time-picker', 'file-upload',
    'breadcrumb', 'pagination', 'toast', 'tooltip'
  ],
  organisms: [
    'header', 'footer', 'data-grid', 'form', 'table', 'tabs',
    'modal', 'list', 'card', 'container', 'grid', 'stack'
  ]
};

const HEALTHCARE_CATEGORIES = {
  patient: [
    'patient-profile', 'patient-card', 'vitals-signs', 
    'medical-history', 'health-dashboard'
  ],
  provider: [
    'provider-dashboard', 'consultation-notes', 
    'prescription-management', 'lab-results', 'doctor-card'
  ],
  appointments: [
    'appointment-calendar', 'appointment-card', 'video-call'
  ],
  medical: [
    'medication-tracker', 'imaging-viewer', 'medical-record',
    'lab-results'
  ],
  emergency: [
    'emergency-alert', 'health-metric'
  ],
  billing: [
    'billing-card', 'service-card'
  ]
};

function analyzeComponents() {
  const componentsDir = path.join(process.cwd(), 'src');
  const components = [];

  function scanDirectory(dir, basePath = '') {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory() && !item.startsWith('.')) {
        const componentName = item;
        const relativePath = path.join(basePath, item);
        
        // Check if it's a component directory (has index file or component file)
        const hasComponent = fs.readdirSync(itemPath).some(file => 
          file.includes('index.') || file.includes(componentName + '.')
        );
        
        if (hasComponent) {
          components.push({
            name: componentName,
            currentPath: relativePath,
            category: categorizeComponent(componentName),
            files: fs.readdirSync(itemPath)
          });
        } else {
          // Recursively scan subdirectories
          scanDirectory(itemPath, relativePath);
        }
      }
    }
  }

  scanDirectory(componentsDir);
  return components;
}

function categorizeComponent(componentName) {
  // Check atomic categories first
  for (const [category, components] of Object.entries(ATOMIC_CATEGORIES)) {
    if (components.includes(componentName)) {
      return `core/${category}`;
    }
  }

  // Check healthcare categories
  for (const [category, components] of Object.entries(HEALTHCARE_CATEGORIES)) {
    if (components.includes(componentName)) {
      return `healthcare/${category}`;
    }
  }

  // Default categorization based on name patterns
  if (componentName.includes('patient') || componentName.includes('health')) {
    return 'healthcare/patient';
  }
  if (componentName.includes('doctor') || componentName.includes('provider')) {
    return 'healthcare/provider';
  }
  if (componentName.includes('appointment')) {
    return 'healthcare/appointments';
  }
  if (componentName.includes('medical') || componentName.includes('medication')) {
    return 'healthcare/medical';
  }
  if (componentName.includes('emergency')) {
    return 'healthcare/emergency';
  }

  // Default to molecules if unsure
  return 'core/molecules';
}

function generateMigrationPlan(components) {
  const migrationPlan = {
    timestamp: new Date().toISOString(),
    totalComponents: components.length,
    categories: {},
    migrations: []
  };

  components.forEach(component => {
    const category = component.category;
    
    if (!migrationPlan.categories[category]) {
      migrationPlan.categories[category] = 0;
    }
    migrationPlan.categories[category]++;

    migrationPlan.migrations.push({
      name: component.name,
      from: `src/${component.currentPath}`,
      to: `src/${category}/${component.name}`,
      files: component.files
    });
  });

  return migrationPlan;
}

function main() {
  console.log('🔍 Analyzing RxOps UI components...\n');

  const components = analyzeComponents();
  const migrationPlan = generateMigrationPlan(components);

  // Save migration plan
  const planPath = path.join(__dirname, 'migration-plan.json');
  fs.writeFileSync(planPath, JSON.stringify(migrationPlan, null, 2));

  console.log(`📊 Analysis Complete!`);
  console.log(`📁 Found ${components.length} components`);
  console.log(`📋 Migration plan saved to: ${planPath}\n`);

  console.log('📈 Component Distribution:');
  Object.entries(migrationPlan.categories).forEach(([category, count]) => {
    console.log(`  ${category}: ${count} components`);
  });

  console.log('\n🚀 Next steps:');
  console.log('1. Review the migration plan in migration-plan.json');
  console.log('2. Run: node tools/migration-scripts/migrate-components.js');
  console.log('3. Update imports with: node tools/migration-scripts/update-imports.js');
}

if (require.main === module) {
  main();
}

module.exports = { analyzeComponents, categorizeComponent, generateMigrationPlan };
