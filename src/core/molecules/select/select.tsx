import { component$, useSignal, $ } from "@builder.io/qwik";
import { createVariantClass } from "../../../design-system/component-base";
import { componentTokens } from "../../../design-system/tokens";
import type { FormVariant, ComponentSize } from "../../../design-system/types";
import type { BaseComponentProps } from "../../../design-system/props";
import { mergeClasses } from "../../../design-system/props";

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  group?: string;
}

export type SelectSize = ComponentSize;
export type SelectVariant = FormVariant;
export type SelectColor = "default" | "success" | "warning" | "error";

interface SelectBaseProps {
  options: SelectOption[];
  value?: string | number | string[] | number[];
  placeholder?: string;
  size?: SelectSize;
  variant?: SelectVariant;
  color?: SelectColor;
  label?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  searchable?: boolean;
  multiple?: boolean;
}

export interface SelectProps extends SelectBaseProps, Omit<BaseComponentProps<HTMLDivElement>, keyof SelectBaseProps> {}

// Select variant configuration
const selectVariants = createVariantClass({
  base: [
    "w-full border font-normal bg-white",
    "transition-all duration-200 ease-in-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0",
    "disabled:bg-neutral-lighter disabled:cursor-not-allowed disabled:opacity-60"
  ].join(" "),
  
  variants: {
    default: [
      "border-neutral text-neutral-darker",
      "hover:border-neutral-dark",
      "focus:border-primary focus-visible:ring-primary-lighter"
    ].join(" "),
    
    filled: [
      "border-transparent bg-neutral-light text-neutral-darker",
      "hover:bg-neutral",
      "focus:bg-white focus:border-primary focus-visible:ring-primary-lighter"
    ].join(" "),
    
    outline: [
      "border-2 border-neutral text-neutral-darker",
      "hover:border-neutral-dark",
      "focus:border-primary focus-visible:ring-primary-lighter"
    ].join(" "),

    // Color-based styling
    "color-success": [
      "border-success text-neutral-darker",
      "hover:border-success-dark",
      "focus:border-success focus-visible:ring-success-lighter"
    ].join(" "),
    
    "color-warning": [
      "border-warning text-neutral-darker",
      "hover:border-warning-dark", 
      "focus:border-warning focus-visible:ring-warning-lighter"
    ].join(" "),
    
    "color-error": [
      "border-error text-neutral-darker",
      "hover:border-error-dark",
      "focus:border-error focus-visible:ring-error-lighter"
    ].join(" "),
  } as Record<string, string>,
  
  compoundVariants: [
    {
      conditions: { size: "sm" },
      className: `${componentTokens.input.sizes.sm.height} ${componentTokens.input.sizes.sm.padding} ${componentTokens.input.sizes.sm.text} ${componentTokens.input.sizes.sm.radius}`
    },
    {
      conditions: { size: "md" },
      className: `${componentTokens.input.sizes.md.height} ${componentTokens.input.sizes.md.padding} ${componentTokens.input.sizes.md.text} ${componentTokens.input.sizes.md.radius}`
    },
    {
      conditions: { size: "lg" },
      className: `${componentTokens.input.sizes.lg.height} ${componentTokens.input.sizes.lg.padding} ${componentTokens.input.sizes.lg.text} ${componentTokens.input.sizes.lg.radius}`
    },
  ],
  
  defaultVariant: "default"
});

// Label and helper text styles (reuse from Input)
const labelVariants = createVariantClass({
  base: "block font-medium text-neutral-darker mb-1",
  variants: {
    sm: "text-sm",
    md: "text-base", 
    lg: "text-lg",
  }
});

const helperTextVariants = createVariantClass({
  base: "mt-1 block",
  variants: {
    default: "text-neutral",
    success: "text-success-dark",
    warning: "text-warning-dark",
    error: "text-error-dark",
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  }
});

export const Select = component$<SelectProps>((props) => {
  const {
    options,
    value,
    placeholder = "Select an option",
    size = "md",
    variant = "default",
    color = "default",
    label,
    helperText,
    error,
    disabled = false,
    required = false,
    fullWidth = true,
    multiple = false,
    id,
    class: qwikClass,
    className,
    style,
    testId,
    ...rest
  } = props;

  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = !!error;
  
  // Determine the final color based on error state
  const finalColor = hasError ? "error" : color;

  // Determine the variant classes to apply
  const getVariantClass = () => {
    if (finalColor !== "default") {
      return `color-${finalColor}`;
    }
    return variant;
  };

  const selectedValue = useSignal<string | number | string[] | number[]>(
    value || (multiple ? [] : "")
  );

  const handleChange = $((event: Event) => {
    const target = event.target as HTMLSelectElement;
    if (multiple) {
      const selected = Array.from(target.selectedOptions).map(option => option.value);
      selectedValue.value = selected;
    } else {
      selectedValue.value = target.value;
    }
  });

  // Enhanced keyboard event handler for medical device select accessibility
  const handleKeyDown$ = $((event: KeyboardEvent) => {
    // Enter key to open/activate select
    if (event.key === 'Enter') {
      event.preventDefault();
      if (!disabled) {
        (event.target as HTMLSelectElement).click();
      }
    }
    
    // Escape key to close and clear selection
    if (event.key === 'Escape') {
      event.preventDefault();
      (event.target as HTMLSelectElement).blur();
    }
    
    // Home/End keys for quick navigation
    if (event.key === 'Home') {
      event.preventDefault();
      if (!disabled) {
        const select = event.target as HTMLSelectElement;
        select.selectedIndex = 0;
        handleChange(event);
      }
    }
    
    if (event.key === 'End') {
      event.preventDefault();
      if (!disabled) {
        const select = event.target as HTMLSelectElement;
        select.selectedIndex = select.options.length - 1;
        handleChange(event);
      }
    }
  });

  const selectClass = mergeClasses(selectVariants({
    [getVariantClass()]: true,
    size,
    disabled,
    className: [
      !fullWidth && "w-auto"
    ].filter(Boolean).join(" ")
  }),
  // Enhanced focus indicators for clinical environments
  "focus:ring-4 focus:ring-primary-500/70 focus:ring-offset-2",
  "focus:shadow-lg focus:border-primary-600"
  );

  const labelClass = labelVariants({
    [size]: true,
    className: required ? "after:content-['*'] after:ml-0.5 after:text-error" : ""
  });

  const helperClass = helperTextVariants({
    [hasError ? "error" : finalColor]: true,
    [size === "lg" ? "md" : "sm"]: true,
  });

  const wrapperClass = mergeClasses(
    `${fullWidth ? "w-full" : "w-auto"} space-y-1`,
    qwikClass,
    className
  );

  // Group options by group property
  const groupedOptions = options.reduce((acc, option) => {
    const group = option.group || "";
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(option);
    return acc;
  }, {} as Record<string, SelectOption[]>);

  return (
    <div class="themed-content">
      <div 
        class={wrapperClass}
        style={style}
        data-testid={testId}
        {...rest}
      >
      {/* Label */}
      {label && (
        <label 
          for={selectId}
          class={labelClass}
        >
          {label}
        </label>
      )}
      
      {/* Select Element */}
      <div class="relative">
        <select
          id={selectId}
          class={selectClass}
          disabled={disabled}
          required={required}
          multiple={multiple}
          aria-invalid={hasError}
          aria-describedby={
            [
              helperText && `${selectId}-helper`,
              error && `${selectId}-error`
            ].filter(Boolean).join(" ") || undefined
          }
          onChange$={handleChange}
          onKeyDown$={handleKeyDown$}
          tabIndex={disabled ? -1 : 0}
        >
          {!multiple && placeholder && (
            <option value="" disabled={!!selectedValue.value}>
              {placeholder}
            </option>
          )}
          
          {Object.entries(groupedOptions).map(([group, groupOptions]) => {
            if (group) {
              return (
                <optgroup key={group} label={group}>
                  {groupOptions.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      disabled={option.disabled}
                      selected={
                        multiple 
                          ? (selectedValue.value as string[])?.includes(String(option.value))
                          : selectedValue.value === option.value
                      }
                    >
                      {option.label}
                    </option>
                  ))}
                </optgroup>
              );
            } else {
              return groupOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  selected={
                    multiple 
                      ? (selectedValue.value as string[])?.includes(String(option.value))
                      : selectedValue.value === option.value
                  }
                >
                  {option.label}
                </option>
              ));
            }
          })}
        </select>
        
        {/* Custom Arrow Icon */}
        <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg class="h-4 w-4 text-neutral" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </div>
      </div>
      
      {/* Helper Text / Error Message */}
      {(helperText || error) && (
        <p
          id={error ? `${selectId}-error` : `${selectId}-helper`}
          class={helperClass}
          role={error ? "alert" : undefined}
        >
          {error || helperText}
        </p>
      )}
    </div>
    </div>
  );
});
