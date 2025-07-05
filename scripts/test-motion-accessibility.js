#!/usr/bin/env node

/**
 * Motion Accessibility Testing Script for RxOps UI Kit
 * 
 * Tests motion sensitivity compliance and healthcare animation effectiveness.
 * Validates that our motion accessibility improvements work correctly.
 */

import fs from 'fs';
import path from 'path';

// Motion accessibility compliance standards
const MOTION_COMPLIANCE_STANDARDS = {
  // CSS properties that should respect reduced motion
  motionSensitiveProperties: [
    'animation',
    'transition',
    'transform',
    'animate-',
    'duration-',
    'ease-',
    'scale-',
    'rotate-',
    'translate-'
  ],
  
  // Required motion-reduce classes/media queries
  requiredMotionReduceSupport: [
    'motion-reduce:',
    '@media (prefers-reduced-motion: reduce)',
    'prefers-reduced-motion',
    'motion-reduce:transition-none',
    'motion-reduce:animate-pulse',
    'motion-reduce:hover:scale-100'
  ],
  
  // Emergency components that may override motion preferences
  emergencyOverrides: [
    'emergency-alert',
    'life-threatening',
    'critical',
    'animate-pulse motion-reduce:animate-pulse'
  ],
  
  // Healthcare timing standards (in ms)
  healthcareTiming: {
    micro: { min: 75, max: 150 },      // Button interactions
    short: { min: 150, max: 250 },     // Tooltips, dropdowns
    emergency: { min: 100, max: 300 }, // Critical alerts
    loading: { min: 500, max: 1000 }   // Loading states
  }
};

class MotionAccessibilityTester {
  constructor() {
    this.srcDir = '/Volumes/EXT/RxOps/uikit/src';
    this.results = {
      summary: {
        totalFiles: 0,
        compliantFiles: 0,
        complianceScore: 0,
        emergencyOverrides: 0,
        motionSafetyViolations: 0
      },
      fileResults: {},
      violations: [],
      recommendations: [],
      healthcareSpecificIssues: []
    };
  }

  async runCompleteTest() {
    console.log('🎬 Testing Motion Accessibility Compliance...\n');
    
    try {
      // Test all component files
      await this.testAllComponentFiles();
      
      // Test our motion accessibility utilities
      await this.testMotionUtilities();
      
      // Test emergency components specifically
      await this.testEmergencyComponents();
      
      // Calculate compliance scores
      this.calculateComplianceScores();
      
      // Generate healthcare recommendations
      this.generateHealthcareRecommendations();
      
      // Output results
      this.outputResults();
      
    } catch (error) {
      console.error('❌ Motion accessibility testing failed:', error);
    }
  }

  async testAllComponentFiles() {
    const componentDirs = [
      'core/atoms',
      'core/molecules', 
      'core/organisms',
      'healthcare'
    ];

    for (const dir of componentDirs) {
      await this.testComponentDirectory(path.join(this.srcDir, dir));
    }
  }

  async testComponentDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) return;
    
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        // Test component files in this directory first
        const componentFiles = fs.readdirSync(itemPath)
          .filter(f => (f.endsWith('.tsx') || f.endsWith('.ts')) && !f.includes('.test.'))
          .map(f => path.join(itemPath, f));
        
        for (const filePath of componentFiles) {
          await this.testComponentFile(filePath);
        }
        
        // Then recursively test subdirectories
        await this.testComponentDirectory(itemPath);
      } else if ((item.endsWith('.tsx') || item.endsWith('.ts')) && !item.includes('.test.')) {
        // Test standalone files in the current directory
        await this.testComponentFile(itemPath);
      }
    }
  }

  async testComponentFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(this.srcDir, filePath);
      
      this.results.totalFiles++;
      
      const fileResult = {
        path: relativePath,
        hasMotionProperties: false,
        hasMotionReduceSupport: false,
        isEmergencyComponent: false,
        violations: [],
        compliance: {
          motionSensitivity: false,
          emergencyOverride: false,
          healthcareTiming: false
        }
      };

      // Check for motion-sensitive properties
      fileResult.hasMotionProperties = this.hasMotionProperties(content);
      
      // Check for motion-reduce support
      fileResult.hasMotionReduceSupport = this.hasMotionReduceSupport(content);
      
      // Check if this is an emergency component
      fileResult.isEmergencyComponent = this.isEmergencyComponent(content, relativePath);
      
      // Test compliance
      this.testFileCompliance(content, fileResult);
      
      // Calculate file compliance score
      const compliantChecks = Object.values(fileResult.compliance).filter(Boolean).length;
      const totalChecks = Object.keys(fileResult.compliance).length;
      fileResult.complianceScore = Math.round((compliantChecks / totalChecks) * 100);
      
      if (fileResult.complianceScore >= 80) {
        this.results.summary.compliantFiles++;
      }
      
      this.results.fileResults[relativePath] = fileResult;
      
    } catch (error) {
      console.warn(`⚠️  Could not test ${filePath}:`, error.message);
    }
  }

  hasMotionProperties(content) {
    return MOTION_COMPLIANCE_STANDARDS.motionSensitiveProperties.some(prop => 
      content.includes(prop)
    );
  }

  hasMotionReduceSupport(content) {
    return MOTION_COMPLIANCE_STANDARDS.requiredMotionReduceSupport.some(support => 
      content.includes(support)
    );
  }

  isEmergencyComponent(content, filePath) {
    const emergencyKeywords = ['emergency', 'critical', 'life-threatening', 'alert'];
    return emergencyKeywords.some(keyword => 
      content.toLowerCase().includes(keyword) || 
      filePath.toLowerCase().includes(keyword)
    );
  }

  testFileCompliance(content, fileResult) {
    // Test 1: Motion sensitivity compliance
    if (fileResult.hasMotionProperties) {
      if (fileResult.hasMotionReduceSupport) {
        fileResult.compliance.motionSensitivity = true;
      } else {
        fileResult.violations.push({
          type: 'motion-sensitivity',
          severity: 'high',
          message: 'Component uses motion properties without motion-reduce support',
          impact: 'Accessibility violation for users with vestibular disorders'
        });
        this.results.summary.motionSafetyViolations++;
      }
    } else {
      // No motion properties, so compliance is not applicable
      fileResult.compliance.motionSensitivity = true;
    }
    
    // Test 2: Emergency override compliance (for critical components)
    if (fileResult.isEmergencyComponent) {
      const hasEmergencyOverride = MOTION_COMPLIANCE_STANDARDS.emergencyOverrides.some(override =>
        content.includes(override)
      );
      
      if (hasEmergencyOverride) {
        fileResult.compliance.emergencyOverride = true;
        this.results.summary.emergencyOverrides++;
      } else {
        fileResult.violations.push({
          type: 'emergency-override',
          severity: 'critical',
          message: 'Emergency component lacks proper motion override for patient safety',
          impact: 'Critical alerts may not be visible to users with reduced motion preferences'
        });
      }
    } else {
      // Not an emergency component, so compliance is not applicable
      fileResult.compliance.emergencyOverride = true;
    }
    
    // Test 3: Healthcare timing compliance
    fileResult.compliance.healthcareTiming = this.testHealthcareTiming(content);
  }

  testHealthcareTiming(content) {
    // Extract duration values from Tailwind classes
    const durationMatches = content.match(/duration-(\d+)/g);
    if (!durationMatches) return true; // No explicit durations found
    
    const durations = durationMatches.map(match => parseInt(match.replace('duration-', '')));
    
    // Check if durations are within healthcare-appropriate ranges
    return durations.every(duration => {
      // Check against different timing categories
      const isMicroTiming = duration >= MOTION_COMPLIANCE_STANDARDS.healthcareTiming.micro.min && 
                           duration <= MOTION_COMPLIANCE_STANDARDS.healthcareTiming.micro.max;
      const isShortTiming = duration >= MOTION_COMPLIANCE_STANDARDS.healthcareTiming.short.min && 
                           duration <= MOTION_COMPLIANCE_STANDARDS.healthcareTiming.short.max;
      const isEmergencyTiming = duration >= MOTION_COMPLIANCE_STANDARDS.healthcareTiming.emergency.min && 
                               duration <= MOTION_COMPLIANCE_STANDARDS.healthcareTiming.emergency.max;
      const isLoadingTiming = duration >= MOTION_COMPLIANCE_STANDARDS.healthcareTiming.loading.min && 
                             duration <= MOTION_COMPLIANCE_STANDARDS.healthcareTiming.loading.max;
      
      return isMicroTiming || isShortTiming || isEmergencyTiming || isLoadingTiming;
    });
  }

  async testMotionUtilities() {
    console.log('🧪 Testing motion accessibility utilities...');
    
    const utilsPath = path.join(this.srcDir, 'utils/motion-accessibility.tsx');
    if (fs.existsSync(utilsPath)) {
      const content = fs.readFileSync(utilsPath, 'utf8');
      
      // Test for required utilities
      const requiredUtilities = [
        'useMotionPreference',
        'getAnimationClasses',
        'HEALTHCARE_TIMING',
        'MotionTransition',
        'EmergencyMotionAlert'
      ];
      
      const missingUtilities = requiredUtilities.filter(util => !content.includes(util));
      
      if (missingUtilities.length === 0) {
        console.log('  ✅ All motion accessibility utilities present');
      } else {
        console.log('  ❌ Missing utilities:', missingUtilities);
        this.results.violations.push({
          type: 'missing-utilities',
          severity: 'high',
          message: `Missing motion utilities: ${missingUtilities.join(', ')}`,
          file: 'utils/motion-accessibility.tsx'
        });
      }
    } else {
      console.log('  ❌ Motion accessibility utilities file not found');
      this.results.violations.push({
        type: 'missing-file',
        severity: 'critical',
        message: 'Motion accessibility utilities file is missing',
        file: 'utils/motion-accessibility.tsx'
      });
    }
  }

  async testEmergencyComponents() {
    console.log('🚨 Testing emergency component motion compliance...');
    
    const emergencyFiles = Object.entries(this.results.fileResults)
      .filter(([path, result]) => result.isEmergencyComponent);
    
    for (const [filePath, result] of emergencyFiles) {
      if (!result.compliance.emergencyOverride) {
        this.results.healthcareSpecificIssues.push({
          file: filePath,
          issue: 'Emergency component lacks motion override',
          severity: 'critical',
          patientSafetyImpact: 'Critical alerts may not be visible',
          recommendation: 'Add motion-reduce:animate-pulse for life-threatening alerts'
        });
      }
    }
  }

  calculateComplianceScores() {
    if (this.results.summary.totalFiles === 0) return;
    
    this.results.summary.complianceScore = Math.round(
      (this.results.summary.compliantFiles / this.results.summary.totalFiles) * 100
    );
  }

  generateHealthcareRecommendations() {
    const recommendations = [];
    
    // Overall compliance recommendation
    if (this.results.summary.complianceScore < 90) {
      recommendations.push({
        priority: 'high',
        category: 'overall-compliance',
        title: 'Improve Motion Accessibility Compliance',
        description: `Only ${this.results.summary.complianceScore}% of files are compliant. Target: 95%+`,
        action: 'Add motion-reduce classes to all components with animations',
        medicalImpact: 'Essential for healthcare workers with vestibular disorders'
      });
    }
    
    // Emergency component recommendations
    if (this.results.healthcareSpecificIssues.length > 0) {
      recommendations.push({
        priority: 'critical',
        category: 'patient-safety',
        title: 'Fix Emergency Component Motion Accessibility',
        description: `${this.results.healthcareSpecificIssues.length} emergency components lack proper motion override`,
        action: 'Implement motion-reduce:animate-pulse for critical patient safety alerts',
        medicalImpact: 'PATIENT SAFETY - critical alerts must be visible to all users'
      });
    }
    
    // Motion safety violations
    if (this.results.summary.motionSafetyViolations > 0) {
      recommendations.push({
        priority: 'high',
        category: 'accessibility',
        title: 'Address Motion Safety Violations',
        description: `${this.results.summary.motionSafetyViolations} components violate motion accessibility`,
        action: 'Add prefers-reduced-motion support to all animated components',
        medicalImpact: 'Legal compliance requirement for healthcare accessibility'
      });
    }
    
    this.results.recommendations = recommendations;
  }

  outputResults() {
    console.log('\n🎬 MOTION ACCESSIBILITY TEST RESULTS\n');
    console.log('=========================================\n');

    // Summary
    console.log('📊 COMPLIANCE SUMMARY:');
    console.log(`   Files Tested: ${this.results.summary.totalFiles}`);
    console.log(`   Compliant Files: ${this.results.summary.compliantFiles}`);
    console.log(`   Overall Compliance: ${this.results.summary.complianceScore}%`);
    console.log(`   Emergency Overrides: ${this.results.summary.emergencyOverrides}`);
    console.log(`   Motion Safety Violations: ${this.results.summary.motionSafetyViolations}\n`);

    // Compliance breakdown
    console.log('📋 COMPLIANCE BREAKDOWN:');
    const filesByCompliance = Object.entries(this.results.fileResults)
      .sort(([,a], [,b]) => b.complianceScore - a.complianceScore);
    
    filesByCompliance.slice(0, 10).forEach(([filePath, result]) => {
      const status = result.complianceScore >= 80 ? '✅' : '❌';
      const emergency = result.isEmergencyComponent ? '🚨' : '  ';
      console.log(`   ${status} ${emergency} ${result.complianceScore}% - ${filePath}`);
    });
    
    if (filesByCompliance.length > 10) {
      console.log(`   ... and ${filesByCompliance.length - 10} more files\n`);
    }

    // Violations
    if (this.results.violations.length > 0) {
      console.log('⚠️  VIOLATIONS FOUND:');
      this.results.violations.forEach((violation, index) => {
        const severityEmoji = violation.severity === 'critical' ? '🚨' : 
                             violation.severity === 'high' ? '⚠️' : '💡';
        console.log(`   ${severityEmoji} ${violation.type}: ${violation.message}`);
        if (violation.file) console.log(`      File: ${violation.file}`);
      });
      console.log('');
    }

    // Healthcare-specific issues
    if (this.results.healthcareSpecificIssues.length > 0) {
      console.log('🏥 HEALTHCARE-SPECIFIC ISSUES:');
      this.results.healthcareSpecificIssues.forEach((issue) => {
        console.log(`   🚨 ${issue.file}`);
        console.log(`      Issue: ${issue.issue}`);
        console.log(`      Patient Safety Impact: ${issue.patientSafetyImpact}`);
        console.log(`      Recommendation: ${issue.recommendation}\n`);
      });
    }

    // Recommendations
    console.log('💡 HEALTHCARE RECOMMENDATIONS:');
    this.results.recommendations.forEach((rec) => {
      const priorityEmoji = rec.priority === 'critical' ? '🚨' : 
                          rec.priority === 'high' ? '⚠️' : '💡';
      
      console.log(`   ${priorityEmoji} ${rec.title}`);
      console.log(`      ${rec.description}`);
      console.log(`      Action: ${rec.action}`);
      console.log(`      Medical Impact: ${rec.medicalImpact}\n`);
    });

    // Overall assessment
    console.log('🎯 OVERALL ASSESSMENT:');
    if (this.results.summary.complianceScore >= 95) {
      console.log('   🎉 EXCELLENT - Motion accessibility compliance is industry-leading');
    } else if (this.results.summary.complianceScore >= 85) {
      console.log('   ✅ GOOD - Motion accessibility is well-implemented with minor improvements needed');
    } else if (this.results.summary.complianceScore >= 70) {
      console.log('   ⚠️  FAIR - Motion accessibility needs significant improvement');
    } else {
      console.log('   🚨 POOR - Motion accessibility requires immediate attention for healthcare compliance');
    }

    // Save detailed results
    this.saveResults();
  }

  saveResults() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = `/Volumes/EXT/RxOps/uikit/MOTION_ACCESSIBILITY_TEST_${timestamp}.json`;
    
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 Detailed results saved to: ${reportPath}`);
  }
}

// Run the motion accessibility test
const tester = new MotionAccessibilityTester();
tester.runCompleteTest().catch(console.error);
