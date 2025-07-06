import { component$, useSignal, useStore, $ } from "@builder.io/qwik";
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
  /** Medical device keyboard support with enhanced focus indicators */
  medicalDeviceMode?: boolean;
  /** Enable healthcare workflow shortcuts */
  enableWorkflowShortcuts?: boolean;
  /** Input context for healthcare applications */
  inputContext?: 'patient-data' | 'medication-dosage' | 'vital-signs' | 'lab-values' | 'notes' | 'default';
  /** Medical data validation rules */
  medicalValidation?: {
    type?: 'patient-id' | 'medication-code' | 'dosage' | 'vital-reading' | 'lab-value';
    range?: { min: number; max: number };
    required?: boolean;
  };
}

// Base input classes with enhanced medical device accessibility
const inputBase = [
  "w-full border font-normal bg-white",
  "transition-all duration-200 ease-in-out",
  "placeholder:text-neutral-light",
  // Enhanced focus for medical devices with high contrast
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2",
  "focus:shadow-xl focus:z-10",
  // Medical device keyboard accessibility
  "focus-visible:ring-primary-500/70 focus-visible:outline-2 focus-visible:outline-primary-600",
  "disabled:bg-neutral-lighter disabled:cursor-not-allowed disabled:opacity-60"
].join(" ");

// Variant styling classes
const variantClasses: Record<FormVariant, string> = {
  default: [
    "border-neutral-light text-neutral-darker",
    "hover:border-neutral-normal",
    "focus:border-primary-500 focus-visible:ring-primary-100"
  ].join(" "),
  filled: [
    "border-transparent bg-neutral-lighter text-neutral-darker",
    "hover:bg-neutral-light",
    "focus:bg-white focus:border-primary-500 focus-visible:ring-primary-100"
  ].join(" "),
  outline: [
    "border-2 border-neutral-light text-neutral-darker",
    "hover:border-neutral-normal",
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
  "border-error-300 text-neutral-darker",
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
    medicalDeviceMode = false,
    enableWorkflowShortcuts = false,
    inputContext = 'default',
    medicalValidation,
    
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

  // Medical device keyboard state
  const keyboardState = useStore({
    validationErrors: [] as string[],
    instructionsId: `input-instructions-${Math.random().toString(36).substr(2, 9)}`,
  });

  // Medical validation function
  const validateMedicalInput = $((value: string) => {
    if (!medicalValidation) return [];
    
    const errors: string[] = [];
    
    if (medicalValidation.required && !value) {
      errors.push('This medical field is required');
    }
    
    if (medicalValidation.type === 'vital-reading' && value) {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        errors.push('Must be a valid numeric vital sign reading');
      } else if (medicalValidation.range) {
        if (numValue < medicalValidation.range.min || numValue > medicalValidation.range.max) {
          errors.push(`Value must be between ${medicalValidation.range.min} and ${medicalValidation.range.max}`);
        }
      }
    } else if (medicalValidation.type === 'dosage' && value) {
      const dosagePattern = /^\d+(\.\d{1,2})?\s*(mg|ml|units?)$/i;
      if (!dosagePattern.test(value)) {
        errors.push('Enter dosage in format: number mg/ml/units (e.g., 10 mg)');
      }
    } else if (medicalValidation.type === 'patient-id' && value) {
      const patientIdPattern = /^[A-Z]{2}\d{6,8}$/;
      if (!patientIdPattern.test(value)) {
        errors.push('Patient ID format: 2 letters followed by 6-8 digits (e.g., AB123456)');
      }
    }
    
    keyboardState.validationErrors = errors;
    return errors;
  });

  // Enhanced keyboard event handler for medical devices
  const handleKeyDown$ = $((event: KeyboardEvent) => {
    // Medical device specific keyboard support
    if (medical || medicalDeviceMode) {
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
      
      // Healthcare workflow shortcuts
      if (enableWorkflowShortcuts) {
        if (inputContext === 'vital-signs') {
          if (event.ctrlKey && event.key === 'r') {
            event.preventDefault();
            // Quick vital sign ranges
            console.log('Show vital sign ranges');
          } else if (event.ctrlKey && event.key === 'h') {
            event.preventDefault();
            // Show history
            console.log('Show vital sign history');
          }
        } else if (inputContext === 'medication-dosage') {
          if (event.ctrlKey && event.key === 'd') {
            event.preventDefault();
            // Show dosage calculator
            console.log('Open dosage calculator');
          } else if (event.ctrlKey && event.key === 'i') {
            event.preventDefault();
            // Show drug interactions
            console.log('Check drug interactions');
          }
        } else if (inputContext === 'patient-data') {
          if (event.ctrlKey && event.key === 'p') {
            event.preventDefault();
            // Quick patient lookup
            console.log('Quick patient lookup');
          } else if (event.ctrlKey && event.key === 'v') {
            event.preventDefault();
            // Verify patient data
            console.log('Verify patient data');
          }
        } else if (inputContext === 'lab-values') {
          if (event.ctrlKey && event.key === 'n') {
            event.preventDefault();
            // Show normal ranges
            console.log('Show normal lab ranges');
          } else if (event.ctrlKey && event.key === 'c') {
            event.preventDefault();
            // Compare with previous values
            console.log('Compare lab values');
          }
        }
      }
      
      // Real-time validation for medical inputs
      if (event.key === 'Enter' && medicalValidation) {
        const currentValue = (event.target as HTMLInputElement).value;
        validateMedicalInput(currentValue);
      }
    }
    
    // Tab navigation enhancement for medical forms
    if (event.key === 'Tab' && !event.shiftKey) {
      // Allow default tab behavior but ensure proper focus management
    }
    
    // Call original onKeyDown$ if provided
    if (onKeyDown$) {
      if (typeof onKeyDown$ === 'function') {
        onKeyDown$(event, event.target as HTMLInputElement);
      }
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
    medical && "ring-2 ring-blue-200 border-info-light",
    medical && isFocused.value && "ring-primary-normal border-primary-normal",
    
    // Medical device enhancements
    medicalDeviceMode && "focus:ring-4 focus:ring-offset-2",
    medicalDeviceMode && hasError && "focus:ring-error-500",
    medicalValidation && keyboardState.validationErrors.length > 0 && "border-warning-500 ring-2 ring-warning-200",
    
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
    "block font-medium text-neutral-dark mb-1",
    size === "sm" ? "text-sm" : "text-base",
    required && "after:content-['*'] after:ml-0.5 after:text-error-500",
    medical && "text-primary-darker font-semibold"
  );

  // Helper text classes
  const helperClasses = mergeClasses(
    "mt-1 block",
    size === "sm" ? "text-xs" : "text-sm",
    hasError ? "text-error-600" : "text-neutral-normal",
    medical && !hasError && "text-primary-normal"
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
              <span class="ml-2 text-xs text-primary-normal font-normal">
                (Medical Data)
              </span>
            )}
          </label>
        )}
        
        {/* Medical input instructions */}
        {medical && (
          <div class="mb-2 text-xs text-primary-normal">
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
          aria-describedby={`${inputId}-helper${medicalDeviceMode ? ` ${keyboardState.instructionsId}` : ''}${hasError ? ` ${inputId}-error` : ''}`}
          aria-invalid={hasError}
          aria-required={required}
          data-medical={medical}
          data-context={inputContext}
          data-validation-type={medicalValidation?.type}
          onInput$={$((event) => {
            if (medicalValidation) {
              validateMedicalInput((event.target as HTMLInputElement).value);
            }
            if (onInput$ && typeof onInput$ === 'function') {
              onInput$(event, event.target as HTMLInputElement);
            }
          })}
          onFocus$={$((event) => {
            handleFocus$(event);
            if (onFocus$ && typeof onFocus$ === 'function') {
              onFocus$(event, event.target as HTMLInputElement);
            }
          })}
          onKeyDown$={handleKeyDown$}
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
        {medicalValidation && keyboardState.validationErrors.length > 0 && (
          <div class="mt-1 text-xs text-warning-600" role="alert" aria-live="assertive">
            {keyboardState.validationErrors.map((error, index) => (
              <div key={index}>⚠ {error}</div>
            ))}
          </div>
        )}
        
        {/* Medical validation feedback */}
        {medical && !hasError && value && (
          <div class="mt-1 text-xs text-success-normal" aria-live="polite">
            ✓ Medical data format validated
          </div>
        )}
        
        {/* Medical Device Keyboard Instructions */}
        {medicalDeviceMode && (
          <div 
            id={keyboardState.instructionsId}
            class="sr-only"
          >
            Medical input field: Enter data and press Tab to continue.
            {medical && ' Escape to clear field, F5 to refresh and select all.'}
            {enableWorkflowShortcuts && inputContext === 'vital-signs' && ' Quick access: Ctrl+R for ranges, Ctrl+H for history.'}
            {enableWorkflowShortcuts && inputContext === 'medication-dosage' && ' Quick access: Ctrl+D for calculator, Ctrl+I for interactions.'}
            {enableWorkflowShortcuts && inputContext === 'patient-data' && ' Quick access: Ctrl+P for lookup, Ctrl+V to verify.'}
            {enableWorkflowShortcuts && inputContext === 'lab-values' && ' Quick access: Ctrl+N for normal ranges, Ctrl+C to compare.'}
            {enableWorkflowShortcuts && ' Healthcare shortcuts enabled.'}
            {medicalValidation && ' Real-time validation active.'}
          </div>
        )}
      </div>
    </div>
  );
});
