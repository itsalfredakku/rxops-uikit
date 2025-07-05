/**
 * Design Token Utilities
 * Helper functions for consistent token usage across components
 * Updated to use semantic color naming
 */

import { designTokens } from './tokens';

// Type definitions for better IntelliSense with semantic colors
export type ColorToken = keyof typeof designTokens.colors;
export type ColorShade = 'lighter' | 'light' | 'normal' | 'dark' | 'darker';
export type SpacingToken = keyof typeof designTokens.spacing;
export type RadiusToken = keyof typeof designTokens.borderRadius;
export type ShadowToken = keyof typeof designTokens.boxShadow;
export type FontSizeToken = keyof typeof designTokens.typography.fontSize;
export type FontWeightToken = keyof typeof designTokens.typography.fontWeight;

/**
 * Get a CSS variable for a semantic color token
 * Enables dynamic theming and better debugging
 */
export function getColorToken(color: ColorToken, shade: ColorShade = 'normal'): string {
  const shadeMap = {
    lighter: '100',
    light: '200',
    normal: '500',
    dark: '600', 
    darker: '800'
  };
  const fallbackShade = shadeMap[shade];
  return `var(--color-${color}-${shade}, var(--color-${color}-${fallbackShade}))`;
}

/**
 * Get Tailwind CSS class for semantic color
 */
export function getColorClass(type: 'bg' | 'text' | 'border' | 'ring', color: ColorToken, shade: ColorShade = 'normal'): string {
  if (shade === 'normal') {
    return `${type}-${color}`;
  }
  return `${type}-${color}-${shade}`;
}

/**
 * Generate complete color variant classes for interactive components with semantic colors
 */
export function createColorVariant(color: ColorToken, variant: 'solid' | 'outline' | 'ghost' | 'soft' = 'solid') {
  const variants = {
    solid: {
      base: `bg-${color} text-white border-${color}`,
      hover: `hover:bg-${color}-dark hover:border-${color}-dark`,
      active: `active:bg-${color}-darker active:border-${color}-darker`,
      focus: `focus-visible:ring-${color}`,
      disabled: 'disabled:opacity-60 disabled:cursor-not-allowed'
    },
    outline: {
      base: `bg-transparent text-${color}-dark border-${color}`,
      hover: `hover:bg-${color}-lighter hover:text-${color}-darker`,
      active: `active:bg-${color}-light`,
      focus: `focus-visible:ring-${color}`,
      disabled: 'disabled:opacity-60 disabled:cursor-not-allowed'
    },
    ghost: {
      base: `bg-transparent text-${color}-dark border-transparent`,
      hover: `hover:bg-${color}-lighter`,
      active: `active:bg-${color}-light`,
      focus: `focus-visible:ring-${color}`,
      disabled: 'disabled:opacity-60 disabled:cursor-not-allowed'
    },
    soft: {
      base: `bg-${color}-lighter text-${color}-darker border-${color}-light`,
      hover: `hover:bg-${color}-light`,
      active: `active:bg-${color}`,
      focus: `focus-visible:ring-${color}`,
      disabled: 'disabled:opacity-60 disabled:cursor-not-allowed'
    }
  };

  const variantConfig = variants[variant];
  return [
    variantConfig.base,
    variantConfig.hover,
    variantConfig.active,
    variantConfig.focus,
    variantConfig.disabled
  ].join(' ');
}

/**
 * Get spacing value from design token
 */
export function getSpacing(size: SpacingToken): string {
  return designTokens.spacing[size];
}

/**
 * Create spacing classes with proper token references
 */
export function getSpacingClass(type: 'p' | 'px' | 'py' | 'pt' | 'pr' | 'pb' | 'pl' | 'm' | 'mx' | 'my' | 'mt' | 'mr' | 'mb' | 'ml' | 'gap', size: SpacingToken): string {
  return `${type}-${size}`;
}

/**
 * Get border radius from design token
 */
export function getRadius(size: RadiusToken): string {
  return designTokens.borderRadius[size];
}

/**
 * Create radius classes with proper token references
 */
export function getRadiusClass(size: RadiusToken): string {
  return `rounded${size === 'base' ? '' : `-${size}`}`;
}

/**
 * Get shadow from design token
 */
export function getShadow(size: ShadowToken): string {
  return designTokens.boxShadow[size];
}

/**
 * Create shadow classes with proper token references
 */
export function getShadowClass(size: ShadowToken): string {
  return `shadow${size === 'base' ? '' : `-${size}`}`;
}

/**
 * Healthcare-specific color mappings for semantic meaning
 */
export const healthcareColors = {
  // Patient status
  healthy: 'success',
  stable: 'primary',
  monitoring: 'warning',
  critical: 'error',
  
  // Priority levels
  low: 'neutral',
  medium: 'warning',
  high: 'error',
  urgent: 'error',
  
  // Medical categories
  consultation: 'primary',
  procedure: 'info',
  medication: 'success',
  lab: 'warning',
  imaging: 'info',
  emergency: 'error'
} as const;

/**
 * Get healthcare semantic color
 */
export function getHealthcareColor(semantic: keyof typeof healthcareColors, shade: ColorShade = 'normal'): string {
  const colorToken = healthcareColors[semantic] as ColorToken;
  return getColorToken(colorToken, shade);
}

/**
 * Get healthcare semantic color class with semantic naming
 */
export function getHealthcareColorClass(type: 'bg' | 'text' | 'border', semantic: keyof typeof healthcareColors, shade: ColorShade = 'normal'): string {
  const colorToken = healthcareColors[semantic] as ColorToken;
  return getColorClass(type, colorToken, shade);
}

/**
 * Interactive state classes with proper token usage
 */
export const interactiveStates = {
  base: 'transition-all duration-normal ease-in-out',
  hover: 'hover:scale-[1.02] hover:-translate-y-0.5',
  active: 'active:scale-[0.98] active:translate-y-0',
  focus: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
  disabled: 'disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none'
};

/**
 * Get complete interactive class string with semantic color tokens
 */
export function getInteractiveClasses(color: ColorToken = 'primary'): string {
  return [
    interactiveStates.base,
    interactiveStates.hover,
    interactiveStates.active,
    interactiveStates.focus,
    `focus-visible:ring-${color}`,
    interactiveStates.disabled
  ].join(' ');
}

/**
 * Typography token utilities
 */
export function getFontSizeClass(size: FontSizeToken): string {
  return `text-${size}`;
}

export function getFontWeightClass(weight: FontWeightToken): string {
  return `font-${weight}`;
}

/**
 * Responsive breakpoint utilities
 */
export function getBreakpointClass(size: keyof typeof designTokens.breakpoints, className: string): string {
  return `${size}:${className}`;
}

/**
 * Validation utilities for token usage
 */
export function validateColorToken(color: string, shade: string): boolean {
  const colorSet = designTokens.colors[color as ColorToken];
  if (!colorSet) return false;
  return (colorSet as Record<string, string>)[shade] !== undefined;
}

export function validateSpacingToken(spacing: string): boolean {
  return spacing in designTokens.spacing;
}

/**
 * Debug utilities for development
 */
export function getTokenInfo(token: string): unknown {
  const parts = token.split('-');
  if (parts.length >= 2) {
    const [type, color, shade] = parts;
    
    if (type === 'bg' || type === 'text' || type === 'border') {
      const isValid = validateColorToken(color, shade);
      const colorSet = designTokens.colors[color as ColorToken] as Record<string, string>;
      const value = isValid ? colorSet[shade] : 'Invalid token';
      
      return {
        type,
        color,
        shade,
        value,
        valid: isValid
      };
    }
  }
  
  return { valid: false, message: 'Unknown token format' };
}

/**
 * Convert legacy color classes to proper tokens
 */
export const legacyColorMap = {
  'blue': 'primary',
  'gray': 'neutral',
  'green': 'success',
  'red': 'error',
  'yellow': 'warning',
  'indigo': 'info'
} as const;

export function migrateLegacyColor(legacyClass: string): string {
  // Replace legacy colors with proper tokens
  return legacyClass.replace(
    /(bg|text|border)-(blue|gray|green|red|yellow|indigo)-(\d+)/g,
    (match, type, color, shade) => {
      const newColor = legacyColorMap[color as keyof typeof legacyColorMap];
      return newColor ? `${type}-${newColor}-${shade}` : match;
    }
  );
}
