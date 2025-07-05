/**
 * RxOps Design System - Design Tokens
 * Healthcare-focused design system tokens with component integration
 */

export const designTokens = {
  // Color System - Healthcare optimized palette
  colors: {
    // Primary brand colors - Healthcare blue
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6', // Main brand color
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554',
      // Semantic aliases
      lighter: '#bfdbfe',
      light: '#60a5fa',
      normal: '#3b82f6',
      dark: '#1d4ed8',
      darker: '#1e3a8a',
    },
    
    // Neutral colors for UI elements
    neutral: {
      0: '#ffffff',
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
      950: '#030712',
      // Semantic aliases
      lighter: '#e5e7eb',
      light: '#9ca3af',
      normal: '#6b7280',
      dark: '#374151',
      darker: '#111827',
    },
    
    // Healthcare semantic colors
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
      // Semantic aliases
      lighter: '#bbf7d0',
      light: '#4ade80',
      normal: '#22c55e',
      dark: '#15803d',
      darker: '#14532d',
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
      // Semantic aliases
      lighter: '#fde68a',
      light: '#fbbf24',
      normal: '#f59e0b',
      dark: '#b45309',
      darker: '#78350f',
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
      // Semantic aliases
      lighter: '#fecaca',
      light: '#f87171',
      normal: '#ef4444',
      dark: '#b91c1c',
      darker: '#7f1d1d',
    },
    info: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
      // Semantic aliases
      lighter: '#bae6fd',
      light: '#38bdf8',
      normal: '#0ea5e9',
      dark: '#0369a1',
      darker: '#0c4a6e',
    },
  },

  // Typography System
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'monospace'],
    },
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },

  // Spacing System
  spacing: {
    0: '0px',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    32: '8rem',
  },

  // Border Radius System
  borderRadius: {
    none: '0px',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },

  // Shadow System
  boxShadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    none: '0 0 #0000',
  },

  // Animation & Transition
  animation: {
    duration: {
      fast: '150ms',
      base: '200ms',
      slow: '300ms',
      slower: '500ms',
    },
    easing: {
      linear: 'linear',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },

  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Z-index layers
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },
} as const;

// Component-specific token mappings
export const componentTokens = {
  button: {
    sizes: {
      xs: {
        height: 'h-6',
        padding: 'px-2',
        text: 'text-xs',
        gap: 'gap-1',
        radius: 'rounded',
      },
      sm: {
        height: 'h-8',
        padding: 'px-3',
        text: 'text-sm',
        gap: 'gap-1.5',
        radius: 'rounded-md',
      },
      md: {
        height: 'h-10',
        padding: 'px-4',
        text: 'text-base',
        gap: 'gap-2',
        radius: 'rounded-md',
      },
      lg: {
        height: 'h-12',
        padding: 'px-6',
        text: 'text-lg',
        gap: 'gap-2',
        radius: 'rounded-lg',
      },
      xl: {
        height: 'h-14',
        padding: 'px-8',
        text: 'text-xl',
        gap: 'gap-3',
        radius: 'rounded-lg',
      },
    },
  },
  input: {
    sizes: {
      sm: {
        height: 'h-8',
        padding: 'px-3 py-1.5',
        text: 'text-sm',
        radius: 'rounded',
      },
      md: {
        height: 'h-10',
        padding: 'px-3 py-2',
        text: 'text-base',
        radius: 'rounded-md',
      },
      lg: {
        height: 'h-12',
        padding: 'px-4 py-3',
        text: 'text-lg',
        radius: 'rounded-lg',
      },
    },
  },
  card: {
    padding: {
      none: 'p-0',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
      xl: 'p-8',
    },
  },
} as const;

// Export individual token categories for easier consumption
export const colors = designTokens.colors;
export const typography = designTokens.typography;
export const spacing = designTokens.spacing;
export const borderRadius = designTokens.borderRadius;
export const boxShadow = designTokens.boxShadow;
export const animation = designTokens.animation;
export const breakpoints = designTokens.breakpoints;
export const zIndex = designTokens.zIndex;

// Export specific typography tokens for convenience
export const fontWeight = designTokens.typography.fontWeight;
export const fontSize = designTokens.typography.fontSize;
export const fontFamily = designTokens.typography.fontFamily;

// Extract lineHeight from fontSize tuples
export const lineHeight = {
  xs: '1rem',
  sm: '1.25rem', 
  base: '1.5rem',
  lg: '1.75rem',
  xl: '1.75rem',
  '2xl': '2rem',
  '3xl': '2.25rem',
  '4xl': '2.5rem',
  tight: '1.25',
  snug: '1.375',
  normal: '1.5',
  relaxed: '1.625',
  loose: '2',
};
