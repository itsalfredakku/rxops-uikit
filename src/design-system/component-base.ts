/**
 * RxOps Design System - Component Base System
 * Component architecture with proper variant management and composition
 */

import type { ComponentSize, InteractiveState } from "./types";

// Re-export for backward compatibility
export type { ComponentSize };
export type ComponentState = InteractiveState;

// Base component context
export interface ComponentContext {
  size: ComponentSize;
  disabled: boolean;
  readonly: boolean;
}

// Enhanced variant system with better TypeScript support
export interface VariantConfig<T extends string = string> {
  base: string;
  variants: Record<T, string>;
  compoundVariants?: Array<{
    conditions: Partial<Record<T | keyof ComponentContext, unknown>>;
    className: string;
  }>;
  defaultVariant?: T;
}

/**
 * Advanced variant class generator with compound variants and context awareness
 */
export function createVariantClass<T extends string>(
  config: VariantConfig<T>
) {
  return function getVariantClass(
    props: Partial<Record<T, unknown>> & Partial<ComponentContext> & { className?: string }
  ): string {
    const classes: string[] = [config.base];
    
    // Apply variant classes
    Object.entries(config.variants).forEach(([variant, className]) => {
      if (props[variant as T]) {
        classes.push(className as string);
      }
    });
    
    // Apply compound variants
    config.compoundVariants?.forEach(({ conditions, className }) => {
      const matches = Object.entries(conditions).every(([key, value]) => {
        return props[key as keyof typeof props] === value;
      });
      if (matches) {
        classes.push(className);
      }
    });
    
    // Add custom className
    if (props.className) {
      classes.push(props.className);
    }
    
    return classes.filter(Boolean).join(" ");
  };
}

/**
 * Size system with consistent scaling
 */
export const sizeConfig = {
  xs: {
    height: "h-6",
    padding: "px-2 py-1",
    text: "text-xs",
    gap: "gap-1",
    radius: "rounded-sm",
  },
  sm: {
    height: "h-8",
    padding: "px-3 py-1.5",
    text: "text-sm",
    gap: "gap-1.5",
    radius: "rounded",
  },
  md: {
    height: "h-10",
    padding: "px-4 py-2",
    text: "text-base",
    gap: "gap-2",
    radius: "rounded-md",
  },
  lg: {
    height: "h-12",
    padding: "px-6 py-3",
    text: "text-lg",
    gap: "gap-2.5",
    radius: "rounded-lg",
  },
  xl: {
    height: "h-14",
    padding: "px-8 py-4",
    text: "text-xl",
    gap: "gap-3",
    radius: "rounded-xl",
  },
} as const;

/**
 * Focus system for consistent keyboard navigation
 */
export const focusConfig = {
  base: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
  primary: "focus-visible:ring-primary",
  success: "focus-visible:ring-success",
  warning: "focus-visible:ring-warning", 
  error: "focus-visible:ring-error",
} as const;

/**
 * Animation system for consistent micro-interactions
 */
export const animationConfig = {
  base: "transition-all duration-normal ease-in-out",
  hover: "hover:scale-[1.02] hover:-translate-y-0.5",
  focus: "focus:scale-[1.01]",
  active: "active:scale-[0.98] active:translate-y-0",
  disabled: "disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none",
} as const;

/**
 * Accessibility helpers
 */
export interface AccessibilityProps {
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-expanded"?: boolean;
  "aria-selected"?: boolean;
  "aria-disabled"?: boolean;
  role?: string;
}

/**
 * Common component props that all components should support
 */
export interface BaseComponentProps extends AccessibilityProps {
  id?: string;
  className?: string;
  testId?: string;
  size?: ComponentSize;
  disabled?: boolean;
  readonly?: boolean;
}

/**
 * Utility to merge component props with proper precedence
 */
export function mergeProps<T extends Record<string, unknown>>(
  defaultProps: Partial<T>,
  userProps: Partial<T>
): T {
  const merged = {
    ...defaultProps,
    ...userProps,
    className: [defaultProps.className, userProps.className]
      .filter(Boolean)
      .join(" "),
  };
  return merged as unknown as T;
}

/**
 * Responsive utility for component variants
 */
export type ResponsiveValue<T> = T | {
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  "2xl"?: T;
};

export function resolveResponsive<T>(
  value: ResponsiveValue<T>,
  breakpoint = "md"
): T {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return (value as Record<string, T>)[breakpoint] || (value as Record<string, T>).md || Object.values(value)[0];
  }
  return value as T;
}

/**
 * Compound component creation helper
 */
export function createCompoundComponent<T extends Record<string, unknown>>(
  mainComponent: unknown,
  subComponents: T
): typeof mainComponent & T {
  Object.keys(subComponents).forEach((key) => {
    (mainComponent as Record<string, unknown>)[key] = subComponents[key];
  });
  return mainComponent as typeof mainComponent & T;
}
