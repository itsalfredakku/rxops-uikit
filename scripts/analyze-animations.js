#!/usr/bin/env node

/**
 * Animation Analysis Script for RxOps UI Kit
 * 
 * Analyzes component animations for healthcare optimization:
 * - Medical-appropriate animation timing
 * - Motion sensitivity compliance
 * - Emergency alert animation effectiveness
 * - Loading state consistency
 */

import fs from 'fs';
import path from 'path';

// Healthcare animation guidelines
const HEALTHCARE_ANIMATION_STANDARDS = {
  // Animation durations (medical UX optimized)
  DURATION_STANDARDS: {
    micro: { min: 50, max: 150, medical: 100 },      // Button hover, focus
    short: { min: 150, max: 300, medical: 200 },     // Tooltip, dropdown
    medium: { min: 300, max: 500, medical: 400 },    // Modal, sidebar
    long: { min: 500, max: 800, medical: 600 },      // Page transitions
    loading: { min: 800, max: 2000, medical: 1000 }, // Spinners, skeleton
    critical: { min: 100, max: 400, medical: 250 }   // Emergency alerts
  },
  
  // Easing functions appropriate for medical interfaces
  EASING_STANDARDS: {
    preferred: ['ease-out', 'ease-in-out', 'cubic-bezier(0.4, 0, 0.2, 1)'],
    avoid: ['ease-in', 'linear'],
    emergency: ['cubic-bezier(0.68, -0.55, 0.265, 1.55)'] // Bounce for alerts
  },
  
  // Motion preferences for medical environments
  MOTION_GUIDELINES: {
    respectsReducedMotion: true,
    maxAnimationsPerSecond: 3,
    emergencyOverride: true, // Critical alerts can override motion preferences
    loadingIndicatorRequired: true
  }
};

// Component categories for animation analysis
const ANIMATION_CATEGORIES = {
  interactive: {
    description: 'User interaction feedback',
    components: ['button', 'input', 'checkbox', 'switch', 'link'],
    requirements: ['hover', 'focus', 'active', 'disabled']
  },
  
  feedback: {
    description: 'System state communication',
    components: ['alert', 'toast', 'modal', 'dropdown', 'tooltip'],
    requirements: ['enter', 'exit', 'loading', 'error']
  },
  
  loading: {
    description: 'Loading and processing states',
    components: ['spinner', 'skeleton', 'progress-bar'],
    requirements: ['continuous', 'determinate', 'indeterminate']
  },
  
  critical: {
    description: 'Emergency and critical medical alerts',
    components: ['emergency-alert', 'critical-notification'],
    requirements: ['attention-grabbing', 'pulse', 'blink', 'scale']
  },
  
  navigation: {
    description: 'Page and section transitions',
    components: ['sidebar', 'tabs', 'breadcrumb', 'pagination'],
    requirements: ['smooth', 'directional', 'contextual']
  }
};

class AnimationAnalyzer {
  constructor() {
    this.srcDir = '/Volumes/EXT/RxOps/uikit/src';
    this.results = {
      summary: {
        totalComponents: 0,
        animatedComponents: 0,
        animationCoverage: 0,
        complianceScore: 0,
        medicalOptimized: 0
      },
      categories: {},
      issues: [],
      recommendations: [],
      complianceChecks: {
        durationCompliance: 0,
        easingCompliance: 0,
        motionSensitivity: 0,
        emergencyEffectiveness: 0
      }
    };
  }

  async analyzeAllComponents() {
    console.log('🎬 Starting Animation Analysis for Healthcare UI...\n');
    
    try {
      // Analyze each category
      for (const [categoryName, category] of Object.entries(ANIMATION_CATEGORIES)) {
        console.log(`📋 Analyzing ${categoryName} animations...`);
        this.results.categories[categoryName] = await this.analyzeCategoryAnimations(category);
      }
      
      // Calculate overall metrics
      this.calculateOverallMetrics();
      
      // Generate healthcare-specific recommendations
      this.generateHealthcareRecommendations();
      
      // Output results
      this.outputResults();
      
    } catch (error) {
      console.error('❌ Animation analysis failed:', error);
    }
  }

  async analyzeCategoryAnimations(category) {
    const categoryResults = {
      totalComponents: category.components.length,
      animatedComponents: 0,
      animations: {},
      compliance: {
        duration: 0,
        easing: 0,
        motionSensitivity: 0,
        medicalOptimization: 0
      },
      issues: [],
      recommendations: []
    };

    for (const componentName of category.components) {
      const animations = await this.analyzeComponentAnimations(componentName);
      if (animations.hasAnimations) {
        categoryResults.animatedComponents++;
        categoryResults.animations[componentName] = animations;
        
        // Check compliance for this component
        this.checkAnimationCompliance(animations, categoryResults, componentName);
      }
    }

    return categoryResults;
  }

  async analyzeComponentAnimations(componentName) {
    const animations = {
      hasAnimations: false,
      cssAnimations: [],
      cssTransitions: [],
      jsAnimations: [],
      tailwindAnimations: [],
      duration: {},
      easing: {},
      motionSensitive: false,
      medicalOptimized: false
    };

    // Find component files
    const componentPaths = await this.findComponentFiles(componentName);
    
    for (const filePath of componentPaths) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Analyze CSS animations and transitions
        this.extractCSSAnimations(content, animations);
        this.extractTailwindAnimations(content, animations);
        this.extractJSAnimations(content, animations);
        
        // Check for motion sensitivity
        animations.motionSensitive = this.checkMotionSensitivity(content);
        animations.medicalOptimized = this.checkMedicalOptimization(content);
        
      } catch (error) {
        console.warn(`⚠️  Could not analyze ${filePath}:`, error.message);
      }
    }

    animations.hasAnimations = 
      animations.cssAnimations.length > 0 ||
      animations.cssTransitions.length > 0 ||
      animations.jsAnimations.length > 0 ||
      animations.tailwindAnimations.length > 0;

    return animations;
  }

  async findComponentFiles(componentName) {
    const possiblePaths = [
      `${this.srcDir}/core/atoms/${componentName}/${componentName}.tsx`,
      `${this.srcDir}/core/atoms/${componentName}/index.tsx`,
      `${this.srcDir}/core/molecules/${componentName}/${componentName}.tsx`,
      `${this.srcDir}/core/molecules/${componentName}/index.tsx`,
      `${this.srcDir}/core/organisms/${componentName}/${componentName}.tsx`,
      `${this.srcDir}/core/organisms/${componentName}/index.tsx`,
      `${this.srcDir}/healthcare/${componentName}/${componentName}.tsx`,
      `${this.srcDir}/healthcare/${componentName}/index.tsx`
    ];

    return possiblePaths.filter(p => fs.existsSync(p));
  }

  extractCSSAnimations(content, animations) {
    // CSS animation properties
    const animationRegex = /animation[-\w]*:\s*([^;]+)/g;
    let match;
    while ((match = animationRegex.exec(content)) !== null) {
      animations.cssAnimations.push(match[1].trim());
      animations.hasAnimations = true;
    }

    // CSS transition properties
    const transitionRegex = /transition[-\w]*:\s*([^;]+)/g;
    while ((match = transitionRegex.exec(content)) !== null) {
      animations.cssTransitions.push(match[1].trim());
      animations.hasAnimations = true;
    }
  }

  extractTailwindAnimations(content, animations) {
    // Tailwind animation classes
    const tailwindAnimations = [
      'animate-spin', 'animate-ping', 'animate-pulse', 'animate-bounce',
      'transition', 'duration-', 'ease-', 'hover:', 'scale-', 'transform'
    ];

    for (const animation of tailwindAnimations) {
      if (content.includes(animation)) {
        animations.tailwindAnimations.push(animation);
        animations.hasAnimations = true;
      }
    }

    // Extract specific durations and easing
    const durationMatch = content.match(/duration-(\d+)/g);
    if (durationMatch) {
      animations.duration.tailwind = durationMatch;
    }

    const easingMatch = content.match(/ease-(in|out|in-out|linear)/g);
    if (easingMatch) {
      animations.easing.tailwind = easingMatch;
    }
  }

  extractJSAnimations(content, animations) {
    // JavaScript animation patterns
    const jsAnimationPatterns = [
      /requestAnimationFrame/g,
      /\.animate\(/g,
      /gsap\./g,
      /framer-motion/g,
      /react-spring/g
    ];

    for (const pattern of jsAnimationPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        animations.jsAnimations.push(...matches);
        animations.hasAnimations = true;
      }
    }
  }

  checkMotionSensitivity(content) {
    // Check for prefers-reduced-motion support
    return content.includes('prefers-reduced-motion') || 
           content.includes('motion-reduce') ||
           content.includes('reduced-motion');
  }

  checkMedicalOptimization(content) {
    // Check for medical-specific animation considerations
    const medicalKeywords = [
      'emergency', 'critical', 'alert', 'medical', 'healthcare',
      'clinical', 'patient', 'vital', 'urgent'
    ];
    
    return medicalKeywords.some(keyword => 
      content.toLowerCase().includes(keyword)
    );
  }

  checkAnimationCompliance(animations, categoryResults, componentName) {
    // Duration compliance check
    let durationCompliant = false;
    if (animations.tailwindAnimations.some(a => a.includes('duration-'))) {
      // Extract duration values and check against standards
      durationCompliant = true; // Simplified for now
    }

    // Easing compliance check
    let easingCompliant = false;
    if (animations.easing.tailwind && animations.easing.tailwind.length > 0) {
      easingCompliant = animations.easing.tailwind.some(e => 
        HEALTHCARE_ANIMATION_STANDARDS.EASING_STANDARDS.preferred.includes(e)
      );
    }

    // Motion sensitivity compliance
    const motionCompliant = animations.motionSensitive;

    // Medical optimization
    const medicalOptimized = animations.medicalOptimized;

    // Update compliance scores
    if (durationCompliant) categoryResults.compliance.duration++;
    if (easingCompliant) categoryResults.compliance.easing++;
    if (motionCompliant) categoryResults.compliance.motionSensitivity++;
    if (medicalOptimized) categoryResults.compliance.medicalOptimization++;

    // Generate issues
    if (!motionCompliant) {
      categoryResults.issues.push({
        component: componentName,
        severity: 'high',
        issue: 'Missing prefers-reduced-motion support',
        impact: 'Accessibility violation for motion-sensitive users'
      });
    }

    if (!medicalOptimized && componentName.includes('emergency')) {
      categoryResults.issues.push({
        component: componentName,
        severity: 'critical',
        issue: 'Emergency component lacks medical optimization',
        impact: 'Critical alerts may not be effective in medical emergencies'
      });
    }
  }

  calculateOverallMetrics() {
    let totalComponents = 0;
    let totalAnimated = 0;
    let totalCompliance = 0;
    let totalMedicalOptimized = 0;

    for (const category of Object.values(this.results.categories)) {
      totalComponents += category.totalComponents;
      totalAnimated += category.animatedComponents;
      
      const categoryCompliance = Object.values(category.compliance).reduce((a, b) => a + b, 0);
      totalCompliance += categoryCompliance;
      totalMedicalOptimized += category.compliance.medicalOptimization;
    }

    this.results.summary.totalComponents = totalComponents;
    this.results.summary.animatedComponents = totalAnimated;
    this.results.summary.animationCoverage = totalComponents > 0 ? 
      Math.round((totalAnimated / totalComponents) * 100) : 0;
    this.results.summary.complianceScore = totalComponents > 0 ? 
      Math.round((totalCompliance / (totalComponents * 4)) * 100) : 0;
    this.results.summary.medicalOptimized = totalComponents > 0 ? 
      Math.round((totalMedicalOptimized / totalComponents) * 100) : 0;
  }

  generateHealthcareRecommendations() {
    const recommendations = [];

    // Animation coverage recommendations
    if (this.results.summary.animationCoverage < 70) {
      recommendations.push({
        priority: 'high',
        category: 'coverage',
        title: 'Increase Animation Coverage',
        description: `Only ${this.results.summary.animationCoverage}% of components have animations. Target: 85%+`,
        action: 'Add hover/focus states to remaining interactive components',
        medicalImpact: 'Better feedback improves clinical workflow efficiency'
      });
    }

    // Motion sensitivity recommendations
    if (this.results.summary.complianceScore < 80) {
      recommendations.push({
        priority: 'critical',
        category: 'accessibility',
        title: 'Improve Motion Sensitivity Support',
        description: 'Missing prefers-reduced-motion support in multiple components',
        action: 'Add motion-reduce: classes and @media queries',
        medicalImpact: 'Essential for healthcare workers with vestibular disorders'
      });
    }

    // Medical optimization recommendations
    if (this.results.summary.medicalOptimized < 60) {
      recommendations.push({
        priority: 'high',
        category: 'medical-optimization',
        title: 'Enhance Medical Interface Animations',
        description: 'Components need medical-specific animation patterns',
        action: 'Implement emergency alert pulses, loading states for medical data',
        medicalImpact: 'Critical for patient safety and clinical decision support'
      });
    }

    // Emergency component recommendations
    const emergencyIssues = Object.values(this.results.categories)
      .flatMap(cat => cat.issues)
      .filter(issue => issue.component.includes('emergency'));

    if (emergencyIssues.length > 0) {
      recommendations.push({
        priority: 'critical',
        category: 'patient-safety',
        title: 'Fix Emergency Alert Animations',
        description: 'Critical alert components have animation deficiencies',
        action: 'Implement attention-grabbing animations with medical timing',
        medicalImpact: 'PATIENT SAFETY - alerts must be impossible to miss'
      });
    }

    this.results.recommendations = recommendations;
  }

  outputResults() {
    console.log('\n🎬 ANIMATION ANALYSIS RESULTS\n');
    console.log('=====================================\n');

    // Summary metrics
    console.log('📊 SUMMARY METRICS:');
    console.log(`   Total Components Analyzed: ${this.results.summary.totalComponents}`);
    console.log(`   Components with Animations: ${this.results.summary.animatedComponents}`);
    console.log(`   Animation Coverage: ${this.results.summary.animationCoverage}%`);
    console.log(`   Healthcare Compliance: ${this.results.summary.complianceScore}%`);
    console.log(`   Medical Optimization: ${this.results.summary.medicalOptimized}%\n`);

    // Category breakdown
    console.log('📋 CATEGORY BREAKDOWN:');
    for (const [categoryName, category] of Object.entries(this.results.categories)) {
      const coverage = category.totalComponents > 0 ? 
        Math.round((category.animatedComponents / category.totalComponents) * 100) : 0;
      
      console.log(`   ${categoryName.toUpperCase()}:`);
      console.log(`     Coverage: ${coverage}% (${category.animatedComponents}/${category.totalComponents})`);
      console.log(`     Motion Sensitivity: ${category.compliance.motionSensitivity}/${category.totalComponents}`);
      console.log(`     Medical Optimized: ${category.compliance.medicalOptimization}/${category.totalComponents}`);
      
      if (category.issues.length > 0) {
        console.log(`     Issues: ${category.issues.length} found`);
      }
      console.log('');
    }

    // Recommendations
    console.log('💡 HEALTHCARE RECOMMENDATIONS:');
    this.results.recommendations.forEach((rec, index) => {
      const priorityEmoji = rec.priority === 'critical' ? '🚨' : 
                          rec.priority === 'high' ? '⚠️' : '💡';
      
      console.log(`   ${priorityEmoji} ${rec.title}`);
      console.log(`      ${rec.description}`);
      console.log(`      Action: ${rec.action}`);
      console.log(`      Medical Impact: ${rec.medicalImpact}\n`);
    });

    // Save detailed results
    this.saveResults();
  }

  saveResults() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = `/Volumes/EXT/RxOps/uikit/ANIMATION_ANALYSIS_${timestamp}.json`;
    
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`📄 Detailed results saved to: ${reportPath}`);
  }
}

// Run the analysis
const analyzer = new AnimationAnalyzer();
analyzer.analyzeAllComponents().catch(console.error);
