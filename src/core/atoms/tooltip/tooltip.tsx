import { component$, Slot, useSignal, $ } from "@builder.io/qwik";
import type { Position } from "../../../design-system/types";
import type { BaseComponentProps, VariantProps } from "../../../design-system/props";

export interface TooltipProps extends 
  BaseComponentProps<HTMLDivElement>, 
  VariantProps {
  /** Tooltip content text */
  content: string;
  /** Position relative to trigger element */
  position?: Position;
  /** Show delay in milliseconds */
  delay?: number;
}

export const Tooltip = component$<TooltipProps>(({
  content,
  position = "top",
  variant = "elevated",
  color = "primary",
  size = "md",
  delay = 300,
  disabled = false,
  class: className,
  className: classNameReact, // React compatibility
  style,
  id,
  testId,
  "data-testid": dataTestId,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedby,
  children: _children,
  ...props
}) => {
  const isVisible = useSignal(false);
  const timeoutRef = useSignal<number | null>(null);

  const showTooltip = $(() => {
    if (disabled) return;
    
    if (timeoutRef.value) {
      clearTimeout(timeoutRef.value);
    }
    
    timeoutRef.value = setTimeout(() => {
      isVisible.value = true;
    }, delay) as unknown as number;
  });

  const hideTooltip = $(() => {
    if (timeoutRef.value) {
      clearTimeout(timeoutRef.value);
    }
    isVisible.value = false;
  });

  const getTooltipClasses = () => {
    const baseClasses = [
      "relative inline-block",
      "hover:scale-105 transition-transform duration-200 cursor-help",
      className,
      classNameReact
    ];

    return baseClasses.filter(Boolean).join(" ");
  };

  const getContentClasses = () => {
    const baseClasses = [
      "absolute z-50 px-2 py-1 text-sm font-medium text-white transition-opacity duration-200",
      "whitespace-nowrap rounded-md shadow-lg pointer-events-none"
    ];

    // Variant classes (visual style)
    const variantClasses = {
      elevated: "bg-neutral-900 shadow-xl border border-neutral-700",
      flat: "bg-neutral-800",
      outlined: "bg-white border-2 border-neutral-300 text-neutral-900 shadow-md",
      text: "bg-transparent text-neutral-900"
    };

    // Color classes (semantic color)
    const colorClasses = {
      primary: variant === "outlined" ? "border-primary-500 text-primary-700" : "bg-primary-600",
      secondary: variant === "outlined" ? "border-secondary-500 text-secondary-700" : "bg-secondary-600", 
      success: variant === "outlined" ? "border-success-500 text-success-700" : "bg-success-600",
      warning: variant === "outlined" ? "border-warning-500 text-warning-700" : "bg-warning-600",
      error: variant === "outlined" ? "border-error-500 text-error-700" : "bg-error-600",
      info: variant === "outlined" ? "border-info-500 text-info-700" : "bg-info-600"
    };

    // Size classes
    const sizeClasses = {
      xs: "px-1.5 py-0.5 text-xs",
      sm: "px-2 py-1 text-sm",
      md: "px-3 py-1.5 text-sm",
      lg: "px-4 py-2 text-base",
      xl: "px-5 py-2.5 text-lg"
    };

    // Position classes
    const positionClasses = {
      top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
      bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2",
      left: "right-full top-1/2 transform -translate-y-1/2 mr-2",
      right: "left-full top-1/2 transform -translate-y-1/2 ml-2",
      "top-start": "bottom-full left-0 mb-2",
      "top-end": "bottom-full right-0 mb-2",
      "bottom-start": "top-full left-0 mt-2",
      "bottom-end": "top-full right-0 mt-2"
    };

    return [
      ...baseClasses,
      variantClasses[variant],
      colorClasses[color],
      sizeClasses[size],
      positionClasses[position]
    ].filter(Boolean).join(" ");
  };

  const getArrowClasses = () => {
    const baseClasses = ["absolute w-2 h-2 transform rotate-45"];
    
    // Arrow position based on tooltip position
    const arrowPositions = {
      top: "top-full left-1/2 transform -translate-x-1/2 -translate-y-1/2",
      bottom: "bottom-full left-1/2 transform -translate-x-1/2 translate-y-1/2", 
      left: "left-full top-1/2 transform -translate-y-1/2 -translate-x-1/2",
      right: "right-full top-1/2 transform -translate-y-1/2 translate-x-1/2",
      "top-start": "top-full left-4 transform -translate-y-1/2",
      "top-end": "top-full right-4 transform -translate-y-1/2",
      "bottom-start": "bottom-full left-4 transform translate-y-1/2",
      "bottom-end": "bottom-full right-4 transform translate-y-1/2"
    };

    // Arrow color based on variant and color
    const arrowColorClasses = {
      elevated: color === "primary" ? "bg-primary-600" : "bg-neutral-900",
      flat: color === "primary" ? "bg-primary-600" : "bg-neutral-800", 
      outlined: "bg-white border border-neutral-300",
      text: "bg-transparent"
    };

    return [
      ...baseClasses,
      arrowPositions[position],
      arrowColorClasses[variant]
    ].filter(Boolean).join(" ");
  };

  return (
    <div 
      id={id}
      data-testid={testId || dataTestId}
      class={getTooltipClasses()}
      style={style}
      onMouseEnter$={showTooltip}
      onMouseLeave$={hideTooltip}
      onFocus$={showTooltip}
      onBlur$={hideTooltip}
      {...props}
    >
      <div class="tooltip-trigger">
        <Slot />
      </div>
      {isVisible.value && !disabled && (
        <div 
          class={getContentClasses()}
          role="tooltip"
          aria-hidden="false"
          aria-label={ariaLabel || content}
          aria-describedby={ariaDescribedby}
        >
          {content}
          <div class={getArrowClasses()} />
        </div>
      )}
    </div>
  );
});
