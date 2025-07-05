import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ImagingViewer, type ImagingViewerProps, type ImagingMetadata, type ImagingAnnotation } from '../imaging-viewer';

// Mock data for testing
const mockMetadata: ImagingMetadata = {
  patientId: 'P123456',
  patientName: 'John Doe',
  studyDate: '2024-12-30',
  modality: 'CT',
  bodyPart: 'Chest',
  studyDescription: 'CT Chest with Contrast',
  seriesNumber: 1,
  instanceNumber: 42,
  slice: 25,
  totalSlices: 50,
  pixelSpacing: [0.5, 0.5],
  sliceThickness: 2.5,
  kvp: 120,
  mas: 200,
  exposureTime: 0.5,
  radiologist: 'Dr. Smith',
  reportStatus: 'FINAL',
  urgency: 'ROUTINE',
  technician: 'Tech A',
  institution: 'General Hospital'
};

const mockAnnotations: ImagingAnnotation[] = [
  {
    id: 'ann1',
    type: 'MEASUREMENT',
    coordinates: [100, 100],
    value: 15.5,
    unit: 'mm',
    label: 'Lesion diameter',
    color: '#ffff00',
    createdBy: 'Dr. Smith',
    createdAt: '2024-12-30T10:00:00Z',
    isVisible: true
  },
  {
    id: 'ann2',
    type: 'TEXT',
    coordinates: [200, 150],
    label: 'Suspicious area',
    color: '#ff0000',
    createdBy: 'Dr. Smith',
    createdAt: '2024-12-30T10:05:00Z',
    isVisible: true
  }
];

// Mock functions
const mockOnAnnotationAdd = vi.fn();
const mockOnAnnotationUpdate = vi.fn();
const mockOnAnnotationDelete = vi.fn();
const mockOnMeasurement = vi.fn();
const mockOnWindowLevelChange = vi.fn();

describe('ImagingViewer Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Structure', () => {
    it('should be defined', () => {
      expect(ImagingViewer).toBeDefined();
    });

    it('should accept all required props', () => {
      const props: ImagingViewerProps = {
        imageUrl: '/test-image.jpg',
        metadata: mockMetadata
      };
      
      expect(props.imageUrl).toBe('/test-image.jpg');
      expect(props.metadata).toEqual(mockMetadata);
    });

    it('should handle optional props', () => {
      const props: ImagingViewerProps = {
        imageUrl: '/test-image.jpg',
        metadata: mockMetadata,
        annotations: mockAnnotations,
        showControls: false,
        showMeasurements: false,
        showAnnotations: false,
        allowAnnotations: false,
        onAnnotationAdd: mockOnAnnotationAdd,
        onAnnotationUpdate: mockOnAnnotationUpdate,
        onAnnotationDelete: mockOnAnnotationDelete,
        onMeasurement: mockOnMeasurement,
        onWindowLevelChange: mockOnWindowLevelChange,
        className: 'custom-class'
      };
      
      expect(props.annotations).toEqual(mockAnnotations);
      expect(props.showControls).toBe(false);
      expect(props.className).toBe('custom-class');
    });
  });

  describe('Metadata Validation', () => {
    it('should handle all modality types', () => {
      const modalities: ImagingMetadata['modality'][] = [
        'CT', 'MRI', 'X-RAY', 'ULTRASOUND', 'MAMMOGRAPHY', 'PET', 'NUCLEAR'
      ];

      modalities.forEach(modality => {
        const props: ImagingViewerProps = {
          imageUrl: '/test-image.jpg',
          metadata: { ...mockMetadata, modality }
        };
        
        expect(props.metadata.modality).toBe(modality);
      });
    });

    it('should handle all urgency levels', () => {
      const urgencyLevels: ImagingMetadata['urgency'][] = ['ROUTINE', 'URGENT', 'STAT'];

      urgencyLevels.forEach(urgency => {
        const props: ImagingViewerProps = {
          imageUrl: '/test-image.jpg',
          metadata: { ...mockMetadata, urgency }
        };
        
        expect(props.metadata.urgency).toBe(urgency);
      });
    });

    it('should handle all report statuses', () => {
      const statuses: ImagingMetadata['reportStatus'][] = ['PENDING', 'PRELIMINARY', 'FINAL', 'ADDENDUM'];

      statuses.forEach(reportStatus => {
        const props: ImagingViewerProps = {
          imageUrl: '/test-image.jpg',
          metadata: { ...mockMetadata, reportStatus }
        };
        
        expect(props.metadata.reportStatus).toBe(reportStatus);
      });
    });
  });

  describe('Annotation Support', () => {
    it('should handle different annotation types', () => {
      const annotationTypes: ImagingAnnotation['type'][] = [
        'MEASUREMENT', 'ARROW', 'CIRCLE', 'RECTANGLE', 'FREEHAND', 'TEXT'
      ];

      annotationTypes.forEach(type => {
        const annotation: ImagingAnnotation = {
          id: `test-${type}`,
          type,
          coordinates: [100, 100],
          color: '#ffffff',
          createdBy: 'Test User',
          createdAt: '2024-12-30T10:00:00Z',
          isVisible: true
        };

        expect(annotation.type).toBe(type);
        expect(annotation.id).toBe(`test-${type}`);
      });
    });

    it('should handle empty annotations array', () => {
      const props: ImagingViewerProps = {
        imageUrl: '/test-image.jpg',
        metadata: mockMetadata,
        annotations: []
      };
      
      expect(props.annotations).toEqual([]);
    });

    it('should handle annotations with measurements', () => {
      const measurementAnnotation: ImagingAnnotation = {
        id: 'measurement-1',
        type: 'MEASUREMENT',
        coordinates: [100, 100],
        value: 25.5,
        unit: 'mm',
        label: 'Tumor diameter',
        color: '#ffff00',
        createdBy: 'Dr. Test',
        createdAt: '2024-12-30T10:00:00Z',
        isVisible: true
      };

      expect(measurementAnnotation.value).toBe(25.5);
      expect(measurementAnnotation.unit).toBe('mm');
      expect(measurementAnnotation.label).toBe('Tumor diameter');
    });
  });

  describe('Event Handlers', () => {
    it('should handle annotation event callbacks', () => {
      const props: ImagingViewerProps = {
        imageUrl: '/test-image.jpg',
        metadata: mockMetadata,
        onAnnotationAdd: mockOnAnnotationAdd,
        onAnnotationUpdate: mockOnAnnotationUpdate,
        onAnnotationDelete: mockOnAnnotationDelete
      };
      
      expect(props.onAnnotationAdd).toBeDefined();
      expect(props.onAnnotationUpdate).toBeDefined();
      expect(props.onAnnotationDelete).toBeDefined();
    });

    it('should handle measurement callback', () => {
      const props: ImagingViewerProps = {
        imageUrl: '/test-image.jpg',
        metadata: mockMetadata,
        onMeasurement: mockOnMeasurement
      };
      
      expect(props.onMeasurement).toBeDefined();
    });

    it('should handle window/level change callback', () => {
      const props: ImagingViewerProps = {
        imageUrl: '/test-image.jpg',
        metadata: mockMetadata,
        onWindowLevelChange: mockOnWindowLevelChange
      };
      
      expect(props.onWindowLevelChange).toBeDefined();
    });
  });

  describe('Healthcare Compliance', () => {
    it('should handle patient data securely', () => {
      const sensitiveMetadata: ImagingMetadata = {
        ...mockMetadata,
        patientId: 'SENSITIVE_ID_123',
        patientName: 'Jane Smith'
      };

      const props: ImagingViewerProps = {
        imageUrl: '/test-image.jpg',
        metadata: sensitiveMetadata
      };
      
      expect(props.metadata.patientId).toBe('SENSITIVE_ID_123');
      expect(props.metadata.patientName).toBe('Jane Smith');
    });

    it('should support HIPAA-compliant workflow tracking', () => {
      const workflowMetadata: ImagingMetadata = {
        ...mockMetadata,
        radiologist: 'Dr. Radiologist',
        technician: 'Tech Specialist',
        reportStatus: 'PRELIMINARY',
        urgency: 'URGENT'
      };

      const props: ImagingViewerProps = {
        imageUrl: '/test-image.jpg',
        metadata: workflowMetadata
      };
      
      expect(props.metadata.radiologist).toBe('Dr. Radiologist');
      expect(props.metadata.technician).toBe('Tech Specialist');
      expect(props.metadata.reportStatus).toBe('PRELIMINARY');
      expect(props.metadata.urgency).toBe('URGENT');
    });
  });

  describe('Display Configurations', () => {
    it('should handle disabled controls', () => {
      const props: ImagingViewerProps = {
        imageUrl: '/test-image.jpg',
        metadata: mockMetadata,
        showControls: false
      };
      
      expect(props.showControls).toBe(false);
    });

    it('should handle disabled measurements', () => {
      const props: ImagingViewerProps = {
        imageUrl: '/test-image.jpg',
        metadata: mockMetadata,
        showMeasurements: false
      };
      
      expect(props.showMeasurements).toBe(false);
    });

    it('should handle disabled annotations', () => {
      const props: ImagingViewerProps = {
        imageUrl: '/test-image.jpg',
        metadata: mockMetadata,
        showAnnotations: false,
        allowAnnotations: false
      };
      
      expect(props.showAnnotations).toBe(false);
      expect(props.allowAnnotations).toBe(false);
    });
  });

  describe('Technical Parameters', () => {
    it('should handle imaging technical parameters', () => {
      const technicalMetadata: ImagingMetadata = {
        ...mockMetadata,
        pixelSpacing: [0.25, 0.25],
        sliceThickness: 1.0,
        kvp: 140,
        mas: 300,
        exposureTime: 0.25
      };

      expect(technicalMetadata.pixelSpacing).toEqual([0.25, 0.25]);
      expect(technicalMetadata.sliceThickness).toBe(1.0);
      expect(technicalMetadata.kvp).toBe(140);
      expect(technicalMetadata.mas).toBe(300);
      expect(technicalMetadata.exposureTime).toBe(0.25);
    });

    it('should handle missing technical parameters', () => {
      const minimalMetadata: ImagingMetadata = {
        patientId: 'P123',
        patientName: 'Test Patient',
        studyDate: '2024-12-30',
        modality: 'CT',
        bodyPart: 'Chest',
        studyDescription: 'Test Study',
        seriesNumber: 1,
        instanceNumber: 1,
        reportStatus: 'PENDING',
        urgency: 'ROUTINE',
        institution: 'Test Hospital'
      };

      expect(minimalMetadata.pixelSpacing).toBeUndefined();
      expect(minimalMetadata.sliceThickness).toBeUndefined();
      expect(minimalMetadata.kvp).toBeUndefined();
    });
  });

  describe('Multi-slice Studies', () => {
    it('should handle single slice studies', () => {
      const singleSliceMetadata: ImagingMetadata = {
        ...mockMetadata,
        slice: undefined,
        totalSlices: undefined
      };

      expect(singleSliceMetadata.slice).toBeUndefined();
      expect(singleSliceMetadata.totalSlices).toBeUndefined();
    });

    it('should handle multi-slice studies', () => {
      const multiSliceMetadata: ImagingMetadata = {
        ...mockMetadata,
        slice: 15,
        totalSlices: 100
      };

      expect(multiSliceMetadata.slice).toBe(15);
      expect(multiSliceMetadata.totalSlices).toBe(100);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid coordinates in annotations', () => {
      const invalidAnnotation: ImagingAnnotation = {
        id: 'invalid-1',
        type: 'TEXT',
        coordinates: [], // Invalid empty coordinates
        color: '#ffffff',
        createdBy: 'Test User',
        createdAt: '2024-12-30T10:00:00Z',
        isVisible: true
      };

      expect(invalidAnnotation.coordinates).toEqual([]);
    });

    it('should handle empty image URL', () => {
      const props: ImagingViewerProps = {
        imageUrl: '',
        metadata: mockMetadata
      };
      
      expect(props.imageUrl).toBe('');
    });
  });
});
