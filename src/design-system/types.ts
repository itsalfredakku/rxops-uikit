/**
 * Design System Type Tokens
 * 
 * Centralized type definitions for consistent component APIs across the RxOpslibrary.
 * These tokens ensure all components follow the same patterns for variants, colors, sizes, etc.
 */

// ==================== BASE TOKENS ====================

// Size scale (used across all components)
export type Size = "xs" | "sm" | "md" | "lg" | "xl";

// Spacing scale (follows Tailwind spacing: p-4, mr-2, etc.)
export type Spacing = "0" | "1" | "2" | "3" | "4" | "6" | "8" | "12" | "16" | "20" | "24";

// Alignment options (used in flex/grid layouts)
export type Alignment = "start" | "center" | "end" | "stretch" | "baseline";

// Justification options (used in flex layouts)
export type Justify = "start" | "center" | "end" | "between" | "around" | "evenly";

// State options (used for form states, component states)
export type State = "default" | "success" | "warning" | "error";

// Position options (used for tooltips, dropdowns, popovers)
export type Position = "top" | "bottom" | "left" | "right" | "top-start" | "top-end" | "bottom-start" | "bottom-end";

// ==================== CORE VISUAL TOKENS ====================

// Core variant types for visual styling approach
export type Variant = "elevated" | "flat" | "text" | "outlined";

// Semantic color types for meaning and context
export type Color = "primary" | "secondary" | "success" | "warning" | "error" | "info";

// Typography style tokens (inspired by Radzen design system)
export type TextStyle = "title" | "subtitle" | "body" | "caption" | "overline";

// Text weight options
export type TextWeight = "thin" | "light" | "normal" | "medium" | "semibold" | "bold" | "extrabold" | "black";

// Text alignment options  
export type TextAlign = "left" | "center" | "right" | "justify";

// Text transform options
export type TextTransform = "none" | "uppercase" | "lowercase" | "capitalize";

// Text decoration options
export type TextDecoration = "none" | "underline" | "line-through" | "overline";

// Color shade intensities (semantic naming)
export type Shade = "lighter" | "light" | "normal" | "dark" | "darker";

// ==================== SPECIALIZED TOKENS ====================

// Reused base types for specific purposes
export type ComponentSize = Size;
export type Gap = Spacing;

// Form-specific variants (different pattern for form components)
export type FormVariant = "default" | "filled" | "outline";

// Form states (extends State)
export type FormState = State;

// Validation states for form components
export type ValidationState = "valid" | "invalid" | "pending";

// Loading states for async components
export type LoadingState = "idle" | "loading" | "success" | "error";

// Interactive states
export type InteractiveState = State | "hover" | "focus" | "active" | "disabled";

// Focus visible states for keyboard navigation
export type FocusState = "none" | "visible" | "within";

// ==================== COMPONENT-SPECIFIC SUBSETS ====================

// Subset sizes for specific components
export type BadgeSize = Extract<Size, "sm" | "md" | "lg">;
export type FormSize = Extract<Size, "sm" | "md" | "lg">;

// Padding variants (subset of spacing)
export type Padding = Extract<Spacing, "0" | "2" | "4" | "6" | "8">;

// ==================== LEGACY & COMPATIBILITY ====================

// Legacy types (keeping for backward compatibility)
export type CardVariant = "default" | "outlined" | "elevated";
export type CardPadding = Padding;
export type AlertVariant = "filled" | "outlined" | "soft";
export type TableAlign = "left" | "center" | "right";
export type FormSpacing = "compact" | "normal" | "relaxed";
export type DividerSpacing = Padding;

// Legacy color for backward compatibility
export type LegacyColor = "default" | Color;

/**
 * Helper type for components that need both modern and legacy color support
 */
export type ColorWithLegacy = Color | "default";

// ==================== HEALTHCARE DOMAIN TOKENS ====================

// Priority levels for medical contexts
export type MedicalPriority = "low" | "normal" | "high" | "urgent" | "critical";

// Appointment status types
export type AppointmentStatus = "scheduled" | "confirmed" | "in-progress" | "completed" | "cancelled" | "no-show";

// Medical record status
export type MedicalRecordStatus = "draft" | "pending" | "approved" | "archived";

// Medication frequency
export type MedicationFrequency = "once-daily" | "twice-daily" | "three-times-daily" | "four-times-daily" | "as-needed";

// ==================== COMPONENT PROP INTERFACES ====================

/**
 * Base props that most components should support
 */
export interface BaseProps {
  /** Component ID for DOM targeting */
  id?: string;
  /** CSS class names */
  className?: string;
  /** Test ID for automated testing */
  testId?: string;
  /** Component size */
  size?: ComponentSize;
  /** Disabled state */
  disabled?: boolean;
  /** Read-only state */
  readonly?: boolean;
}

/**
 * Layout props for spacing and positioning
 */
export interface LayoutProps {
  /** Gap between child elements */
  gap?: Gap;
  /** Internal padding */
  padding?: Padding;
  /** Alignment of content */
  align?: Alignment;
  /** Justification of content */
  justify?: Justify;
}

/**
 * Form field props for validation and interaction
 */
export interface FormFieldProps {
  /** Field label */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Helper text */
  helperText?: string;
  /** Error message */
  error?: string;
  /** Required field indicator */
  required?: boolean;
  /** Validation state */
  validationState?: ValidationState;
}

/**
 * Interactive props for clickable components
 */
export interface InteractiveProps {
  /** Loading state */
  loading?: boolean;
  /** Loading state type */
  loadingState?: LoadingState;
  /** Click handler */
  onClick?: () => void;
}

// ==================== BACKWARD COMPATIBILITY EXPORTS ====================

/**
 * Re-export commonly used combinations for backward compatibility
 */
export type {
  Variant as BadgeVariant,
  Variant as ButtonVariant,
  Color as BadgeColor,
  Color as ButtonColor,
  ComponentSize as ButtonSize,
  Shade as BadgeShade,
  FormVariant as InputVariant,
  FormVariant as SelectVariant,
  Alignment as StackAlign,
  Justify as StackJustify,
  Spacing as GridGap
};
