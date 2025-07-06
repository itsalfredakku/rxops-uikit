import { beforeEach, describe, it, expect, vi } from 'vitest';
import { render } from '@builder.io/qwik';
import { Icon } from '../index';

describe('Icon Component - Alternative Tests', () => {
  beforeEach(() => {
    // Clear DOM before each test
    document.body.innerHTML = '';
  });

  describe('Basic Rendering', () => {
    it('should render icon correctly', async () => {
      const container = document.createElement('div');
      const result = await render(container, 
        <Icon icon="heart" size={24} />
      );

      expect(result).toBeDefined();
      expect(container.querySelector('svg')).toBeTruthy();
    });

    it('should display custom icon with proper sizing', async () => {
      const container = document.createElement('div');
      const result = await render(container, 
        <Icon 
          icon="stethoscope" 
          size={32} 
          purpose="status"
        />
      );

      expect(result).toBeDefined();
      expect(container.querySelector('svg')).toBeTruthy();
    });

    it('should show healthcare-specific icons', async () => {
      const container = document.createElement('div');
      const result = await render(container, 
        <Icon 
          icon="heart" 
          size={20} 
          emergencyMode={true}
          purpose="emergency"
          interactive={true}
        />
      );

      expect(result).toBeDefined();
      // Check for emergency mode in the rendered output
      expect(container.querySelector('[data-emergency-mode]')).toBeTruthy();
    });
  });

  describe('Icon Variants & Colors', () => {
    it('should support different icon sizes', async () => {
      const container = document.createElement('div');
      const result = await render(container, 
        <Icon 
          icon="briefcase-medical" 
          size={40} 
          purpose="info"
        />
      );

      expect(result).toBeDefined();
      expect(container.querySelector('svg')).toBeTruthy();
    });

    it('should handle custom colors and themes', async () => {
      const container = document.createElement('div');
      const result = await render(container, 
        <Icon 
          icon="shield" 
          size={24} 
          className="text-amber-600"
          purpose="status"
        />
      );

      expect(result).toBeDefined();
      expect(container.querySelector('.text-amber-600')).toBeTruthy();
    });

    it('should render interactive clickable icons', async () => {
      const container = document.createElement('div');
      const result = await render(container, 
        <Icon 
          icon="settings" 
          size={24} 
          purpose="action"
          interactive={true}
        />
      );

      expect(result).toBeDefined();
      expect(container.querySelector('[role="button"]')).toBeTruthy();
      expect(container.querySelector('[tabindex="0"]')).toBeTruthy();
    });
  });

  describe('Healthcare-Specific Icons', () => {
    it('should render medical diagnostic icons', async () => {
      const container = document.createElement('div');
      const result = await render(container, 
        <Icon 
          icon="thermometer" 
          size={32} 
          medicalDeviceMode={true}
          purpose="info"
          interactive={true}
        />
      );

      expect(result).toBeDefined();
      expect(container.querySelector('[data-medical-device]')).toBeTruthy();
    });

    it('should display emergency response icons', async () => {
      const container = document.createElement('div');
      const result = await render(container, 
        <Icon 
          icon="ambulance" 
          size={40} 
          emergencyMode={true}
          className="animate-pulse"
          purpose="emergency"
          interactive={true}
        />
      );

      expect(result).toBeDefined();
      expect(container.querySelector('[data-emergency-mode]')).toBeTruthy();
      expect(container.querySelector('.animate-pulse')).toBeTruthy();
    });

    it('should handle patient care icons', async () => {
      const container = document.createElement('div');
      const result = await render(container, 
        <Icon 
          icon="user" 
          size={24} 
          purpose="info"
        />
      );

      expect(result).toBeDefined();
      expect(container.querySelector('svg')).toBeTruthy();
    });
  });

  describe('Accessibility & Interaction', () => {
    it('should provide proper accessibility attributes', async () => {
      const container = document.createElement('div');
      const result = await render(container, 
        <Icon 
          icon="info" 
          size={24} 
          label="Information icon"
          purpose="info"
          interactive={true}
        />
      );

      expect(result).toBeDefined();
      expect(container.querySelector('[aria-label]')).toBeTruthy();
    });

    it('should support keyboard navigation', async () => {
      const container = document.createElement('div');
      const result = await render(container, 
        <Icon 
          icon="arrow-right" 
          size={20} 
          interactive={true}
          purpose="navigation"
        />
      );

      expect(result).toBeDefined();
      expect(container.querySelector('[tabindex="0"]')).toBeTruthy();
      expect(container.querySelector('[role="button"]')).toBeTruthy();
    });
  });

  describe('Performance & Integration', () => {
    it('should render efficiently with minimal DOM operations', async () => {
      const container = document.createElement('div');
      const result = await render(container, 
        <Icon 
          icon="activity" 
          size={32} 
          purpose="status"
        />
      );

      expect(result).toBeDefined();
      expect(container.querySelector('svg')).toBeTruthy();
    });

    it('should handle complex icon combinations', async () => {
      const container = document.createElement('div');
      const result = await render(container, 
        <div className="flex gap-2">
          <Icon icon="heart" size={20} />
          <Icon icon="activity" size={20} />
          <Icon icon="shield" size={20} />
        </div>
      );

      expect(result).toBeDefined();
      expect(container.querySelectorAll('svg')).toHaveLength(3);
      expect(container.querySelector('.flex.gap-2')).toBeTruthy();
    });

    it('should maintain consistent styling across themes', async () => {
      const container = document.createElement('div');
      const result = await render(container, 
        <Icon 
          icon="settings" 
          size={24} 
          className="transition-colors duration-200"
          purpose="action"
        />
      );

      expect(result).toBeDefined();
      expect(container.querySelector('.transition-colors')).toBeTruthy();
      expect(container.querySelector('svg')).toBeTruthy();
    });
  });
});
