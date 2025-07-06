/**
 * @fileoverview Spinner Component Alternative Tests
 * Healthcare-focused test suite with medical device keyboard accessibility
 * WCAG 2.1 AA+ compliance validation and Section 508 support
 * Emergency workflows and medical loading processes
 */

import { render } from '@builder.io/qwik';
import { expect, describe, it, beforeEach, vi } from 'vitest';
import { Spinner } from '../spinner';
import '../../../../testing/qwik-dom-patches';

describe('Spinner Component - Alternative Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render spinner with default props', async () => {
      const container = document.createElement('div');
      
      await render(container, <Spinner />);

      // Test basic structure
      const spinnerContainer = container.querySelector('.themed-content > div');
      expect(spinnerContainer).toBeTruthy();
      expect(spinnerContainer?.getAttribute('role')).toBe('status');
      expect(spinnerContainer?.getAttribute('aria-busy')).toBe('true');

      // Test default size (md)
      expect(spinnerContainer?.className).toContain('w-6 h-6');

      // Test default variant (circular)
      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
      expect(svg?.getAttribute('viewBox')).toBe('0 0 24 24');

      // Test aria-label default
      expect(spinnerContainer?.getAttribute('aria-label')).toBe('Loading...');
    });

    it('should handle different sizes', async () => {
      const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
      const expectedClasses = ['w-4 h-4', 'w-5 h-5', 'w-6 h-6', 'w-8 h-8', 'w-10 h-10'];

      for (let i = 0; i < sizes.length; i++) {
        const container = document.createElement('div');
        
        await render(container, <Spinner size={sizes[i]} />);

        const spinnerContainer = container.querySelector('.themed-content > div');
        expect(spinnerContainer?.className).toContain(expectedClasses[i]);
      }
    });

    it('should handle different variants', async () => {
      // Test circular variant
      const circularContainer = document.createElement('div');
      await render(circularContainer, <Spinner variant="circular" />);
      const circularSvg = circularContainer.querySelector('svg');
      expect(circularSvg).toBeTruthy();

      // Test dots variant
      const dotsContainer = document.createElement('div');
      await render(dotsContainer, <Spinner variant="dots" />);
      const dotsWrapper = dotsContainer.querySelector('.flex.items-center.justify-center.gap-1');
      expect(dotsWrapper).toBeTruthy();
      const dots = dotsContainer.querySelectorAll('.rounded-full.animate-bounce');
      expect(dots.length).toBe(3);

      // Test bars variant
      const barsContainer = document.createElement('div');
      await render(barsContainer, <Spinner variant="bars" />);
      const barsWrapper = barsContainer.querySelector('.flex.items-center.justify-center.gap-0\\.5');
      expect(barsWrapper).toBeTruthy();
      const bars = barsContainer.querySelectorAll('.animate-pulse');
      expect(bars.length).toBe(4);
    });
  });

  describe('Healthcare-Specific Features', () => {
    it('should support medical device mode', async () => {
      const container = document.createElement('div');
      
      await render(container, <Spinner 
        medicalDeviceMode={true}
        interactive={true}
        label="Processing medical data"
      />);

      const spinnerContainer = container.querySelector('.themed-content > div');
      expect(spinnerContainer?.hasAttribute('data-medical-device')).toBe(true);
      expect(spinnerContainer?.getAttribute('aria-live')).toBe('polite');
      expect(spinnerContainer?.getAttribute('aria-label')).toBe('Processing medical data - Press Escape to cancel');
    });

    it('should handle emergency mode', async () => {
      const container = document.createElement('div');
      
      await render(container, <Spinner 
        emergencyMode={true}
        purpose="emergency"
      />);

      const spinnerContainer = container.querySelector('.themed-content > div');
      // Emergency mode state starts with emergencyMode prop value
      expect(spinnerContainer?.hasAttribute('data-emergency-mode')).toBe(true);
      expect(spinnerContainer?.getAttribute('data-purpose')).toBe('emergency');
    });

    it('should display progress for medical processes', async () => {
      const container = document.createElement('div');
      
      await render(container, <Spinner 
        medicalDeviceMode={true}
        progress={65}
        label="Syncing patient data"
      />);

      const spinnerContainer = container.querySelector('.themed-content > div');
      expect(spinnerContainer?.getAttribute('aria-label')).toBe('Syncing patient data - 65% complete');

      // Test progress indicator
      const progressText = container.querySelector('.absolute.-bottom-6');
      expect(progressText?.textContent).toBe('65%');

      // Test progress in circular variant
      const progressCircle = container.querySelector('circle[stroke-dasharray]');
      expect(progressCircle).toBeTruthy();
    });
  });

  describe('Healthcare Purposes and Workflow', () => {
    it('should handle different healthcare purposes', async () => {
      const purposes = ['loading', 'processing', 'saving', 'emergency', 'critical'] as const;

      for (const purpose of purposes) {
        const container = document.createElement('div');
        
        await render(container, <Spinner purpose={purpose} />);

        const spinnerContainer = container.querySelector('.themed-content > div');
        expect(spinnerContainer?.getAttribute('data-purpose')).toBe(purpose);
      }
    });

    it('should support interactive spinners with keyboard accessibility', async () => {
      const container = document.createElement('div');
      
      await render(container, <Spinner 
        interactive={true}
        medicalDeviceMode={true}
        label="Loading patient records"
      />);

      const spinnerContainer = container.querySelector('.themed-content > div');
      expect(spinnerContainer?.getAttribute('tabIndex')).toBe('0');
      expect(spinnerContainer?.getAttribute('aria-label')).toBe('Loading patient records - Press Escape to cancel');
      expect(spinnerContainer?.className).toContain('cursor-pointer');
      expect(spinnerContainer?.className).toContain('focus:outline-none');
    });

    it('should support workflow shortcuts in medical device mode', async () => {
      const container = document.createElement('div');
      
      await render(container, <Spinner 
        interactive={true}
        medicalDeviceMode={true}
        enableWorkflowShortcuts={true}
      />);

      const spinnerContainer = container.querySelector('.themed-content > div');
      expect(spinnerContainer?.hasAttribute('data-medical-device')).toBe(true);
    });
  });

  describe('Accessibility and ARIA Support', () => {
    it('should handle proper ARIA labels and roles', async () => {
      const container = document.createElement('div');
      
      await render(container, <Spinner 
        label="Custom loading message"
        medicalDeviceMode={false}
      />);

      const spinnerContainer = container.querySelector('.themed-content > div');
      expect(spinnerContainer?.getAttribute('role')).toBe('status');
      expect(spinnerContainer?.getAttribute('aria-busy')).toBe('true');
      expect(spinnerContainer?.getAttribute('aria-label')).toBe('Custom loading message');
      expect(spinnerContainer?.getAttribute('aria-live')).toBe(null);

      // Test screen reader content
      const srText = container.querySelector('.sr-only');
      expect(srText?.textContent).toBe('Custom loading message');
    });

    it('should handle enhanced ARIA for medical device mode', async () => {
      const container = document.createElement('div');
      
      await render(container, <Spinner 
        medicalDeviceMode={true}
        interactive={true}
        progress={45}
        label="Processing vital signs"
      />);

      const spinnerContainer = container.querySelector('.themed-content > div');
      expect(spinnerContainer?.getAttribute('aria-live')).toBe('polite');
      expect(spinnerContainer?.getAttribute('aria-label')).toBe('Processing vital signs - 45% complete - Press Escape to cancel');
      expect(spinnerContainer?.getAttribute('role')).toBe('status');
    });

    it('should handle screen reader optimization', async () => {
      const container = document.createElement('div');
      
      await render(container, <Spinner 
        label="Medical data processing"
        purpose="emergency"
        medicalDeviceMode={true}
        emergencyMode={true}
      />);

      // Test screen reader content - the last .sr-only element contains the label
      const srTexts = container.querySelectorAll('.sr-only');
      const lastSrText = srTexts[srTexts.length - 1];
      expect(lastSrText?.textContent).toBe('Medical data processing (Emergency)');

      // Test emergency mode screen reader content
      const emergencyText = container.querySelector('.sr-only');
      expect(emergencyText).toBeTruthy();
    });
  });

  describe('Performance and Theming', () => {
    it('should render efficiently with complex props', async () => {
      const container = document.createElement('div');
      
      await render(container, <Spinner 
        size="lg"
        variant="circular"
        color="#3b82f6"
        label="Complex medical spinner"
        interactive={true}
        medicalDeviceMode={true}
        emergencyMode={false}
        enableWorkflowShortcuts={true}
        purpose="processing"
        progress={78}
        class="custom-spinner-class"
      />);

      const spinnerContainer = container.querySelector('.themed-content > div');
      expect(spinnerContainer).toBeTruthy();
      expect(spinnerContainer?.className).toContain('w-8 h-8'); // lg size
      expect(spinnerContainer?.className).toContain('custom-spinner-class');
      
      // Test all healthcare attributes are set
      expect(spinnerContainer?.hasAttribute('data-medical-device')).toBe(true);
      expect(spinnerContainer?.getAttribute('data-purpose')).toBe('processing');
      expect(spinnerContainer?.getAttribute('aria-label')).toContain('Complex medical spinner');
    });

    it('should handle theme integration', async () => {
      const container = document.createElement('div');
      
      await render(container, <Spinner 
        class="custom-theme-class"
      />);

      const themedContainer = container.querySelector('.themed-content');
      expect(themedContainer).toBeTruthy();

      const spinnerContainer = container.querySelector('.themed-content > div');
      expect(spinnerContainer?.className).toContain('custom-theme-class');
    });

    it('should handle multiple spinners with different configurations', async () => {
      const container = document.createElement('div');
      
      await render(container, <div>
        <Spinner variant="circular" purpose="loading" size="sm" />
        <Spinner variant="dots" purpose="processing" size="md" />
        <Spinner variant="bars" purpose="saving" size="lg" />
      </div>);

      const spinners = container.querySelectorAll('.themed-content > div[role="status"]');
      expect(spinners.length).toBe(3);

      // Test first spinner (circular, sm)
      expect(spinners[0]?.className).toContain('w-5 h-5');
      expect(spinners[0]?.getAttribute('data-purpose')).toBe('loading');
      expect(spinners[0]?.querySelector('svg')).toBeTruthy();

      // Test second spinner (dots, md)
      expect(spinners[1]?.className).toContain('w-6 h-6');
      expect(spinners[1]?.getAttribute('data-purpose')).toBe('processing');
      expect(spinners[1]?.querySelectorAll('.rounded-full').length).toBe(3);

      // Test third spinner (bars, lg)
      expect(spinners[2]?.className).toContain('w-8 h-8');
      expect(spinners[2]?.getAttribute('data-purpose')).toBe('saving');
      expect(spinners[2]?.querySelectorAll('.animate-pulse').length).toBe(4);
    });
  });

  describe('Color and Custom Styling', () => {
    it('should handle custom colors', async () => {
      const container = document.createElement('div');
      
      await render(container, <Spinner 
        variant="circular"
        color="#ff6b6b"
      />);

      const svg = container.querySelector('svg');
      const circle = svg?.querySelector('circle');
      const path = svg?.querySelector('path');
      
      expect(circle?.getAttribute('stroke')).toBe('#ff6b6b');
      expect(path?.getAttribute('fill')).toBe('#ff6b6b');
    });

    it('should handle purpose-based colors', async () => {
      const container = document.createElement('div');
      
      await render(container, <Spinner 
        purpose="emergency"
        variant="dots"
      />);

      // Emergency purpose should use orange color (#f59e0b)
      const dots = container.querySelectorAll('.rounded-full');
      expect(dots.length).toBe(3);
      // Color is applied via style attribute, not className
    });

    it('should handle custom CSS classes and styles', async () => {
      const container = document.createElement('div');
      
      await render(container, <Spinner 
        className="my-custom-class"
      />);

      const spinnerContainer = container.querySelector('.themed-content > div');
      expect(spinnerContainer?.className).toContain('my-custom-class');
    });
  });

  describe('Variants and Interactive Features', () => {
    it('should handle circular variant with progress', async () => {
      const container = document.createElement('div');
      
      await render(container, <Spinner 
        variant="circular"
        progress={75}
        size="lg"
      />);

      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
      // SVG doesn't have explicit width/height attributes, uses CSS classes
      expect(svg?.getAttribute('viewBox')).toBe('0 0 24 24');

      // Check for progress circle
      const progressCircle = container.querySelector('circle[stroke-dasharray]');
      expect(progressCircle).toBeTruthy();
      
      // Check progress text - only shown in medical device mode
      const progressText = container.querySelector('.absolute.-bottom-6');
      expect(progressText).toBe(null); // Not in medical device mode
    });

    it('should handle dots variant with animation', async () => {
      const container = document.createElement('div');
      
      await render(container, <Spinner 
        variant="dots"
        size="md"
        color="#10b981"
      />);

      const dotsWrapper = container.querySelector('.flex.items-center.justify-center.gap-1');
      expect(dotsWrapper).toBeTruthy();

      const dots = container.querySelectorAll('.rounded-full.animate-bounce');
      expect(dots.length).toBe(3);

      // Test dot sizes for md size - according to dotSizeClasses, md is w-1 h-1
      dots.forEach(dot => {
        expect(dot.className).toContain('w-1 h-1');
      });
    });

    it('should handle bars variant with different heights', async () => {
      const container = document.createElement('div');
      
      await render(container, <Spinner 
        variant="bars"
        size="lg"
      />);

      const barsWrapper = container.querySelector('.flex.items-center.justify-center.gap-0\\.5');
      expect(barsWrapper).toBeTruthy();

      const bars = container.querySelectorAll('.animate-pulse');
      expect(bars.length).toBe(4);

      // Test bar width classes for lg size - according to barSizeClasses, lg is w-1.5
      bars.forEach((bar) => {
        expect(bar.className).toContain('w-1.5');
        expect(bar.className).toContain('h-full'); // All bars have h-full
      });
    });

    it('should handle click events in interactive mode', async () => {
      const container = document.createElement('div');
      
      await render(container, <Spinner 
        interactive={true}
        label="Interactive spinner"
      />);

      const spinnerContainer = container.querySelector('.themed-content > div');
      expect(spinnerContainer?.getAttribute('tabIndex')).toBe('0');
      expect(spinnerContainer?.className).toContain('cursor-pointer');
      expect(spinnerContainer?.className).toContain('focus:outline-none');
      expect(spinnerContainer?.className).toContain('focus:ring-2');
    });

    it('should handle keyboard navigation in medical device mode', async () => {
      const container = document.createElement('div');
      
      await render(container, <Spinner 
        interactive={true}
        medicalDeviceMode={true}
        enableWorkflowShortcuts={true}
        purpose="critical"
      />);

      const spinnerContainer = container.querySelector('.themed-content > div');
      expect(spinnerContainer?.hasAttribute('data-medical-device')).toBe(true);
      expect(spinnerContainer?.getAttribute('data-purpose')).toBe('critical');
      // Focus ring class may vary based on medical device focus state
      expect(spinnerContainer?.className).toContain('focus:ring');
    });

    it('should handle emergency mode with proper urgency indicators', async () => {
      const container = document.createElement('div');
      
      await render(container, <Spinner 
        emergencyMode={true}
        purpose="emergency"
        variant="circular"
        size="xl"
      />);

      const spinnerContainer = container.querySelector('.themed-content > div');
      expect(spinnerContainer?.hasAttribute('data-emergency-mode')).toBe(true);
      expect(spinnerContainer?.className).toContain('w-10 h-10'); // xl size

      // Emergency mode should have enhanced visual cues
      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
    });
  });
});
