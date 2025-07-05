/**
 * Component Utilities
 * Utility functions for consistent component behavior
 */

import { type ClassList } from '@builder.io/qwik';

/**
 * Combines multiple class strings/arrays into a single string
 * Supports conditional classes and filters out falsy values
 */
export const cn = (...classes: Array<string | undefined | null | boolean | ClassList>): string => {
  return classes
    .flat()
    .filter(Boolean)
    .join(' ');
};

/**
 * Creates variant-based class names with consistent patterns
 */
export const createVariants = <T extends Record<string, Record<string, string>>>(
  config: T
): ((variant: keyof T, value: keyof T[keyof T]) => string) => {
  return (variant, value) => {
    const variantConfig = config[variant];
    return variantConfig?.[value] || '';
  };
};

/**
 * Size mapping utilities
 */
export const sizeVariants = {
  button: {
    sm: 'h-button-sm px-3 text-sm',
    md: 'h-button-md px-4 text-base',
    lg: 'h-button-lg px-6 text-lg',
    xl: 'h-12 px-8 text-xl',
  },
  input: {
    sm: 'h-input-sm px-3 text-sm',
    md: 'h-input-md px-4 text-base',
    lg: 'h-input-lg px-4 text-lg',
  },
  text: {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
  },
} as const;

/**
 * Color variant utilities for consistent theming
 */
export const colorVariants = {
  primary: {
    solid: 'bg-primary text-white border-primary hover:bg-primary-dark focus:ring-primary',
    outline: 'bg-transparent text-primary-dark border-primary hover:bg-primary-lighter focus:ring-primary',
    ghost: 'bg-transparent text-primary-dark border-transparent hover:bg-primary-lighter focus:ring-primary',
    soft: 'bg-primary-lighter text-primary-darker border-primary-light hover:bg-primary-light focus:ring-primary',
  },
  success: {
    solid: 'bg-success text-white border-success hover:bg-success-dark focus:ring-success',
    outline: 'bg-transparent text-success-dark border-success hover:bg-success-lighter focus:ring-success',
    ghost: 'bg-transparent text-success-dark border-transparent hover:bg-success-lighter focus:ring-success',
    soft: 'bg-success-lighter text-success-darker border-success-light hover:bg-success-light focus:ring-success',
  },
  warning: {
    solid: 'bg-warning text-white border-warning hover:bg-warning-dark focus:ring-warning',
    outline: 'bg-transparent text-warning-dark border-warning hover:bg-warning-lighter focus:ring-warning',
    ghost: 'bg-transparent text-warning-dark border-transparent hover:bg-warning-lighter focus:ring-warning',
    soft: 'bg-warning-lighter text-warning-darker border-warning-light hover:bg-warning-light focus:ring-warning',
  },
  error: {
    solid: 'bg-error text-white border-error hover:bg-error-dark focus:ring-error',
    outline: 'bg-transparent text-error-dark border-error hover:bg-error-lighter focus:ring-error',
    ghost: 'bg-transparent text-error-dark border-transparent hover:bg-error-lighter focus:ring-error',
    soft: 'bg-error-lighter text-error-darker border-error-light hover:bg-error-light focus:ring-error',
  },
  neutral: {
    solid: 'bg-neutral-dark text-white border-neutral-dark hover:bg-neutral-darker focus:ring-neutral',
    outline: 'bg-transparent text-neutral-dark border-neutral-light hover:bg-neutral-lighter focus:ring-neutral',
    ghost: 'bg-transparent text-neutral-dark border-transparent hover:bg-neutral-lighter focus:ring-neutral',
    soft: 'bg-neutral-light text-neutral-darker border-neutral-light hover:bg-neutral focus:ring-neutral',
  },
} as const;

/**
 * Common component base classes
 */
export const baseClasses = {
  interactive: 'transition-base cursor-pointer select-none',
  disabled: 'opacity-60 cursor-not-allowed pointer-events-none',
  focusRing: 'focus:outline-none focus:ring-2 focus:ring-offset-2',
  roundedBase: 'rounded-lg',
  roundedFull: 'rounded-full',
  shadow: 'shadow-soft',
  border: 'border',
} as const;

/**
 * Animation utilities
 */
export const animations = {
  fadeIn: 'animate-fade-in',
  slideUp: 'animate-slide-up',
  scaleIn: 'animate-scale-in',
} as const;

/**
 * Healthcare-specific utilities
 */
export const healthcareVariants = {
  status: {
    healthy: 'bg-success-lighter text-success-darker border-success-light',
    warning: 'bg-warning-lighter text-warning-darker border-warning-light',
    critical: 'bg-error-lighter text-error-darker border-error-light',
    stable: 'bg-primary-lighter text-primary-darker border-primary-light',
    monitoring: 'bg-neutral-lighter text-neutral-darker border-neutral-light',
  },
  priority: {
    low: 'bg-neutral-lighter text-neutral-dark',
    medium: 'bg-warning-lighter text-warning-dark',
    high: 'bg-error-lighter text-error-dark',
    urgent: 'bg-error text-white animate-pulse',
  },
} as const;

/**
 * Responsive utilities
 */
export const responsiveClasses = {
  stack: 'flex flex-col space-y-4',
  stackSm: 'sm:flex-row sm:space-y-0 sm:space-x-4',
  grid: 'grid gap-4',
  gridResponsive: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  hidden: {
    mobile: 'hidden sm:block',
    tablet: 'hidden md:block',
    desktop: 'hidden lg:block',
  },
  show: {
    mobile: 'block sm:hidden',
    tablet: 'block md:hidden',
    desktop: 'block lg:hidden',
  },
} as const;

/**
 * Form validation utilities
 */
export const validationClasses = {
  valid: 'border-success-light focus:border-success focus:ring-success',
  invalid: 'border-error-light focus:border-error focus:ring-error',
  pending: 'border-warning-light focus:border-warning focus:ring-warning',
} as const;

/**
 * Type definitions for better TypeScript support
 */
export type Size = 'sm' | 'md' | 'lg' | 'xl';
export type ColorScheme = 'primary' | 'success' | 'warning' | 'error' | 'neutral';
export type Variant = 'solid' | 'outline' | 'ghost' | 'soft';
export type HealthStatus = 'healthy' | 'warning' | 'critical' | 'stable' | 'monitoring';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
