import { createDOM } from '@builder.io/qwik/testing';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VitalSignsChart, type VitalSignReading } from '../vital-signs-chart';

// Mock the utility modules
vi.mock('../../../utils/hipaa', () => ({
  hipaaAuditor: {
    logAccess: vi.fn(),
    logProgress: vi.fn()
  }
}));

vi.mock('../../../utils/performance', () => ({
  performanceMonitor: {
    markStart: vi.fn(),
    markEnd: vi.fn(),
    measure: vi.fn()
  }
}));

describe('VitalSignsChart', () => {
  const mockVitals: VitalSignReading[] = [
    {
      id: 'vital-1',
      type: 'blood-pressure',
      value: '120/80',
      unit: 'mmHg',
      systolic: 120,
      diastolic: 80,
      timestamp: '2024-01-15T10:30:00Z',
      status: 'normal',
      takenBy: {
        name: 'Nurse Johnson',
        role: 'RN',
        id: 'nurse-123'
      },
      location: 'Room 101',
      device: 'Omron BP Monitor',
      verified: true
    },
    {
      id: 'vital-2',
      type: 'heart-rate',
      value: 75,
      unit: 'bpm',
      timestamp: '2024-01-15T10:32:00Z',
      status: 'normal',
      takenBy: {
        name: 'Nurse Johnson',
        role: 'RN',
        id: 'nurse-123'
      },
      verified: true
    },
    {
      id: 'vital-3',
      type: 'temperature',
      value: 98.6,
      unit: 'F',
      timestamp: '2024-01-15T10:35:00Z',
      status: 'normal',
      takenBy: {
        name: 'Nurse Johnson',
        role: 'RN',
        id: 'nurse-123'
      }
    }
  ];

  const mockPatient = {
    id: 'patient-123',
    name: 'John Doe',
    age: 45,
    gender: 'male' as const
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders vital signs chart correctly', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <VitalSignsChart 
        vitals={mockVitals}
        patient={mockPatient}
      />
    );

    // Check that component renders without errors
    expect(screen.innerHTML).toContain('vital-signs-chart');
    expect(screen.innerHTML).toContain('Vital Signs');
  });

  it('displays patient information', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <VitalSignsChart 
        vitals={mockVitals}
        patient={mockPatient}
      />
    );

    expect(screen.innerHTML).toContain('Patient: John Doe');
  });

  it('handles empty vitals list', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <VitalSignsChart 
        vitals={[]}
        patient={mockPatient}
      />
    );

    expect(screen.innerHTML).toContain('No vital signs found');
  });

  it('applies compact styling when compact prop is true', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <VitalSignsChart 
        vitals={mockVitals}
        patient={mockPatient}
        compact={true}
      />
    );

    expect(screen.innerHTML).toContain('space-y-3');
  });

  it('shows time range selector', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <VitalSignsChart 
        vitals={mockVitals}
        patient={mockPatient}
      />
    );

    expect(screen.innerHTML).toContain('Last 24 Hours');
    expect(screen.innerHTML).toContain('select');
  });

  it('displays vitals in table mode', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <VitalSignsChart 
        vitals={mockVitals}
        patient={mockPatient}
        mode="table"
      />
    );

    expect(screen.innerHTML).toContain('Blood Pressure');
    expect(screen.innerHTML).toContain('Heart Rate');
    expect(screen.innerHTML).toContain('120/80');
  });

  it('handles critical vitals alert', async () => {
    const criticalVitals: VitalSignReading[] = [
      {
        id: 'critical-1',
        type: 'blood-pressure',
        value: '220/120',
        unit: 'mmHg',
        systolic: 220,
        diastolic: 120,
        timestamp: '2024-01-15T10:30:00Z',
        status: 'critical',
        takenBy: {
          name: 'Nurse Emergency',
          role: 'RN',
          id: 'nurse-emergency'
        }
      }
    ];

    const { screen, render } = await createDOM();
    
    await render(
      <VitalSignsChart 
        vitals={criticalVitals}
        patient={mockPatient}
        showAlerts={true}
      />
    );

    expect(screen.innerHTML).toContain('Critical Values Detected');
  });

  it('handles HIPAA audit configuration', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <VitalSignsChart 
        vitals={mockVitals}
        patient={mockPatient}
        hipaaAudit={{
          enabled: true,
          patientId: 'patient-123',
          providerId: 'provider-456'
        }}
      />
    );

    // Should render without errors when HIPAA audit is enabled
    expect(screen.innerHTML).toContain('vital-signs-chart');
  });

  it('displays normal ranges when enabled', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <VitalSignsChart 
        vitals={mockVitals}
        patient={mockPatient}
        showNormalRanges={true}
        mode="table"
      />
    );

    expect(screen.innerHTML).toContain('Normal:');
  });
});
