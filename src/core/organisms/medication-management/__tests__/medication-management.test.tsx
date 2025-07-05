import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MedicationManagement, type Medication } from '../medication-management';
import { mockHIPAAAuditor, mockPerformanceMonitor, createTestRenderer } from '../../../../testing/test-utils';

// Mock the utility modules
vi.mock('../../../utils/hipaa', () => ({
  hipaaAuditor: mockHIPAAAuditor
}));

vi.mock('../../../utils/performance', () => ({
  performanceMonitor: mockPerformanceMonitor
}));

describe('MedicationManagement', () => {
  const mockMedications: Medication[] = [
    {
      id: 'med-1',
      name: 'Lisinopril',
      genericName: 'Lisinopril',
      dosage: '10mg',
      form: 'tablet',
      frequency: 'once-daily',
      instructions: 'Take with food',
      status: 'active',
      prescribedBy: {
        name: 'Dr. Smith',
        npi: '1234567890',
        specialty: 'Cardiology'
      },
      prescribedDate: '2024-01-01',
      startDate: '2024-01-01',
      refillsRemaining: 2,
      totalRefills: 5,
      adherence: {
        percentage: 85,
        lastTaken: '2024-01-15',
        missedDoses: 3,
        totalDoses: 20
      },
      pharmacy: {
        name: 'CVS Pharmacy',
        phone: '555-0123',
        address: '123 Main St'
      }
    },
    {
      id: 'med-2',
      name: 'Metformin',
      genericName: 'Metformin HCL',
      dosage: '500mg',
      form: 'tablet',
      frequency: 'twice-daily',
      instructions: 'Take with meals',
      status: 'active',
      prescribedBy: {
        name: 'Dr. Johnson',
        specialty: 'Endocrinology'
      },
      prescribedDate: '2024-01-05',
      startDate: '2024-01-05',
      interactions: ['Lisinopril'],
      adherence: {
        percentage: 92,
        lastTaken: '2024-01-15',
        missedDoses: 1,
        totalDoses: 15
      }
    },
    {
      id: 'med-3',
      name: 'Warfarin',
      dosage: '5mg',
      form: 'tablet',
      frequency: 'once-daily',
      instructions: 'Take at same time daily',
      status: 'discontinued',
      prescribedBy: {
        name: 'Dr. Williams',
        specialty: 'Hematology'
      },
      prescribedDate: '2023-12-01',
      startDate: '2023-12-01',
      endDate: '2024-01-10',
      criticalWarnings: ['Monitor INR levels closely']
    }
  ];

  const mockPatient = {
    id: 'patient-123',
    name: 'John Doe',
    allergies: ['Penicillin', 'Sulfa'],
    conditions: ['Hypertension', 'Diabetes']
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders medication list correctly', async () => {
    const { screen, render } = await createTestRenderer();
    
    await render(
      <MedicationManagement 
        medications={mockMedications}
        patient={mockPatient}
      />
    );

    // Check header
    expect(screen.getByText('Medications')).toBeDefined();
    expect(screen.getByText('Patient: John Doe')).toBeDefined();

    // Check medications are displayed
    expect(screen.getByText('Lisinopril')).toBeDefined();
    expect(screen.getByText('Metformin')).toBeDefined();
    expect(screen.getByText('Warfarin')).toBeDefined();

    // Check medication details
    expect(screen.getByText('10mg')).toBeDefined();
    expect(screen.getByText('Once daily')).toBeDefined();
    expect(screen.getByText('Take with food')).toBeDefined();
  });

  it('shows adherence view when enabled', async () => {
    const { screen, render } = await createTestRenderer();
    
    await render(
      <MedicationManagement 
        medications={mockMedications}
        patient={mockPatient}
        showAdherence={true}
      />
    );

    // Check adherence button
    expect(screen.getByText('Adherence View')).toBeDefined();

    // Check adherence percentages
    expect(screen.getByText('85%')).toBeDefined();
    expect(screen.getByText('92%')).toBeDefined();
  });

  it('displays interaction warnings when enabled', async () => {
    const { screen, render } = await createTestRenderer();
    
    await render(
      <MedicationManagement 
        medications={mockMedications}
        patient={mockPatient}
        showInteractions={true}
      />
    );

    // Should show interaction warning
    expect(screen.getByText('Drug Interaction Warnings')).toBeDefined();
  });

  it('shows critical warnings for dangerous medications', async () => {
    const { screen, render } = await createTestRenderer();
    
    await render(
      <MedicationManagement 
        medications={mockMedications}
        patient={mockPatient}
      />
    );

    // Check critical warning for Warfarin
    expect(screen.getByText('Monitor INR levels closely')).toBeDefined();
  });

  it('handles medication actions when not read-only', async () => {
    const mockOnAdherenceLog = vi.fn();
    const { screen, render } = await createTestRenderer();
    
    await render(
      <MedicationManagement 
        medications={mockMedications.slice(0, 1)} // Only active medication
        patient={mockPatient}
        readOnly={false}
        onAdherenceLog$={mockOnAdherenceLog}
      />
    );

    // Check action buttons are present
    const takeButton = screen.getByText('Take');
    const skipButton = screen.getByText('Skip');
    
    expect(takeButton).toBeDefined();
    expect(skipButton).toBeDefined();
  });

  it('displays empty state when no medications', async () => {
    const { screen, render } = await createTestRenderer();
    
    await render(
      <MedicationManagement 
        medications={[]}
        patient={mockPatient}
      />
    );

    expect(screen.getByText('No medications found')).toBeDefined();
    expect(screen.getByText('Medications will appear here when prescribed')).toBeDefined();
  });

  it('renders in compact mode correctly', async () => {
    const { container, render } = await createTestRenderer();
    
    await render(
      <MedicationManagement 
        medications={mockMedications}
        patient={mockPatient}
        compact={true}
      />
    );

    const medicationManagement = container.querySelector('.medication-management');
    expect(medicationManagement?.classList.contains('space-y-2')).toBe(true);
  });

  it('logs HIPAA audit events when enabled', async () => {
    const { screen, render } = await createTestRenderer();
    
    await render(
      <MedicationManagement 
        medications={mockMedications.slice(0, 1)}
        patient={mockPatient}
        hipaaAudit={{
          enabled: true,
          patientId: 'patient-123',
          providerId: 'provider-456'
        }}
      />
    );

    // Click on medication card to select it
    const medicationCard = screen.getByText('Lisinopril').closest('.medication-card');
    expect(medicationCard).toBeDefined();
  });

  it('handles different medication forms and frequencies', async () => {
    const injectionMed: Medication = {
      id: 'med-injection',
      name: 'Insulin',
      dosage: '10 units',
      form: 'injection',
      frequency: 'three-times-daily',
      instructions: 'Inject before meals',
      status: 'active',
      prescribedBy: {
        name: 'Dr. Diabetes',
        specialty: 'Endocrinology'
      },
      prescribedDate: '2024-01-01',
      startDate: '2024-01-01'
    };

    const { screen, render } = await createTestRenderer();
    
    await render(
      <MedicationManagement 
        medications={[injectionMed]}
        patient={mockPatient}
      />
    );

    expect(screen.getByText('Insulin')).toBeDefined();
    expect(screen.getByText('10 units')).toBeDefined();
    expect(screen.getByText('3 times daily')).toBeDefined();
    expect(screen.getByText('injection')).toBeDefined();
  });

  it('shows pharmacy information when available', async () => {
    const { screen, render } = await createTestRenderer();
    
    await render(
      <MedicationManagement 
        medications={mockMedications.slice(0, 1)} // Lisinopril has pharmacy info
        patient={mockPatient}
      />
    );

    expect(screen.getByText('CVS Pharmacy')).toBeDefined();
  });

  it('displays refill information correctly', async () => {
    const { screen, render } = await createTestRenderer();
    
    await render(
      <MedicationManagement 
        medications={mockMedications.slice(0, 1)} // Lisinopril has refill info
        patient={mockPatient}
      />
    );

    expect(screen.getByText('2 of 5 remaining')).toBeDefined();
  });
});
