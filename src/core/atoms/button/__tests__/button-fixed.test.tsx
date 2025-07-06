/**
 * Fixed Button Component Tests
 * Tests for the core Button atom component with proper Qwik DOM assertions
 */

import { describe, it, expect } from 'vitest';
import { $ } from '@builder.io/qwik';
import { Button } from '../button';
import { createQwikTestRenderer, healthcareMatchers, HealthcareTestAssertions } from '../../../../testing/qwik-test-utils';

describe('Button Component - Fixed Tests', () => {
  
  describe('Basic Rendering', () => {
    it('should render button with default props', async () => {
      const { render, getByText, getByRole } = await createQwikTestRenderer();
      
      await render(<Button>Click me</Button>);
      
      const button = getByRole('button');
      expect(healthcareMatchers.toHaveTextContent(button, 'Click me')).toBe(true);
      expect(button.tagName.toLowerCase()).toBe('button');
    });

    it('should render button with custom class', async () => {
      const { render, getByText, container } = await createQwikTestRenderer();
      
      await render(<Button class="custom-button">Custom Button</Button>);
      
      const button = getByText('Custom Button');
      expect(healthcareMatchers.toHaveClass(button, 'custom-button')).toBe(true);
    });

    it('should render button with aria label', async () => {
      const { render, getByRole } = await createQwikTestRenderer();
      
      await render(<Button ariaLabel="Save patient data">Save</Button>);
      
      const button = getByRole('button');
      expect(healthcareMatchers.toHaveAttribute(button, 'aria-label', 'Save patient data')).toBe(true);
      expect(healthcareMatchers.toHaveTextContent(button, 'Save')).toBe(true);
    });
  });

  describe('Button Intent (Semantic Styling)', () => {
    it('should render primary intent button', async () => {
      const { render, getByText } = await createQwikTestRenderer();
      
      await render(<Button intent="primary">Primary Action</Button>);
      
      const button = getByText('Primary Action');
      expect(healthcareMatchers.toHaveTextContent(button, 'Primary Action')).toBe(true);
      // Check for primary styling in class list
      const classList = button.classList.toString();
      expect(classList.includes('bg-primary') || classList.includes('primary')).toBe(true);
    });

    it('should render secondary intent button', async () => {
      const { render, getByText } = await createQwikTestRenderer();
      
      await render(<Button intent="secondary">Secondary Action</Button>);
      
      const button = getByText('Secondary Action');
      expect(healthcareMatchers.toHaveTextContent(button, 'Secondary Action')).toBe(true);
      // Check for secondary styling
      const classList = button.classList.toString();
      expect(classList.includes('outline') || classList.includes('border')).toBe(true);
    });

    it('should render error intent button', async () => {
      const { render, getByText } = await createQwikTestRenderer();
      
      await render(<Button intent="error">Delete Record</Button>);
      
      const button = getByText('Delete Record');
      expect(healthcareMatchers.toHaveTextContent(button, 'Delete Record')).toBe(true);
      // Check for error styling
      const classList = button.classList.toString();
      expect(classList.includes('error') || classList.includes('bg-error') || classList.includes('destructive')).toBe(true);
    });

    it('should render success intent button', async () => {
      const { render, getByText } = await createQwikTestRenderer();
      
      await render(<Button intent="success">Confirm Treatment</Button>);
      
      const button = getByText('Confirm Treatment');
      expect(healthcareMatchers.toHaveTextContent(button, 'Confirm Treatment')).toBe(true);
      // Check for success styling
      const classList = button.classList.toString();
      expect(classList.includes('success') || classList.includes('bg-success')).toBe(true);
    });

    it('should render warning intent button', async () => {
      const { render, getByText } = await createQwikTestRenderer();
      
      await render(<Button intent="warning">Caution Action</Button>);
      
      const button = getByText('Caution Action');
      expect(healthcareMatchers.toHaveTextContent(button, 'Caution Action')).toBe(true);
      // Check for warning styling
      const classList = button.classList.toString();
      expect(classList.includes('warning') || classList.includes('bg-warning')).toBe(true);
    });
  });

  describe('Button Sizes', () => {
    it('should render small button', async () => {
      const { render, getByText } = await createQwikTestRenderer();
      
      await render(<Button size="sm">Small Button</Button>);
      
      const button = getByText('Small Button');
      expect(healthcareMatchers.toHaveTextContent(button, 'Small Button')).toBe(true);
      const classList = button.classList.toString();
      expect(classList.includes('h-11') || classList.includes('text-sm')).toBe(true);
    });

    it('should render medium button (default)', async () => {
      const { render, getByText } = await createQwikTestRenderer();
      
      await render(<Button size="md">Medium Button</Button>);
      
      const button = getByText('Medium Button');
      expect(healthcareMatchers.toHaveTextContent(button, 'Medium Button')).toBe(true);
      const classList = button.classList.toString();
      expect(classList.includes('h-11') || classList.includes('text-sm')).toBe(true);
    });

    it('should render large button', async () => {
      const { render, getByText } = await createQwikTestRenderer();
      
      await render(<Button size="lg">Large Button</Button>);
      
      const button = getByText('Large Button');
      expect(healthcareMatchers.toHaveTextContent(button, 'Large Button')).toBe(true);
      const classList = button.classList.toString();
      expect(classList.includes('h-12') || classList.includes('text-base')).toBe(true);
    });
  });

  describe('Button States', () => {
    it('should render disabled button', async () => {
      const { render, getByText } = await createQwikTestRenderer();
      
      await render(<Button disabled>Disabled Button</Button>);
      
      const button = getByText('Disabled Button');
      expect(healthcareMatchers.toBeDisabled(button)).toBe(true);
      expect(healthcareMatchers.toHaveTextContent(button, 'Disabled Button')).toBe(true);
    });

    it('should render loading button', async () => {
      const { render, getByText, container } = await createQwikTestRenderer();
      
      await render(<Button loading>Loading...</Button>);
      
      const button = getByText('Loading...');
      expect(healthcareMatchers.toHaveAttribute(button, 'aria-busy', 'true')).toBe(true);
      // Check for loading spinner
      const spinner = container.querySelector('svg');
      expect(spinner).toBeTruthy();
    });

    it('should render full width button', async () => {
      const { render, getByText } = await createQwikTestRenderer();
      
      await render(<Button fullWidth>Full Width Button</Button>);
      
      const button = getByText('Full Width Button');
      expect(healthcareMatchers.toHaveTextContent(button, 'Full Width Button')).toBe(true);
      expect(healthcareMatchers.toHaveClass(button, 'w-full')).toBe(true);
    });
  });

  describe('Healthcare-Specific Features', () => {
    it('should meet healthcare touch target requirements (44px minimum)', async () => {
      const { render, getByText } = await createQwikTestRenderer();
      
      await render(<Button>Touch Target Test</Button>);
      
      const button = getByText('Touch Target Test');
      // Check for minimum height classes
      const classList = button.classList.toString();
      expect(classList.includes('h-11') || classList.includes('h-12') || classList.includes('min-h-11')).toBe(true);
      
      // Use healthcare-specific assertion
      expect(() => HealthcareTestAssertions.assertTouchTargetCompliance(button)).not.toThrow();
    });

    it('should render with proper ARIA attributes for accessibility', async () => {
      const { render, getByRole } = await createQwikTestRenderer();
      
      await render(
        <Button 
          ariaLabel="Save patient vital signs"
          role="button"
        >
          Save Vitals
        </Button>
      );
      
      const button = getByRole('button');
      expect(healthcareMatchers.toHaveAttribute(button, 'aria-label', 'Save patient vital signs')).toBe(true);
      expect(healthcareMatchers.toHaveRole(button, 'button')).toBe(true);
      
      // Use healthcare-specific assertion
      expect(() => HealthcareTestAssertions.assertProperLabeling(button)).not.toThrow();
    });

    it('should support different button types', async () => {
      const { render, getByText } = await createQwikTestRenderer();
      
      await render(<Button type="submit">Submit Form</Button>);
      
      const button = getByText('Submit Form');
      expect(healthcareMatchers.toHaveAttribute(button, 'type', 'submit')).toBe(true);
      expect(healthcareMatchers.toHaveTextContent(button, 'Submit Form')).toBe(true);
    });

    it('should render emergency button with proper styling', async () => {
      const { render, getByText } = await createQwikTestRenderer();
      
      await render(<Button emergency>Emergency Action</Button>);
      
      const button = getByText('Emergency Action');
      expect(healthcareMatchers.toHaveAttribute(button, 'data-emergency', 'true')).toBe(true);
      expect(healthcareMatchers.toHaveTextContent(button, 'Emergency Action')).toBe(true);
      
      // Use healthcare-specific assertion
      expect(() => HealthcareTestAssertions.assertEmergencyButtonStyling(button)).not.toThrow();
    });

    it('should render medical device mode features', async () => {
      const { render, getByText, container } = await createQwikTestRenderer();
      
      await render(
        <Button medicalDeviceMode enableWorkflowShortcuts>
          Medical Device Button
        </Button>
      );
      
      const button = getByText('Medical Device Button');
      expect(healthcareMatchers.toHaveTextContent(button, 'Medical Device Button')).toBe(true);
      
      // Check for instructions element
      const instructions = container.querySelector('[id*="instructions"]');
      expect(instructions).toBeTruthy();
      
      // Use healthcare-specific assertion
      expect(() => HealthcareTestAssertions.assertMedicalDeviceMode(button)).not.toThrow();
    });
  });

  describe('Accessibility Compliance', () => {
    it('should support keyboard navigation', async () => {
      const { render, getByText } = await createQwikTestRenderer();
      
      await render(<Button tabIndex={0}>Keyboard Accessible</Button>);
      
      const button = getByText('Keyboard Accessible');
      expect(healthcareMatchers.toHaveTextContent(button, 'Keyboard Accessible')).toBe(true);
      expect(healthcareMatchers.toHaveAttribute(button, 'tabindex', '0')).toBe(true);
      
      // Use healthcare-specific assertion
      expect(() => HealthcareTestAssertions.assertKeyboardAccessible(button)).not.toThrow();
    });

    it('should work with screen readers', async () => {
      const { render, getByRole } = await createQwikTestRenderer();
      
      await render(
        <Button 
          ariaLabel="Primary action button for patient care"
          role="button"
        >
          Patient Care Action
        </Button>
      );
      
      const button = getByRole('button');
      expect(healthcareMatchers.toHaveAttribute(button, 'aria-label', 'Primary action button for patient care')).toBe(true);
      expect(healthcareMatchers.toHaveRole(button, 'button')).toBe(true);
      expect(healthcareMatchers.toHaveTextContent(button, 'Patient Care Action')).toBe(true);
      expect(healthcareMatchers.toHaveAccessibleName(button)).toBe(true);
    });

    it('should have proper focus management', async () => {
      const { render, getByText } = await createQwikTestRenderer();
      
      await render(<Button>Focusable Button</Button>);
      
      const button = getByText('Focusable Button');
      expect(button.tagName.toLowerCase()).toBe('button');
      // Button elements are naturally focusable
      expect(healthcareMatchers.toHaveAttribute(button, 'tabindex')).toBe(false); // Should not need explicit tabindex
    });
  });

  describe('Integration with Healthcare Components', () => {
    it('should work as form submission button', async () => {
      const { render, getByText } = await createQwikTestRenderer();
      
      await render(
        <form>
          <Button type="submit">Submit Patient Form</Button>
        </form>
      );
      
      const button = getByText('Submit Patient Form');
      expect(healthcareMatchers.toHaveTextContent(button, 'Submit Patient Form')).toBe(true);
      expect(healthcareMatchers.toHaveAttribute(button, 'type', 'submit')).toBe(true);
    });

    it('should support left icon spacing', async () => {
      const { render, getByText } = await createQwikTestRenderer();
      
      await render(<Button leftIcon>Button with Left Icon</Button>);
      
      const button = getByText('Button with Left Icon');
      expect(healthcareMatchers.toHaveTextContent(button, 'Button with Left Icon')).toBe(true);
      const classList = button.classList.toString();
      expect(classList.includes('pl-2')).toBe(true);
    });

    it('should support right icon spacing', async () => {
      const { render, getByText } = await createQwikTestRenderer();
      
      await render(<Button rightIcon>Button with Right Icon</Button>);
      
      const button = getByText('Button with Right Icon');
      expect(healthcareMatchers.toHaveTextContent(button, 'Button with Right Icon')).toBe(true);
      const classList = button.classList.toString();
      expect(classList.includes('pr-2')).toBe(true);
    });
  });

  describe('Performance and Bundle Size', () => {
    it('should render efficiently', async () => {
      const { render, getByText } = await createQwikTestRenderer();
      const startTime = performance.now();
      
      await render(<Button>Performance Test</Button>);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      const button = getByText('Performance Test');
      expect(healthcareMatchers.toHaveTextContent(button, 'Performance Test')).toBe(true);
      expect(renderTime).toBeLessThan(100); // Should render in under 100ms
    });

    it('should handle multiple buttons efficiently', async () => {
      const { render, getByText, getAllByText } = await createQwikTestRenderer();
      
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
      
      const button1 = getByText('Button 1');
      const button10 = getByText('Button 10');
      expect(healthcareMatchers.toHaveTextContent(button1, 'Button 1')).toBe(true);
      expect(healthcareMatchers.toHaveTextContent(button10, 'Button 10')).toBe(true);
    });
  });

  describe('Legacy Prop Support', () => {
    it('should support legacy variant prop', async () => {
      const { render, getByText } = await createQwikTestRenderer();
      
      await render(<Button variant="outlined">Legacy Variant</Button>);
      
      const button = getByText('Legacy Variant');
      expect(healthcareMatchers.toHaveTextContent(button, 'Legacy Variant')).toBe(true);
      const classList = button.classList.toString();
      expect(classList.includes('outline') || classList.includes('border')).toBe(true);
    });

    it('should support legacy color prop', async () => {
      const { render, getByText } = await createQwikTestRenderer();
      
      await render(<Button color="primary">Legacy Color</Button>);
      
      const button = getByText('Legacy Color');
      expect(healthcareMatchers.toHaveTextContent(button, 'Legacy Color')).toBe(true);
      const classList = button.classList.toString();
      expect(classList.includes('primary') || classList.includes('bg-primary')).toBe(true);
    });
  });
});
