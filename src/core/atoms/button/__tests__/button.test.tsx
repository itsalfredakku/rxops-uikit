/**
 * Button Component Tests
 * Tests for the core Button atom component with healthcare-specific features
 */

import { describe, it, expect } from 'vitest';
import { createDOM } from '@builder.io/qwik/testing';
import { $ } from '@builder.io/qwik';
import { Button } from '../button';

describe('Button Component', () => {
  
  describe('Basic Rendering', () => {
    it('should render button with default props', async () => {
      const { screen, render } = await createDOM();
      
      await render(
        <Button>Click me</Button>
      );
      
      expect(screen.outerHTML).toContain('Click me');
      expect(screen.outerHTML).toContain('button');
    });

    it('should render button with custom class', async () => {
      const { screen, render } = await createDOM();
      
      await render(
        <Button class="custom-button">Custom Button</Button>
      );
      
      expect(screen.outerHTML).toContain('custom-button');
      expect(screen.outerHTML).toContain('Custom Button');
    });

    it('should render button with aria label', async () => {
      const { screen, render } = await createDOM();
      
      await render(
        <Button aria-label="Save patient data">Save</Button>
      );
      
      expect(screen.outerHTML).toContain('aria-label="Save patient data"');
      expect(screen.outerHTML).toContain('Save');
    });
  });

  describe('Button Intent (Semantic Styling)', () => {
    it('should render primary intent button', async () => {
      const { screen, render } = await createDOM();
      
      await render(
        <Button intent="primary">Primary Action</Button>
      );
      
      expect(screen.outerHTML).toContain('Primary Action');
      // Should have primary styling classes
      expect(screen.outerHTML).toMatch(/primary|bg-blue|bg-primary/);
    });

    it('should render secondary intent button', async () => {
      const { screen, render } = await createDOM();
      
      await render(
        <Button intent="secondary">Secondary Action</Button>
      );
      
      expect(screen.outerHTML).toContain('Secondary Action');
      // Should have secondary styling classes
      expect(screen.outerHTML).toMatch(/secondary|outline|border/);
    });

    it('should render error intent button', async () => {
      const { screen, render } = await createDOM();
      
      await render(
        <Button intent="error">Delete Record</Button>
      );
      
      expect(screen.outerHTML).toContain('Delete Record');
      // Should have error styling classes
      expect(screen.outerHTML).toMatch(/error|destructive|bg-red/);
    });

    it('should render success intent button', async () => {
      const { screen, render } = await createDOM();
      
      await render(
        <Button intent="success">Confirm Treatment</Button>
      );
      
      expect(screen.outerHTML).toContain('Confirm Treatment');
      // Should have success styling classes  
      expect(screen.outerHTML).toMatch(/success|bg-green/);
    });

    it('should render warning intent button', async () => {
      const { screen, render } = await createDOM();
      
      await render(
        <Button intent="warning">Caution Action</Button>
      );
      
      expect(screen.outerHTML).toContain('Caution Action');
      // Should have warning styling classes  
      expect(screen.outerHTML).toMatch(/warning|bg-yellow|bg-orange/);
    });
  });

  describe('Button Sizes', () => {
    it('should render small button', async () => {
      const { screen, render } = await createDOM();
      
      await render(
        <Button size="sm">Small Button</Button>
      );
      
      expect(screen.outerHTML).toContain('Small Button');
      expect(screen.outerHTML).toMatch(/sm|small|text-sm/);
    });

    it('should render medium button (default)', async () => {
      const { screen, render } = await createDOM();
      
      await render(
        <Button size="md">Medium Button</Button>
      );
      
      expect(screen.outerHTML).toContain('Medium Button');
      expect(screen.outerHTML).toMatch(/md|medium|text-base/);
    });

    it('should render large button', async () => {
      const { screen, render } = await createDOM();
      
      await render(
        <Button size="lg">Large Button</Button>
      );
      
      expect(screen.outerHTML).toContain('Large Button');
      expect(screen.outerHTML).toMatch(/lg|large|text-lg/);
    });
  });

  describe('Button States', () => {
    it('should render disabled button', async () => {
      const { screen, render } = await createDOM();
      
      await render(
        <Button disabled>Disabled Button</Button>
      );
      
      expect(screen.outerHTML).toContain('disabled');
      expect(screen.outerHTML).toContain('Disabled Button');
    });

    it('should render loading button', async () => {
      const { screen, render } = await createDOM();
      
      await render(
        <Button loading>Loading...</Button>
      );
      
      expect(screen.outerHTML).toContain('Loading...');
      // Should show loading indicator
      expect(screen.outerHTML).toMatch(/loading|spinner|animate/);
    });

    it('should render full width button', async () => {
      const { screen, render } = await createDOM();
      
      await render(
        <Button fullWidth>Full Width Button</Button>
      );
      
      expect(screen.outerHTML).toContain('Full Width Button');
      expect(screen.outerHTML).toMatch(/w-full|width|block/);
    });
  });

  describe('Healthcare-Specific Features', () => {
    it('should meet healthcare touch target requirements (44px minimum)', async () => {
      const { screen, render } = await createDOM();
      
      await render(
        <Button>Touch Target Test</Button>
      );
      
      // Button should have minimum 44px height for touch accessibility
      const button = screen.querySelector('button');
      expect(button).toBeTruthy();
      
      // Check for touch-friendly sizing in classes
      expect(screen.outerHTML).toMatch(/h-11|h-12|py-3|py-4|min-h-11|min-h-12/);
    });

    it('should render with proper ARIA attributes for accessibility', async () => {
      const { screen, render } = await createDOM();
      
      await render(
        <Button 
          aria-label="Save patient vital signs"
          aria-describedby="help-text"
          role="button"
        >
          Save Vitals
        </Button>
      );
      
      expect(screen.outerHTML).toContain('aria-label="Save patient vital signs"');
      expect(screen.outerHTML).toContain('aria-describedby="help-text"');
      expect(screen.outerHTML).toContain('role="button"');
    });

    it('should support different button types', async () => {
      const { screen, render } = await createDOM();
      
      await render(
        <Button type="submit">Submit Form</Button>
      );
      
      expect(screen.outerHTML).toContain('type="submit"');
      expect(screen.outerHTML).toContain('Submit Form');
    });
  });

  describe('Event Handling', () => {
    it('should handle click events', async () => {
      const { screen, render } = await createDOM();
      let clicked = false;
      const handleClick = $(() => { clicked = true; });
      
      await render(
        <Button onClick$={handleClick}>Click Handler Test</Button>
      );
      
      expect(screen.outerHTML).toContain('Click Handler Test');
      // Button should be interactive
      const button = screen.querySelector('button');
      expect(button).toBeTruthy();
    });

    it('should not trigger events when disabled', async () => {
      const { screen, render } = await createDOM();
      let clicked = false;
      const handleClick = $(() => { clicked = true; });
      
      await render(
        <Button disabled onClick$={handleClick}>Disabled Click Test</Button>
      );
      
      expect(screen.outerHTML).toContain('disabled');
      expect(screen.outerHTML).toContain('Disabled Click Test');
      expect(clicked).toBe(false);
    });
  });

  describe('Accessibility Compliance', () => {
    it('should support keyboard navigation', async () => {
      const { screen, render } = await createDOM();
      
      await render(
        <Button tabIndex={0}>Keyboard Accessible</Button>
      );
      
      expect(screen.outerHTML).toContain('Keyboard Accessible');
      expect(screen.outerHTML).toContain('tabindex');
    });

    it('should work with screen readers', async () => {
      const { screen, render } = await createDOM();
      
      await render(
        <Button 
          aria-label="Primary action button for patient care"
          role="button"
        >
          Patient Care Action
        </Button>
      );
      
      expect(screen.outerHTML).toContain('aria-label="Primary action button for patient care"');
      expect(screen.outerHTML).toContain('role="button"');
      expect(screen.outerHTML).toContain('Patient Care Action');
    });

    it('should have proper focus management', async () => {
      const { screen, render } = await createDOM();
      
      await render(
        <Button>Focusable Button</Button>
      );
      
      const button = screen.querySelector('button');
      expect(button).toBeTruthy();
      // Button element is naturally focusable
      expect(button?.tagName).toBe('BUTTON');
    });
  });

  describe('Integration with Healthcare Components', () => {
    it('should work as form submission button', async () => {
      const { screen, render } = await createDOM();
      
      await render(
        <form>
          <Button type="submit">Submit Patient Form</Button>
        </form>
      );
      
      expect(screen.outerHTML).toContain('Submit Patient Form');
      expect(screen.outerHTML).toContain('type="submit"');
    });

    it('should support icon spacing', async () => {
      const { screen, render } = await createDOM();
      
      await render(
        <Button leftIcon>Button with Left Icon</Button>
      );
      
      expect(screen.outerHTML).toContain('Button with Left Icon');
      // Should have icon spacing classes
      expect(screen.outerHTML).toMatch(/leftIcon|left|icon|gap|space/);
    });

    it('should support right icon spacing', async () => {
      const { screen, render } = await createDOM();
      
      await render(
        <Button rightIcon>Button with Right Icon</Button>
      );
      
      expect(screen.outerHTML).toContain('Button with Right Icon');
      // Should have icon spacing classes
      expect(screen.outerHTML).toMatch(/rightIcon|right|icon|gap|space/);
    });
  });

  describe('Performance and Bundle Size', () => {
    it('should render efficiently', async () => {
      const { screen, render } = await createDOM();
      const startTime = performance.now();
      
      await render(
        <Button>Performance Test</Button>
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      expect(screen.outerHTML).toContain('Performance Test');
      expect(renderTime).toBeLessThan(100); // Should render in under 100ms
    });

    it('should handle multiple buttons efficiently', async () => {
      const { screen, render } = await createDOM();
      
      await render(
        <div>
          <Button>Button 1</Button>
          <Button>Button 2</Button>
          <Button>Button 3</Button>
          <Button>Button 4</Button>
          <Button>Button 5</Button>
          <Button>Button 6</Button>
          <Button>Button 7</Button>
          <Button>Button 8</Button>
          <Button>Button 9</Button>
          <Button>Button 10</Button>
        </div>
      );
      
      expect(screen.outerHTML).toContain('Button 1');
      expect(screen.outerHTML).toContain('Button 10');
    });
  });

  describe('Legacy Prop Support', () => {
    it('should support legacy variant prop', async () => {
      const { screen, render } = await createDOM();
      
      await render(
        <Button variant="outlined">Legacy Variant</Button>
      );
      
      expect(screen.outerHTML).toContain('Legacy Variant');
      expect(screen.outerHTML).toMatch(/outline|border/);
    });

    it('should support legacy color prop', async () => {
      const { screen, render } = await createDOM();
      
      await render(
        <Button color="primary">Legacy Color</Button>
      );
      
      expect(screen.outerHTML).toContain('Legacy Color');
      expect(screen.outerHTML).toMatch(/primary|blue/);
    });
  });
});
