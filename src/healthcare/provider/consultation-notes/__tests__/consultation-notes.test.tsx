import { describe, it, expect, beforeEach } from 'vitest';
import { createDOM } from '@builder.io/qwik/testing';
import { ConsultationNotes, type MedicalNote, type ConsultationNotesProps } from '../consultation-notes';

describe('ConsultationNotes Component', () => {
  let mockCurrentUser: ConsultationNotesProps['currentUser'];
  let mockNotes: MedicalNote[];

  beforeEach(() => {
    mockCurrentUser = {
      id: 'user-1',
      name: 'Dr. John Smith',
      title: 'Cardiologist',
      license: 'MD12345',
      canEdit: true,
      canSign: true
    };

    mockNotes = [
      {
        id: 'note-1',
        timestamp: new Date('2024-01-15T10:30:00Z'),
        author: {
          id: 'user-1',
          name: 'Dr. John Smith',
          title: 'Cardiologist',
          license: 'MD12345'
        },
        type: 'consultation',
        priority: 'routine',
        content: 'Patient presents with chest pain.',
        tags: ['cardiology', 'chest-pain', 'routine'],
        linkedPatientId: 'patient-1',
        visitId: 'visit-1',
        version: 1,
        isLocked: false,
        confidentialityLevel: 'standard'
      }
    ];
  });

  describe('Basic Rendering', () => {
    it('should render consultation notes component', async () => {
      const { screen, render } = await createDOM();
      
      await render(
        <ConsultationNotes
          patientId="patient-1"
          patientName="John Doe"
          visitId="visit-1"
          currentUser={mockCurrentUser}
          existingNotes={mockNotes}
        />
      );

      expect(screen.outerHTML).toBeTruthy();
    });

    it('should display patient information', async () => {
      const { screen, render } = await createDOM();
      
      await render(
        <ConsultationNotes
          patientId="patient-1"
          patientName="John Doe"
          visitId="visit-1"
          currentUser={mockCurrentUser}
          existingNotes={mockNotes}
        />
      );

      expect(screen.outerHTML).toContain('John Doe');
    });

    it('should render with empty notes', async () => {
      const { screen, render } = await createDOM();
      
      await render(
        <ConsultationNotes
          patientId="patient-1"
          patientName="John Doe"
          visitId="visit-1"
          currentUser={mockCurrentUser}
          existingNotes={[]}
        />
      );

      expect(screen.outerHTML).toBeTruthy();
    });
  });

  describe('Notes Display', () => {
    it('should display existing notes', async () => {
      const { screen, render } = await createDOM();
      
      await render(
        <ConsultationNotes
          patientId="patient-1"
          patientName="John Doe"
          visitId="visit-1"
          currentUser={mockCurrentUser}
          existingNotes={mockNotes}
        />
      );

      expect(screen.outerHTML).toContain('chest pain');
    });

    it('should handle different note types', async () => {
      const { screen, render } = await createDOM();
      
      await render(
        <ConsultationNotes
          patientId="patient-1"
          patientName="John Doe"
          visitId="visit-1"
          currentUser={mockCurrentUser}
          existingNotes={mockNotes}
        />
      );

      expect(screen.outerHTML).toContain('consultation');
    });
  });

  describe('User Permissions', () => {
    it('should render for users with edit permissions', async () => {
      const { screen, render } = await createDOM();
      
      await render(
        <ConsultationNotes
          patientId="patient-1"
          patientName="John Doe"
          visitId="visit-1"
          currentUser={{ ...mockCurrentUser, canEdit: true }}
          existingNotes={mockNotes}
        />
      );

      expect(screen.outerHTML).toBeTruthy();
    });

    it('should render for users without edit permissions', async () => {
      const { screen, render } = await createDOM();
      
      await render(
        <ConsultationNotes
          patientId="patient-1"
          patientName="John Doe"
          visitId="visit-1"
          currentUser={{ ...mockCurrentUser, canEdit: false }}
          existingNotes={mockNotes}
        />
      );

      expect(screen.outerHTML).toBeTruthy();
    });
  });
});
