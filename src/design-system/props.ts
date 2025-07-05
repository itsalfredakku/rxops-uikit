/**
 * Design System Props Utilities
 * 
 * Standardized prop interfaces and utilities for consistent component APIs.
 * These interfaces can be extended by individual components as needed.
 */

import type { QRL, HTMLAttributes, CSSProperties } from '@builder.io/qwik';
import type { JSXChildren } from '@builder.io/qwik';
import type {
  ComponentSize,
  Variant,
  Color,
  Spacing,
  Gap,
  Padding,
  Alignment,
  Justify,
  FormVariant,
  FormState,
  FormSize,
  ValidationState,
  LoadingState,
  InteractiveState,
  MedicalPriority,
  AppointmentStatus,
  MedicalRecordStatus,
  MedicationFrequency
} from './types';

// ==================== UTILITY FUNCTIONS ====================

// Type for class values that supports reasonable nesting depth
type ClassValue = 
  | string 
  | undefined 
  | null 
  | false
  | ClassValue[];

/**
 * Enhanced utility to merge class names with comprehensive edge case handling
 * Handles Qwik's class and React's className for maximum compatibility
 * 
 * Features:
 * - Handles undefined/null/false class values
 * - Maintains proper precedence order (base → variant → custom)
 * - Supports conditional classes and nested arrays
 * - Performance optimized with deduplication for large class lists
 * - Maintains order for CSS cascade correctness
 * 
 * @param classes - Array of class values (strings, conditionals, nested arrays)
 * @returns Merged class string with duplicates removed and proper spacing
 */
export function mergeClasses(...classes: ClassValue[]): string {
  // Helper function to flatten arrays recursively
  function flattenClasses(items: ClassValue[]): string[] {
    const result: string[] = [];
    for (const item of items) {
      if (Array.isArray(item)) {
        result.push(...flattenClasses(item));
      } else if (item && typeof item === 'string') {
        result.push(item);
      }
    }
    return result;
  }
  
  const flatClasses = flattenClasses(classes);
  
  if (flatClasses.length === 0) return '';
  
  // Split all class strings and flatten into individual classes
  const allClasses = flatClasses
    .flatMap(cls => cls.split(/\s+/))
    .filter(cls => cls.length > 0);
  
  // Performance optimization: Use Set for deduplication while maintaining order
  // This preserves CSS cascade order - later classes override earlier ones
  const seen = new Set<string>();
  const uniqueClasses: string[] = [];
  
  // Process from right to left to ensure later classes take precedence
  for (let i = allClasses.length - 1; i >= 0; i--) {
    const cls = allClasses[i];
    if (!seen.has(cls)) {
      seen.add(cls);
      uniqueClasses.unshift(cls); // Add to beginning to maintain order
    }
  }
  
  return uniqueClasses.join(' ');
}

/**
 * Utility to merge CSS styles from multiple sources
 * Supports both string and object style formats
 */
export function mergeStyles(
  baseStyle?: CSSProperties | string,
  customStyle?: CSSProperties | string
): CSSProperties | string | undefined {
  if (!baseStyle && !customStyle) return undefined;
  if (!baseStyle) return customStyle;
  if (!customStyle) return baseStyle;
  
  // If both are strings, concatenate
  if (typeof baseStyle === 'string' && typeof customStyle === 'string') {
    return `${baseStyle}; ${customStyle}`;
  }
  
  // If both are objects, merge
  if (typeof baseStyle === 'object' && typeof customStyle === 'object') {
    return { ...baseStyle, ...customStyle };
  }
  
  // Mixed types - convert to string
  const baseStr = typeof baseStyle === 'string' ? baseStyle : styleObjectToString(baseStyle);
  const customStr = typeof customStyle === 'string' ? customStyle : styleObjectToString(customStyle);
  return `${baseStr}; ${customStr}`;
}

/**
 * Convert CSS properties object to string format
 */
function styleObjectToString(styleObj: CSSProperties): string {
  return Object.entries(styleObj)
    .map(([key, value]) => `${kebabCase(key)}: ${value}`)
    .join('; ');
}

/**
 * Convert camelCase to kebab-case for CSS properties
 */
function kebabCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
}

/**
 * Utility to extract and merge styling props from component props
 * Ensures proper forwarding of native HTML attributes while handling our custom props
 */
export function extractStyleProps<T extends BaseComponentProps>(props: T) {
  const {
    class: qwikClass,
    className,
    style,
    testId,
    'data-testid': dataTestId,
    size,
    disabled,
    readonly,
    children,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    ...rest
  } = props;

  // Merge class names (prefer className over class for React compatibility)
  const mergedClass = mergeClasses(qwikClass, className);
  
  // Prefer testId over data-testid
  const finalTestId = testId || dataTestId;

  // Extract data attributes
  const dataAttributes: Record<string, unknown> = {};
  Object.entries(rest).forEach(([key, value]) => {
    if (key.startsWith('data-')) {
      dataAttributes[key] = value;
      delete (rest as Record<string, unknown>)[key];
    }
  });

  return {
    styleProps: {
      class: mergedClass,
      style,
      'data-testid': finalTestId,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      'aria-describedby': ariaDescribedBy,
      ...dataAttributes,
    },
    componentProps: {
      size,
      disabled,
      readonly,
      children,
    },
    nativeProps: rest,
  };
}

// ==================== BASE COMPONENT PROPS ====================

/**
 * Essential props that every component should support
 * Extends native HTML attributes for maximum flexibility
 */
export interface BaseComponentProps<T extends HTMLElement = HTMLElement> extends Omit<HTMLAttributes<T>, 'class' | 'style'> {
  /** CSS class names to apply (Qwik standard) */
  class?: string;
  /** CSS class names to apply (React compatibility) */
  className?: string;
  /** Inline styles (object or string) */
  style?: CSSProperties | string;
  /** Unique identifier for the component */
  id?: string;
  /** Test identifier for automated testing */
  testId?: string;
  /** Data test identifier (alternative naming) */
  'data-testid'?: string;
  /** Component size variant */
  size?: ComponentSize;
  /** Whether the component is disabled */
  disabled?: boolean;
  /** Whether the component is read-only */
  readonly?: boolean;
  /** Child elements */
  children?: JSXChildren;
  /** Accessibility label for screen readers */
  'aria-label'?: string;
  /** ID of element that labels this component */
  'aria-labelledby'?: string;
  /** ID of element that describes this component */
  'aria-describedby'?: string;
  /** Data attributes (any data-* attribute) */
  [key: `data-${string}`]: string | number | boolean | undefined;
}

/**
 * Visual styling props for components that support design system variants
 */
export interface VariantProps {
  /** Visual variant following design system */
  variant?: Variant;
  /** Semantic color for color theming */
  color?: Color;
}

/**
 * Interactive component props for clickable/actionable elements
 */
export interface InteractiveProps<T = HTMLElement> {
  /** Loading state */
  loading?: boolean;
  /** Click handler */
  onClick$?: QRL<(event: Event, data?: T) => void>;
  /** Hover handler */
  onHover$?: QRL<(event: Event) => void>;
  /** Focus handler */
  onFocus$?: QRL<(event: Event) => void>;
  /** Blur handler */
  onBlur$?: QRL<(event: Event) => void>;
}

/**
 * Accessibility props for enhanced user experience
 */
export interface AccessibilityProps {
  /** Accessible label for screen readers */
  'aria-label'?: string;
  /** ID of element that labels this component */
  'aria-labelledby'?: string;
  /** ID of element that describes this component */
  'aria-describedby'?: string;
  /** Whether element is expanded (for dropdowns, accordions) */
  'aria-expanded'?: boolean;
  /** Whether element is selected */
  'aria-selected'?: boolean;
  /** Whether element is disabled */
  'aria-disabled'?: boolean;
  /** Semantic role of the element */
  role?: string;
  /** Tab index for keyboard navigation */
  tabIndex?: number;
}

// ==================== LAYOUT COMPONENT PROPS ====================

/**
 * Props for layout and spacing control
 */
export interface LayoutProps {
  /** Gap between child elements */
  gap?: Gap;
  /** Internal padding */
  padding?: Padding;
  /** Content alignment */
  align?: Alignment;
  /** Content justification */
  justify?: Justify;
  /** Spacing around the component */
  spacing?: Spacing;
}

/**
 * Props for responsive layout components
 */
export interface ResponsiveLayoutProps extends LayoutProps {
  /** Responsive breakpoints configuration */
  responsive?: {
    sm?: Partial<LayoutProps>;
    md?: Partial<LayoutProps>;
    lg?: Partial<LayoutProps>;
    xl?: Partial<LayoutProps>;
  };
}

// ==================== FORM COMPONENT PROPS ====================

/**
 * Base form field props
 */
export interface FormFieldProps {
  /** Field label */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Helper text shown below the field */
  helperText?: string;
  /** Error message */
  error?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Form variant style */
  variant?: FormVariant;
  /** Form field size */
  formSize?: FormSize;
  /** Current validation state */
  validationState?: ValidationState;
  /** Form state for styling */
  formState?: FormState;
}

/**
 * Input-specific props
 */
export interface InputProps extends FormFieldProps {
  /** Input type */
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  /** Current value */
  value?: string;
  /** Default value */
  defaultValue?: string;
  /** Maximum length */
  maxLength?: number;
  /** Minimum length */
  minLength?: number;
  /** Input pattern for validation */
  pattern?: string;
  /** Auto-complete hint */
  autoComplete?: string;
  /** Whether to auto-focus */
  autoFocus?: boolean;
  /** Change handler */
  onChange?: QRL<(value: string) => void>;
  /** Blur handler */
  onBlur?: QRL<() => void>;
  /** Focus handler */
  onFocus?: QRL<() => void>;
}

/**
 * Select/dropdown specific props
 */
export interface SelectProps extends FormFieldProps {
  /** Available options */
  options: Array<{
    value: string;
    label: string;
    disabled?: boolean;
  }>;
  /** Current selected value */
  value?: string;
  /** Default selected value */
  defaultValue?: string;
  /** Whether multiple selection is allowed */
  multiple?: boolean;
  /** Selection change handler */
  onChange?: QRL<(value: string | string[]) => void>;
}

// ==================== INTERACTIVE COMPONENT PROPS ====================

/**
 * Props for clickable/interactive components
 */
export interface InteractiveProps {
  /** Whether component is in loading state */
  loading?: boolean;
  /** Specific loading state */
  loadingState?: LoadingState;
  /** Interactive state */
  interactiveState?: InteractiveState;
  /** Click handler */
  onClick?: QRL<() => void>;
  /** Mouse enter handler */
  onMouseEnter?: QRL<() => void>;
  /** Mouse leave handler */
  onMouseLeave?: QRL<() => void>;
  /** Focus handler */
  onFocus?: QRL<() => void>;
  /** Blur handler */
  onBlur?: QRL<() => void>;
}

/**
 * Button-specific props
 */
export interface ButtonProps extends InteractiveProps {
  /** Visual variant */
  variant?: Variant;
  /** Semantic color */
  color?: Color;
  /** Button type for forms */
  type?: 'button' | 'submit' | 'reset';
  /** Form association */
  form?: string;
  /** Whether button spans full width */
  fullWidth?: boolean;
  /** Icon to show before text */
  startIcon?: JSXChildren;
  /** Icon to show after text */
  endIcon?: JSXChildren;
}

// ==================== HEALTHCARE DOMAIN PROPS ====================

/**
 * Patient-related props
 */
export interface PatientProps {
  /** Patient ID */
  patientId?: string;
  /** Patient name */
  patientName?: string;
  /** Date of birth */
  dateOfBirth?: string;
  /** Medical record number */
  mrn?: string;
  /** Insurance information */
  insurance?: {
    provider: string;
    policyNumber: string;
    groupNumber?: string;
  };
}

/**
 * Appointment-related props
 */
export interface AppointmentProps {
  /** Appointment ID */
  appointmentId?: string;
  /** Appointment date and time */
  dateTime?: string;
  /** Duration in minutes */
  duration?: number;
  /** Appointment status */
  status?: AppointmentStatus;
  /** Appointment type */
  type?: string;
  /** Provider information */
  provider?: {
    id: string;
    name: string;
    specialty?: string;
  };
  /** Location/room */
  location?: string;
}

/**
 * Medical record props
 */
export interface MedicalRecordProps {
  /** Record ID */
  recordId?: string;
  /** Record type */
  recordType?: string;
  /** Creation date */
  createdDate?: string;
  /** Last modified date */
  modifiedDate?: string;
  /** Record status */
  status?: MedicalRecordStatus;
  /** Priority level */
  priority?: MedicalPriority;
  /** Tags/categories */
  tags?: string[];
  /** Follow-up required */
  followUpRequired?: boolean;
}

/**
 * Medication-related props
 */
export interface MedicationProps {
  /** Medication ID */
  medicationId?: string;
  /** Medication name */
  name?: string;
  /** Dosage */
  dosage?: string;
  /** Frequency */
  frequency?: MedicationFrequency;
  /** Start date */
  startDate?: string;
  /** End date */
  endDate?: string;
  /** Prescribing provider */
  prescriber?: string;
  /** Special instructions */
  instructions?: string;
  /** Side effects */
  sideEffects?: string[];
}

// ==================== COMPOUND PROP INTERFACES ====================

/**
 * Complete props for a standard UI component
 * Uses intersection types to avoid interface conflicts
 */
export type StandardComponentProps = 
  BaseComponentProps & 
  Omit<AccessibilityProps, keyof BaseComponentProps> & 
  LayoutProps & {
    /** Visual variant */
    variant?: Variant;
    /** Semantic color */
    color?: Color;
  };

/**
 * Complete props for form components
 * Uses intersection types to avoid interface conflicts
 */
export type StandardFormProps = 
  BaseComponentProps & 
  Omit<AccessibilityProps, keyof BaseComponentProps> & 
  FormFieldProps & 
  Omit<InteractiveProps, keyof BaseComponentProps>;

/**
 * Complete props for healthcare components
 */
export type HealthcareComponentProps = 
  StandardComponentProps & 
  PatientProps & 
  MedicalRecordProps;

// ==================== UTILITY TYPES ====================

/**
 * Extract prop types for a specific domain
 */
export type ExtractProps<T, K extends keyof T> = Pick<T, K>;

/**
 * Make certain props required
 */
export type RequireProps<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Make all props optional except specified ones
 */
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

/**
 * Props with event handlers
 */
export type WithEventHandlers<T> = T & {
  onChange?: QRL<(value: unknown) => void>;
  onFocus?: QRL<() => void>;
  onBlur?: QRL<() => void>;
  onClick?: QRL<() => void>;
};

// ==================== PROP VALIDATION UTILITIES ====================

/**
 * Validate that required props are provided
 */
export function validateRequiredProps<T extends Record<string, unknown>>(
  props: T,
  requiredKeys: (keyof T)[]
): void {
  const missing = requiredKeys.filter(key => props[key] === undefined);
  if (missing.length > 0) {
    throw new Error(`Missing required props: ${missing.join(', ')}`);
  }
}

/**
 * Merge props with defaults
 */
export function mergeWithDefaults<T extends Record<string, unknown>>(
  userProps: Partial<T>,
  defaultProps: Partial<T>
): T {
  return {
    ...defaultProps,
    ...userProps,
    className: [defaultProps.className, userProps.className]
      .filter(Boolean)
      .join(' '),
  } as unknown as T;
}

/**
 * Extract HTML attributes from component props
 */
export function extractHtmlProps<T extends Record<string, unknown>>(
  props: T,
  excludeKeys: (keyof T)[] = []
): Record<string, unknown> {
  const htmlProps: Record<string, unknown> = {};
  const exclude = new Set(['children', 'className', 'testId', ...excludeKeys]);
  
  Object.entries(props).forEach(([key, value]) => {
    if (!exclude.has(key) && (key.startsWith('aria-') || key.startsWith('data-') || key === 'id')) {
      htmlProps[key] = value;
    }
  });
  
  return htmlProps;
}
