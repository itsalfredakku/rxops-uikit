/**
 * Test suite for Accordion component
 * Demonstrates Medical industry-focused testing approach
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Accordion } from '../accordion';
import { UIKitTestUtils, HEALTHCARE_TEST_CONFIG, HealthcareTestHelpers } from '../../../../testing/test-utils';

describe('Accordion Component', () => {
  let testEnv: Awaited<ReturnType<typeof UIKitTestUtils.createTestEnvironment>>;
  
  beforeEach(async () => {
    testEnv = await UIKitTestUtils.createTestEnvironment();
  });

  describe('Accessibility (WCAG 2.1 AA)', () => {
    it('should meet accessibility standards', async () => {
      const { render } = testEnv;
      
      const items = [
        {
          id: 'medical-history',
          title: 'Medical History',
          defaultOpen: false,
        },
        {
          id: 'medications',
          title: 'Current Medications',
          defaultOpen: false,
        },
      ];
      
      const { container } = await render(
        <Accordion items={items} variant="medical" />
      );
      
      const results = UIKitTestUtils.testAccessibility(container);
      
      expect(results.hasProperLabels).toBe(true);
      expect(results.hasProperHeadingStructure).toBe(true);
      expect(results.hasKeyboardSupport).toBe(true);
      expect(results.hasColorContrast).toBe(true);
    });

    it('should support keyboard navigation', async () => {
      const { render } = testEnv;
      
      const items = [
        { id: 'item1', title: 'Item 1' },
        { id: 'item2', title: 'Item 2' },
      ];
      
      const { container } = await render(<Accordion items={items} />);
      
      const navResult = UIKitTestUtils.testKeyboardNavigation(container);
      expect(navResult.passed).toBe(true);
      expect(navResult.issues).toHaveLength(0);
    });

    it('should be screen reader compatible', () => {
      const { render } = testEnv;
      
      const { container } = render(
        <Accordion 
          items={[{ id: 'test', title: 'Test Item' }]}
        />
      );
      
      const srResult = UIKitTestUtils.testScreenReaderCompatibility(container);
      expect(srResult.passed).toBe(true);
      expect(srResult.issues).toHaveLength(0);
    });

    it('should have proper ARIA attributes', () => {
      const { render } = testEnv;
      
      const { container } = render(
        <Accordion 
          items={[{ id: 'test', title: 'Test Item' }]}
        />
      );
      
      const buttons = container.querySelectorAll('button');
      buttons.forEach((button: Element) => {
        expect(button).toHaveAttribute('aria-expanded');
        expect(button).toHaveAttribute('aria-controls');
      });
      
      const contents = container.querySelectorAll('[role="region"]');
      contents.forEach((content: Element) => {
        expect(content).toHaveAttribute('aria-labelledby');
      });
    });
  });

  describe('Mobile Healthcare Optimization', () => {
    it('should meet touch target requirements', () => {
      const { render } = testEnv;
      
      const { container } = render(
        <Accordion 
          items={[
            { id: 'item1', title: 'Allergies' },
            { id: 'item2', title: 'Medications' },
          ]}
          size="lg"
        />
      );
      
      const touchResult = UIKitTestUtils.testTouchTargets(container);
      expect(touchResult.passed).toBe(true);
      expect(touchResult.failures).toHaveLength(0);
    });

    it('should work across mobile viewports', () => {
      const { render } = testEnv;
      
      Object.entries(HEALTHCARE_TEST_CONFIG.mobile.viewports).forEach(([_name, viewport]) => {
        UIKitTestUtils.simulateViewport(viewport);
        
        const { container } = render(
          <Accordion 
            items={[{ id: 'test', title: 'Test' }]}
          />
        );
        
        expect(container.firstChild).toBeTruthy();
        
        // Check that accordion remains functional
        const button = container.querySelector('button');
        expect(button).toBeTruthy();
        expect(button?.getBoundingClientRect().width).toBeGreaterThan(0);
      });
    });

    it('should have healthcare-optimized styling', () => {
      const { render } = testEnv;
      
      const { container } = render(
        <Accordion 
          items={[{ id: 'test', title: 'Test' }]}
          variant="medical"
        />
      );
      
      expect(container.firstChild).toHaveClass('bg-primary-50');
      expect(container.firstChild).toHaveClass('border-primary-200');
    });
  });

  describe('HIPAA Compliance', () => {
    it('should log audit events when enabled', () => {
      const { render, userEvent } = testEnv;
      
      const patient = HealthcareTestHelpers.createTestPatient();
      
      const { container } = render(
        <Accordion 
          items={[
            { 
              id: 'medical-history', 
              title: 'Medical History',
              badge: 'Sensitive' 
            }
          ]}
          hipaaAudit={{
            enabled: true,
            category: 'medical-history',
            patientId: patient.id,
          }}
        />
      );
      
      const button = container.querySelector('button');
      expect(button).toBeTruthy();
      
      // Simulate user interaction
      userEvent.click(button!);
      
      expect(mockHIPAAAuditor.logAccess).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'expand',
          component: 'accordion',
          category: 'medical-history',
          patientId: patient.id,
        })
      );
    });

    it('should handle sensitive medical data appropriately', () => {
      const { render } = testEnv;
      
      const { container } = render(
        <Accordion 
          variant="medical"
          items={[
            { 
              id: 'phi-data', 
              title: 'Protected Health Information',
              badge: 'PHI' 
            }
          ]}
          hipaaAudit={{
            enabled: true,
            category: 'patient-records',
          }}
        />
      );
      
      // Check for appropriate visual indicators
      const badge = container.querySelector('[class*="badge"]');
      expect(badge).toBeTruthy();
      expect(container.firstChild).toHaveAttribute('data-healthcare-element', 'accordion');
    });
  });

  describe('Performance', () => {
    it('should render within performance budget', async () => {
      const { render } = testEnv;
      
      const { renderTime, passed } = await UIKitTestUtils.testPerformance(async () => {
        render(
          <Accordion 
            items={Array.from({ length: 10 }, (_, i) => ({
              id: `item-${i}`,
              title: `Medical Record ${i + 1}`,
            }))}
          />
        );
      });
      
      expect(passed).toBe(true);
      expect(renderTime).toBeLessThan(HEALTHCARE_TEST_CONFIG.performance.renderTime);
    });

    it('should handle large datasets efficiently', () => {
      const { render } = testEnv;
      
      const startTime = performance.now();
      
      const { container } = render(
        <Accordion 
          items={Array.from({ length: 100 }, (_, i) => ({
            id: `large-item-${i}`,
            title: `Large Dataset Item ${i + 1}`,
          }))}
        />
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      expect(renderTime).toBeLessThan(200); // 200ms for large dataset
      expect(container.firstChild).toBeTruthy();
    });
  });

  describe('Component Functionality', () => {
    it('should expand and collapse items correctly', () => {
      const { render, userEvent } = testEnv;
      
      const { container } = render(
        <Accordion 
          items={[{ id: 'test', title: 'Test Item' }]}
        />
      );
      
      const button = container.querySelector('button');
      const content = container.querySelector('[role="region"]');
      
      // Initially collapsed
      expect(button).toHaveAttribute('aria-expanded', 'false');
      expect(content).toHaveClass('max-h-0');
      
      // Expand
      userEvent.click(button!);
      expect(button).toHaveAttribute('aria-expanded', 'true');
      expect(content).toHaveClass('max-h-screen');
    });

    it('should support multiple open items when configured', () => {
      const { render, userEvent } = testEnv;
      
      const { container } = render(
        <Accordion 
          multiple={true}
          items={[
            { id: 'item1', title: 'Item 1' },
            { id: 'item2', title: 'Item 2' },
          ]}
        />
      );
      
      const buttons = container.querySelectorAll('button');
      
      // Open both items
      userEvent.click(buttons[0]);
      userEvent.click(buttons[1]);
      
      expect(buttons[0]).toHaveAttribute('aria-expanded', 'true');
      expect(buttons[1]).toHaveAttribute('aria-expanded', 'true');
    });

    it('should respect default open state', () => {
      const { render } = testEnv;
      
      const { container } = render(
        <Accordion 
          items={[
            { id: 'open', title: 'Open Item', defaultOpen: true },
            { id: 'closed', title: 'Closed Item', defaultOpen: false },
          ]}
        />
      );
      
      const buttons = container.querySelectorAll('button');
      
      expect(buttons[0]).toHaveAttribute('aria-expanded', 'true');
      expect(buttons[1]).toHaveAttribute('aria-expanded', 'false');
    });

    it('should handle disabled items', () => {
      const { render, userEvent } = testEnv;
      
      const { container } = render(
        <Accordion 
          items={[{ id: 'disabled', title: 'Disabled Item', disabled: true }]}
        />
      );
      
      const button = container.querySelector('button');
      
      expect(button).toBeDisabled();
      expect(button).toHaveClass('opacity-50');
      
      // Should not respond to clicks
      userEvent.click(button!);
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('Healthcare-Specific Features', () => {
    it('should display medical severity indicators', () => {
      const { render } = testEnv;
      
      const { container } = render(
        <Accordion 
          variant="medical"
          items={[
            { 
              id: 'critical', 
              title: 'Critical Alert',
              badge: 'URGENT' 
            }
          ]}
        />
      );
      
      const badge = container.querySelector('[class*="badge"]');
      expect(badge).toHaveTextContent('URGENT');
      expect(badge).toHaveClass('bg-primary-100');
    });

    it('should integrate with medical workflow context', () => {
      const { render } = testEnv;
      
      const _provider = HealthcareTestHelpers.createTestProvider();
      const patient = HealthcareTestHelpers.createTestPatient();
      
      const { container } = render(
        <Accordion 
          variant="medical"
          items={[
            { 
              id: 'patient-record', 
              title: `${patient.name} - Medical Record`,
              badge: 'PHI' 
            }
          ]}
          hipaaAudit={{
            enabled: true,
            category: 'patient-records',
            patientId: patient.id,
          }}
        />
      );
      
      expect(container.firstChild).toHaveAttribute('data-healthcare-element', 'accordion');
      expect(container.querySelector('button')).toHaveTextContent(patient.name);
    });
  });
});
