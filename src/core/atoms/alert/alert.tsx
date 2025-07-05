import { component$, Slot, Signal, useSignal, $ } from "@builder.io/qwik";
import { createVariantClass } from "../../../design-system/component-base";
import type { AlertVariant } from "../../../design-system/types";
import { BaseComponentProps, mergeClasses, mergeStyles } from "../../../design-system/props";

// Alert supports a subset of the standard Color types
export type AlertColor = "info" | "success" | "warning" | "error";
export type { AlertVariant };

export interface AlertProps extends Omit<BaseComponentProps<HTMLDivElement>, 'children'> {
  color?: AlertColor;
  variant?: AlertVariant;
  title?: string;
  closable?: boolean;
  onClose?: () => void;
  // Legacy prop support (deprecated)
  /** @deprecated Use color instead */
  severity?: AlertColor;
}

// Alert variant configuration
const alertVariants = createVariantClass({
  base: [
    "relative flex items-start gap-3 p-4 rounded-md border",
    "transition-all duration-200 ease-in-out"
  ].join(" "),
  
  variants: {
    // Info variants with enhanced contrast using semantic aliases
    "info-filled": [
      "bg-info-dark text-white border-info-dark" // Darker blue for better contrast
    ].join(" "),
    "info-outlined": [
      "bg-white text-info-darker border-info border-2" // Darker text for better contrast
    ].join(" "),
    "info-soft": [
      "bg-info-lighter text-info-darker border-info-light" // Darker text for better contrast
    ].join(" "),
    
    // Success variants with enhanced contrast using semantic aliases
    "success-filled": [
      "bg-success-dark text-white border-success-dark" // Darker green for better contrast
    ].join(" "),
    "success-outlined": [
      "bg-white text-success-darker border-success border-2" // Darker text for better contrast
    ].join(" "),
    "success-soft": [
      "bg-success-lighter text-success-darker border-success-light" // Darker text for better contrast
    ].join(" "),
    
    // Warning variants with enhanced contrast using semantic aliases
    "warning-filled": [
      "bg-warning-dark text-white border-warning-dark" // Better contrast with white text
    ].join(" "),
    "warning-outlined": [
      "bg-white text-warning-darker border-warning border-2" // Darker text for better contrast
    ].join(" "),
    "warning-soft": [
      "bg-warning-lighter text-warning-darker border-warning-light" // Better contrast: lighter background + much darker text
    ].join(" "),
    
    // Error variants with enhanced contrast using semantic aliases
    "error-filled": [
      "bg-error-dark text-white border-error-dark" // Darker red for better contrast
    ].join(" "),
    "error-outlined": [
      "bg-white text-error-darker border-error border-2" // Darker text for better contrast
    ].join(" "),
    "error-soft": [
      "bg-error-lighter text-error-darker border-error-light" // Darker text for better contrast
    ].join(" "),
  } as Record<string, string>,
  
  defaultVariant: "info-soft"
});

// Default icons for each color
const colorIcons = {
  info: (
    <svg class="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clip-rule="evenodd" />
    </svg>
  ),
  success: (
    <svg class="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.53L8.23 10.661a.75.75 0 00-1.115 1.008l1.567 1.729a1.25 1.25 0 001.294.096.75.75 0 00.108-.094l4.773-6.677z" clip-rule="evenodd" />
    </svg>
  ),
  warning: (
    <svg class="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
    </svg>
  ),
  error: (
    <svg class="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
    </svg>
  ),
};

export const Alert = component$<AlertProps>((props) => {
  const {
    color: colorProp,
    severity, // Legacy prop support
    variant = "soft",
    title,
    closable = false,
    onClose,
    class: qwikClass,
    className,
    style,
    testId,
    'data-testid': dataTestId,
    ...rest
  } = props;

  // Use color if provided, fallback to severity for backward compatibility
  const color = colorProp || severity || "info";

  const isVisible: Signal<boolean> = useSignal(true);

  const handleClose = $(() => {
    isVisible.value = false;
    onClose?.();
  });

  const alertClass = alertVariants({
    [`${color}-${variant}`]: true
  });

  const finalClass = mergeClasses(alertClass, qwikClass, className);
  
  // Merge styles if provided
  const finalStyle = mergeStyles(undefined, style);

  if (!isVisible.value) {
    return null;
  }

  return (
    <div
      class={finalClass}
      style={finalStyle}
      role="alert"
      data-testid={testId || dataTestId}
      {...rest}
    >
      {/* Icon */}
      <div class="flex-shrink-0">
        <Slot name="icon">
          {colorIcons[color]}
        </Slot>
      </div>
      
      {/* Content */}
      <div class="flex-1 min-w-0">
        {title && (
          <h3 class="text-sm font-medium mb-1">
            {title}
          </h3>
        )}
        <div class="text-sm">
          <Slot />
        </div>
      </div>
      
      {/* Close Button */}
      {closable && (
        <div class="flex-shrink-0">
          <button
            type="button"
            class={[
              "inline-flex rounded-md p-1.5 transition-colors duration-200",
              variant === "filled" ? "text-white/80 hover:text-white hover:bg-black/10" :
              variant === "outlined" ? (
                color === "info" ? "text-info-darker hover:bg-info-lighter" :
                color === "success" ? "text-success-darker hover:bg-success-lighter" :
                color === "warning" ? "text-warning-darker hover:bg-warning-lighter" :
                "text-error-darker hover:bg-error-lighter"
              ) : (
                color === "info" ? "text-info-darker hover:bg-info-light" :
                color === "success" ? "text-success-darker hover:bg-success-light" :
                color === "warning" ? "text-warning-darker hover:bg-warning-light" :
                "text-error-darker hover:bg-error-light"
              )
            ].join(" ")}
            onClick$={handleClose}
            aria-label="Close alert"
          >
            <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
});
