/**
 * Healthcare-specific testing utilities for RxOps UIKit
 * 
 * This file provides specialized testing utilities for healthcare components,
 * including mock data generators, healthcare-specific matchers, and testing patterns.
 */

import { createDOM } from "@builder.io/qwik/testing";
import type { JSXNode } from "@builder.io/qwik";

// ===========================
// HEALTHCARE MOCK DATA
// ===========================

/**
 * Mock patient data for testing
 */
export const mockPatientData = {
  id: "patient-123",
  name: "John Doe",
  dateOfBirth: "1985-06-15",
  mrn: "MRN123456",
  gender: "male" as const,
  phone: "(555) 123-4567",
  email: "john.doe@example.com",
  emergencyContact: {
    name: "Jane Doe",
    relationship: "spouse",
    phone: "(555) 123-4568"
  },
  insurance: {
    provider: "HealthCare Plus",
    policyNumber: "HC123456789",
    groupNumber: "GRP001"
  }
};

/**
 * Mock provider/doctor data for testing
 */
export const mockProviderData = {
  id: "provider-456",
  name: "Dr. Sarah Smith",
  specialty: "Internal Medicine",
  license: "MD123456",
  npi: "1234567890",
  phone: "(555) 987-6543",
  email: "dr.smith@healthcenter.com",
  credentials: ["MD", "FACP"],
  experience: 15
};

/**
 * Mock appointment data for testing
 */
export const mockAppointmentData = {
  id: "appt-789",
  patientId: "patient-123",
  providerId: "provider-456",
  date: "2025-01-15",
  time: "10:00",
  duration: 30,
  type: "routine" as const,
  status: "scheduled" as const,
  reason: "Annual checkup",
  notes: "Patient reports feeling well"
};

/**
 * Mock medication data for testing
 */
export const mockMedicationData = {
  id: "med-101",
  name: "Lisinopril",
  genericName: "Lisinopril",
  dosage: "10mg",
  frequency: "once daily" as const,
  route: "oral" as const,
  prescribedDate: "2025-01-01",
  prescribedBy: "Dr. Sarah Smith",
  refillsRemaining: 5,
  totalRefills: 5,
  instructions: "Take with or without food",
  status: "active" as const
};

/**
 * Mock vital signs data for testing
 */
export const mockVitalSignsData = {
  patientId: "patient-123",
  timestamp: "2025-01-15T10:30:00Z",
  bloodPressure: {
    systolic: 120,
    diastolic: 80,
    unit: "mmHg"
  },
  heartRate: {
    value: 72,
    unit: "bpm"
  },
  temperature: {
    value: 98.6,
    unit: "°F"
  },
  respiratoryRate: {
    value: 16,
    unit: "breaths/min"
  },
  oxygenSaturation: {
    value: 98,
    unit: "%"
  },
  weight: {
    value: 170,
    unit: "lbs"
  },
  height: {
    value: 70,
    unit: "inches"
  }
};

/**
 * Mock emergency alert data for testing
 */
export const mockEmergencyAlertData = {
  id: "alert-999",
  type: "critical" as const,
  patientId: "patient-123",
  title: "Critical Alert",
  message: "Patient experiencing severe symptoms",
  severity: "high" as const,
  timestamp: "2025-01-15T14:30:00Z",
  acknowledged: false,
  respondingTeam: []
};

// ===========================
// HEALTHCARE TESTING UTILITIES
// ===========================

/**
 * Healthcare-specific render options with common defaults
 */
export interface HealthcareRenderOptions {
  /** Mock patient context */
  patient?: typeof mockPatientData;
  /** Mock provider context */
  provider?: typeof mockProviderData;
  /** Mock user permissions */
  permissions?: string[];
  /** Mock theme/accessibility settings */
  a11ySettings?: {
    highContrast?: boolean;
    reducedMotion?: boolean;
    fontSize?: 'small' | 'medium' | 'large';
  };
}

/**
 * Render a component with healthcare-specific context
 */
export async function renderHealthcareComponent(
  component: JSXNode,
  options: HealthcareRenderOptions = {}
) {
  const {
    patient = mockPatientData,
    provider = mockProviderData,
    permissions = ['read', 'write'],
    a11ySettings = {},
  } = options;

  // Create DOM for testing
  const { screen, render } = await createDOM();
  
  // Render the component
  await render(component);

  // Add healthcare-specific context to the result
  return {
    screen,
    render,
    context: {
      patient,
      provider,
      permissions,
      a11ySettings
    }
  };
}

/**
 * Generate mock data arrays for testing lists/grids
 */
export const mockDataGenerators = {
  patients: (count: number = 3) => 
    Array.from({ length: count }, (_, i) => ({
      ...mockPatientData,
      id: `patient-${i + 1}`,
      name: `Patient ${i + 1}`,
      mrn: `MRN${String(i + 1).padStart(6, '0')}`
    })),

  appointments: (count: number = 3) =>
    Array.from({ length: count }, (_, i) => ({
      ...mockAppointmentData,
      id: `appt-${i + 1}`,
      time: `${10 + i}:00`,
      reason: `Appointment ${i + 1}`
    })),

  medications: (count: number = 3) =>
    Array.from({ length: count }, (_, i) => ({
      ...mockMedicationData,
      id: `med-${i + 1}`,
      name: `Medication ${i + 1}`,
      dosage: `${5 + i}mg`
    })),

  vitalSigns: (count: number = 3) =>
    Array.from({ length: count }, (_, i) => ({
      ...mockVitalSignsData,
      timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      bloodPressure: {
        systolic: 120 + i * 5,
        diastolic: 80 + i * 2,
        unit: "mmHg"
      }
    }))
};

// ===========================
// HEALTHCARE TESTING MATCHERS
// ===========================

/**
 * Custom matchers for healthcare components
 */
export const healthcareMatchers = {
  /**
   * Check if component has HIPAA-compliant attributes
   */
  hasHIPAACompliance: (element: Element) => {
    const hasDataProtection = element.hasAttribute('data-protected') || 
                              element.classList.contains('hipaa-protected');
    const hasAccessControl = element.hasAttribute('data-access-level');
    
    return {
      pass: hasDataProtection && hasAccessControl,
      message: () => hasDataProtection && hasAccessControl
        ? 'Component has HIPAA compliance attributes'
        : 'Component missing HIPAA compliance attributes (data-protected and data-access-level)'
    };
  },

  /**
   * Check if component meets healthcare accessibility standards
   */
  hasHealthcareA11y: (element: Element) => {
    const hasAriaLabels = element.hasAttribute('aria-label') || element.hasAttribute('aria-labelledby');
    const hasRole = element.hasAttribute('role');
    const hasFocusManagement = element.hasAttribute('tabindex') || element.querySelector('[tabindex]');
    
    return {
      pass: hasAriaLabels && hasRole && hasFocusManagement,
      message: () => hasAriaLabels && hasRole && hasFocusManagement
        ? 'Component meets healthcare accessibility standards'
        : 'Component missing accessibility attributes (aria-label/labelledby, role, focus management)'
    };
  },

  /**
   * Check if component has emergency override capabilities
   */
  hasEmergencyOverride: (element: Element) => {
    const hasEmergencyClass = element.classList.contains('emergency-override') ||
                              element.hasAttribute('data-emergency');
    const hasHighPriority = element.hasAttribute('data-priority') &&
                            ['critical', 'high', 'emergency'].includes(element.getAttribute('data-priority') || '');
    
    return {
      pass: hasEmergencyClass || hasHighPriority,
      message: () => hasEmergencyClass || hasHighPriority
        ? 'Component has emergency override capabilities'
        : 'Component missing emergency override (emergency-override class or high priority data-priority)'
    };
  }
};

// ===========================
// HEALTHCARE TEST PATTERNS
// ===========================

/**
 * Standard test patterns for healthcare components
 */
export const healthcareTestPatterns = {
  /**
   * Test basic component rendering with healthcare context
   */
  basicRendering: async (component: JSXNode, expectedContent: string[]) => {
    const { screen } = await renderHealthcareComponent(component);
    
    // Check for basic content
    expectedContent.forEach(content => {
      expect(screen.outerHTML).toContain(content);
    });
    
    return screen;
  },

  /**
   * Test component with different permission levels
   */
  permissionTesting: async (component: JSXNode, scenarios: Array<{
    permissions: string[];
    expectedBehavior: string[];
    notExpectedBehavior?: string[];
  }>) => {
    const results = [];
    
    for (const scenario of scenarios) {
      const { screen } = await renderHealthcareComponent(component, {
        permissions: scenario.permissions
      });
      
      // Check expected behavior
      scenario.expectedBehavior.forEach(behavior => {
        expect(screen.outerHTML).toContain(behavior);
      });
      
      // Check that restricted behavior is not present
      scenario.notExpectedBehavior?.forEach(behavior => {
        expect(screen.outerHTML).not.toContain(behavior);
      });
      
      results.push({ permissions: scenario.permissions, screen });
    }
    
    return results;
  },

  /**
   * Test component accessibility compliance
   */
  accessibilityTesting: async (component: JSXNode) => {
    const { screen } = await renderHealthcareComponent(component, {
      a11ySettings: {
        highContrast: true,
        reducedMotion: true,
        fontSize: 'large'
      }
    });
    
    // Basic accessibility checks
    const element = screen.querySelector('[role]') || screen;
    
    // Should have proper ARIA attributes
    expect(element.hasAttribute('aria-label') || element.hasAttribute('aria-labelledby')).toBe(true);
    
    // Should be keyboard navigable
    const focusableElements = screen.querySelectorAll('[tabindex], button, input, select, textarea, a[href]');
    expect(focusableElements.length).toBeGreaterThan(0);
    
    return screen;
  },

  /**
   * Test component with emergency scenarios
   */
  emergencyTesting: async (component: JSXNode, emergencyProps: any) => {
    const { screen } = await renderHealthcareComponent(component);
    
    // Should handle emergency state properly
    expect(screen.outerHTML).toContain('emergency');
    
    // Should have high visibility
    const emergencyElements = screen.querySelectorAll('.emergency, [data-emergency], [data-priority="critical"]');
    expect(emergencyElements.length).toBeGreaterThan(0);
    
    return screen;
  }
};

// ===========================
// HEALTHCARE TESTING HELPERS
// ===========================

/**
 * Helper to simulate healthcare user interactions
 */
export const healthcareInteractions = {
  /**
   * Simulate clinician login
   */
  simulateClinicianLogin: () => ({
    user: {
      id: 'clinician-123',
      name: 'Dr. Test User',
      role: 'physician',
      permissions: ['read', 'write', 'prescribe', 'emergency']
    }
  }),

  /**
   * Simulate patient login
   */
  simulatePatientLogin: () => ({
    user: {
      id: 'patient-123',
      name: 'Test Patient',
      role: 'patient',
      permissions: ['read', 'limited-write']
    }
  }),

  /**
   * Simulate emergency situation
   */
  simulateEmergency: () => ({
    emergency: true,
    priority: 'critical' as const,
    overrideAccess: true,
    alertLevel: 'high' as const
  })
};

/**
 * Export all utilities as a single object for convenience
 */
export const HealthcareTestingKit = {
  // Data
  mockData: {
    patient: mockPatientData,
    provider: mockProviderData,
    appointment: mockAppointmentData,
    medication: mockMedicationData,
    vitalSigns: mockVitalSignsData,
    emergencyAlert: mockEmergencyAlertData
  },
  
  // Generators
  generators: mockDataGenerators,
  
  // Utilities
  render: renderHealthcareComponent,
  patterns: healthcareTestPatterns,
  matchers: healthcareMatchers,
  interactions: healthcareInteractions
};

export default HealthcareTestingKit;
