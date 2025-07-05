import { describe, it, expect } from 'vitest';
import { createDOM } from '@builder.io/qwik/testing';
import { HealthDashboard, type HealthMetric, type Appointment, type HealthAlert, type MedicationReminder } from '../health-dashboard';

// Mock data
const mockMetrics: HealthMetric[] = [
  {
    id: '1',
    name: 'Blood Pressure',
    value: '120/80',
    unit: 'mmHg',
    lastUpdated: '2024-01-15T10:00:00Z',
    trend: 'stable',
    status: 'normal',
    targetRange: { min: 90, max: 140 }
  },
  {
    id: '2',
    name: 'Heart Rate',
    value: 75,
    unit: 'bpm',
    lastUpdated: '2024-01-15T10:00:00Z',
    trend: 'down',
    status: 'normal',
    targetRange: { min: 60, max: 100 }
  },
  {
    id: '3',
    name: 'Blood Sugar',
    value: 180,
    unit: 'mg/dL',
    lastUpdated: '2024-01-15T10:00:00Z',
    trend: 'up',
    status: 'warning',
    targetRange: { min: 80, max: 130 }
  }
];

const mockAppointments: Appointment[] = [
  {
    id: '1',
    title: 'Annual Physical',
    provider: 'Dr. Smith',
    date: '2024-01-20T00:00:00Z',
    time: '10:00',
    type: 'consultation',
    status: 'scheduled'
  },
  {
    id: '2',
    title: 'Blood Test Follow-up',
    provider: 'Dr. Johnson',
    date: '2024-01-25T00:00:00Z',
    time: '14:30',
    type: 'follow-up',
    status: 'confirmed',
    isVirtual: true
  }
];

const mockAlerts: HealthAlert[] = [
  {
    id: '1',
    type: 'vital',
    severity: 'high',
    title: 'High Blood Sugar Alert',
    message: 'Your blood sugar reading is above the target range',
    date: '2024-01-15T10:00:00Z',
    read: false,
    actions: [
      { label: 'View Details', action: 'view' },
      { label: 'Contact Doctor', action: 'contact' }
    ]
  },
  {
    id: '2',
    type: 'medication',
    severity: 'medium',
    title: 'Medication Reminder',
    message: 'Time to take your evening medication',
    date: '2024-01-15T18:00:00Z',
    read: true
  }
];

const mockMedicationReminders: MedicationReminder[] = [
  {
    id: '1',
    medicationName: 'Lisinopril',
    dosage: '10mg',
    time: '08:00:00',
    taken: false,
    skipped: false,
    late: false
  },
  {
    id: '2',
    medicationName: 'Metformin',
    dosage: '500mg',
    time: '12:00:00',
    taken: false,
    skipped: false,
    late: true
  }
];

describe('HealthDashboard', () => {
  it('should create component with basic props', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <HealthDashboard 
        patientId="patient-123"
        patientName="John Doe"
        metrics={mockMetrics}
        upcomingAppointments={mockAppointments}
        alerts={mockAlerts}
        medicationReminders={mockMedicationReminders}
      />
    );

    expect(screen.outerHTML).toContain('Health Dashboard');
    expect(screen.outerHTML).toContain('Welcome back, John Doe');
  });

  it('should display health metrics correctly', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <HealthDashboard 
        patientId="patient-123"
        patientName="John Doe"
        metrics={mockMetrics}
        upcomingAppointments={[]}
        alerts={[]}
        medicationReminders={[]}
      />
    );

    expect(screen.outerHTML).toContain('Blood Pressure');
    expect(screen.outerHTML).toContain('120/80');
    expect(screen.outerHTML).toContain('Heart Rate');
    expect(screen.outerHTML).toContain('75');
    expect(screen.outerHTML).toContain('Blood Sugar');
    expect(screen.outerHTML).toContain('180');
  });

  it('should show metric status indicators', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <HealthDashboard 
        patientId="patient-123"
        patientName="John Doe"
        metrics={mockMetrics}
        upcomingAppointments={[]}
        alerts={[]}
        medicationReminders={[]}
      />
    );

    // Check for different status colors applied via CSS classes
    expect(screen.outerHTML).toContain('text-green-600'); // normal status
    expect(screen.outerHTML).toContain('text-yellow-600'); // warning status
  });

  it('should display upcoming appointments', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <HealthDashboard 
        patientId="patient-123"
        patientName="John Doe"
        metrics={[]}
        upcomingAppointments={mockAppointments}
        alerts={[]}
        medicationReminders={[]}
      />
    );

    expect(screen.outerHTML).toContain('Upcoming Appointments');
    expect(screen.outerHTML).toContain('Annual Physical');
    expect(screen.outerHTML).toContain('Dr. Smith');
    expect(screen.outerHTML).toContain('Blood Test Follow-up');
    expect(screen.outerHTML).toContain('Dr. Johnson');
  });

  it('should show virtual appointment indicators', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <HealthDashboard 
        patientId="patient-123"
        patientName="John Doe"
        metrics={[]}
        upcomingAppointments={mockAppointments}
        alerts={[]}
        medicationReminders={[]}
      />
    );

    expect(screen.outerHTML).toContain('Virtual');
  });

  it('should display priority alerts', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <HealthDashboard 
        patientId="patient-123"
        patientName="John Doe"
        metrics={[]}
        upcomingAppointments={[]}
        alerts={mockAlerts}
        medicationReminders={[]}
      />
    );

    expect(screen.outerHTML).toContain('Priority Alerts');
    expect(screen.outerHTML).toContain('High Blood Sugar Alert');
    expect(screen.outerHTML).toContain('Your blood sugar reading is above the target range');
  });

  it('should show medication reminders', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <HealthDashboard 
        patientId="patient-123"
        patientName="John Doe"
        metrics={[]}
        upcomingAppointments={[]}
        alerts={[]}
        medicationReminders={mockMedicationReminders}
      />
    );

    expect(screen.outerHTML).toContain('Medications Due');
    expect(screen.outerHTML).toContain('Lisinopril');
    expect(screen.outerHTML).toContain('10mg');
    expect(screen.outerHTML).toContain('Metformin');
    expect(screen.outerHTML).toContain('500mg');
  });

  it('should show late medication indicators', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <HealthDashboard 
        patientId="patient-123"
        patientName="John Doe"
        metrics={[]}
        upcomingAppointments={[]}
        alerts={[]}
        medicationReminders={mockMedicationReminders}
      />
    );

    expect(screen.outerHTML).toContain('Late');
  });

  it('should display summary statistics', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <HealthDashboard 
        patientId="patient-123"
        patientName="John Doe"
        metrics={mockMetrics}
        upcomingAppointments={mockAppointments}
        alerts={mockAlerts}
        medicationReminders={mockMedicationReminders}
      />
    );

    expect(screen.outerHTML).toContain('3'); // metrics count
    expect(screen.outerHTML).toContain('2'); // appointments count
    expect(screen.outerHTML).toContain('Health Metrics');
    expect(screen.outerHTML).toContain('Appointments');
  });

  it('should show quick actions when enabled', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <HealthDashboard 
        patientId="patient-123"
        patientName="John Doe"
        metrics={[]}
        upcomingAppointments={[]}
        alerts={[]}
        medicationReminders={[]}
        showQuickActions={true}
      />
    );

    expect(screen.outerHTML).toContain('Add Metric');
    expect(screen.outerHTML).toContain('Schedule');
  });

  it('should handle empty states correctly', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <HealthDashboard 
        patientId="patient-123"
        patientName="John Doe"
        metrics={[]}
        upcomingAppointments={[]}
        alerts={[]}
        medicationReminders={[]}
      />
    );

    expect(screen.outerHTML).toContain('No health metrics recorded');
    expect(screen.outerHTML).toContain('No upcoming appointments');
  });

  it('should display medication action buttons', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <HealthDashboard 
        patientId="patient-123"
        patientName="John Doe"
        metrics={[]}
        upcomingAppointments={[]}
        alerts={[]}
        medicationReminders={mockMedicationReminders}
      />
    );

    expect(screen.outerHTML).toContain('Taken');
    expect(screen.outerHTML).toContain('Skip');
  });

  it('should show alert action buttons', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <HealthDashboard 
        patientId="patient-123"
        patientName="John Doe"
        metrics={[]}
        upcomingAppointments={[]}
        alerts={mockAlerts}
        medicationReminders={[]}
      />
    );

    expect(screen.outerHTML).toContain('View Details');
    expect(screen.outerHTML).toContain('Contact Doctor');
  });

  it('should apply custom className', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <HealthDashboard 
        patientId="patient-123"
        patientName="John Doe"
        metrics={[]}
        upcomingAppointments={[]}
        alerts={[]}
        medicationReminders={[]}
        class="custom-dashboard"
      />
    );

    expect(screen.outerHTML).toContain('custom-dashboard');
  });

  it('should display time range selector', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <HealthDashboard 
        patientId="patient-123"
        patientName="John Doe"
        metrics={mockMetrics}
        upcomingAppointments={[]}
        alerts={[]}
        medicationReminders={[]}
      />
    );

    expect(screen.outerHTML).toContain('24 Hours');
    expect(screen.outerHTML).toContain('7 Days');
    expect(screen.outerHTML).toContain('30 Days');
    expect(screen.outerHTML).toContain('90 Days');
  });

  it('should show target ranges for metrics', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <HealthDashboard 
        patientId="patient-123"
        patientName="John Doe"
        metrics={mockMetrics}
        upcomingAppointments={[]}
        alerts={[]}
        medicationReminders={[]}
      />
    );

    expect(screen.outerHTML).toContain('Target:');
    expect(screen.outerHTML).toContain('90 - 140');
    expect(screen.outerHTML).toContain('60 - 100');
  });
});
