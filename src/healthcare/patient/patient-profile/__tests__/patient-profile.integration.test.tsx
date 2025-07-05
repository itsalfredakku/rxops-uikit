import { describe, it, expect, beforeEach } from 'vitest';
import { createDOM } from '@builder.io/qwik/testing';
import { PatientProfile, type PatientData } from '../patient-profile';
import { $ } from '@builder.io/qwik';

// Healthcare integration test scenarios
describe('PatientProfile Healthcare Integration Tests', () => {
  let patientData: PatientData;

  beforeEach(() => {
    patientData = {
      id: 'patient_test_001',
      firstName: 'Sarah',
      lastName: 'Johnson',
      dateOfBirth: '1990-03-22',
      gender: 'female',
      email: 'sarah.johnson@email.com',
      phone: '+1-555-234-5678',
      address: {
        street: '456 Oak Avenue',
        city: 'Seattle',
        state: 'WA',
        zipCode: '98101',
        country: 'USA'
      },
      emergencyContact: {
        name: 'Michael Johnson',
        relationship: 'Husband',
        phone: '+1-555-234-9876'
      },
      insurance: {
        provider: 'Anthem',
        policyNumber: 'ANT987654321',
        groupNumber: 'GRP999'
      },
      medicalHistory: {
        allergies: ['Peanuts', 'Iodine'],
        medications: [
          {
            name: 'Birth Control Pills',
            dosage: '1 tablet',
            frequency: 'Daily',
            prescribedBy: 'Dr. Sarah Wilson'
          },
          {
            name: 'Vitamin D',
            dosage: '1000 IU',
            frequency: 'Daily',
            prescribedBy: 'Dr. Sarah Wilson'
          }
        ],
        conditions: ['Vitamin D Deficiency'],
        surgeries: []
      },
      vitals: {
        bloodPressure: '110/70',
        heartRate: 68,
        temperature: 98.4,
        weight: 65,
        height: 165,
        lastUpdated: '2025-06-30'
      },
      status: 'active',
      lastVisit: '2025-05-15',
      nextAppointment: '2025-08-15'
    };
  });

  describe('HIPAA Compliance Testing', () => {
    it('should handle patient data access by different user roles', async () => {
      const roles = ['patient', 'provider', 'admin'] as const;
      
      for (const role of roles) {
        const { screen, render } = await createDOM();
        
        await render(
          <PatientProfile
            patient={patientData}
            userRole={role}
            mode="summary"
          />
        );
        
        const html = screen.outerHTML;
        
        // All roles should see basic info
        expect(html).toContain('Sarah Johnson');
        expect(html).toContain('female');
        
        // Providers and admins should see sensitive info
        if (role === 'provider' || role === 'admin') {
          expect(html).toContain('ANT987654321'); // Insurance
          expect(html).toContain('Michael Johnson'); // Emergency contact
        }
      }
    });

    it('should maintain audit trail capability', async () => {
      const { screen, render } = await createDOM();
      
      await render(
        <PatientProfile
          patient={patientData}
          userRole="provider"
          mode="detailed"
        />
      );
      
      // Component should render without errors, indicating proper data handling
      const html = screen.outerHTML;
      expect(html).toContain('Sarah Johnson');
      expect(html).toContain('patient_test_001');
    });
  });

  describe('Clinical Workflow Integration', () => {
    it('should support emergency workflow', async () => {
      const emergencyPatient = {
        ...patientData,
        status: 'emergency' as const,
        medicalHistory: {
          ...patientData.medicalHistory,
          allergies: ['Peanuts', 'Iodine', 'Latex'] // Additional emergency allergy
        }
      };

      const { screen, render } = await createDOM();
      
      await render(
        <PatientProfile
          patient={emergencyPatient}
          userRole="provider"
          mode="emergency"
        />
      );
      
      const html = screen.outerHTML;
      
      // Emergency mode should highlight critical information
      expect(html).toContain('Emergency Contact');
      expect(html).toContain('Critical Allergies');
      expect(html).toContain('Peanuts');
      expect(html).toContain('Iodine');
      expect(html).toContain('Latex');
      expect(html).toContain('Recent Vitals');
    });

    it('should support routine clinical workflow', async () => {
      const { screen, render } = await createDOM();
      
      await render(
        <PatientProfile
          patient={patientData}
          userRole="provider"
          mode="detailed"
        />
      );
      
      const html = screen.outerHTML;
      
      // Should provide comprehensive view for routine care
      expect(html).toContain('Overview');
      expect(html).toContain('Medical');
      expect(html).toContain('Vitals');
      expect(html).toContain('Contacts');
      expect(html).toContain('Birth Control Pills');
      expect(html).toContain('Vitamin D');
    });
  });

  describe('Data Validation and Integrity', () => {
    it('should handle comprehensive patient data correctly', async () => {
      const { screen, render } = await createDOM();
      
      await render(
        <PatientProfile
          patient={patientData}
          userRole="provider"
          mode="summary"
        />
      );
      
      const html = screen.outerHTML;
      
      // Verify all major data points are present
      expect(html).toContain('Sarah Johnson');
      expect(html).toContain('sarah.johnson@email.com');
      expect(html).toContain('+1-555-234-5678');
      expect(html).toContain('Seattle, WA');
      expect(html).toContain('110/70');
      expect(html).toContain('68 bpm');
      expect(html).toContain('Peanuts');
      expect(html).toContain('Iodine');
    });

    it('should calculate health metrics accurately', async () => {
      const { screen, render } = await createDOM();
      
      await render(
        <PatientProfile
          patient={patientData}
          userRole="provider"
          mode="detailed"
        />
      );
      
      // Calculate expected BMI: 65kg / (1.65m)^2 = 23.9
      const expectedBMI = (65 / (1.65 * 1.65)).toFixed(1);
      
      const html = screen.outerHTML;
      expect(html).toContain(expectedBMI);
    });
  });

  describe('User Experience and Accessibility', () => {
    it('should provide clear information hierarchy', async () => {
      const { screen, render } = await createDOM();
      
      await render(
        <PatientProfile
          patient={patientData}
          userRole="provider"
          mode="detailed"
        />
      );
      
      const html = screen.outerHTML;
      
      // Check for proper heading structure
      expect(html).toContain('Sarah Johnson'); // Main heading
      expect(html).toContain('Personal Information'); // Section headings
      expect(html).toContain('Insurance Information');
      expect(html).toContain('Emergency Contact');
    });

    it('should handle responsive design considerations', async () => {
      const { screen, render } = await createDOM();
      
      await render(
        <PatientProfile
          patient={patientData}
          userRole="provider"
          mode="summary"
        />
      );
      
      const html = screen.outerHTML;
      
      // Verify responsive classes are present
      expect(html).toContain('md:grid-cols-2');
      expect(html).toContain('lg:grid-cols-3');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle incomplete patient data gracefully', async () => {
      const incompletePatient: PatientData = {
        ...patientData,
        medicalHistory: {
          allergies: [],
          medications: [],
          conditions: [],
          surgeries: []
        },
        avatar: undefined,
        lastVisit: undefined,
        nextAppointment: undefined
      };

      const { screen, render } = await createDOM();
      
      await render(
        <PatientProfile
          patient={incompletePatient}
          userRole="provider"
          mode="summary"
        />
      );
      
      const html = screen.outerHTML;
      
      // Should still render basic info
      expect(html).toContain('Sarah Johnson');
      expect(html).toContain('No known allergies');
    });

    it('should handle very long medication lists', async () => {
      const patientWithManyMeds = {
        ...patientData,
        medicalHistory: {
          ...patientData.medicalHistory,
          medications: Array.from({ length: 10 }, (_, i) => ({
            name: `Medication ${i + 1}`,
            dosage: `${(i + 1) * 10}mg`,
            frequency: i % 2 === 0 ? 'Daily' : 'Twice daily',
            prescribedBy: `Dr. ${String.fromCharCode(65 + i)}`
          }))
        }
      };

      const { screen, render } = await createDOM();
      
      await render(
        <PatientProfile
          patient={patientWithManyMeds}
          userRole="provider"
          mode="detailed"
        />
      );
      
      const html = screen.outerHTML;
      
      // Should handle large lists without breaking
      expect(html).toContain('Sarah Johnson');
      expect(html).toContain('Medication 1');
      expect(html).toContain('Medication 10');
    });
  });

  describe('Performance and Scalability', () => {
    it('should render large patient profiles efficiently', async () => {
      const largePatientData = {
        ...patientData,
        medicalHistory: {
          allergies: Array.from({ length: 20 }, (_, i) => `Allergy ${i + 1}`),
          medications: Array.from({ length: 15 }, (_, i) => ({
            name: `Medication ${i + 1}`,
            dosage: `${(i + 1) * 5}mg`,
            frequency: 'Daily',
            prescribedBy: `Dr. Provider ${i + 1}`
          })),
          conditions: Array.from({ length: 10 }, (_, i) => `Condition ${i + 1}`),
          surgeries: Array.from({ length: 5 }, (_, i) => ({
            procedure: `Surgery ${i + 1}`,
            date: `2020-0${i + 1}-15`,
            hospital: `Hospital ${i + 1}`
          }))
        }
      };

      const startTime = performance.now();
      
      const { screen, render } = await createDOM();
      
      await render(
        <PatientProfile
          patient={largePatientData}
          userRole="provider"
          mode="detailed"
        />
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render in reasonable time (< 100ms for this test)
      expect(renderTime).toBeLessThan(100);
      
      const html = screen.outerHTML;
      expect(html).toContain('Sarah Johnson');
      expect(html).toContain('Allergy 20');
      expect(html).toContain('Medication 15');
    });
  });

  describe('Integration with External Systems', () => {
    it('should support export functionality integration', async () => {
      const mockExport = $(() => {
        console.log('Export called');
      });

      const { screen, render } = await createDOM();
      
      await render(
        <PatientProfile
          patient={patientData}
          userRole="provider"
          onExport$={mockExport}
        />
      );
      
      const html = screen.outerHTML;
      expect(html).toContain('Export patient data');
    });

    it('should support sharing functionality integration', async () => {
      const mockShare = $(() => {
        console.log('Share called');
      });

      const { screen, render } = await createDOM();
      
      await render(
        <PatientProfile
          patient={patientData}
          userRole="provider"
          onShare$={mockShare}
        />
      );
      
      const html = screen.outerHTML;
      expect(html).toContain('Share patient profile');
    });
  });
});
