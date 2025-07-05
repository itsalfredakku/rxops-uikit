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
  autocomplete?: string;
  /** Input mode for virtual keyboards */
  inputMode?: "none" | "text" | "decimal" | "numeric" | "tel" | "search" | "email" | "url";
}

// Base input classes
const inputBase = [
  "w-full border font-normal bg-white",
  "transition-all duration-200 ease-in-out",
  "placeholder:text-neutral-400",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0",
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
    
    // Styling props
    class: qwikClass,
    className,
    style,
    
    // Forward all other HTML attributes
    ...rest
  } = props;

  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = !!error;

  // Build component classes with proper precedence
  const inputClasses = mergeClasses(
    // Base component classes
    inputBase,
    
    // Variant classes
    hasError ? errorClasses : variantClasses[variant],
    
    // Size classes
    sizeClasses[size],
    
    // State classes
    !fullWidth && "w-auto",
    
    // Custom classes (highest priority)
    qwikClass,
    className
  );

  // Merge styles if provided
  const inputStyle = mergeStyles(undefined, style);

  // Label classes
  const labelClasses = mergeClasses(
    "block font-medium text-neutral-700 mb-1",
    size === "sm" ? "text-sm" : "text-base",
    required && "after:content-['*'] after:ml-0.5 after:text-error-500"
  );

  // Helper text classes
  const helperClasses = mergeClasses(
    "mt-1 block",
    size === "sm" ? "text-xs" : "text-sm",
    hasError ? "text-error-600" : "text-neutral-500"
  );

  return (
    <div class="themed-content">
      <div class={fullWidth ? "w-full" : "w-auto"}>
        {/* Label */}
        {label && (
          <label for={inputId} class={labelClasses}>
            {label}
          </label>
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
          aria-invalid={hasError}
          aria-describedby={
            (error || helperText) ? `${inputId}-helper` : undefined
          }
          {...rest}
        />
        
        {/* Helper Text / Error Message */}
        {(error || helperText) && (
          <p
            id={`${inputId}-helper`}
            class={helperClasses}
            role={error ? "alert" : undefined}
          >
            {error || helperText}
          </p>
        )}
      </div>
    </div>
  );
});
