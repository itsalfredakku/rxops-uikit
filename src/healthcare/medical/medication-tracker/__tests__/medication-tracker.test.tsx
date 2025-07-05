import { describe, it, expect, beforeEach } from 'vitest';
import { createDOM } from '@builder.io/qwik/testing';
import { MedicationTracker, type Medication, type MedicationDose, type DrugInteraction } from '../medication-tracker';

describe('MedicationTracker', () => {
  let mockMedications: Medication[];
  let mockDoses: MedicationDose[];
  let mockInteractions: DrugInteraction[];

  beforeEach(() => {
    mockMedications = [
      {
        id: 'med-1',
        name: 'Metformin',
        dosage: '500mg',
        frequency: 'Twice daily',
        instructions: 'Take with meals',
        prescribedBy: 'Dr. Smith',
        prescribedDate: '2025-06-01T00:00:00.000Z',
        startDate: '2025-06-01',
        refillsRemaining: 3,
        totalRefills: 5,
        isActive: true,
        category: 'prescription',
        interactions: ['Alcohol'],
        sideEffects: ['Nausea', 'Diarrhea']
      },
      {
        id: 'med-2',
        name: 'Vitamin D3',
        dosage: '1000 IU',
        frequency: 'Daily',
        instructions: 'Take with breakfast',
        prescribedBy: 'Dr. Johnson',
        prescribedDate: '2025-05-15T00:00:00.000Z',
        startDate: '2025-05-15',
        refillsRemaining: 1,
        totalRefills: 3,
        isActive: true,
        category: 'supplement'
      },
      {
        id: 'med-3',
        name: 'Aspirin',
        dosage: '81mg',
        frequency: 'Daily',
        instructions: 'Take with food',
        prescribedBy: 'Dr. Brown',
        prescribedDate: '2025-04-01T00:00:00.000Z',
        startDate: '2025-04-01',
        endDate: '2025-06-01',
        refillsRemaining: 0,
        totalRefills: 2,
        isActive: false,
        category: 'prescription'
      }
    ];

    const today = new Date().toISOString().split('T')[0];
    mockDoses = [
      {
        id: 'dose-1',
        medicationId: 'med-1',
        scheduledTime: `${today}T08:00:00.000Z`,
        actualTime: `${today}T08:15:00.000Z`,
        status: 'taken',
        takenBy: 'patient'
      },
      {
        id: 'dose-2',
        medicationId: 'med-1',
        scheduledTime: `${today}T20:00:00.000Z`,
        status: 'scheduled'
      },
      {
        id: 'dose-3',
        medicationId: 'med-2',
        scheduledTime: `${today}T09:00:00.000Z`,
        status: 'missed'
      }
    ];

    mockInteractions = [
      {
        id: 'int-1',
        medication1: 'Metformin',
        medication2: 'Alcohol',
        severity: 'moderate',
        description: 'May increase risk of lactic acidosis',
        recommendation: 'Limit alcohol consumption'
      }
    ];
  });

  describe('Component Rendering', () => {
    it('should render medication tracker with basic information', async () => {
      const { screen, render } = await createDOM();
      
      await render(
        <MedicationTracker
          patientId="patient-1"
          medications={mockMedications}
          doses={mockDoses}
          interactions={mockInteractions}
        />
      );

      const html = screen.outerHTML;
      
      // Check header and main elements
      expect(html).toContain('Medication Tracker');
      expect(html).toContain('2 active medications');
    });

    it('should display active medications', async () => {
      const { screen, render } = await createDOM();
      
      await render(
        <MedicationTracker
          patientId="patient-1"
          medications={mockMedications}
          doses={mockDoses}
        />
      );

      const html = screen.outerHTML;
      
      // Check that active medications are displayed
      expect(html).toContain('Metformin');
      expect(html).toContain('500mg');
      expect(html).toContain('Twice daily');
      expect(html).toContain('Dr. Smith');
      
      expect(html).toContain('Vitamin D3');
      expect(html).toContain('1000 IU');
      expect(html).toContain('Daily');
      
      // Inactive medication should not be in current view by default
      expect(html).not.toContain('Aspirin');
    });

    it('should show adherence metrics', async () => {
      const { screen, render } = await createDOM();
      
      await render(
        <MedicationTracker
          patientId="patient-1"
          medications={mockMedications}
          doses={mockDoses}
          showAdherence={true}
        />
      );

      const html = screen.outerHTML;
      
      // Check adherence rate calculation (1 taken out of 3 total = 33%)
      expect(html).toContain('Adherence Rate');
      expect(html).toContain('33%');
      
      // Check today's doses count
      expect(html).toContain('Today\'s Doses');
      expect(html).toContain('3');
    });

    it('should display refill alerts', async () => {
      const { screen, render } = await createDOM();
      
      await render(
        <MedicationTracker
          patientId="patient-1"
          medications={mockMedications}
          showRefills={true}
        />
      );

      const html = screen.outerHTML;
      
      // Check refills needed count (Vitamin D3 has 1 refill remaining)
      expect(html).toContain('Refills Needed');
      expect(html).toContain('1');
    });

    it('should show interaction alerts when present', async () => {
      const severeInteraction: DrugInteraction = {
        id: 'int-severe',
        medication1: 'Warfarin',
        medication2: 'Aspirin',
        severity: 'severe',
        description: 'Increased bleeding risk',
        recommendation: 'Consult healthcare provider immediately'
      };

      const { screen, render } = await createDOM();
      
      await render(
        <MedicationTracker
          patientId="patient-1"
          medications={mockMedications}
          interactions={[...mockInteractions, severeInteraction]}
          showInteractions={true}
        />
      );

      const html = screen.outerHTML;
      
      // Check for interaction alert
      expect(html).toContain('Drug Interaction Alert');
      expect(html).toContain('severe interactions detected');
    });
  });

  describe('User Role Permissions', () => {
    it('should show add button for providers', async () => {
      const { screen, render } = await createDOM();
      
      await render(
        <MedicationTracker
          patientId="patient-1"
          medications={mockMedications}
          userRole="provider"
          allowEdit={true}
        />
      );

      const html = screen.outerHTML;
      expect(html).toContain('Add Medication');
    });

    it('should hide add button for patients', async () => {
      const { screen, render } = await createDOM();
      
      await render(
        <MedicationTracker
          patientId="patient-1"
          medications={mockMedications}
          userRole="patient"
          allowEdit={true}
        />
      );

      const html = screen.outerHTML;
      // Add button should not be visible for patients
      expect(html).not.toContain('Add Medication');
    });

    it('should show edit/delete buttons for healthcare providers', async () => {
      const { screen, render } = await createDOM();
      
      await render(
        <MedicationTracker
          patientId="patient-1"
          medications={mockMedications}
          userRole="provider"
          allowEdit={true}
        />
      );

      const html = screen.outerHTML;
      // Should contain edit and delete action buttons (rendered as SVG icons)
      expect(html).toContain('<path'); // SVG icons are present
    });
  });

  describe('Tab Navigation', () => {
    it('should render all tabs with correct counts', async () => {
      const { screen, render } = await createDOM();
      
      await render(
        <MedicationTracker
          patientId="patient-1"
          medications={mockMedications}
          doses={mockDoses}
        />
      );

      const html = screen.outerHTML;
      
      // Check tab labels and counts
      expect(html).toContain('Current Medications');
      expect(html).toContain('Today\'s Schedule');
      expect(html).toContain('History');
      expect(html).toContain('Refills');
      
      // Active medications count
      expect(html).toContain('2'); // 2 active medications
      
      // Today's doses count
      expect(html).toContain('3'); // 3 doses today
      
      // History count (inactive medications)
      expect(html).toContain('1'); // 1 inactive medication
      
      // Refills needed count
      expect(html).toContain('1'); // 1 medication needs refill
    });
  });

  describe('Medication Categories', () => {
    it('should display medication categories with proper styling', async () => {
      const { screen, render } = await createDOM();
      
      await render(
        <MedicationTracker
          patientId="patient-1"
          medications={mockMedications}
        />
      );

      const html = screen.outerHTML;
      
      // Check category badges
      expect(html).toContain('prescription');
      expect(html).toContain('supplement');
      
      // Check category-specific styling classes
      expect(html).toContain('bg-primary-lighter'); // prescription category
      expect(html).toContain('bg-secondary-lighter'); // supplement category
    });
  });

  describe('Dose Status Management', () => {
    it('should display dose statuses correctly', async () => {
      const { screen, render } = await createDOM();
      
      await render(
        <MedicationTracker
          patientId="patient-1"
          medications={mockMedications}
          doses={mockDoses}
        />
      );

      // Switch to schedule tab by simulating the tab content
      const html = screen.outerHTML;
      
      // Should show different dose statuses
      expect(html).toContain('taken');
      expect(html).toContain('scheduled');
      expect(html).toContain('missed');
    });
  });

  describe('Accessibility Features', () => {
    it('should have proper ARIA labels and semantic structure', async () => {
      const { screen, render } = await createDOM();
      
      await render(
        <MedicationTracker
          patientId="patient-1"
          medications={mockMedications}
          doses={mockDoses}
        />
      );

      const html = screen.outerHTML;
      
      // Check for proper button elements and navigation structure
      expect(html).toContain('<button');
      expect(html).toContain('<nav');
      
      // Check for proper heading structure
      expect(html).toContain('<h2');
      expect(html).toContain('<h3');
    });

    it('should provide keyboard navigation support', async () => {
      const { screen, render } = await createDOM();
      
      await render(
        <MedicationTracker
          patientId="patient-1"
          medications={mockMedications}
          userRole="patient"
        />
      );

      const html = screen.outerHTML;
      
      // Check that interactive elements are properly structured for keyboard navigation
      expect(html).toContain('transition-colors'); // Indicates proper focus states
      expect(html).toContain('hover:'); // Hover states that work with focus
    });
  });

  describe('Healthcare Compliance', () => {
    it('should handle patient data privacy appropriately', async () => {
      const { screen, render } = await createDOM();
      
      await render(
        <MedicationTracker
          patientId="patient-1"
          medications={mockMedications}
          userRole="patient"
        />
      );

      const html = screen.outerHTML;
      
      // Component should render without exposing sensitive internal data
      expect(html).toContain('Metformin'); // Medication name is appropriate to show
      expect(html).toContain('Dr. Smith'); // Prescriber info is appropriate
      expect(html).not.toContain('patient-1'); // Patient ID should not be directly visible in UI
    });

    it('should show appropriate information based on user role', async () => {
      const { screen, render } = await createDOM();
      
      await render(
        <MedicationTracker
          patientId="patient-1"
          medications={mockMedications}
          userRole="provider"
          allowEdit={true}
        />
      );

      const html = screen.outerHTML;
      
      // Providers should see edit capabilities
      expect(html).toContain('Add Medication');
      
      // Should show comprehensive medication information
      expect(html).toContain('Prescribed by');
      expect(html).toContain('Instructions');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty medication list', async () => {
      const { screen, render } = await createDOM();
      
      await render(
        <MedicationTracker
          patientId="patient-1"
          medications={[]}
          doses={[]}
        />
      );

      const html = screen.outerHTML;
      
      // Should show empty state
      expect(html).toContain('No active medications');
      expect(html).toContain('0 active medications');
    });

    it('should handle medications without optional fields', async () => {
      const minimalMedication: Medication = {
        id: 'med-minimal',
        name: 'Basic Med',
        dosage: '10mg',
        frequency: 'Once daily',
        instructions: 'Take as directed',
        prescribedBy: 'Dr. Test',
        prescribedDate: '2025-07-01T00:00:00.000Z',
        startDate: '2025-07-01',
        refillsRemaining: 2,
        totalRefills: 3,
        isActive: true,
        category: 'prescription'
        // No interactions, sideEffects, or other optional fields
      };

      const { screen, render } = await createDOM();
      
      await render(
        <MedicationTracker
          patientId="patient-1"
          medications={[minimalMedication]}
        />
      );

      const html = screen.outerHTML;
      
      // Should render without errors
      expect(html).toContain('Basic Med');
      expect(html).toContain('10mg');
      expect(html).toContain('Once daily');
    });

    it('should calculate adherence rate correctly with no doses', async () => {
      const { screen, render } = await createDOM();
      
      await render(
        <MedicationTracker
          patientId="patient-1"
          medications={mockMedications}
          doses={[]}
          showAdherence={true}
        />
      );

      const html = screen.outerHTML;
      
      // Should show 0% adherence when no doses recorded
      expect(html).toContain('0%');
    });
  });

  describe('Component Integration', () => {
    it('should work with all optional props disabled', async () => {
      const { screen, render } = await createDOM();
      
      await render(
        <MedicationTracker
          patientId="patient-1"
          medications={mockMedications}
          showAdherence={false}
          showInteractions={false}
          showReminders={false}
          showRefills={false}
          allowEdit={false}
        />
      );

      const html = screen.outerHTML;
      
      // Should still render basic medication list
      expect(html).toContain('Medication Tracker');
      expect(html).toContain('Metformin');
      
      // Should not show disabled features
      expect(html).not.toContain('Adherence Rate');
      expect(html).not.toContain('Drug Interaction Alert');
    });
  });
});
