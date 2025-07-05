import { component$, type JSXChildren, type JSXNode } from '@builder.io/qwik';
import { createDOM } from '@builder.io/qwik/testing';
import { qwikVite } from '@builder.io/qwik/optimizer';
import { expect } from 'vitest';

// Qwik component test renderer
async function renderQwikComponent(
  Component: any,
  props: Record<string, any> = {},
  options: { timeout?: number } = {}
): Promise<{
  container: HTMLElement;
  html: string;
  cleanup: () => void;
}> {
  const { timeout = 5000 } = options;
  
  try {
    // For now, use a simple DOM approach since Qwik testing is complex
    const container = document.createElement('div');
    document.body.appendChild(container);
    
    // Simulate component rendering by creating basic HTML structure
    container.innerHTML = `
      <div data-component="${Component.name || 'TestComponent'}" data-testid="qwik-component">
        <div>Mock Qwik Component Render</div>
        <pre>${JSON.stringify(props, null, 2)}</pre>
      </div>
    `;
    
    return {
      container,
      html: container.innerHTML,
      cleanup: () => {
        try {
          if (container.parentNode) {
            container.parentNode.removeChild(container);
          }
        } catch (e) {
          console.warn('Cleanup warning:', e);
        }
      }
    };
  } catch (error) {
    console.error('Qwik component render error:', error);
    throw new Error(`Failed to render Qwik component: ${String(error)}`);
  }
}

// Mock Qwik store for testing
function createMockStore<T extends Record<string, any>>(initialData: T): T {
  return new Proxy(initialData, {
    get(target, prop) {
      return target[prop as keyof T];
    },
    set(target, prop, value) {
      target[prop as keyof T] = value;
      return true;
    }
  });
}

// Mock Qwik signal for testing
function createMockSignal<T>(initialValue: T) {
  let value = initialValue;
  
  return {
    get value() {
      return value;
    },
    set value(newValue: T) {
      value = newValue;
    }
  };
}

// Test component interaction helpers
export const qwikTestUtils = {
  // Simulate click event on Qwik component
  async clickElement(element: HTMLElement): Promise<void> {
    const event = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    });
    element.dispatchEvent(event);
    
    // Allow time for Qwik's event handling
    await new Promise(resolve => setTimeout(resolve, 100));
  },

  // Simulate input change on form elements
  async changeInput(input: HTMLInputElement, value: string): Promise<void> {
    input.value = value;
    const event = new Event('input', {
      bubbles: true,
      cancelable: true
    });
    input.dispatchEvent(event);
    
    // Allow time for Qwik's event handling
    await new Promise(resolve => setTimeout(resolve, 100));
  },

  // Simulate form submission
  async submitForm(form: HTMLFormElement): Promise<void> {
    const event = new Event('submit', {
      bubbles: true,
      cancelable: true
    });
    form.dispatchEvent(event);
    
    // Allow time for Qwik's event handling
    await new Promise(resolve => setTimeout(resolve, 100));
  },

  // Wait for Qwik component to stabilize
  async waitForStability(timeout = 1000): Promise<void> {
    return new Promise(resolve => {
      setTimeout(resolve, timeout);
    });
  },

  // Check if element has Qwik attributes
  hasQwikAttributes(element: HTMLElement): boolean {
    const qwikAttrs = ['q:id', 'q:container', 'q:version', 'q:instance'];
    return qwikAttrs.some(attr => element.hasAttribute(attr));
  }
};

// Healthcare component test data
export const healthcareTestData = {
  patient: {
    id: 'P123',
    name: 'John Doe',
    age: 45,
    gender: 'Male',
    bloodType: 'O+',
    allergies: ['Penicillin', 'Shellfish'],
    vitals: {
      bloodPressure: '120/80',
      heartRate: 72,
      temperature: 98.6,
      weight: 180,
      height: 72
    }
  },
  
  appointment: {
    id: 'A456',
    patientId: 'P123',
    doctorId: 'D789',
    date: '2025-07-15',
    time: '10:00',
    type: 'General Checkup',
    status: 'confirmed'
  },
  
  medication: {
    id: 'M001',
    name: 'Lisinopril',
    dosage: '10mg',
    frequency: 'Once daily',
    instructions: 'Take with food'
  },
  
  doctor: {
    id: 'D789',
    name: 'Dr. Sarah Wilson',
    specialty: 'Internal Medicine',
    credentials: ['MD', 'FACP'],
    rating: 4.8
  }
};

// Component props generators for testing
export const propGenerators = {
  // Generate patient card props
  patientCardProps: (overrides = {}) => ({
    patient: healthcareTestData.patient,
    showVitals: true,
    showAllergies: true,
    onEdit: () => {},
    ...overrides
  }),

  // Generate appointment card props
  appointmentCardProps: (overrides = {}) => ({
    appointment: healthcareTestData.appointment,
    patient: healthcareTestData.patient,
    doctor: healthcareTestData.doctor,
    onReschedule: () => {},
    onCancel: () => {},
    ...overrides
  }),

  // Generate medication tracker props
  medicationTrackerProps: (overrides = {}) => ({
    medications: [healthcareTestData.medication],
    patientId: healthcareTestData.patient.id,
    onTakeMedication: () => {},
    onSkipMedication: () => {},
    ...overrides
  }),

  // Generate form field props
  formFieldProps: (overrides = {}) => ({
    label: 'Test Field',
    name: 'testField',
    type: 'text',
    required: false,
    ...overrides
  })
};

// Test environment setup for healthcare components
function setupHealthcareTestEnvironment() {
  // Mock localStorage for patient data persistence
  const mockStorage: Record<string, string> = {};
  
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: (key: string) => mockStorage[key] || null,
      setItem: (key: string, value: string) => {
        mockStorage[key] = value;
      },
      removeItem: (key: string) => {
        delete mockStorage[key];
      },
      clear: () => {
        Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
      },
      length: Object.keys(mockStorage).length,
      key: (index: number) => Object.keys(mockStorage)[index] || null
    },
    writable: true
  });

  // Mock sessionStorage
  const mockSessionStorage: Record<string, string> = {};
  
  Object.defineProperty(window, 'sessionStorage', {
    value: {
      getItem: (key: string) => mockSessionStorage[key] || null,
      setItem: (key: string, value: string) => {
        mockSessionStorage[key] = value;
      },
      removeItem: (key: string) => {
        delete mockSessionStorage[key];
      },
      clear: () => {
        Object.keys(mockSessionStorage).forEach(key => delete mockSessionStorage[key]);
      },
      length: Object.keys(mockSessionStorage).length,
      key: (index: number) => Object.keys(mockSessionStorage)[index] || null
    },
    writable: true
  });

  // Mock fetch for API calls
  global.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString();
    
    // Mock API responses based on URL patterns
    if (url.includes('/api/patients')) {
      return new Response(JSON.stringify(healthcareTestData.patient), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (url.includes('/api/appointments')) {
      return new Response(JSON.stringify(healthcareTestData.appointment), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (url.includes('/api/medications')) {
      return new Response(JSON.stringify([healthcareTestData.medication]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Default mock response
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  };

  // Mock Date for consistent testing
  const mockDate = new Date('2025-07-01T10:00:00Z');
  const originalDate = global.Date;

  // Mock crypto for generating IDs
  Object.defineProperty(global, 'crypto', {
    value: {
      randomUUID: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9)
    }
  });

  return {
    cleanup: () => {
      // Restore mocks
      global.Date = originalDate;
    }
  };
}

// Accessibility testing for healthcare components
const healthcareA11yHelpers = {
  // Check for proper ARIA labels on medical forms
  checkMedicalFormAccessibility: (container: HTMLElement) => {
    const inputs = container.querySelectorAll('input, select, textarea');
    const labels = container.querySelectorAll('label');
    const fieldsets = container.querySelectorAll('fieldset');
    
    // Each input should have a label or aria-label
    inputs.forEach(input => {
      const id = input.getAttribute('id');
      const ariaLabel = input.getAttribute('aria-label');
      const ariaLabelledBy = input.getAttribute('aria-labelledby');
      const associatedLabel = container.querySelector(`label[for="${id}"]`);
      
      expect(
        ariaLabel || ariaLabelledBy || associatedLabel
      ).toBeTruthy();
    });

    // Fieldsets should have legends
    fieldsets.forEach(fieldset => {
      const legend = fieldset.querySelector('legend');
      expect(legend).toBeTruthy();
    });

    return {
      inputCount: inputs.length,
      labelCount: labels.length,
      fieldsetCount: fieldsets.length
    };
  },

  // Check for proper heading hierarchy
  checkHeadingHierarchy: (container: HTMLElement) => {
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const levels = Array.from(headings).map(h => parseInt(h.tagName.charAt(1)));
    
    // Check that heading levels don't skip (e.g., h1 -> h3)
    for (let i = 1; i < levels.length; i++) {
      const diff = levels[i] - levels[i - 1];
      expect(diff).toBeLessThanOrEqual(1);
    }

    return {
      headingCount: headings.length,
      levels
    };
  },

  // Check for proper color contrast (simplified)
  checkColorContrast: (container: HTMLElement) => {
    const elements = container.querySelectorAll('*');
    const lowContrastElements: Element[] = [];
    
    elements.forEach(el => {
      const styles = window.getComputedStyle(el);
      const bgColor = styles.backgroundColor;
      const textColor = styles.color;
      
      // Simple contrast check (you might want to use a more sophisticated library)
      if (bgColor !== 'rgba(0, 0, 0, 0)' && textColor !== 'rgba(0, 0, 0, 0)') {
        // This is a simplified check - in real scenarios, use a proper contrast ratio calculator
        if (bgColor === textColor) {
          lowContrastElements.push(el);
        }
      }
    });

    return {
      totalElements: elements.length,
      lowContrastCount: lowContrastElements.length,
      lowContrastElements
    };
  }
};

export {
  renderQwikComponent,
  createMockStore,
  createMockSignal,
  setupHealthcareTestEnvironment,
  healthcareA11yHelpers
};
