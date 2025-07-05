/**
 * Code Block Component Tests
 * Medical industry-focused code display component testing
 */

import { describe, it, expect } from 'vitest';
import { createDOM } from '@builder.io/qwik/testing';
import { CodeBlock, CodeExecutor, MedicalProtocolViewer } from '../code-block';

describe('CodeBlock Component', () => {
  it('should render with basic code content', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <CodeBlock 
        code="const message = 'Hello, World!';"
        language="javascript"
      />
    );

    const codeBlock = screen.querySelector('[data-healthcare-element="code-block"]');
    expect(codeBlock).toBeTruthy();
  });

  it('should support healthcare-specific languages', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <CodeBlock 
        code="MSH|^~\\&|LAB|HOSPITAL|EMR|CLINIC|20250106140530||ORU^R01|MSG001|P|2.5"
        language="hl7"
        medicalType="hl7_message"
      />
    );

    const codeBlock = screen.querySelector('[data-healthcare-element="code-block"]');
    expect(codeBlock).toBeTruthy();
  });

  it('should display FHIR resources', async () => {
    const { screen, render } = await createDOM();
    const fhirCode = `{
  "resourceType": "Patient",
  "id": "example",
  "active": true,
  "name": [{"use": "official", "family": "Doe", "given": ["John"]}]
}`;
    
    await render(
      <CodeBlock 
        code={fhirCode}
        language="json"
        medicalType="fhir_resource"
        title="FHIR Patient Resource"
      />
    );

    const codeBlock = screen.querySelector('[data-healthcare-element="code-block"]');
    expect(codeBlock).toBeTruthy();
  });

  it('should support copyable functionality', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <CodeBlock 
        code="SELECT * FROM patients WHERE active = true;"
        language="sql"
        copyable={true}
        showLineNumbers={true}
      />
    );

    const codeBlock = screen.querySelector('[data-healthcare-element="code-block"]');
    expect(codeBlock).toBeTruthy();
  });
});

describe('CodeExecutor Component', () => {
  it('should render with executable code', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <CodeExecutor 
        code="console.log('BMI Calculator');"
        language="javascript"
        allowExecution={true}
      />
    );

    const executor = screen.querySelector('[data-healthcare-element="code-executor"]');
    expect(executor).toBeTruthy();
  });

  it('should support different execution environments', async () => {
    const { screen, render } = await createDOM();
    
    await render(
      <CodeExecutor 
        code="function calculateBMI(weight, height) { return weight / (height * height); }"
        language="javascript"
        environment="sandbox"
        showOutput={true}
      />
    );

    const executor = screen.querySelector('[data-healthcare-element="code-executor"]');
    expect(executor).toBeTruthy();
  });
});

describe('MedicalProtocolViewer Component', () => {
  it('should render medical protocol steps', async () => {
    const { screen, render } = await createDOM();
    const protocol = {
      id: 'cpr-protocol',
      title: 'CPR Protocol',
      version: '1.0',
      steps: [
        {
          id: 'step-1',
          title: 'Check Responsiveness',
          description: 'Tap shoulders and shout',
          required: true
        }
      ]
    };
    
    await render(
      <MedicalProtocolViewer 
        protocol={protocol}
        interactive={true}
      />
    );

    const viewer = screen.querySelector('[data-healthcare-element="medical-protocol-viewer"]');
    expect(viewer).toBeTruthy();
  });

  it('should support protocol metadata', async () => {
    const { screen, render } = await createDOM();
    const protocol = {
      id: 'emergency-protocol',
      title: 'Emergency Response',
      version: '2.1',
      steps: [
        {
          id: 'step-1',
          title: 'Assess Scene Safety',
          description: 'Ensure area is safe for responders',
          required: true,
          duration: '30 seconds'
        }
      ],
      metadata: {
        author: 'Medical Team',
        category: 'emergency',
        dateCreated: '2025-01-01'
      }
    };
    
    await render(
      <MedicalProtocolViewer 
        protocol={protocol}
        interactive={false}
      />
    );

    const viewer = screen.querySelector('[data-healthcare-element="medical-protocol-viewer"]');
    expect(viewer).toBeTruthy();
  });
});
