import { expect, afterEach } from 'vitest';
import '@testing-library/jest-dom';

// Cleanup after each test
afterEach(() => {
  document.body.innerHTML = '';
});

// Healthcare-specific test utilities
export const healthcareTestUtils = {
  // Mock patient data
  mockPatient: {
    id: 'P001',
    name: 'John Doe',
    age: 45,
    gender: 'Male',
    dateOfBirth: '1979-05-15',
    bloodType: 'O+',
    allergies: ['Penicillin'],
    emergencyContact: {
      name: 'Jane Doe',
      relationship: 'Spouse',
      phone: '+1 (555) 123-4567'
    }
  },

  // Mock doctor data
  mockDoctor: {
    id: 'D001',
    name: 'Dr. Sarah Wilson',
    specialty: 'Cardiology',
    credentials: ['MD', 'FACC'],
    rating: 4.8,
    reviewCount: 127
  },

  // Mock medications
  mockMedications: [
    {
      id: 'MED001',
      name: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Once daily',
      nextDose: '2025-07-02T08:00:00Z'
    }
  ]
};

// Export utilities
export {
  healthcareTestUtils as healthcare
};
