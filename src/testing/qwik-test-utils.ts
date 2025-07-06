/**
 * Fixed Qwik Testing Utilities
 * Proper testing setup for Qwik components with correct DOM assertions
 */

import { createDOM } from '@builder.io/qwik/testing';

export interface QwikTestRenderer {
  container: Element;
  getByText: (text: string) => Element;
  queryByText: (text: string) => Element | null;
  getByRole: (role: string) => Element;
  queryByRole: (role: string) => Element | null;
  getByLabelText: (text: string) => Element;
  queryByLabelText: (text: string) => Element | null;
  getAllByText: (text: string) => Element[];
  render: (component: any) => Promise<any>;
}

export async function createQwikTestRenderer(): Promise<QwikTestRenderer> {
  const { screen, render } = await createDOM();

  const getByText = (text: string): Element => {
    const elements = Array.from(screen.querySelectorAll('*'));
    for (const element of elements) {
      if (element.textContent?.includes(text)) {
        return element;
      }
    }
    throw new Error(`Unable to find element with text: ${text}`);
  };

  const queryByText = (text: string): Element | null => {
    const elements = Array.from(screen.querySelectorAll('*'));
    for (const element of elements) {
      if (element.textContent?.includes(text)) {
        return element;
      }
    }
    return null;
  };

  const getByRole = (role: string): Element => {
    const element = screen.querySelector(`[role="${role}"]`) || 
                   screen.querySelector(getRoleSelector(role));
    if (!element) {
      throw new Error(`Unable to find element with role: ${role}`);
    }
    return element;
  };

  const queryByRole = (role: string): Element | null => {
    return screen.querySelector(`[role="${role}"]`) || 
           screen.querySelector(getRoleSelector(role));
  };

  const getByLabelText = (text: string): Element => {
    // Check aria-label
    const ariaLabelElement = screen.querySelector(`[aria-label="${text}"]`);
    if (ariaLabelElement) return ariaLabelElement;

    // Check associated labels
    const labels = Array.from(screen.querySelectorAll('label'));
    for (const label of labels) {
      if (label.textContent?.includes(text)) {
        const forAttr = label.getAttribute('for');
        if (forAttr) {
          const element = screen.querySelector(`#${forAttr}`);
          if (element) return element;
        }
      }
    }

    throw new Error(`Unable to find element with label text: ${text}`);
  };

  const queryByLabelText = (text: string): Element | null => {
    try {
      return getByLabelText(text);
    } catch {
      return null;
    }
  };

  const getAllByText = (text: string): Element[] => {
    const elements = Array.from(screen.querySelectorAll('*'));
    return elements.filter(element => element.textContent?.includes(text));
  };

  return {
    container: screen,
    getByText,
    queryByText,
    getByRole,
    queryByRole,
    getByLabelText,
    queryByLabelText,
    getAllByText,
    render
  };
}

// Helper function to get HTML selector for ARIA roles
function getRoleSelector(role: string): string {
  const roleSelectors: Record<string, string> = {
    button: 'button, [role="button"], input[type="button"], input[type="submit"], input[type="reset"]',
    link: 'a, [role="link"]',
    heading: 'h1, h2, h3, h4, h5, h6, [role="heading"]',
    textbox: 'input[type="text"], input[type="email"], input[type="password"], textarea, [role="textbox"]',
    checkbox: 'input[type="checkbox"], [role="checkbox"]',
    radio: 'input[type="radio"], [role="radio"]',
    combobox: 'select, [role="combobox"]',
    listbox: 'select[multiple], [role="listbox"]',
    tab: '[role="tab"]',
    tabpanel: '[role="tabpanel"]',
    dialog: 'dialog, [role="dialog"]',
    alert: '[role="alert"]',
    status: '[role="status"]',
    region: '[role="region"]',
    navigation: 'nav, [role="navigation"]',
    main: 'main, [role="main"]',
    complementary: 'aside, [role="complementary"]',
    contentinfo: 'footer, [role="contentinfo"]',
    banner: 'header, [role="banner"]'
  };

  return roleSelectors[role] || `[role="${role}"]`;
}

// Healthcare-specific test helpers
export const HealthcareTestAssertions = {
  // Assert button meets healthcare touch target requirements (44px minimum)
  assertTouchTargetCompliance: (element: Element) => {
    if (element.tagName.toLowerCase() === 'button') {
      const computedStyle = window.getComputedStyle(element);
      const height = parseInt(computedStyle.height);
      const width = parseInt(computedStyle.width);
      
      if (height < 44 || width < 44) {
        throw new Error(`Touch target too small: ${width}x${height}px (minimum 44x44px required for healthcare)`);
      }
    }
  },

  // Assert proper ARIA labeling for screen readers
  assertProperLabeling: (element: Element) => {
    const hasLabel = 
      element.getAttribute('aria-label') ||
      element.getAttribute('aria-labelledby') ||
      element.getAttribute('title') ||
      element.textContent?.trim();

    if (!hasLabel) {
      throw new Error(`Element lacks proper labeling for screen readers: ${element.tagName}`);
    }
  },

  // Assert keyboard accessibility
  assertKeyboardAccessible: (element: Element) => {
    const tabIndex = element.getAttribute('tabindex');
    const isInteractive = ['button', 'a', 'input', 'select', 'textarea'].includes(
      element.tagName.toLowerCase()
    );

    if (!isInteractive && tabIndex === '-1') {
      throw new Error(`Element is not keyboard accessible: ${element.tagName}`);
    }
  },

  // Assert emergency button styling
  assertEmergencyButtonStyling: (element: Element) => {
    const hasEmergencyAttribute = element.getAttribute('data-emergency') === 'true';
    const classList = element.classList.toString();
    
    if (hasEmergencyAttribute && !classList.includes('ring')) {
      throw new Error('Emergency button missing visual emphasis');
    }
  },

  // Assert medical device mode features
  assertMedicalDeviceMode: (element: Element) => {
    const hasInstructions = element.querySelector('[id*="instructions"]');
    const hasEnhancedFocus = element.classList.toString().includes('focus:ring-4');
    
    if (!hasInstructions || !hasEnhancedFocus) {
      throw new Error('Medical device mode features not properly implemented');
    }
  }
};

// Custom matchers for healthcare components
export const healthcareMatchers = {
  toHaveTextContent: (element: Element, text: string) => {
    return element.textContent?.includes(text) ?? false;
  },

  toHaveAttribute: (element: Element, attribute: string, value?: string) => {
    const attrValue = element.getAttribute(attribute);
    if (value !== undefined) {
      return attrValue === value;
    }
    return attrValue !== null;
  },

  toBeVisible: (element: Element) => {
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           style.opacity !== '0';
  },

  toHaveClass: (element: Element, className: string) => {
    return element.classList.contains(className);
  },

  toHaveRole: (element: Element, role: string) => {
    return element.getAttribute('role') === role;
  },

  toBeDisabled: (element: Element) => {
    return element.hasAttribute('disabled') || 
           element.getAttribute('aria-disabled') === 'true';
  },

  toHaveAccessibleName: (element: Element) => {
    return !!(
      element.getAttribute('aria-label') ||
      element.getAttribute('aria-labelledby') ||
      element.textContent?.trim()
    );
  }
};

export default createQwikTestRenderer;
