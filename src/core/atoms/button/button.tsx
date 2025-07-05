import { component$, Slot } from "@builder.io/qwik";
import type { BaseComponentProps, VariantProps, InteractiveProps } from "../../../design-system/props";
import { mergeClasses } from "../../../design-system/props";
import { createColorVariant, getInteractiveClasses } from "../../../design-system/token-utils";
import type { ComponentSize, Variant, Color } from "../../../design-system/types";

// Semantic-first: Intent-based styling approach
export type ButtonIntent = 
  | "primary"     // Main call-to-action
  | "secondary"   // Secondary actions
  | "success"     // Positive actions (save, confirm)
  | "warning"     // Caution actions (delete, warning)
  | "error"       // Destructive actions (delete permanently)
  | "info"        // Informational actions
  | "neutral";    // Default/neutral actions

export interface ButtonProps extends 
  BaseComponentProps<HTMLButtonElement>, 
  VariantProps,
  Pick<InteractiveProps, 'loading'> {
  /** 
   * Semantic intent that drives styling automatically
   * @deprecated Use intent prop instead of variant + color combination
   */
  intent?: ButtonIntent;
  /** Button type attribute */
  type?: "button" | "submit" | "reset";
  /** Whether button takes full width */
  fullWidth?: boolean;
  /** Whether button has left icon spacing */
  leftIcon?: boolean;
  /** Whether button has right icon spacing */
  rightIcon?: boolean;
  /** 
   * @deprecated Use intent prop for semantic styling
   * Legacy prop for backward compatibility 
   */
  variant?: VariantProps['variant'];
  /** 
   * @deprecated Use intent prop for semantic styling
   * Legacy prop for backward compatibility 
   */
  color?: VariantProps['color'];
}

// Base button classes using design tokens with enhanced hover states
const buttonBase = [
  "inline-flex items-center justify-center font-medium leading-none",
  "border cursor-pointer select-none whitespace-nowrap relative overflow-hidden",
  getInteractiveClasses('primary'),
  // Enhanced hover states with motion accessibility
  "transform transition-all duration-200 ease-out",
  "hover:shadow-lg hover:scale-[1.02] hover:brightness-105",
  "active:scale-[0.98] active:shadow-sm",
  "focus:ring-2 focus:ring-offset-2 focus:ring-primary-500",
  // Reduced motion support
  "motion-reduce:transition-colors motion-reduce:hover:scale-100 motion-reduce:hover:transform-none",
  // Disabled state override
  "disabled:hover:scale-100 disabled:hover:translate-y-0 disabled:hover:shadow-none disabled:hover:brightness-100"
].join(" ");

// Semantic intent-based styling using design tokens
const intentStyles: Record<ButtonIntent, string> = {
  primary: createColorVariant('primary', 'solid'),
  secondary: createColorVariant('neutral', 'outline'),
  success: createColorVariant('success', 'solid'),
  warning: createColorVariant('warning', 'solid'),
  error: createColorVariant('error', 'solid'),
  info: createColorVariant('info', 'solid'),
  neutral: createColorVariant('neutral', 'soft')
};

// Size classes using design tokens with healthcare touch targets (min 44px)
const sizeClasses: Record<ComponentSize, string> = {
  xs: "h-11 px-2 text-xs gap-1 rounded-sm min-w-[44px]", // Increased from h-7 for touch
  sm: "h-11 px-3 text-sm gap-1.5 rounded-md min-w-[44px]", // Increased from h-8 for touch
  md: "h-11 px-4 text-sm gap-2 rounded-md min-w-[44px]", // Increased from h-10 for touch
  lg: "h-12 px-6 text-base gap-2 rounded-lg min-w-[44px]", // Increased from h-11 for touch
  xl: "h-14 px-8 text-lg gap-3 rounded-lg min-w-[44px]" // Increased from h-12 for touch
};

// Legacy variant styling for backward compatibility
const variantClasses: Record<Variant, string> = {
  elevated: "border shadow-sm",
  flat: "border",
  outlined: "border-2 bg-transparent", 
  text: "border-transparent bg-transparent"
};

// Legacy color styling for backward compatibility
const colorClasses: Record<Color, string> = {
  primary: createColorVariant('primary', 'solid'),
  secondary: createColorVariant('neutral', 'outline'),
  success: createColorVariant('success', 'solid'),
  warning: createColorVariant('warning', 'solid'),
  error: createColorVariant('error', 'solid'),
  info: createColorVariant('info', 'solid')
};

export const Button = component$<ButtonProps>((props) => {
  const {
    // Semantic intent (preferred approach)
    intent,
    
    // Legacy props for backward compatibility
    variant = "elevated",
    color = "primary",
    size = "md",
    type = "button",
    fullWidth = false,
    loading = false,
    disabled = false,
    leftIcon = false,
    rightIcon = false,
    
    // Styling props
    class: qwikClass,
    className,
    style,
    
    // Forward all other HTML attributes
    ...rest
  } = props;

  // Build component classes with proper precedence
  const buttonClasses = mergeClasses(
    // Base component classes with enhanced hover states
    buttonBase,
    
    // Intent-based styling (preferred - takes precedence if provided)
    intent ? intentStyles[intent] : undefined,
    
    // Legacy variant + color combination (fallback)
    !intent ? variantClasses[variant] : undefined,
    !intent ? colorClasses[color] : undefined,
    
    // Adjust color for certain variants if using legacy approach
    !intent && variant === "outlined" ? colorClasses.secondary : undefined,
    !intent && variant === "text" ? colorClasses.secondary : undefined,
    
    // Size classes using design tokens
    sizeClasses[size],
    
    // State classes
    loading && "cursor-wait opacity-75",
    fullWidth && "w-full",
    leftIcon && "pl-2",
    rightIcon && "pr-2",
    
    // Custom classes (highest priority)
    qwikClass,
    className
  );

  return (
    <button
      type={type}
      class={buttonClasses}
      style={style}
      disabled={disabled || loading}
      aria-busy={loading}
      {...rest}
    >
      <div class="themed-content">
        {/* Loading Spinner with Motion Sensitivity */}
        {loading && (
          <span class="inline-flex shrink-0">
            <svg
              class="animate-spin motion-reduce:animate-pulse h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </span>
        )}
        
        {/* Button Content */}
        <span class={loading ? "sr-only" : undefined}>
          <Slot />
        </span>
      </div>
    </button>
  );
});
