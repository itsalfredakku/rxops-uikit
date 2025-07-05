import { createDOM } from '@builder.io/qwik/testing';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EmergencyAlert, type EmergencyAlert as EmergencyAlertData } from '../emergency-alert';

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

describe('EmergencyAlert', () => {
  const mockAlert: EmergencyAlertData = {
    id: 'alert-123',
    type: 'cardiac-arrest',
    severity: 'critical',
    status: 'active',
    title: 'Code Blue - Room 302',
    message: 'Patient experiencing cardiac arrest, immediate response required',
    location: {
      room: '302',
      floor: '3rd Floor',
      building: 'Main Hospital'
    },
    patient: {
      id: 'patient-456',
      name: 'John Doe',
      mrn: 'MRN123456',
      age: 65,
      allergies: ['Penicillin', 'Sulfa drugs', 'Latex']
    },
    reporter: {
      name: 'Nurse Johnson',
      role: 'RN',
      id: 'nurse-123',
      department: 'ICU'
    },
    timestamp: '2024-01-15T14:30:00Z',
    estimatedResponseTime: 5,
    requiredActions: ['call-emergency', 'send-team', 'prepare-equipment'],
    responders: [
      {
        id: 'resp-1',
        name: 'Dr. Smith',
        role: 'Cardiologist',
        status: 'responding',
        eta: 3
      },
      {
        id: 'resp-2',
        name: 'Nurse Team Alpha',
        role: 'Emergency Response',
        status: 'notified',
        eta: 2
      }
    ],
    escalation: {
      level: 1,
      nextEscalation: '2024-01-15T14:40:00Z'
    }
  };

  const mockCurrentUser = {
    id: 'user-789',
    name: 'Dr. Wilson',
    role: 'Emergency Physician'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders emergency alert correctly', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <EmergencyAlert 
        alert={mockAlert}
        currentUser={mockCurrentUser}
      />
    );

    expect(screen.innerHTML).toContain('Code Blue - Room 302');
    expect(screen.innerHTML).toContain('Patient experiencing cardiac arrest');
    expect(screen.innerHTML).toContain('CRITICAL');
  });

  it('displays patient information when provided', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <EmergencyAlert 
        alert={mockAlert}
        currentUser={mockCurrentUser}
      />
    );

    expect(screen.innerHTML).toContain('Patient: John Doe');
    expect(screen.innerHTML).toContain('Penicillin');
    expect(screen.innerHTML).toContain('Allergies:');
  });

  it('shows location information', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <EmergencyAlert 
        alert={mockAlert}
        currentUser={mockCurrentUser}
      />
    );

    expect(screen.innerHTML).toContain('302, 3rd Floor, Main Hospital');
  });

  it('displays severity with appropriate styling', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <EmergencyAlert 
        alert={mockAlert}
        currentUser={mockCurrentUser}
      />
    );

    expect(screen.innerHTML).toContain('data-severity="critical"');
    expect(screen.innerHTML).toContain('border-red-400');
  });

  it('shows life-threatening alerts with pulse animation', async () => {
    const lifeThreatening: EmergencyAlertData = {
      ...mockAlert,
      severity: 'life-threatening'
    };

    const { screen, render } = await createDOM();
    
    await render(
      <EmergencyAlert 
        alert={lifeThreatening}
        currentUser={mockCurrentUser}
      />
    );

    expect(screen.innerHTML).toContain('animate-pulse');
    expect(screen.innerHTML).toContain('border-red-500');
  });

  it('displays status badges correctly', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <EmergencyAlert 
        alert={mockAlert}
        currentUser={mockCurrentUser}
      />
    );

    expect(screen.innerHTML).toContain('ACTIVE');
    expect(screen.innerHTML).toContain('data-status="active"');
  });

  it('shows acknowledge button when user can respond', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <EmergencyAlert 
        alert={mockAlert}
        currentUser={mockCurrentUser}
        canRespond={true}
      />
    );

    expect(screen.innerHTML).toContain('Acknowledge');
  });

  it('displays reporter information', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <EmergencyAlert 
        alert={mockAlert}
        currentUser={mockCurrentUser}
      />
    );

    expect(screen.innerHTML).toContain('Reported by: Nurse Johnson');
  });

  it('shows estimated response time', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <EmergencyAlert 
        alert={mockAlert}
        currentUser={mockCurrentUser}
      />
    );

    expect(screen.innerHTML).toContain('ETA: 5m');
  });

  it('renders in compact mode correctly', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <EmergencyAlert 
        alert={mockAlert}
        currentUser={mockCurrentUser}
        compact={true}
      />
    );

    expect(screen.innerHTML).toContain('p-3');
  });

  it('handles resolved alert status', async () => {
    const resolvedAlert: EmergencyAlertData = {
      ...mockAlert,
      status: 'resolved',
      resolution: {
        timestamp: '2024-01-15T14:45:00Z',
        resolvedBy: 'Dr. Smith',
        notes: 'Patient stabilized successfully',
        outcome: 'resolved'
      }
    };

    const { screen, render } = await createDOM();
    
    await render(
      <EmergencyAlert 
        alert={resolvedAlert}
        currentUser={mockCurrentUser}
      />
    );

    expect(screen.innerHTML).toContain('RESOLVED');
  });

  it('handles different emergency types', async () => {
    const fireAlert: EmergencyAlertData = {
      ...mockAlert,
      type: 'fire',
      title: 'Fire Alarm - Building B',
      message: 'Smoke detected in building B, evacuate immediately'
    };

    const { screen, render } = await createDOM();
    
    await render(
      <EmergencyAlert 
        alert={fireAlert}
        currentUser={mockCurrentUser}
      />
    );

    expect(screen.innerHTML).toContain('Fire Alarm - Building B');
    expect(screen.innerHTML).toContain('evacuate immediately');
  });

  it('handles HIPAA audit configuration', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <EmergencyAlert 
        alert={mockAlert}
        currentUser={mockCurrentUser}
        hipaaAudit={{
          enabled: true,
          patientId: 'patient-456',
          providerId: 'provider-789'
        }}
      />
    );

    // Should render without errors when HIPAA audit is enabled
    expect(screen.innerHTML).toContain('emergency-alert');
  });

  it('displays different severity levels with correct colors', async () => {
    const severities: Array<EmergencyAlertData['severity']> = ['low', 'medium', 'high', 'critical', 'life-threatening'];
    
    for (const severity of severities) {
      const alert = { ...mockAlert, severity };
      const { screen, render } = await createDOM();
      
      await render(
        <EmergencyAlert 
          alert={alert}
          currentUser={mockCurrentUser}
        />
      );

      expect(screen.innerHTML).toContain(`data-severity="${severity}"`);
      
      if (severity === 'life-threatening') {
        expect(screen.innerHTML).toContain('border-red-500');
      } else if (severity === 'critical') {
        expect(screen.innerHTML).toContain('border-red-400');
      } else if (severity === 'high') {
        expect(screen.innerHTML).toContain('border-orange-400');
      } else if (severity === 'medium') {
        expect(screen.innerHTML).toContain('border-yellow-400');
      } else {
        expect(screen.innerHTML).toContain('border-blue-400');
      }
    }
  });

  it('shows time elapsed since alert', async () => {
    // Mock current time to be 10 minutes after alert
    const _alertTime = new Date('2024-01-15T14:30:00Z');
    const currentTime = new Date('2024-01-15T14:40:00Z');
    
    vi.spyOn(Date, 'now').mockReturnValue(currentTime.getTime());
    
    const { screen, render } = await createDOM();
    
    await render(
      <EmergencyAlert 
        alert={mockAlert}
        currentUser={mockCurrentUser}
      />
    );

    // Should show some time indication
    expect(screen.innerHTML).toContain('ago');
    
    vi.restoreAllMocks();
  });

  it('handles alert without patient information', async () => {
    const alertWithoutPatient: EmergencyAlertData = {
      ...mockAlert,
      patient: undefined
    };

    const { screen, render } = await createDOM();
    
    await render(
      <EmergencyAlert 
        alert={alertWithoutPatient}
        currentUser={mockCurrentUser}
      />
    );

    expect(screen.innerHTML).not.toContain('Patient:');
    expect(screen.innerHTML).toContain('Code Blue - Room 302');
  });
});
