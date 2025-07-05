#!/usr/bin/env node

/**
 * Component Index Maintenance Script
 * Automatically scans and updates the component registry
 */

const fs = require('fs');
const path = require('path');

const config = {
  srcDir: './src',
  indexFile: './docs/development/COMPONENT_INDEX.md',
  outputFile: './docs/development/COMPONENT_REGISTRY.json'
};

class ComponentIndexer {
  constructor() {
    this.components = {
      atoms: [],
      molecules: [],
      organisms: [],
      healthcare: [],
      layouts: [],
      utilities: []
    };
    this.stats = {
      total: 0,
      migrated: 0,
      needsMigration: 0,
      stable: 0
    };
  }

  /**
   * Scan all component files and categorize them
   */
  scanComponents() {
    console.log('🔍 Scanning component files...');
    
    // Scan core components
    this.scanDirectory(path.join(config.srcDir, 'core/atoms'), 'atoms');
    this.scanDirectory(path.join(config.srcDir, 'core/molecules'), 'molecules'); 
    this.scanDirectory(path.join(config.srcDir, 'core/organisms'), 'organisms');
    
    // Scan healthcare components
    this.scanDirectory(path.join(config.srcDir, 'healthcare'), 'healthcare');
    
    // Scan layout components
    this.scanDirectory(path.join(config.srcDir, 'layouts'), 'layouts');
    
    // Scan utilities
    this.scanDirectory(path.join(config.srcDir, 'utils'), 'utilities');
    this.scanDirectory(path.join(config.srcDir, 'design-system'), 'utilities');
    
    this.calculateStats();
    console.log('✅ Component scan complete');
  }

  /**
   * Scan a directory for component files
   */
  scanDirectory(dirPath, category) {
    if (!fs.existsSync(dirPath)) {
      console.log(`⚠️ Directory not found: ${dirPath}`);
      return;
    }

    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const item of items) {
      if (item.isDirectory()) {
        // Check for component files in subdirectory
        const subDir = path.join(dirPath, item.name);
        const componentFiles = this.findComponentFiles(subDir);
        
        if (componentFiles.length > 0) {
          const component = this.analyzeComponent(subDir, item.name, category);
          this.components[category].push(component);
        }
      } else if (item.name.endsWith('.tsx') && !item.name.includes('.test.')) {
        // Direct component file
        const component = this.analyzeComponent(dirPath, item.name.replace('.tsx', ''), category);
        this.components[category].push(component);
      }
    }
  }

  /**
   * Find component files in a directory
   */
  findComponentFiles(dirPath) {
    if (!fs.existsSync(dirPath)) return [];
    
    const files = fs.readdirSync(dirPath);
    return files.filter(file => 
      file.endsWith('.tsx') && 
      !file.includes('.test.') &&
      !file.includes('__tests__')
    );
  }

  /**
   * Analyze a component and extract metadata
   */
  analyzeComponent(dirPath, componentName, category) {
    const componentFiles = this.findComponentFiles(dirPath);
    const mainFile = componentFiles.find(f => 
      f === 'index.tsx' || 
      f === `${componentName}.tsx` ||
      f.toLowerCase().includes(componentName.toLowerCase())
    ) || componentFiles[0];

    const filePath = path.join(dirPath, mainFile);
    const relativePath = path.relative(config.srcDir, filePath);
    
    // Read file content for analysis
    let content = '';
    try {
      content = fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      console.log(`⚠️ Could not read file: ${filePath}`);
    }

    // Analyze component content
    const analysis = this.analyzeComponentContent(content, componentName);
    
    // Get file stats
    const stats = fs.statSync(filePath);
    
    return {
      name: componentName,
      category,
      file: relativePath,
      lastModified: stats.mtime.toISOString().split('T')[0],
      size: stats.size,
      ...analysis,
      exports: this.extractExports(content),
      dependencies: this.extractDependencies(content),
      hasTests: this.hasTestFiles(dirPath),
      complexity: this.calculateComplexity(content)
    };
  }

  /**
   * Analyze component content for patterns and status
   */
  analyzeComponentContent(content, componentName) {
    const analysis = {
      status: 'unknown',
      migrationStatus: 'unknown',
      hasAtomicComponents: false,
      hasHtmlElements: false,
      hasBaseProps: false,
      hasTypescript: false,
      accessibility: false
    };

    // Check for atomic component usage
    const atomicPatterns = [
      /<Row\s|<Column\s|<Stack\s|<Text\s|<Button\s|<Icon\s|<Badge\s|<Card\s/,
      /from.*atoms|from.*molecules|from.*layouts/
    ];
    analysis.hasAtomicComponents = atomicPatterns.some(pattern => pattern.test(content));

    // Check for HTML elements (indicating migration needed)
    const htmlPatterns = [
      /<div\s|<span\s|<p\s|<h1\s|<h2\s|<h3\s|<button\s|<input\s/,
      /<header\s|<main\s|<section\s|<aside\s|<nav\s/
    ];
    analysis.hasHtmlElements = htmlPatterns.some(pattern => pattern.test(content));

    // Check for BaseComponentProps
    analysis.hasBaseProps = content.includes('BaseComponentProps');

    // Check TypeScript usage
    analysis.hasTypescript = content.includes('interface ') || content.includes('type ');

    // Check accessibility features
    const a11yPatterns = [
      /aria-|role=|tabIndex|onKeyDown|onKeyPress/,
      /alt=|title=|label=/
    ];
    analysis.accessibility = a11yPatterns.some(pattern => pattern.test(content));

    // Determine status based on analysis
    if (analysis.hasAtomicComponents && !analysis.hasHtmlElements) {
      analysis.status = 'stable';
      analysis.migrationStatus = 'migrated';
    } else if (analysis.hasAtomicComponents && analysis.hasHtmlElements) {
      analysis.status = 'stabilizing';  
      analysis.migrationStatus = 'partial';
    } else if (analysis.hasHtmlElements) {
      analysis.status = 'needs-migration';
      analysis.migrationStatus = 'pending';
    } else {
      analysis.status = 'stable';
      analysis.migrationStatus = 'n/a';
    }

    return analysis;
  }

  /**
   * Extract component exports
   */
  extractExports(content) {
    const exports = [];
    const exportPattern = /export\s+(?:const|function|class)\s+(\w+)/g;
    let match;
    
    while ((match = exportPattern.exec(content)) !== null) {
      exports.push(match[1]);
    }
    
    // Check for default export
    if (content.includes('export default')) {
      const defaultMatch = content.match(/export\s+default\s+(\w+)/);
      if (defaultMatch) {
        exports.push(`default: ${defaultMatch[1]}`);
      }
    }
    
    return exports;
  }

  /**
   * Extract component dependencies
   */
  extractDependencies(content) {
    const dependencies = [];
    const importPattern = /import\s+.*?\s+from\s+['"`]([^'"`]+)['"`]/g;
    let match;
    
    while ((match = importPattern.exec(content)) !== null) {
      if (!match[1].startsWith('.')) {
        dependencies.push(match[1]);
      }
    }
    
    return [...new Set(dependencies)]; // Remove duplicates
  }

  /**
   * Check if component has test files
   */
  hasTestFiles(dirPath) {
    try {
      const files = fs.readdirSync(dirPath);
      return files.some(file => 
        file.includes('.test.') || 
        file.includes('.spec.') ||
        fs.existsSync(path.join(dirPath, '__tests__'))
      );
    } catch {
      return false;
    }
  }

  /**
   * Calculate component complexity score
   */
  calculateComplexity(content) {
    const lines = content.split('\n').length;
    const functionCount = (content.match(/function\s+\w+/g) || []).length;
    const hookCount = (content.match(/use\w+/g) || []).length;
    const jsxElements = (content.match(/<\w+/g) || []).length;
    
    // Simple complexity score
    const complexity = Math.round(
      (lines * 0.1) + 
      (functionCount * 2) + 
      (hookCount * 1.5) + 
      (jsxElements * 0.5)
    );
    
    if (complexity < 10) return 'low';
    if (complexity < 25) return 'medium';
    if (complexity < 50) return 'high';
    return 'very-high';
  }

  /**
   * Calculate overall statistics
   */
  calculateStats() {
    const allComponents = [
      ...this.components.atoms,
      ...this.components.molecules, 
      ...this.components.organisms,
      ...this.components.healthcare,
      ...this.components.layouts,
      ...this.components.utilities
    ];

    this.stats.total = allComponents.length;
    this.stats.migrated = allComponents.filter(c => c.migrationStatus === 'migrated').length;
    this.stats.needsMigration = allComponents.filter(c => c.migrationStatus === 'pending').length;
    this.stats.stable = allComponents.filter(c => c.status === 'stable').length;
  }

  /**
   * Generate registry JSON file
   */
  generateRegistry() {
    const registry = {
      metadata: {
        generatedAt: new Date().toISOString(),
        version: '1.0.0',
        totalComponents: this.stats.total
      },
      stats: this.stats,
      components: this.components
    };

    fs.writeFileSync(config.outputFile, JSON.stringify(registry, null, 2));
    console.log(`📄 Registry generated: ${config.outputFile}`);
  }

  /**
   * Generate status report
   */
  generateReport() {
    console.log('\n📊 COMPONENT INDEX REPORT');
    console.log('=' .repeat(50));
    console.log(`📦 Total Components: ${this.stats.total}`);
    console.log(`✅ Migrated: ${this.stats.migrated}`);
    console.log(`⚠️ Needs Migration: ${this.stats.needsMigration}`);
    console.log(`🟢 Stable: ${this.stats.stable}`);
    console.log('');
    
    // Category breakdown
    console.log('📂 Category Breakdown:');
    Object.entries(this.components).forEach(([category, components]) => {
      if (components.length > 0) {
        console.log(`  ${category}: ${components.length} components`);
      }
    });
    console.log('');

    // Migration status by category
    console.log('🔄 Migration Status:');
    Object.entries(this.components).forEach(([category, components]) => {
      if (components.length > 0) {
        const migrated = components.filter(c => c.migrationStatus === 'migrated').length;
        const pending = components.filter(c => c.migrationStatus === 'pending').length;
        const percentage = Math.round((migrated / components.length) * 100);
        console.log(`  ${category}: ${migrated}/${components.length} (${percentage}%)`);
      }
    });
  }

  /**
   * Update the markdown index file
   */
  updateMarkdownIndex() {
    // This would update the COMPONENT_INDEX.md file with current data
    // For now, just log that the registry is available
    console.log(`📝 Registry data available in ${config.outputFile}`);
    console.log('   Use this data to update COMPONENT_INDEX.md');
  }

  /**
   * Run the complete indexing process
   */
  run() {
    console.log('🚀 Starting Component Index Update...\n');
    
    this.scanComponents();
    this.generateRegistry();
    this.generateReport();
    this.updateMarkdownIndex();
    
    console.log('\n✅ Component indexing complete!');
  }
}

// CLI usage
if (require.main === module) {
  const indexer = new ComponentIndexer();
  indexer.run();
}

module.exports = ComponentIndexer;
