import { component$, useSignal, $ } from "@builder.io/qwik";
import { createVariantClass } from "../../../design-system/component-base";
import type { ComponentSize } from "../../../design-system/types";
import { cn } from "../../../design-system/utils";
import type { BaseComponentProps } from "../../../design-system/props";
import { mergeClasses } from "../../../design-system/props";

export type CheckboxSize = ComponentSize;
export type CheckboxVariant = "default" | "primary";

interface CheckboxBaseProps {
  label?: string;
  description?: string;
  size?: CheckboxSize;
  variant?: CheckboxVariant;
  error?: string;
  helperText?: string;
  indeterminate?: boolean;
  checked?: boolean;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  value?: string;
  id?: string;
  onChange$?: (event: Event) => void;
}

export interface CheckboxProps extends CheckboxBaseProps, Omit<BaseComponentProps<HTMLDivElement>, keyof CheckboxBaseProps | `on${string}$`> {}

// Checkbox variant configuration
const checkboxVariants = createVariantClass({
  base: "checkbox-wrapper flex items-start gap-3",
  variants: {
    default: "checkbox-default",
    primary: "checkbox-primary",
    sm: "checkbox-sm",
    md: "checkbox-md",
    lg: "checkbox-lg"
  }
});

const checkboxControlVariants = createVariantClass({
  base: "checkbox-control relative flex items-center",
  variants: {
    sm: "h-4 w-4",
    md: "h-5 w-5", 
    lg: "h-6 w-6"
  }
});

const checkboxInputVariants = createVariantClass({
  base: [
    "peer absolute h-full w-full appearance-none rounded border-2 cursor-pointer",
    "transition-all duration-200 ease-in-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "disabled:cursor-not-allowed disabled:opacity-50"
  ].join(" "),
  variants: {
    default: [
      "border-neutral-300 bg-white text-primary-600",
      "hover:border-neutral-400 focus-visible:ring-primary-500",
      "checked:bg-primary-600 checked:border-primary-600",
      "indeterminate:bg-primary-600 indeterminate:border-primary-600"
    ].join(" "),
    primary: [
      "border-primary-300 bg-white text-primary-600", 
      "hover:border-primary-400 focus-visible:ring-primary-500",
      "checked:bg-primary-600 checked:border-primary-600",
      "indeterminate:bg-primary-600 indeterminate:border-primary-600"
    ].join(" ")
  }
});

const checkboxBoxVariants = createVariantClass({
  base: [
    "checkbox-box pointer-events-none absolute inset-0 flex items-center justify-center",
    "text-white opacity-0 transition-opacity duration-200",
    "peer-checked:opacity-100 peer-indeterminate:opacity-100"
  ].join(" "),
  variants: {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  }
});

const checkboxLabelVariants = createVariantClass({
  base: [
    "checkbox-label font-medium text-neutral-900 cursor-pointer",
    "peer-disabled:cursor-not-allowed peer-disabled:text-neutral-500"
  ].join(" "),
  variants: {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  }
});

const checkboxDescriptionVariants = createVariantClass({
  base: "checkbox-description text-neutral-600 mt-1",
  variants: {
    sm: "text-xs",
    md: "text-sm", 
    lg: "text-base"
  }
});

export const Checkbox = component$<CheckboxProps>((props) => {
  const {
    label,
    description,
    helperText,
    size = "md",
    variant = "default",
    error,
    indeterminate = false,
    checked = false,
    disabled = false,
    required = false,
    name,
    value,
    id,
    onChange$,
    class: qwikClass,
    className,
    style,
    testId,
    ...rest
  } = props;
  
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
  const isChecked = useSignal(checked);
  const hasError = !!error;

  const handleChange = $((event: Event) => {
    const target = event.target as HTMLInputElement;
    isChecked.value = target.checked;
    onChange$?.(event);
  });

  const wrapperClass = mergeClasses(
    checkboxVariants({
      [variant]: true,
      [size]: true
    }),
    hasError && "text-error-600",
    qwikClass,
    className
  );

  const controlClass = checkboxControlVariants({
    [size]: true
  });

  const inputClass = checkboxInputVariants({
    [variant]: true
  });

  const boxClass = checkboxBoxVariants({
    [size]: true
  });

  return (
    <div 
      class={wrapperClass} 
      style={style}
      data-testid={testId}
      {...rest}
    >
      <div class={controlClass}>
        <input
          type="checkbox"
          id={checkboxId}
          name={name}
          value={value}
          class={inputClass}
          checked={isChecked.value}
          disabled={disabled}
          required={required}
          aria-invalid={hasError}
          aria-describedby={description || helperText || error ? `${checkboxId}-description` : undefined}
          onChange$={handleChange}
        />
        <div class={boxClass}>
          {isChecked.value && !indeterminate && (
            <svg class="h-3 w-3" viewBox="0 0 16 16" fill="currentColor">
              <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
            </svg>
          )}
          {indeterminate && (
            <svg class="h-3 w-3" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8z"/>
            </svg>
          )}
        </div>
      </div>

      {(label || description || helperText) && (
        <div class="checkbox-content flex-1">
          {label && (
            <label 
              for={checkboxId} 
              class={checkboxLabelVariants({ [size]: true })}
            >
              {label}
              {required && <span class="text-error-500 ml-1">*</span>}
            </label>
          )}
          {(description || helperText) && (
            <p 
              id={`${checkboxId}-description`}
              class={checkboxDescriptionVariants({ [size]: true })}
            >
              {description || helperText}
            </p>
          )}
          {error && (
            <p 
              id={`${checkboxId}-error`}
              class={cn(checkboxDescriptionVariants({ [size]: true }), "text-error-600 mt-1")}
              role="alert"
            >
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
});
