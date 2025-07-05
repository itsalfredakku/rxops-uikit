/**
 * Test suite for Accordion component
 * Simplified version focusing on core functionality
 */

import { describe, it, expect } from 'vitest';
import { Accordion } from '../accordion';
import { createTestRenderer } from '../../../../testing/test-utils';

describe('Accordion Component', () => {
  
  describe('Basic Functionality', () => {
    it('should render with provided items', async () => {
      const { screen, render } = await createTestRenderer();
      
      const items = [
        { id: 'item1', title: 'Medical History' },
        { id: 'item2', title: 'Current Medications' },
      ];
      
      await render(<Accordion items={items} />);
      
      expect(screen.getByText('Medical History')).toBeTruthy();
      expect(screen.getByText('Current Medications')).toBeTruthy();
    });

    it('should have proper accessibility attributes', async () => {
      const { container, render } = await createTestRenderer();
      
      const items = [
        { id: 'test', title: 'Test Item' }
      ];
      
      await render(<Accordion items={items} />);
      
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

    it('should handle empty items array', async () => {
      const { container, render } = await createTestRenderer();
      
      await render(<Accordion items={[]} />);
      
      expect(container.querySelectorAll('button')).toHaveLength(0);
    });
  });

  describe('Healthcare Specific Features', () => {
    it('should render medical variant correctly', async () => {
      const { screen, render } = await createTestRenderer();
      
      const items = [
        {
          id: 'patient-info',
          title: 'Patient Information',
          priority: 'high' as const,
        }
      ];
      
      await render(<Accordion variant="medical" items={items} />);
      
      expect(screen.getByText('Patient Information')).toBeTruthy();
    });

    it('should handle different sizes', async () => {
      const { screen, render } = await createTestRenderer();
      
      const items = [
        { id: 'size-test', title: 'Size Test' }
      ];
      
      await render(<Accordion size="sm" items={items} />);
      
      expect(screen.getByText('Size Test')).toBeTruthy();
    });
  });
});
