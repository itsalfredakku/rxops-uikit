import { component$, Slot, useSignal, useStore, $ } from "@builder.io/qwik";
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
  /** ARIA label for accessibility */
  ariaLabel?: string;
  /** Emergency/critical button for medical devices */
  emergency?: boolean;
  /** Medical device keyboard shortcut (F1-F12) */
  shortcut?: string;
  /** Medical device keyboard support with enhanced focus indicators */
  medicalDeviceMode?: boolean;
  /** Enable healthcare workflow shortcuts */
  enableWorkflowShortcuts?: boolean;
  /** Button context for healthcare applications */
  buttonContext?: 'emergency' | 'medication' | 'patient-action' | 'data-entry' | 'navigation' | 'default';
  /** Confirmation required for destructive actions */
  requireConfirmation?: boolean;
}

// Base button classes using design tokens with enhanced hover states and medical device accessibility
const buttonBase = [
  "inline-flex items-center justify-center font-medium leading-none",
  "border cursor-pointer select-none whitespace-nowrap relative overflow-hidden",
  getInteractiveClasses('primary'),
  // Enhanced hover states with motion accessibility
  "transform transition-all duration-200 ease-out",
  "hover:shadow-lg hover:scale-[1.02] hover:brightness-105",
  "active:scale-[0.98] active:shadow-sm",
  // Medical device keyboard accessibility with high contrast focus
  "focus:outline-none focus:ring-4 focus:ring-primary-500/50 focus:ring-offset-2",
  "focus:shadow-2xl focus:z-10",
  // Enhanced focus for medical devices in clinical lighting
  "focus-visible:ring-4 focus-visible:ring-primary-600/70 focus-visible:ring-offset-2",
  "focus-visible:outline-2 focus-visible:outline-primary-600",
  // Reduced motion support
  "motion-reduce:transition-colors motion-reduce:hover:scale-100 motion-reduce:hover:transform-none",
  // Disabled state override
  "disabled:hover:scale-100 disabled:hover:translate-y-0 disabled:hover:shadow-none disabled:hover:brightness-100",
  "disabled:cursor-not-allowed disabled:opacity-60"
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
    
    // Accessibility props
    ariaLabel,
    emergency = false,
    shortcut,
    medicalDeviceMode = false,
    enableWorkflowShortcuts = false,
    buttonContext = 'default',
    requireConfirmation = false,
    
    // Event handlers
    onClick$,
    
    // Styling props
    class: qwikClass,
    className,
    style,
    
    // Forward all other HTML attributes
    ...rest
  } = props;

  // Focus state for enhanced medical device accessibility
  const isFocused = useSignal(false);

  // Medical device keyboard state
  const keyboardState = useStore({
    confirmationPending: false,
    instructionsId: `button-instructions-${Math.random().toString(36).substr(2, 9)}`,
  });

  // Handle confirmation for destructive actions
  const handleConfirmedAction = $(() => {
    if (requireConfirmation && !keyboardState.confirmationPending) {
      keyboardState.confirmationPending = true;
      // Reset confirmation after 3 seconds
      setTimeout(() => {
        keyboardState.confirmationPending = false;
      }, 3000);
      return;
    }
    
    // Reset confirmation state and trigger button click
    keyboardState.confirmationPending = false;
    // Use native click to trigger the onClick$ handler
    const button = document.querySelector(`[data-button-id="${keyboardState.instructionsId}"]`) as HTMLButtonElement;
    if (button) {
      button.click();
    }
  });

  // Enhanced keyboard event handler for medical devices
  const handleKeyDown$ = $((event: KeyboardEvent) => {
    // Medical device keyboard support
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      
      if (!disabled && !loading) {
        if (requireConfirmation) {
          handleConfirmedAction();
        } else {
          (event.target as HTMLElement).click();
        }
      }
    }

    // Emergency button escape functionality
    if (emergency && event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      // Emergency buttons should lose focus on escape for quick navigation
      (event.target as HTMLElement).blur();
    }

    // Medical device shortcut support
    if (shortcut && event.key === shortcut && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      if (!disabled && !loading) {
        if (requireConfirmation) {
          handleConfirmedAction();
        } else {
          (event.target as HTMLElement).click();
        }
      }
    }

    // Healthcare workflow shortcuts based on context
    if (medicalDeviceMode && enableWorkflowShortcuts && !disabled && !loading) {
      if (buttonContext === 'emergency') {
        if (event.key === 'Escape') {
          event.preventDefault();
          // Cancel emergency action
          (event.target as HTMLElement).blur();
        }
      } else if (buttonContext === 'medication') {
        if (event.ctrlKey && event.key === 'm') {
          event.preventDefault();
          // Quick medication action
          (event.target as HTMLElement).click();
        }
      } else if (buttonContext === 'patient-action') {
        if (event.ctrlKey && event.key === 'p') {
          event.preventDefault();
          // Quick patient action
          (event.target as HTMLElement).click();
        }
      }
    }

    // Confirmation reset on Escape
    if (keyboardState.confirmationPending && event.key === 'Escape') {
      event.preventDefault();
      keyboardState.confirmationPending = false;
    }
  });

  // Enhanced focus handlers for medical device accessibility
  const handleFocus$ = $((event: FocusEvent) => {
    isFocused.value = true;
  });

  const handleBlur$ = $((event: FocusEvent) => {
    isFocused.value = false;
  });

  // Build component classes with proper precedence
  const buttonClasses = mergeClasses(
    // Base component classes with enhanced hover states
    buttonBase,
    
    // Intent-based styling (preferred - takes precedence if provided)
    intent ? intentStyles[intent] : undefined,
    
    // Emergency button styling for medical devices
    emergency && "ring-2 ring-error-normal ring-offset-2 bg-error-normal text-white border-error-dark",
    emergency && "hover:bg-error-dark focus:ring-error-normal",
    
    // Medical device enhancements
    medicalDeviceMode && "focus:ring-4 focus:ring-offset-2",
    medicalDeviceMode && emergency && "focus:ring-error-normal",
    requireConfirmation && keyboardState.confirmationPending && "ring-4 ring-warning-500 bg-warning-50",
    
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
    
    // Focus state for enhanced medical device visibility
    isFocused.value && "shadow-2xl ring-4",
    
    // Custom classes (highest priority)
    qwikClass,
    className
  );

  // Generate accessible label
  const accessibleLabel = ariaLabel || 
    (emergency ? "Emergency action button" : undefined) ||
    (requireConfirmation && keyboardState.confirmationPending ? "Press again to confirm" : undefined);

  return (
    <button
      type={type}
      class={buttonClasses}
      style={style}
      disabled={disabled || loading}
      tabIndex={disabled ? -1 : 0}
      aria-busy={loading}
      aria-label={accessibleLabel}
      aria-describedby={medicalDeviceMode ? keyboardState.instructionsId : (shortcut ? `${shortcut}-shortcut` : undefined)}
      aria-pressed={requireConfirmation && keyboardState.confirmationPending ? "true" : undefined}
      role="button"
      data-button-id={keyboardState.instructionsId}
      data-emergency={emergency}
      data-context={buttonContext}
      onClick$={requireConfirmation ? handleConfirmedAction : onClick$}
      onKeyDown$={handleKeyDown$}
      onFocus$={handleFocus$}
      onBlur$={handleBlur$}
      {...rest}
    >
      <div class="themed-content">
        {/* Medical device shortcut indicator */}
        {shortcut && (
          <span 
            id={`${shortcut}-shortcut`}
            class="sr-only"
          >
            Keyboard shortcut: {shortcut}
          </span>
        )}
        
        {/* Emergency indicator for medical devices */}
        {emergency && (
          <span class="sr-only">
            Emergency function - Press Escape to cancel
          </span>
        )}
        
        {/* Loading Spinner with Motion Sensitivity */}
        {loading && (
          <span class="inline-flex shrink-0" aria-hidden="true">
            <svg
              class="animate-spin motion-reduce:animate-pulse h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
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
        
        {/* Confirmation state indicator */}
        {requireConfirmation && keyboardState.confirmationPending && (
          <span class="sr-only" aria-live="assertive">
            Press again to confirm action
          </span>
        )}
        
        {/* Loading state announcement */}
        {loading && (
          <span class="sr-only" aria-live="polite">
            Loading, please wait
          </span>
        )}
        
        {/* Medical Device Keyboard Instructions */}
        {medicalDeviceMode && (
          <div 
            id={keyboardState.instructionsId}
            class="sr-only"
          >
            Button controls: Press Enter or Space to activate.
            {emergency && ' Emergency button - Escape to cancel.'}
            {requireConfirmation && ' Destructive action - requires confirmation.'}
            {shortcut && ` Shortcut: ${shortcut}.`}
            {enableWorkflowShortcuts && buttonContext === 'medication' && ' Quick access: Ctrl+M.'}
            {enableWorkflowShortcuts && buttonContext === 'patient-action' && ' Quick access: Ctrl+P.'}
            {enableWorkflowShortcuts && ' Healthcare shortcuts enabled.'}
          </div>
        )}
      </div>
    </button>
  );
});
