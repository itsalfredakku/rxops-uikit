#!/usr/bin/env node

/**
 * Component Management Dashboard
 * Interactive CLI for component index maintenance
 */

const fs = require('fs');
const path = require('path');

class ComponentDashboard {
  constructor() {
    this.registryPath = './docs/development/COMPONENT_REGISTRY.json';
    this.indexPath = './docs/development/COMPONENT_INDEX.md';
    this.registry = this.loadRegistry();
  }

  loadRegistry() {
    try {
      return JSON.parse(fs.readFileSync(this.registryPath, 'utf8'));
    } catch (error) {
      console.log('⚠️ Registry not found. Run component-indexer.js first.');
      return null;
    }
  }

  /**
   * Display component statistics dashboard
   */
  showDashboard() {
    if (!this.registry) return;

    console.log('\n🎛️  COMPONENT MANAGEMENT DASHBOARD');
    console.log('=' .repeat(60));
    console.log(`📊 Generated: ${new Date(this.registry.metadata.generatedAt).toLocaleString()}`);
    console.log(`📦 Total Components: ${this.registry.stats.total}`);
    console.log('');

    // Migration progress bar
    this.showProgressBar();
    
    // Category breakdown with health indicators
    this.showCategoryHealth();
    
    // Top issues and recommendations
    this.showRecommendations();
  }

  /**
   * Show visual progress bar for migration status
   */
  showProgressBar() {
    const { migrated, needsMigration, total } = this.registry.stats;
    const percentage = Math.round((migrated / total) * 100);
    const barLength = 30;
    const filledLength = Math.round((percentage / 100) * barLength);
    
    const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
    
    console.log('🔄 Migration Progress:');
    console.log(`   [${bar}] ${percentage}%`);
    console.log(`   ✅ Migrated: ${migrated} | ⚠️ Pending: ${needsMigration} | 🟢 Stable: ${this.registry.stats.stable}`);
    console.log('');
  }

  /**
   * Show category health with indicators
   */
  showCategoryHealth() {
    console.log('📂 Category Health:');
    console.log('   Category        | Count | Migrated | Status');
    console.log('   ' + '-'.repeat(45));

    Object.entries(this.registry.components).forEach(([category, components]) => {
      if (components.length === 0) return;
      
      const migrated = components.filter(c => c.migrationStatus === 'migrated').length;
      const stable = components.filter(c => c.status === 'stable').length;
      const percentage = Math.round((migrated / components.length) * 100);
      
      let healthIndicator = '🔴'; // Poor
      if (percentage >= 80) healthIndicator = '🟢'; // Good
      else if (percentage >= 50) healthIndicator = '🟡'; // Medium
      else if (percentage >= 20) healthIndicator = '🟠'; // Fair
      
      const categoryPadded = (category + ' '.repeat(15)).substring(0, 15);
      const countPadded = (components.length.toString() + ' '.repeat(5)).substring(0, 5);
      const migratedPadded = (`${migrated}/${components.length}` + ' '.repeat(8)).substring(0, 8);
      
      console.log(`   ${categoryPadded} | ${countPadded} | ${migratedPadded} | ${healthIndicator} ${percentage}%`);
    });
    console.log('');
  }

  /**
   * Show actionable recommendations
   */
  showRecommendations() {
    console.log('💡 Recommendations:');
    
    const recommendations = [];
    
    // Migration recommendations
    const atomsPending = this.registry.components.atoms.filter(c => c.migrationStatus === 'pending').length;
    if (atomsPending > 0) {
      recommendations.push(`🔴 CRITICAL: ${atomsPending} atoms need migration (foundation layer)`);
    }
    
    const moleculesPending = this.registry.components.molecules.filter(c => c.migrationStatus === 'pending').length;
    if (moleculesPending > 0) {
      recommendations.push(`🟠 HIGH: ${moleculesPending} molecules need migration`);
    }
    
    // Testing recommendations
    const componentsWithoutTests = this.getAllComponents().filter(c => !c.hasTests).length;
    if (componentsWithoutTests > 0) {
      recommendations.push(`🟡 MEDIUM: ${componentsWithoutTests} components missing tests`);
    }
    
    // Complexity recommendations
    const highComplexityComponents = this.getAllComponents().filter(c => 
      c.complexity === 'high' || c.complexity === 'very-high'
    ).length;
    if (highComplexityComponents > 0) {
      recommendations.push(`🟡 MEDIUM: ${highComplexityComponents} components have high complexity`);
    }
    
    // Accessibility recommendations
    const componentsWithoutA11y = this.getAllComponents().filter(c => !c.accessibility).length;
    if (componentsWithoutA11y > 0) {
      recommendations.push(`🟠 HIGH: ${componentsWithoutA11y} components missing accessibility features`);
    }
    
    if (recommendations.length === 0) {
      console.log('   🎉 All systems healthy! No immediate actions needed.');
    } else {
      recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec}`);
      });
    }
    console.log('');
  }

  /**
   * Get all components as flat array
   */
  getAllComponents() {
    return Object.values(this.registry.components).flat();
  }

  /**
   * Show detailed component information
   */
  showComponentDetails(componentName) {
    const allComponents = this.getAllComponents();
    const component = allComponents.find(c => 
      c.name.toLowerCase() === componentName.toLowerCase()
    );
    
    if (!component) {
      console.log(`❌ Component '${componentName}' not found`);
      return;
    }
    
    console.log(`\n📦 Component: ${component.name}`);
    console.log('=' .repeat(40));
    console.log(`📁 File: ${component.file}`);
    console.log(`📂 Category: ${component.category}`);
    console.log(`📅 Last Modified: ${component.lastModified}`);
    console.log(`📏 Size: ${(component.size / 1024).toFixed(1)}KB`);
    console.log(`🔄 Migration Status: ${component.migrationStatus}`);
    console.log(`🟢 Status: ${component.status}`);
    console.log(`🧪 Has Tests: ${component.hasTests ? '✅' : '❌'}`);
    console.log(`♿ Accessibility: ${component.accessibility ? '✅' : '❌'}`);
    console.log(`🎯 Complexity: ${component.complexity}`);
    
    if (component.dependencies.length > 0) {
      console.log(`📦 Dependencies: ${component.dependencies.join(', ')}`);
    }
    
    if (component.exports.length > 0) {
      console.log(`📤 Exports: ${component.exports.join(', ')}`);
    }
    
    console.log('');
  }

  /**
   * List components by status
   */
  listComponentsByStatus(status) {
    const components = this.getAllComponents().filter(c => 
      c.status === status || c.migrationStatus === status
    );
    
    if (components.length === 0) {
      console.log(`No components found with status: ${status}`);
      return;
    }
    
    console.log(`\n📋 Components with status: ${status}`);
    console.log('=' .repeat(50));
    
    components.forEach(component => {
      const statusIcon = this.getStatusIcon(component.status);
      const migrationIcon = this.getMigrationIcon(component.migrationStatus);
      console.log(`${statusIcon}${migrationIcon} ${component.name} (${component.category})`);
    });
    console.log('');
  }

  /**
   * Generate migration plan for next batch
   */
  generateMigrationPlan() {
    console.log('\n🗓️  NEXT MIGRATION BATCH PLAN');
    console.log('=' .repeat(50));
    
    // Prioritize atoms first (foundation)
    const atomsToMigrate = this.registry.components.atoms
      .filter(c => c.migrationStatus === 'pending')
      .slice(0, 5);
    
    // Then molecules
    const moleculesToMigrate = this.registry.components.molecules
      .filter(c => c.migrationStatus === 'pending')
      .slice(0, 3);
    
    // Healthcare components
    const healthcareToMigrate = this.registry.components.healthcare
      .filter(c => c.migrationStatus === 'pending')
      .slice(0, 2);
    
    if (atomsToMigrate.length > 0) {
      console.log('🔴 CRITICAL - Atoms (Foundation):');
      atomsToMigrate.forEach(c => {
        console.log(`   • ${c.name} (${c.file})`);
      });
      console.log('');
    }
    
    if (moleculesToMigrate.length > 0) {
      console.log('🟠 HIGH - Molecules:');
      moleculesToMigrate.forEach(c => {
        console.log(`   • ${c.name} (${c.file})`);
      });
      console.log('');
    }
    
    if (healthcareToMigrate.length > 0) {
      console.log('🟡 MEDIUM - Healthcare:');
      healthcareToMigrate.forEach(c => {
        console.log(`   • ${c.name} (${c.file})`);
      });
      console.log('');
    }
    
    const totalInBatch = atomsToMigrate.length + moleculesToMigrate.length + healthcareToMigrate.length;
    console.log(`📊 Batch Size: ${totalInBatch} components`);
    console.log(`⏱️  Estimated Time: ${totalInBatch * 2}-${totalInBatch * 4} hours`);
    console.log(`🎯 Efficiency: Smart batch processing (70-90% time savings)`);
  }

  /**
   * Get status icon
   */
  getStatusIcon(status) {
    const icons = {
      'stable': '🟢',
      'stabilizing': '🟡',
      'needs-migration': '🔴',
      'unknown': '⚪'
    };
    return icons[status] || '⚪';
  }

  /**
   * Get migration icon
   */
  getMigrationIcon(migrationStatus) {
    const icons = {
      'migrated': '✅',
      'partial': '🔄',
      'pending': '⏳',
      'n/a': '➖',
      'unknown': '❓'
    };
    return icons[migrationStatus] || '❓';
  }

  /**
   * CLI interface
   */
  runCLI() {
    const args = process.argv.slice(2);
    const command = args[0];
    
    switch (command) {
      case 'dashboard':
      case undefined:
        this.showDashboard();
        break;
        
      case 'component':
        if (args[1]) {
          this.showComponentDetails(args[1]);
        } else {
          console.log('Usage: node component-dashboard.js component <component-name>');
        }
        break;
        
      case 'status':
        if (args[1]) {
          this.listComponentsByStatus(args[1]);
        } else {
          console.log('Usage: node component-dashboard.js status <status>');
          console.log('Available statuses: stable, stabilizing, needs-migration, migrated, pending');
        }
        break;
        
      case 'plan':
        this.generateMigrationPlan();
        break;
        
      case 'help':
        this.showHelp();
        break;
        
      default:
        console.log(`Unknown command: ${command}`);
        this.showHelp();
    }
  }

  /**
   * Show help information
   */
  showHelp() {
    console.log('\n🎛️  Component Management Dashboard');
    console.log('Usage: node component-dashboard.js [command] [options]');
    console.log('');
    console.log('Commands:');
    console.log('  dashboard          Show main dashboard (default)');
    console.log('  component <name>   Show detailed component information');
    console.log('  status <status>    List components by status');
    console.log('  plan              Generate next migration batch plan');
    console.log('  help              Show this help message');
    console.log('');
    console.log('Examples:');
    console.log('  node component-dashboard.js');
    console.log('  node component-dashboard.js component Button');
    console.log('  node component-dashboard.js status pending');
    console.log('  node component-dashboard.js plan');
    console.log('');
  }
}

// Run CLI if called directly
if (require.main === module) {
  const dashboard = new ComponentDashboard();
  dashboard.runCLI();
}

module.exports = ComponentDashboard;
