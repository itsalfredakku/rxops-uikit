import { component$, Slot } from "@builder.io/qwik";
import type { BaseComponentProps } from "../../../design-system/props";
import { mergeClasses } from "../../../design-system/props";
import { Column } from "../../../layouts/column";

export interface FormFieldProps extends BaseComponentProps<HTMLDivElement> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

export const FormField = component$<FormFieldProps>((props) => {
  const { 
    label, 
    error, 
    hint, 
    required,
    class: qwikClass,
    className,
    style,
    testId,
    size: _size, // Mark as unused with underscore
    ...rest
  } = props;
  
  const wrapperClass = mergeClasses(
    "ui-form-field",
    qwikClass,
    className
  );
  
  return (
    <Column 
      gap="1"
      class={wrapperClass}
      style={style}
      data-testid={testId}
      {...rest}
    >
      {label && (
        <label class="ui-form-field-label block text-sm font-medium text-neutral-700">
          {label}
          {required && <span class="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      <div class="ui-form-field-input">
        <Slot />
      </div>
      
      {hint && !error && (
        <p class="ui-form-field-hint text-xs text-neutral-500">
          {hint}
        </p>
      )}
      
      {error && (
        <p class="ui-form-field-error text-xs text-error-600">
          {error}
        </p>
      )}
    </Column>
  );
});
