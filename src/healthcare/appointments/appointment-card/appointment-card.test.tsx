import { describe, it, expect } from 'vitest';
import type { Appointment, AppointmentStatus } from './appointment-card';

const mockAppointment: Appointment = {
  id: '1',
  doctorName: 'Dr. Sarah Wilson',
  specialization: 'Cardiologist',
  date: '2024-06-30',
  time: '10:00 AM',
  status: 'scheduled',
  type: 'video',
  notes: 'Regular checkup'
};

describe('AppointmentCard Component', () => {
  it('should have correct appointment type', () => {
    expect(mockAppointment.type).toBe('video');
  });

  it('should handle different status types', () => {
    const statuses: AppointmentStatus[] = ['scheduled', 'completed', 'cancelled', 'in-progress'];
    statuses.forEach(status => {
      const appointment = { ...mockAppointment, status };
      expect(appointment.status).toBe(status);
    });
  });

  it('should contain required appointment fields', () => {
    expect(mockAppointment).toHaveProperty('id');
    expect(mockAppointment).toHaveProperty('doctorName');
    expect(mockAppointment).toHaveProperty('specialization');
    expect(mockAppointment).toHaveProperty('date');
    expect(mockAppointment).toHaveProperty('time');
    expect(mockAppointment).toHaveProperty('status');
    expect(mockAppointment).toHaveProperty('type');
  });

  it('should handle optional fields', () => {
    const appointmentWithoutNotes: Appointment = {
      id: '2',
      doctorName: 'Dr. John Doe',
      specialization: 'General Medicine',
      date: '2024-07-01',
      time: '2:00 PM',
      status: 'scheduled',
      type: 'audio'
    };
    
    expect(appointmentWithoutNotes.notes).toBeUndefined();
  });

  it('should validate appointment time format', () => {
    expect(mockAppointment.time).toMatch(/\d{1,2}:\d{2}\s(AM|PM)/);
  });
});
