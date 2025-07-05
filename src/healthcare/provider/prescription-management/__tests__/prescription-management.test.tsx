import { describe, it, expect } from 'vitest';
import { createDOM } from '@builder.io/qwik/testing';
import { PrescriptionManagement, type Prescription } from '../prescription-management';

// Mock data
const mockPrescriptions: Prescription[] = [
  {
    id: '1',
    medicationName: 'Lisinopril',
    genericName: 'Lisinopril',
    strength: '10mg',
    dosage: '1 tablet',
    frequency: 'Once daily',
    route: 'oral',
    quantity: 30,
    refillsRemaining: 5,
    totalRefills: 5,
    prescribedDate: '2024-01-01T00:00:00Z',
    expiryDate: '2024-12-31T23:59:59Z',
    prescriber: 'Dr. Smith',
    pharmacy: 'CVS Pharmacy',
    status: 'active',
    instructions: 'Take with or without food',
    isGeneric: true,
    cost: 15.99,
    insuranceCovered: true
  },
  {
    id: '2',
    medicationName: 'Albuterol Inhaler',
    strength: '90mcg',
    dosage: '2 puffs',
    frequency: 'As needed',
    route: 'inhaled',
    quantity: 1,
    refillsRemaining: 0,
    totalRefills: 2,
    prescribedDate: '2024-01-15T00:00:00Z',
    expiryDate: '2024-06-15T23:59:59Z',
    prescriber: 'Dr. Johnson',
    pharmacy: 'Walgreens',
    status: 'active',
    instructions: 'Use as rescue inhaler for shortness of breath',
    isPrn: true,
    warnings: ['Do not exceed 8 puffs in 24 hours']
  }
];

describe('PrescriptionManagement', () => {
  it('should create component with basic props', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <PrescriptionManagement 
        patientId="patient-123"
        prescriptions={mockPrescriptions}
      />
    );

    expect(screen.outerHTML).toContain('Prescription Management');
    expect(screen.outerHTML).toContain('Lisinopril');
    expect(screen.outerHTML).toContain('Albuterol Inhaler');
  });

  it('should handle empty prescriptions array', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <PrescriptionManagement 
        patientId="patient-123"
        prescriptions={[]}
      />
    );

    expect(screen.outerHTML).toContain('No prescriptions found');
  });

  it('should display prescription details correctly', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <PrescriptionManagement 
        patientId="patient-123"
        prescriptions={mockPrescriptions}
      />
    );

    // Check medication details
    expect(screen.outerHTML).toContain('Lisinopril');
    expect(screen.outerHTML).toContain('10mg');
    expect(screen.outerHTML).toContain('Once daily');
    expect(screen.outerHTML).toContain('Dr. Smith');
    expect(screen.outerHTML).toContain('CVS Pharmacy');
  });

  it('should show status badges', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <PrescriptionManagement 
        patientId="patient-123"
        prescriptions={mockPrescriptions}
      />
    );

    expect(screen.outerHTML).toContain('active');
  });

  it('should display refill information', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <PrescriptionManagement 
        patientId="patient-123"
        prescriptions={mockPrescriptions}
      />
    );

    expect(screen.outerHTML).toContain('5 of 5'); // Lisinopril refills
    expect(screen.outerHTML).toContain('0 of 2'); // Albuterol refills
  });

  it('should show PRN indicator for as-needed medications', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <PrescriptionManagement 
        patientId="patient-123"
        prescriptions={mockPrescriptions}
      />
    );

    // Check for PRN indicator on Albuterol
    expect(screen.outerHTML).toContain('PRN');
  });

  it('should display route information', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <PrescriptionManagement 
        patientId="patient-123"
        prescriptions={mockPrescriptions}
      />
    );

    expect(screen.outerHTML).toContain('oral');
    expect(screen.outerHTML).toContain('inhaled');
  });

  it('should show warnings when present', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <PrescriptionManagement 
        patientId="patient-123"
        prescriptions={mockPrescriptions}
      />
    );

    expect(screen.outerHTML).toContain('Do not exceed 8 puffs in 24 hours');
  });

  it('should render search functionality', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <PrescriptionManagement 
        patientId="patient-123"
        prescriptions={mockPrescriptions}
        showFilters={true}
      />
    );

    expect(screen.outerHTML).toContain('Search prescriptions');
  });

  it('should show filters when enabled', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <PrescriptionManagement 
        patientId="patient-123"
        prescriptions={mockPrescriptions}
        showFilters={true}
      />
    );

    expect(screen.outerHTML).toContain('Filters');
  });

  it('should show add prescription button when editable', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <PrescriptionManagement 
        patientId="patient-123"
        prescriptions={mockPrescriptions}
        isEditable={true}
      />
    );

    expect(screen.outerHTML).toContain('Add Prescription');
  });

  it('should display expiry dates', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <PrescriptionManagement 
        patientId="patient-123"
        prescriptions={mockPrescriptions}
      />
    );

    expect(screen.outerHTML).toContain('Expires');
  });

  it('should handle different prescription statuses', async () => {
    const { screen, render } = await createDOM();
    
    const prescriptionsWithVariedStatus: Prescription[] = [
      { ...mockPrescriptions[0], status: 'active' },
      { ...mockPrescriptions[1], status: 'expired' }
    ];

    await render(
      <PrescriptionManagement 
        patientId="patient-123"
        prescriptions={prescriptionsWithVariedStatus}
      />
    );

    expect(screen.outerHTML).toContain('active');
    expect(screen.outerHTML).toContain('expired');
  });

  it('should apply custom className', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <PrescriptionManagement 
        patientId="patient-123"
        prescriptions={mockPrescriptions}
        class="custom-prescription-management"
      />
    );

    expect(screen.outerHTML).toContain('custom-prescription-management');
  });

  it('should show refill request button for eligible prescriptions', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <PrescriptionManagement 
        patientId="patient-123"
        prescriptions={mockPrescriptions}
      />
    );

    expect(screen.outerHTML).toContain('Request Refill');
  });

  it('should display medication instructions', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <PrescriptionManagement 
        patientId="patient-123"
        prescriptions={mockPrescriptions}
      />
    );

    expect(screen.outerHTML).toContain('Take with or without food');
    expect(screen.outerHTML).toContain('Use as rescue inhaler');
  });
});
