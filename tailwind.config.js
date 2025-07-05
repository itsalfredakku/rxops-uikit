/** @type {import('tailwindcss').Config} */
/**
 * TailwindCSS Configuration - Enhanced for stability and performance
 * 
 * Fixes for CRITICAL-002: CSS Hot Reload Loop
 * - Optimized content patterns to reduce file watching
 * - Added safelist for dynamic classes
 * - Added more specific file patterns
 */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/core/**/*.{js,ts,jsx,tsx}",
    "./src/healthcare/**/*.{js,ts,jsx,tsx}",
    "./src/layouts/**/*.{js,ts,jsx,tsx}",
    // Explicitly exclude generated files and tests to reduce file watching
    "!./src/**/*.{spec,test}.{js,ts,jsx,tsx}",
    "!./src/**/__tests__/**/*",
    // Lib is built output, no need to watch
    "!./lib/**/*",
    // Demo files separated for better optimization
    "./demo/src/**/*.{js,ts,jsx,tsx}",
    "!./demo/src/**/*.{spec,test}.{js,ts,jsx,tsx}",
  ],
  // Add safelist for dynamic classes to prevent excessive rebuilds
  safelist: [
    // Semantic color classes
    {
      pattern: /bg-(primary|success|warning|error|neutral)(-lighter|-light|-dark|-darker)?$/,
      variants: ['hover', 'focus', 'active'],
    },
    {
      pattern: /text-(primary|success|warning|error|neutral)(-lighter|-light|-dark|-darker)?$/,
      variants: ['hover', 'focus', 'active'],
    },
    {
      pattern: /border-(primary|success|warning|error|neutral)(-lighter|-light|-dark|-darker)?$/,
      variants: ['hover', 'focus', 'active'],
    },
    {
      pattern: /ring-(primary|success|warning|error|neutral)(-lighter|-light|-dark|-darker)?$/,
      variants: ['hover', 'focus', 'active'],
    },
    // Legacy numeric classes for backward compatibility
    {
      pattern: /bg-(primary|success|warning|error|info)-(50|100|200|300|400|500|600|700|800|900)/,
      variants: ['hover', 'focus'],
    },
    {
      pattern: /text-(primary|success|warning|error|info)-(50|100|200|300|400|500|600|700|800|900)/,
      variants: ['hover', 'focus'],
    },
  ],
  theme: {
    extend: {
      // Modern Healthcare Design System
      colors: {
        // Primary brand colors
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
          // Semantic aliases for design system
          lighter: '#bfdbfe',  // primary-200
          light: '#60a5fa',    // primary-400
          normal: '#3b82f6',   // primary-500
          dark: '#1d4ed8',     // primary-700
          darker: '#1e3a8a',   // primary-900
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
        },
        warning: {
          50: '#fefce8',    // Very light yellow-amber for subtle backgrounds
          100: '#fef3c7',   // Light amber for soft backgrounds  
          200: '#fde68a',   // Lighter amber for gentle warnings
          300: '#fbbf24',   // Medium amber - good for text on light backgrounds
          400: '#f59e0b',   // Standard amber - main warning color
          500: '#d97706',   // Darker amber - for prominent warnings
          600: '#b45309',   // Dark amber - for text on light backgrounds
          700: '#92400e',   // Very dark amber - high contrast text
          800: '#78350f',   // Deep amber - for very high contrast
          900: '#451a03',   // Darkest amber - for maximum contrast
          // Semantic aliases for design system
          lighter: '#fde68a',  // warning-200
          light: '#fbbf24',    // warning-300
          normal: '#f59e0b',   // warning-400
          dark: '#b45309',     // warning-600
          darker: '#78350f',   // warning-800
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
        },
      },

      // Typography
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'monospace'],
      },

      // Enhanced spacing system
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },

      // Softer border colors for healthcare UI
      borderColor: {
        'DEFAULT': '#e5e7eb', // neutral-200 - much lighter default border
        'light': '#f3f4f6',   // neutral-100 - very light borders
        'subtle': '#d1d5db',  // neutral-300 - subtle borders
      },

      // Animation and transitions
      transitionDuration: {
        '250': '250ms',
        '400': '400ms',
      },
      
      // Custom animations
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-subtle': 'pulseSubtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },

      // Enhanced shadows for healthcare UI
      boxShadow: {
        'soft': '0 2px 8px 0 rgba(0, 0, 0, 0.06)',
        'medium': '0 4px 16px 0 rgba(0, 0, 0, 0.08)',
        'strong': '0 8px 32px 0 rgba(0, 0, 0, 0.12)',
        'glow-primary': '0 0 20px rgba(59, 130, 246, 0.3)',
        'glow-success': '0 0 20px rgba(34, 197, 94, 0.3)',
        'glow-warning': '0 0 20px rgba(245, 158, 11, 0.3)',
        'glow-error': '0 0 20px rgba(239, 68, 68, 0.3)',
      },

      // Border radius
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },

      // Z-index utilities
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [
    // Custom utilities plugin
    function({ addUtilities }) {
      const newUtilities = {
        // Glass morphism effect
        '.glass': {
          'background': 'rgba(255, 255, 255, 0.25)',
          'backdrop-filter': 'blur(10px)',
          'border': '1px solid rgba(255, 255, 255, 0.18)',
        },
        
        // Text utilities
        '.text-balance': {
          'text-wrap': 'balance',
        },
        
        // Scrollbar utilities
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
        
        // Focus ring utilities for healthcare UI
        '.focus-ring-healthcare': {
          '@apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2': {},
        },
        
        // Safe area utilities for mobile
        '.safe-top': {
          'padding-top': 'env(safe-area-inset-top)',
        },
        '.safe-bottom': {
          'padding-bottom': 'env(safe-area-inset-bottom)',
        },
      };
      
      addUtilities(newUtilities);
    }
  ],
};