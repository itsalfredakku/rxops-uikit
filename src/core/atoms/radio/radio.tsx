import { component$, useSignal, $ } from "@builder.io/qwik";
import { createVariantClass } from "../../../design-system/component-base";
import type { ComponentSize } from "../../../design-system/types";
import type { BaseComponentProps } from "../../../design-system/props";
import { mergeClasses } from "../../../design-system/props";

export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
}

export type RadioSize = ComponentSize;
export type RadioDirection = "horizontal" | "vertical";

interface RadioBaseProps {
  name: string;
  options: RadioOption[];
  value?: string;
  defaultValue?: string;  
  direction?: RadioDirection;
  size?: RadioSize;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  helperText?: string;
  onValueChange$?: (value: string) => void;
}

export interface RadioProps extends RadioBaseProps, Omit<BaseComponentProps<HTMLDivElement>, keyof RadioBaseProps | `on${string}$`> {}

// Radio variant configuration
const radioGroupVariants = createVariantClass({
  base: "radio-group",
  variants: {
    vertical: "space-y-3",
    horizontal: "flex flex-wrap gap-4",
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  }
});

const radioOptionVariants = createVariantClass({
  base: "radio-option relative flex items-start",
  variants: {
    sm: "gap-2",
    md: "gap-3",
    lg: "gap-4"
  }
});

const radioInputVariants = createVariantClass({
  base: [
    "peer absolute h-full w-full appearance-none rounded-full border-2 cursor-pointer",
    "transition-all duration-200 ease-in-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500",
    "disabled:cursor-not-allowed disabled:opacity-50"
  ].join(" "),
  variants: {
    default: [
      "border-neutral-300 bg-white",
      "hover:border-neutral-400",
      "checked:bg-primary-600 checked:border-primary-600"
    ].join(" ")
  }
});

const radioIndicatorVariants = createVariantClass({
  base: [
    "radio-indicator relative flex items-center justify-center rounded-full border-2",
    "transition-all duration-200 ease-in-out",
    "peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-primary-500",
    "peer-disabled:opacity-50"
  ].join(" "),
  variants: {
    default: [
      "border-neutral-300 bg-white",
      "peer-hover:border-neutral-400",
      "peer-checked:bg-primary-600 peer-checked:border-primary-600"
    ].join(" "),
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6"
  }
});

const radioDotVariants = createVariantClass({
  base: [
    "radio-dot rounded-full bg-white opacity-0 transition-opacity duration-200",
    "peer-checked:opacity-100"
  ].join(" "),
  variants: {
    sm: "h-1.5 w-1.5",
    md: "h-2 w-2",
    lg: "h-2.5 w-2.5"
  }
});

const radioLabelVariants = createVariantClass({
  base: [
    "radio-label cursor-pointer font-medium text-neutral-900 flex items-start gap-3",
    "peer-disabled:cursor-not-allowed peer-disabled:text-neutral-500"
  ].join(" "),
  variants: {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  }
});

const radioDescriptionVariants = createVariantClass({
  base: "radio-description text-neutral-600 mt-1",
  variants: {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  }
});

export const Radio = component$<RadioProps>((props) => {
  const {
    name,
    options,
    value,
    defaultValue,
    direction = "vertical",
    size = "md",
    disabled = false,
    required = false,
    error,
    helperText,
    onValueChange$,
    class: qwikClass,
    className,
    style,
    testId,
    ...rest
  } = props;
  
  const internalValue = useSignal(value || defaultValue || "");
  const hasError = !!error;

  const handleChange = $((newValue: string) => {
    internalValue.value = newValue;
    onValueChange$?.(newValue);
  });

  const groupClass = mergeClasses(
    radioGroupVariants({
      [direction]: true,
      [size]: true
    }),
    hasError && "text-error-600",
    qwikClass,
    className
  );

  return (
    <div 
      class={groupClass} 
      style={style}
      data-testid={testId}
      {...rest}
    >
      <div class="radio-options">
        {options.map((option) => {
          const isChecked = internalValue.value === option.value;
          const optionId = `${name}-${option.value}`;
          const isDisabled = disabled || option.disabled;

          const optionClass = radioOptionVariants({
            [size]: true
          });

          return (
            <div key={option.value} class={optionClass}>
              <div class="relative">
                <input
                  type="radio"
                  id={optionId}
                  name={name}
                  value={option.value}
                  checked={isChecked}
                  disabled={isDisabled}
                  required={required}
                  class={radioInputVariants({ default: true })}
                  aria-invalid={hasError}
                  onChange$={(event) => {
                    const target = event.target as HTMLInputElement;
                    handleChange(target.value);
                  }}
                />
                <div class={radioIndicatorVariants({ default: true, [size]: true })}>
                  <div class={radioDotVariants({ [size]: true })} />
                </div>
              </div>

              <label for={optionId} class={radioLabelVariants({ [size]: true })}>
                <div class="radio-content flex-1">
                  <span class="radio-text">{option.label}</span>
                  {option.description && (
                    <div class={radioDescriptionVariants({ [size]: true })}>
                      {option.description}
                    </div>
                  )}
                </div>
              </label>
            </div>
          );
        })}
      </div>

      {(error || helperText) && (
        <div class="radio-footer mt-2">
          {error && (
            <p class="text-error-600 text-sm" role="alert">
              {error}
            </p>
          )}
          {!error && helperText && (
            <p class="text-neutral-600 text-sm">
              {helperText}
            </p>
          )}
        </div>
      )}
    </div>
  );
});
