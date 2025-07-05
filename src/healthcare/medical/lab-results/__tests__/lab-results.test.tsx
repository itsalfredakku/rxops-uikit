import { describe, it, expect } from 'vitest';
import { createDOM } from '@builder.io/qwik/testing';
import { LabResults, type LabResult } from '../lab-results';

// Mock data
const mockLabResults: LabResult[] = [
  {
    id: '1',
    testName: 'Hemoglobin A1C',
    testCode: 'HbA1c',
    category: 'Chemistry',
    value: 7.2,
    unit: '%',
    referenceRange: { min: 4.0, max: 5.6 },
    status: 'high',
    collectionDate: '2024-01-15T10:00:00Z',
    resultDate: '2024-01-16T14:30:00Z',
    orderingProvider: 'Dr. Smith',
    facility: 'LabCorp',
    fasting: true,
    notes: 'Patient should continue diabetes management',
    trend: 'up',
    previousValue: 6.8,
    previousDate: '2023-10-15T10:00:00Z'
  },
  {
    id: '2',
    testName: 'Total Cholesterol',
    testCode: 'CHOL',
    category: 'Lipid Panel',
    value: 180,
    unit: 'mg/dL',
    referenceRange: { max: 200 },
    status: 'normal',
    collectionDate: '2024-01-15T10:00:00Z',
    resultDate: '2024-01-16T14:30:00Z',
    orderingProvider: 'Dr. Johnson',
    facility: 'Quest Diagnostics',
    fasting: true,
    trend: 'down',
    previousValue: 220,
    previousDate: '2023-10-15T10:00:00Z'
  },
  {
    id: '3',
    testName: 'Potassium',
    testCode: 'K',
    category: 'Chemistry',
    value: 3.0,
    unit: 'mEq/L',
    referenceRange: { min: 3.5, max: 5.0 },
    status: 'critical',
    collectionDate: '2024-01-20T08:00:00Z',
    resultDate: '2024-01-20T12:00:00Z',
    orderingProvider: 'Dr. Emergency',
    facility: 'Hospital Lab',
    critical: true,
    notes: 'Critical low value - immediate attention required'
  }
];

describe('LabResults', () => {
  it('should create component with basic props', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <LabResults 
        patientId="patient-123"
        results={mockLabResults}
      />
    );

    expect(screen.outerHTML).toContain('Lab Results');
    expect(screen.outerHTML).toContain('Hemoglobin A1C');
    expect(screen.outerHTML).toContain('Total Cholesterol');
    expect(screen.outerHTML).toContain('Potassium');
  });

  it('should handle empty results array', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <LabResults 
        patientId="patient-123"
        results={[]}
      />
    );

    expect(screen.outerHTML).toContain('No lab results found');
  });

  it('should display result values correctly', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <LabResults 
        patientId="patient-123"
        results={mockLabResults}
      />
    );

    expect(screen.outerHTML).toContain('7.2 %');
    expect(screen.outerHTML).toContain('180 mg/dL');
    expect(screen.outerHTML).toContain('3.0 mEq/L');
  });

  it('should show status badges', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <LabResults 
        patientId="patient-123"
        results={mockLabResults}
      />
    );

    expect(screen.outerHTML).toContain('high');
    expect(screen.outerHTML).toContain('normal');
    expect(screen.outerHTML).toContain('critical');
  });

  it('should display reference ranges', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <LabResults 
        patientId="patient-123"
        results={mockLabResults}
      />
    );

    expect(screen.outerHTML).toContain('4 - 5.6');
    expect(screen.outerHTML).toContain('< 200');
    expect(screen.outerHTML).toContain('3.5 - 5');
  });

  it('should show critical alerts', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <LabResults 
        patientId="patient-123"
        results={mockLabResults}
      />
    );

    expect(screen.outerHTML).toContain('Critical low value');
  });

  it('should display trend information when enabled', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <LabResults 
        patientId="patient-123"
        results={mockLabResults}
        showTrends={true}
      />
    );

    expect(screen.outerHTML).toContain('Previous:');
    expect(screen.outerHTML).toContain('6.8 %');
    expect(screen.outerHTML).toContain('220 mg/dL');
  });

  it('should group results by category when enabled', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <LabResults 
        patientId="patient-123"
        results={mockLabResults}
        groupByCategory={true}
      />
    );

    expect(screen.outerHTML).toContain('Chemistry');
    expect(screen.outerHTML).toContain('Lipid Panel');
  });

  it('should render search functionality', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <LabResults 
        patientId="patient-123"
        results={mockLabResults}
        showFilters={true}
      />
    );

    expect(screen.outerHTML).toContain('Search lab results');
  });

  it('should show filters when enabled', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <LabResults 
        patientId="patient-123"
        results={mockLabResults}
        showFilters={true}
      />
    );

    expect(screen.outerHTML).toContain('Filters');
  });

  it('should display collection and result dates', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <LabResults 
        patientId="patient-123"
        results={mockLabResults}
      />
    );

    expect(screen.outerHTML).toContain('Collected');
    expect(screen.outerHTML).toContain('Result Date');
  });

  it('should show ordering provider information', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <LabResults 
        patientId="patient-123"
        results={mockLabResults}
      />
    );

    expect(screen.outerHTML).toContain('Dr. Smith');
    expect(screen.outerHTML).toContain('Dr. Johnson');
    expect(screen.outerHTML).toContain('Dr. Emergency');
  });

  it('should display facility information', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <LabResults 
        patientId="patient-123"
        results={mockLabResults}
      />
    );

    expect(screen.outerHTML).toContain('LabCorp');
    expect(screen.outerHTML).toContain('Quest Diagnostics');
    expect(screen.outerHTML).toContain('Hospital Lab');
  });

  it('should show fasting indicator when applicable', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <LabResults 
        patientId="patient-123"
        results={mockLabResults}
      />
    );

    expect(screen.outerHTML).toContain('Fasting');
  });

  it('should display test codes when available', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <LabResults 
        patientId="patient-123"
        results={mockLabResults}
      />
    );

    expect(screen.outerHTML).toContain('HbA1c');
    expect(screen.outerHTML).toContain('CHOL');
    expect(screen.outerHTML).toContain('K');
  });

  it('should apply custom className', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <LabResults 
        patientId="patient-123"
        results={mockLabResults}
        class="custom-lab-results"
      />
    );

    expect(screen.outerHTML).toContain('custom-lab-results');
  });

  it('should show out of range indicators', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <LabResults 
        patientId="patient-123"
        results={mockLabResults}
      />
    );

    expect(screen.outerHTML).toContain('Outside reference range');
  });

  it('should display notes when available', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <LabResults 
        patientId="patient-123"
        results={mockLabResults}
      />
    );

    expect(screen.outerHTML).toContain('Patient should continue diabetes management');
    expect(screen.outerHTML).toContain('Critical low value - immediate attention required');
  });
});
