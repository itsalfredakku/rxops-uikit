#!/usr/bin/env node

/**
 * Healthcare UIKit Bundle Analyzer
 * Analyzes bundle size and performance for medical device compatibility
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const rootDir = resolve(__dirname, '..');

// Healthcare bundle size targets for medical devices
const HEALTHCARE_TARGETS = {
  core: 100, // KB - Core components
  healthcare: 150, // KB - Healthcare-specific components
  total: 250, // KB - Total bundle size
  mobile: 50, // KB - Critical components for mobile devices
  emergency: 25, // KB - Emergency/critical components only
};

// Medical device performance targets
const PERFORMANCE_TARGETS = {
  loadTime: 3000, // ms - 3G network target
  interactivity: 1000, // ms - Time to interactive
  accessibility: 100, // score - WCAG 2.1 AA compliance
};

class HealthcareBundleAnalyzer {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      bundles: {},
      components: {},
      healthcare: {},
      performance: {},
      recommendations: [],
    };
  }

  async analyze() {
    console.log('🏥 Healthcare UIKit Bundle Analysis Starting...\n');
    
    try {
      await this.analyzeBundles();
      await this.analyzeComponents();
      await this.analyzeHealthcareComponents();
      await this.generateRecommendations();
      await this.generateReport();
      
      console.log('✅ Bundle analysis complete! See bundle-analysis-report.json');
    } catch (error) {
      console.error('❌ Bundle analysis failed:', error);
      process.exit(1);
    }
  }

  async analyzeBundles() {
    console.log('📦 Analyzing bundle sizes...');
    
    const libDir = join(rootDir, 'lib');
    if (!existsSync(libDir)) {
      console.log('⚠️  No lib directory found. Building library first...');
      return;
    }

    // Analyze main bundles
    const bundles = ['index.qwik.mjs', 'index.qwik.cjs'];
    
    for (const bundle of bundles) {
      const bundlePath = join(libDir, bundle);
      if (existsSync(bundlePath)) {
        const stats = this.getFileStats(bundlePath);
        this.results.bundles[bundle] = {
          size: stats.size,
          sizeKB: Math.round(stats.size / 1024 * 100) / 100,
          withinTarget: stats.size / 1024 < HEALTHCARE_TARGETS.total,
          target: HEALTHCARE_TARGETS.total + 'KB',
        };
        
        console.log(`  ${bundle}: ${this.results.bundles[bundle].sizeKB}KB`);
      }
    }
  }

  async analyzeComponents() {
    console.log('\n🧩 Analyzing component structure...');
    
    const srcDir = join(rootDir, 'src');
    const categories = ['atoms', 'molecules', 'organisms'];
    
    for (const category of categories) {
      const categoryPath = join(srcDir, 'core', category);
      if (existsSync(categoryPath)) {
        this.results.components[category] = await this.analyzeCategory(categoryPath);
        console.log(`  ${category}: ${this.results.components[category].count} components`);
      }
    }
  }

  async analyzeHealthcareComponents() {
    console.log('\n🏥 Analyzing healthcare-specific components...');
    
    const healthcareDir = join(rootDir, 'src', 'healthcare');
    if (existsSync(healthcareDir)) {
      this.results.healthcare = await this.analyzeHealthcareDir(healthcareDir);
      console.log(`  Healthcare components: ${this.results.healthcare.totalComponents}`);
      console.log(`  Clinical impact components: ${this.results.healthcare.clinicalComponents}`);
    }
  }

  async analyzeCategory(categoryPath) {
    let count = 0;
    let totalSize = 0;
    const components = {};
    
    try {
      const items = readdirSync(categoryPath, { withFileTypes: true });
      
      for (const item of items) {
        if (item.isDirectory()) {
          const componentPath = join(categoryPath, item.name);
          const componentStats = await this.analyzeComponent(componentPath);
          components[item.name] = componentStats;
          count++;
          totalSize += componentStats.size;
        }
      }
    } catch (error) {
      console.log(`    Warning: Could not analyze ${categoryPath}`);
    }
    
    return {
      count,
      totalSize,
      averageSize: count > 0 ? Math.round(totalSize / count) : 0,
      components,
    };
  }

  async analyzeComponent(componentPath) {
    let size = 0;
    let files = 0;
    const fileTypes = {};
    
    try {
      const items = readdirSync(componentPath, { withFileTypes: true });
      
      for (const item of items) {
        if (item.isFile()) {
          const filePath = join(componentPath, item.name);
          const stats = statSync(filePath);
          const ext = item.name.split('.').pop();
          
          size += stats.size;
          files++;
          fileTypes[ext] = (fileTypes[ext] || 0) + 1;
        }
      }
    } catch (error) {
      // Component directory doesn't exist or is inaccessible
    }
    
    return {
      size,
      files,
      fileTypes,
      sizeKB: Math.round(size / 1024 * 100) / 100,
    };
  }

  async analyzeHealthcareDir(healthcareDir) {
    let totalComponents = 0;
    let clinicalComponents = 0;
    const categories = {};
    
    try {
      const items = readdirSync(healthcareDir, { withFileTypes: true });
      
      for (const item of items) {
        if (item.isDirectory()) {
          const categoryPath = join(healthcareDir, item.name);
          const categoryStats = await this.analyzeCategory(categoryPath);
          categories[item.name] = categoryStats;
          totalComponents += categoryStats.count;
          
          // Count clinical impact components
          if (item.name.includes('clinical') || item.name.includes('medical')) {
            clinicalComponents += categoryStats.count;
          }
        }
      }
    } catch (error) {
      console.log(`    Warning: Could not analyze healthcare directory`);
    }
    
    return {
      totalComponents,
      clinicalComponents,
      categories,
    };
  }

  generateRecommendations() {
    console.log('\n💡 Generating healthcare optimization recommendations...');
    
    // Bundle size recommendations
    for (const [bundle, stats] of Object.entries(this.results.bundles)) {
      if (!stats.withinTarget) {
        this.results.recommendations.push({
          type: 'bundle-size',
          priority: 'high',
          message: `${bundle} (${stats.sizeKB}KB) exceeds healthcare target of ${stats.target}`,
          action: 'Consider code splitting or removing unused components',
        });
      }
    }

    // Component structure recommendations
    if (this.results.components.atoms?.count < 10) {
      this.results.recommendations.push({
        type: 'architecture',
        priority: 'medium',
        message: 'Consider adding more atomic components for better reusability',
        action: 'Break down complex components into smaller atoms',
      });
    }

    // Healthcare-specific recommendations
    if (this.results.healthcare.clinicalComponents < 5) {
      this.results.recommendations.push({
        type: 'healthcare',
        priority: 'high',
        message: 'Limited clinical workflow components available',
        action: 'Prioritize development of clinical decision support components',
      });
    }

    console.log(`  Generated ${this.results.recommendations.length} recommendations`);
  }

  async generateReport() {
    const reportPath = join(rootDir, 'bundle-analysis-report.json');
    const summaryPath = join(rootDir, 'bundle-summary.md');
    
    // JSON report for tooling
    writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    
    // Markdown summary for humans
    const summary = this.generateMarkdownSummary();
    writeFileSync(summaryPath, summary);
    
    console.log(`\n📊 Reports generated:`);
    console.log(`  Detailed: bundle-analysis-report.json`);
    console.log(`  Summary: bundle-summary.md`);
  }

  generateMarkdownSummary() {
    const totalBundleSize = Object.values(this.results.bundles)
      .reduce((sum, bundle) => sum + bundle.sizeKB, 0);
    
    const totalComponents = Object.values(this.results.components)
      .reduce((sum, category) => sum + category.count, 0);

    return `# Healthcare UIKit Bundle Analysis

**Generated:** ${this.results.timestamp}

## 📊 Bundle Overview

- **Total Bundle Size:** ${totalBundleSize}KB
- **Healthcare Target:** ${HEALTHCARE_TARGETS.total}KB
- **Status:** ${totalBundleSize <= HEALTHCARE_TARGETS.total ? '✅ Within target' : '⚠️ Exceeds target'}

## 🧩 Component Summary

- **Total Components:** ${totalComponents}
- **Atoms:** ${this.results.components.atoms?.count || 0}
- **Molecules:** ${this.results.components.molecules?.count || 0}
- **Organisms:** ${this.results.components.organisms?.count || 0}
- **Healthcare Components:** ${this.results.healthcare.totalComponents || 0}

## 💡 Key Recommendations

${this.results.recommendations.map(rec => 
  `- **${rec.type.toUpperCase()}** (${rec.priority}): ${rec.message}`
).join('\n')}

## 🎯 Healthcare Performance Targets

- **Mobile Load Time:** <${PERFORMANCE_TARGETS.loadTime}ms
- **Accessibility Score:** >${PERFORMANCE_TARGETS.accessibility}%
- **Emergency Components:** <${HEALTHCARE_TARGETS.emergency}KB

---
*Generated by Healthcare UIKit Bundle Analyzer*
`;
  }

  getFileStats(filePath) {
    return statSync(filePath);
  }
}

// Run analysis if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const analyzer = new HealthcareBundleAnalyzer();
  analyzer.analyze();
}

export { HealthcareBundleAnalyzer };
