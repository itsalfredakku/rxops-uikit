import { describe, it, expect } from 'vitest';
import { createDOM } from '@builder.io/qwik/testing';
import { MedicalHistory, type MedicalEvent } from '../medical-history';

// Mock data
const mockEvents: MedicalEvent[] = [
  {
    id: '1',
    date: '2024-01-15T10:00:00Z',
    type: 'diagnosis',
    title: 'Hypertension Diagnosis',
    description: 'Patient diagnosed with stage 1 hypertension after multiple readings',
    provider: 'Dr. Smith',
    facility: 'General Hospital',
    severity: 'medium',
    status: 'active',
    medications: ['Lisinopril 10mg'],
    icd10: 'I10',
    notes: 'Patient should monitor blood pressure daily'
  },
  {
    id: '2',
    date: '2024-01-10T14:30:00Z',
    type: 'test',
    title: 'Blood Work',
    description: 'Comprehensive metabolic panel and lipid profile',
    provider: 'Dr. Johnson',
    facility: 'Lab Corp',
    severity: 'low',
    status: 'resolved',
    cpt: '80053'
  }
];

describe('MedicalHistory', () => {
  it('should create component with basic props', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <MedicalHistory 
        patientId="patient-123"
        events={mockEvents}
      />
    );

    expect(screen.outerHTML).toContain('Medical History');
    expect(screen.outerHTML).toContain('Hypertension Diagnosis');
    expect(screen.outerHTML).toContain('Blood Work');
  });

  it('should handle empty events array', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <MedicalHistory 
        patientId="patient-123"
        events={[]}
      />
    );

    expect(screen.outerHTML).toContain('No medical history events found');
  });

  it('should render component structure correctly', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <MedicalHistory 
        patientId="patient-123"
        events={mockEvents}
        showFilters={true}
        isEditable={true}
      />
    );

    // Check main container
    expect(screen.outerHTML).toContain('medical-history');
    // Check search functionality
    expect(screen.outerHTML).toContain('Search medical history');
    // Check filters
    expect(screen.outerHTML).toContain('Filters');
  });

  it('should display event metadata', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <MedicalHistory 
        patientId="patient-123"
        events={mockEvents}
      />
    );

    // Check event types
    expect(screen.outerHTML).toContain('diagnosis');
    expect(screen.outerHTML).toContain('test');
    
    // Check providers
    expect(screen.outerHTML).toContain('Dr. Smith');
    expect(screen.outerHTML).toContain('Dr. Johnson');
    
    // Check status
    expect(screen.outerHTML).toContain('active');
    expect(screen.outerHTML).toContain('resolved');
  });

  it('should handle custom props', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <MedicalHistory 
        patientId="patient-123"
        events={mockEvents}
        class="custom-medical-history"
        maxHeight="400px"
        showFilters={false}
      />
    );

    expect(screen.outerHTML).toContain('custom-medical-history');
  });

  it('should display medical codes when available', async () => {
    const { screen, render } = await createDOM();
    
    const eventsWithCodes: MedicalEvent[] = [
      {
        ...mockEvents[0],
        icd10: 'I10',
        cpt: '99213'
      }
    ];

    await render(
      <MedicalHistory 
        patientId="patient-123"
        events={eventsWithCodes}
      />
    );

    expect(screen.outerHTML).toContain('I10');
  });

  it('should handle different event types', async () => {
    const { screen, render } = await createDOM();
    
    const diverseEvents: MedicalEvent[] = [
      { ...mockEvents[0], type: 'diagnosis' },
      { ...mockEvents[1], type: 'procedure' },
      { 
        id: '3',
        date: '2024-01-12T09:00:00Z',
        type: 'emergency',
        title: 'Emergency Visit',
        description: 'Patient presented with chest pain',
        provider: 'Dr. Emergency',
        status: 'resolved'
      }
    ];

    await render(
      <MedicalHistory 
        patientId="patient-123"
        events={diverseEvents}
      />
    );

    expect(screen.outerHTML).toContain('diagnosis');
    expect(screen.outerHTML).toContain('procedure');
    expect(screen.outerHTML).toContain('emergency');
  });
});
