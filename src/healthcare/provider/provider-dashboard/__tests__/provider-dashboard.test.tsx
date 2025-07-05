import { describe, test, expect } from 'vitest';
import { createDOM } from '@builder.io/qwik/testing';
import { ProviderDashboard } from '../provider-dashboard';
import type { PatientQueueItem, ProviderSchedule, ProviderNotification, ProviderMetrics, QuickAction } from '../provider-dashboard';

// Mock data for testing
const mockPatientQueue: PatientQueueItem[] = [
  {
    id: 'queue-1',
    patientId: 'patient-1',
    patientName: 'John Smith',
    appointmentId: 'apt-1',
    appointmentTime: '10:00 AM',
    appointmentType: 'consultation',
    priority: 'urgent',
    status: 'waiting',
    reasonForVisit: 'Chest pain and difficulty breathing',
    estimatedDuration: 30,
    waitTime: 15,
    roomNumber: 'Room 101',
    medicalAlerts: ['Allergic to Penicillin', 'High Blood Pressure'],
    lastVitals: {
      bloodPressure: '140/90',
      heartRate: 85,
      temperature: 99.2,
      oxygenSaturation: 97
    }
  },
  {
    id: 'queue-2',
    patientId: 'patient-2',
    patientName: 'Sarah Johnson',
    appointmentId: 'apt-2',
    appointmentTime: '10:30 AM',
    appointmentType: 'follow-up',
    priority: 'normal',
    status: 'in-progress',
    reasonForVisit: 'Follow-up on diabetes management',
    estimatedDuration: 20,
    waitTime: 5,
    roomNumber: 'Room 102'
  }
];

const mockSchedule: ProviderSchedule[] = [
  {
    id: 'schedule-1',
    date: '2024-01-15',
    startTime: '09:00',
    endTime: '12:00',
    appointments: 6,
    availableSlots: 2,
    status: 'active'
  }
];

const mockNotifications: ProviderNotification[] = [
  {
    id: 'notif-1',
    type: 'alert',
    severity: 'critical',
    title: 'Critical Lab Result',
    message: 'Patient John Smith has abnormal lab results requiring immediate attention',
    timestamp: '2024-01-15T10:30:00Z',
    read: false,
    actionRequired: true,
    patientId: 'patient-1',
    patientName: 'John Smith'
  }
];

const mockMetrics: ProviderMetrics = {
  totalPatients: 150,
  todayAppointments: 12,
  completedConsultations: 8,
  pendingActions: 3,
  averageConsultationTime: 25,
  patientSatisfactionScore: 4.8,
  revenue: {
    today: 1250,
    thisWeek: 8500,
    thisMonth: 32000
  }
};

const mockQuickActions: QuickAction[] = [
  {
    id: 'action-1',
    label: 'New Prescription',
    icon: 'fas fa-prescription-bottle-alt',
    action: 'new-prescription',
    shortcut: 'Ctrl+P',
    badge: 2
  }
];

describe('ProviderDashboard Component', () => {
  test('renders basic provider dashboard structure', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <ProviderDashboard
        providerId="provider-1"
        providerName="Dr. Sarah Johnson"
        specialty="Internal Medicine"
        patientQueue={mockPatientQueue}
        schedule={mockSchedule}
        notifications={mockNotifications}
        metrics={mockMetrics}
        quickActions={mockQuickActions}
      />
    );

    // Test that component renders without throwing
    expect(screen.outerHTML).toBeTruthy();
  });

  test('renders with empty patient queue', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <ProviderDashboard
        providerId="provider-1"
        providerName="Dr. Sarah Johnson"
        specialty="Internal Medicine"
        patientQueue={[]}
        schedule={mockSchedule}
        notifications={mockNotifications}
        metrics={mockMetrics}
      />
    );

    // Test that component renders without throwing
    expect(screen.outerHTML).toBeTruthy();
  });

  test('handles required props correctly', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <ProviderDashboard
        providerId="provider-1"
        providerName="Dr. Sarah Johnson"
        specialty="Internal Medicine"
        patientQueue={mockPatientQueue}
        schedule={mockSchedule}
        notifications={mockNotifications}
        metrics={mockMetrics}
      />
    );

    // Test that component renders the basic structure
    expect(screen.outerHTML).toContain('provider-dashboard');
  });

  test('renders with different patient priorities', async () => {
    const { screen, render } = await createDOM();
    
    const priorityQueue: PatientQueueItem[] = [
      {
        id: 'urgent',
        patientId: 'patient-urgent',
        patientName: 'Emergency Patient',
        appointmentId: 'apt-urgent',
        appointmentTime: '09:00 AM',
        appointmentType: 'emergency',
        priority: 'urgent',
        status: 'waiting',
        reasonForVisit: 'Chest pain',
        estimatedDuration: 30,
        waitTime: 5
      },
      {
        id: 'normal',
        patientId: 'patient-normal',
        patientName: 'Regular Patient',
        appointmentId: 'apt-normal',
        appointmentTime: '10:00 AM',
        appointmentType: 'consultation',
        priority: 'normal',
        status: 'waiting',
        reasonForVisit: 'Routine checkup',
        estimatedDuration: 20,
        waitTime: 10
      }
    ];
    
    await render(
      <ProviderDashboard
        providerId="provider-1"
        providerName="Dr. Sarah Johnson"  
        specialty="Internal Medicine"
        patientQueue={priorityQueue}
        schedule={mockSchedule}
        notifications={mockNotifications}
        metrics={mockMetrics}
      />
    );

    // Test that component handles different priorities
    expect(screen.outerHTML).toBeTruthy();
  });

  test('renders with notification badges', async () => {
    const { screen, render } = await createDOM();
    
    const notifications: ProviderNotification[] = [
      ...mockNotifications,
      {
        id: 'notif-2',
        type: 'reminder',
        severity: 'medium',
        title: 'Appointment Reminder',
        message: 'Next patient in 15 minutes',
        timestamp: '2024-01-15T10:15:00Z',
        read: false,
        actionRequired: false
      }
    ];
    
    await render(
      <ProviderDashboard
        providerId="provider-1"
        providerName="Dr. Sarah Johnson"
        specialty="Internal Medicine"
        patientQueue={mockPatientQueue}
        schedule={mockSchedule}
        notifications={notifications}
        metrics={mockMetrics}
      />
    );

    // Test that component renders with multiple notifications
    expect(screen.outerHTML).toBeTruthy();
  });

  test('renders with conditional sections disabled', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <ProviderDashboard
        providerId="provider-1"
        providerName="Dr. Sarah Johnson"
        specialty="Internal Medicine"
        patientQueue={mockPatientQueue}
        schedule={mockSchedule}
        notifications={mockNotifications}
        metrics={mockMetrics}
        showMetrics={false}
        showNotifications={false}
        showPatientQueue={true}
        showSchedule={false}
      />
    );

    // Test that component renders with conditional sections
    expect(screen.outerHTML).toBeTruthy();
  });

  test('handles patient status variations', async () => {
    const { screen, render } = await createDOM();
    
    const statusQueue: PatientQueueItem[] = [
      {
        id: 'waiting',
        patientId: 'patient-waiting',
        patientName: 'Waiting Patient',
        appointmentId: 'apt-waiting',
        appointmentTime: '09:00 AM',
        appointmentType: 'consultation',
        priority: 'normal',
        status: 'waiting',
        reasonForVisit: 'Checkup',
        estimatedDuration: 20,
        waitTime: 10
      },
      {
        id: 'progress',
        patientId: 'patient-progress',
        patientName: 'In Progress Patient',
        appointmentId: 'apt-progress',
        appointmentTime: '09:30 AM',
        appointmentType: 'consultation',
        priority: 'normal',
        status: 'in-progress',
        reasonForVisit: 'Follow-up',
        estimatedDuration: 15,
        waitTime: 0
      },
      {
        id: 'completed',
        patientId: 'patient-completed',
        patientName: 'Completed Patient',
        appointmentId: 'apt-completed',
        appointmentTime: '08:30 AM',
        appointmentType: 'consultation',
        priority: 'normal',
        status: 'completed',
        reasonForVisit: 'Routine',
        estimatedDuration: 25,
        waitTime: 0
      }
    ];
    
    await render(
      <ProviderDashboard
        providerId="provider-1"
        providerName="Dr. Sarah Johnson"
        specialty="Internal Medicine"
        patientQueue={statusQueue}
        schedule={mockSchedule}
        notifications={mockNotifications}
        metrics={mockMetrics}
      />
    );

    // Test that component handles different patient statuses
    expect(screen.outerHTML).toBeTruthy();
  });

  test('renders provider dashboard types', () => {
    // Test that the types are properly exported
    const patientQueue: PatientQueueItem = {
      id: 'test',
      patientId: 'test',
      patientName: 'Test Patient',
      appointmentId: 'test',
      appointmentTime: '10:00',
      appointmentType: 'consultation',
      priority: 'normal',
      status: 'waiting',
      reasonForVisit: 'Test',
      estimatedDuration: 30,
      waitTime: 5
    };

    const schedule: ProviderSchedule = {
      id: 'test',
      date: '2024-01-15',
      startTime: '09:00',
      endTime: '17:00',
      appointments: 8,
      availableSlots: 2,
      status: 'active'
    };

    const notification: ProviderNotification = {
      id: 'test',
      type: 'alert',
      severity: 'medium',
      title: 'Test',
      message: 'Test message',
      timestamp: '2024-01-15T10:00:00Z',
      read: false
    };

    const metrics: ProviderMetrics = {
      totalPatients: 100,
      todayAppointments: 10,
      completedConsultations: 5,
      pendingActions: 2,
      averageConsultationTime: 25,
      patientSatisfactionScore: 4.5,
      revenue: {
        today: 1000,
        thisWeek: 5000,
        thisMonth: 20000
      }
    };

    const quickAction: QuickAction = {
      id: 'test',
      label: 'Test Action',
      icon: 'fas fa-test',
      action: 'test'
    };

    // Test that types are properly structured
    expect(patientQueue.id).toBe('test');
    expect(schedule.status).toBe('active');
    expect(notification.type).toBe('alert');
    expect(metrics.totalPatients).toBe(100);
    expect(quickAction.label).toBe('Test Action');
  });
});
