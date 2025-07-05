#!/usr/bin/env node

/**
 * Import Updater for RxOps UI Restructuring
 * 
 * This script updates import statements across the codebase
 * to match the new component locations.
 */

const fs = require('fs');
const path = require('path');

function findAllTSFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const itemPath = path.join(dir, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules' && item !== 'dist') {
      findAllTSFiles(itemPath, files);
    } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
      files.push(itemPath);
    }
  }
  
  return files;
}

function loadMigrationPlan() {
  const planPath = path.join(__dirname, 'migration-plan.json');
  
  if (!fs.existsSync(planPath)) {
    console.error('❌ Migration plan not found. Run component-analyzer.js first.');
    process.exit(1);
  }
  
  return JSON.parse(fs.readFileSync(planPath, 'utf8'));
}

function createImportMappings(migrationPlan) {
  const mappings = new Map();
  
  migrationPlan.migrations.forEach(migration => {
    const oldImport = migration.from.replace('src/', './').replace(/\/$/, '');
    const newImport = migration.to.replace('src/', './').replace(/\/$/, '');
    
    // Handle various import patterns
    mappings.set(oldImport, newImport);
    mappings.set(oldImport + '/', newImport + '/');
    mappings.set(oldImport + '/index', newImport + '/index');
    
    // Handle relative imports from different depths
    mappings.set('../' + migration.name, newImport);
    mappings.set('../../' + migration.name, newImport);
    mappings.set('../../../' + migration.name, newImport);
  });
  
  return mappings;
}

function updateImportsInFile(filePath, mappings) {
  const content = fs.readFileSync(filePath, 'utf8');
  let updatedContent = content;
  let hasChanges = false;
  
  // Update import statements
  mappings.forEach((newPath, oldPath) => {
    const patterns = [
      new RegExp(`from ['"]${oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g'),
      new RegExp(`import\\s+['"]${oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g'),
      new RegExp(`require\\(['"]${oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]\\)`, 'g')
    ];
    
    patterns.forEach(pattern => {
      if (pattern.test(updatedContent)) {
        updatedContent = updatedContent.replace(pattern, (match) => {
          hasChanges = true;
          return match.replace(oldPath, newPath);
        });
      }
    });
  });
  
  if (hasChanges) {
    fs.writeFileSync(filePath, updatedContent);
    return true;
  }
  
  return false;
}

function updatePackageJsonPaths() {
  const packagePath = path.join(process.cwd(), 'package.json');
  
  if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Update exports field if it exists
    if (packageJson.exports) {
      packageJson.exports = {
        ".": {
          "import": "./lib/index.qwik.mjs",
          "require": "./lib/index.qwik.cjs",
          "types": "./lib-types/index.d.ts"
        },
        "./core": {
          "import": "./lib/core/index.qwik.mjs",
          "require": "./lib/core/index.qwik.cjs",
          "types": "./lib-types/core/index.d.ts"
        },
        "./healthcare": {
          "import": "./lib/healthcare/index.qwik.mjs",
          "require": "./lib/healthcare/index.qwik.cjs",
          "types": "./lib-types/healthcare/index.d.ts"
        }
      };
    }
    
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    console.log('📦 Updated package.json exports');
  }
}

function updateTSConfig() {
  const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
  
  if (fs.existsSync(tsconfigPath)) {
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
    
    // Add path mappings for better imports
    if (!tsconfig.compilerOptions) {
      tsconfig.compilerOptions = {};
    }
    
    if (!tsconfig.compilerOptions.paths) {
      tsconfig.compilerOptions.paths = {};
    }
    
    tsconfig.compilerOptions.paths = {
      ...tsconfig.compilerOptions.paths,
      "@rxops/uikit": ["./src/index.ts"],
      "@rxops/uikit/core": ["./src/core/index.ts"],
      "@rxops/uikit/healthcare": ["./src/healthcare/index.ts"],
      "@rxops/uikit/design-system": ["./src/design-system/index.ts"],
      "@rxops/uikit/*": ["./src/*"]
    };
    
    fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
    console.log('⚙️  Updated tsconfig.json paths');
  }
}

function main() {
  console.log('🔄 Updating import statements...\n');

  const migrationPlan = loadMigrationPlan();
  const mappings = createImportMappings(migrationPlan);
  
  console.log(`📝 Created ${mappings.size} import mappings\n`);

  // Find all TypeScript files
  const tsFiles = findAllTSFiles(path.join(process.cwd(), 'src'));
  const demoFiles = findAllTSFiles(path.join(process.cwd(), 'demo/src'));
  const allFiles = [...tsFiles, ...demoFiles];

  console.log(`🔍 Found ${allFiles.length} TypeScript files to check\n`);

  let updatedFiles = 0;

  // Update imports in each file
  allFiles.forEach(filePath => {
    if (updateImportsInFile(filePath, mappings)) {
      console.log(`✅ Updated: ${path.relative(process.cwd(), filePath)}`);
      updatedFiles++;
    }
  });

  console.log('\n📦 Updating configuration files...');
  updatePackageJsonPaths();
  updateTSConfig();

  console.log('\n✨ Import Update Summary:');
  console.log(`📁 Files checked: ${allFiles.length}`);
  console.log(`✅ Files updated: ${updatedFiles}`);
  console.log(`🔗 Import mappings: ${mappings.size}`);

  if (updatedFiles > 0) {
    console.log('\n🎉 Import statements updated successfully!');
    console.log('🧪 Run tests to verify everything works correctly');
  } else {
    console.log('\n📝 No import statements needed updating');
  }
}

if (require.main === module) {
  main();
}

module.exports = { updateImportsInFile, createImportMappings };
