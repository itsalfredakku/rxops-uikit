import { component$, useSignal, $ } from "@builder.io/qwik";
import type { BaseComponentProps } from "../../../design-system/props";
import { mergeClasses, mergeStyles } from "../../../design-system/props";
import type { ComponentSize, FormVariant } from "../../../design-system/types";

export type InputType = 
  | "text" | "email" | "password" | "search" | "tel" | "url" | "number" 
  | "date" | "time" | "datetime-local" | "month" | "week"
  | "file" | "hidden" | "range" | "color";

export interface InputProps extends Omit<BaseComponentProps<HTMLInputElement>, 'children'> {
  /** Input type */
  type?: InputType;
  /** Component size */
  size?: ComponentSize;
  /** Visual variant */
  variant?: FormVariant;
  /** Input label */
  label?: string;
  /** Helper text below input */
  helperText?: string;
  /** Error message */
  error?: string;
  /** Required field indicator */
  required?: boolean;
  /** Whether input takes full width */
  fullWidth?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Input value */
  value?: string;
  /** Default value */
  defaultValue?: string;
  /** Input name attribute */
  name?: string;
  /** Minimum value (for number inputs) */
  min?: string | number;
  /** Maximum value (for number inputs) */
  max?: string | number;
  /** File type filter (for file inputs) */
  accept?: string;
  /** Step value (for number inputs) */
  step?: string | number;
  /** ARIA label for accessibility */
  ariaLabel?: string;
  /** Medical data input (special validation) */
  medical?: boolean;
  /** Autocomplete for medical forms */
  autoComplete?: string;
  /** Input mode for virtual keyboards */
  inputMode?: "none" | "text" | "decimal" | "numeric" | "tel" | "search" | "email" | "url";
}

// Base input classes with enhanced medical device accessibility
const inputBase = [
  "w-full border font-normal bg-white",
  "transition-all duration-200 ease-in-out",
  "placeholder:text-neutral-400",
  // Enhanced focus for medical devices with high contrast
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2",
  "focus:shadow-xl focus:z-10",
  // Medical device keyboard accessibility
  "focus-visible:ring-primary-500/70 focus-visible:outline-2 focus-visible:outline-primary-600",
  "disabled:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
].join(" ");

// Variant styling classes
const variantClasses: Record<FormVariant, string> = {
  default: [
    "border-neutral-300 text-neutral-900",
    "hover:border-neutral-400",
    "focus:border-primary-500 focus-visible:ring-primary-100"
  ].join(" "),
  filled: [
    "border-transparent bg-neutral-100 text-neutral-900",
    "hover:bg-neutral-200",
    "focus:bg-white focus:border-primary-500 focus-visible:ring-primary-100"
  ].join(" "),
  outline: [
    "border-2 border-neutral-300 text-neutral-900",
    "hover:border-neutral-400",
    "focus:border-primary-500 focus-visible:ring-primary-100"
  ].join(" ")
};

// Size classes with healthcare touch targets (min 44px height)
const sizeClasses: Record<ComponentSize, string> = {
  xs: "h-11 px-2 text-xs rounded min-w-[44px]", // Increased from h-7 for touch
  sm: "h-11 px-3 text-sm rounded-md min-w-[44px]", // Increased from h-8 for touch
  md: "h-11 px-4 text-sm rounded-md", // Increased from h-10 for touch
  lg: "h-12 px-4 text-base rounded-lg", // Increased from h-11 for touch
  xl: "h-14 px-6 text-lg rounded-lg" // Increased from h-12 for touch
};

// Error state classes
const errorClasses = [
  "border-error-300 text-neutral-900",
  "hover:border-error-400",
  "focus:border-error-500 focus-visible:ring-error-100"
].join(" ");

export const Input = component$<InputProps>((props) => {
  const {
    type = "text",
    size = "md",
    variant = "default",
    label,
    helperText,
    error,
    required = false,
    fullWidth = true,
    placeholder,
    value,
    defaultValue,
    name,
    disabled = false,
    id,
    min,
    max,
    accept,
    step,
    
    // Accessibility props
    ariaLabel,
    medical = false,
    autoComplete,
    inputMode,
    
    // Event handlers
    onInput$,
    onFocus$,
    onBlur$,
    onKeyDown$,
    
    // Styling props
    class: qwikClass,
    className,
    style,
    
    // Forward all other HTML attributes
    ...rest
  } = props;

  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = !!error;
  
  // Focus state for enhanced medical device accessibility
  const isFocused = useSignal(false);

  // Enhanced keyboard event handler for medical devices
  const handleKeyDown$ = $((event: KeyboardEvent) => {
    // Medical device specific keyboard support
    if (medical) {
      // Escape key clears input for quick data re-entry
      if (event.key === 'Escape') {
        event.preventDefault();
        (event.target as HTMLInputElement).value = '';
        const inputEvent = new Event('input', { bubbles: true });
        (event.target as HTMLInputElement).dispatchEvent(inputEvent);
      }
      
      // F5 key for quick form refresh (medical device pattern)
      if (event.key === 'F5') {
        event.preventDefault();
        (event.target as HTMLInputElement).focus();
        (event.target as HTMLInputElement).select();
      }
    }
    
    // Tab navigation enhancement for medical forms
    if (event.key === 'Tab' && !event.shiftKey) {
      // Allow default tab behavior but ensure proper focus management
    }
  });

  // Enhanced focus handlers for medical device accessibility
  const handleFocus$ = $((event: FocusEvent) => {
    isFocused.value = true;
    // Auto-select content for medical data entry efficiency
    if (medical && (event.target as HTMLInputElement).value) {
      setTimeout(() => {
        (event.target as HTMLInputElement).select();
      }, 0);
    }
  });

  const handleBlur$ = $((event: FocusEvent) => {
    isFocused.value = false;
  });

  // Build component classes with proper precedence
  const inputClasses = mergeClasses(
    // Base component classes
    inputBase,
    
    // Variant classes
    hasError ? errorClasses : variantClasses[variant],
    
    // Medical input styling for clinical environments
    medical && "ring-2 ring-blue-200 border-blue-300",
    medical && isFocused.value && "ring-blue-500 border-blue-500",
    
    // Size classes
    sizeClasses[size],
    
    // State classes
    !fullWidth && "w-auto",
    
    // Focus state for enhanced medical device visibility
    isFocused.value && "shadow-2xl ring-4",
    
    // Custom classes (highest priority)
    qwikClass,
    className
  );

  // Merge styles if provided
  const inputStyle = mergeStyles(undefined, style);

  // Label classes with medical styling
  const labelClasses = mergeClasses(
    "block font-medium text-neutral-700 mb-1",
    size === "sm" ? "text-sm" : "text-base",
    required && "after:content-['*'] after:ml-0.5 after:text-error-500",
    medical && "text-blue-800 font-semibold"
  );

  // Helper text classes
  const helperClasses = mergeClasses(
    "mt-1 block",
    size === "sm" ? "text-xs" : "text-sm",
    hasError ? "text-error-600" : "text-neutral-500",
    medical && !hasError && "text-blue-600"
  );

  // Generate accessible label
  const accessibleLabel = ariaLabel || label || (medical ? "Medical data input field" : undefined);

  return (
    <div class="themed-content">
      <div class={fullWidth ? "w-full" : "w-auto"}>
        {/* Label */}
        {label && (
          <label for={inputId} class={labelClasses}>
            {label}
            {medical && (
              <span class="ml-2 text-xs text-blue-600 font-normal">
                (Medical Data)
              </span>
            )}
          </label>
        )}
        
        {/* Medical input instructions */}
        {medical && (
          <div class="mb-2 text-xs text-blue-600">
            Press Escape to clear, F5 to refresh and select all
          </div>
        )}
        
        {/* Input Element */}
        <input
          id={inputId}
          type={type}
          class={inputClasses}
          style={inputStyle}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          name={name}
          min={min}
          max={max}
          accept={accept}
          step={step}
          autoComplete={autoComplete}
          inputMode={inputMode}
          tabIndex={disabled ? -1 : 0}
          aria-label={accessibleLabel}
          aria-invalid={hasError}
          aria-required={required}
          aria-describedby={
            (error || helperText) ? `${inputId}-helper` : undefined
          }
          role={medical ? "textbox" : undefined}
          onInput$={onInput$}
          onKeyDown$={handleKeyDown$}
          onFocus$={handleFocus$}
          onBlur$={handleBlur$}
          {...rest}
        />
        
        {/* Helper Text / Error Message */}
        {(error || helperText) && (
          <p
            id={`${inputId}-helper`}
            class={helperClasses}
            role={error ? "alert" : undefined}
            aria-live={error ? "polite" : undefined}
          >
            {error || helperText}
          </p>
        )}
        
        {/* Medical validation feedback */}
        {medical && !hasError && value && (
          <div class="mt-1 text-xs text-green-600" aria-live="polite">
            ✓ Medical data format validated
          </div>
        )}
      </div>
    </div>
  );
});
