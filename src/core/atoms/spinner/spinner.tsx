import { component$ } from "@builder.io/qwik";
import type { ComponentSize } from "../../../design-system/types";
import { BaseComponentProps, mergeClasses } from "../../../design-system/props";

export type SpinnerVariant = "circular" | "dots" | "bars";

export interface SpinnerProps extends BaseComponentProps<HTMLDivElement> {
  size?: ComponentSize;
  variant?: SpinnerVariant;
  color?: string;
  label?: string;
}

const sizeClasses: Record<ComponentSize, string> = {
  xs: "w-4 h-4",
  sm: "w-5 h-5",
  md: "w-6 h-6",
  lg: "w-8 h-8",
  xl: "w-10 h-10"
};

const dotSizeClasses: Record<ComponentSize, string> = {
  xs: "w-0.5 h-0.5",
  sm: "w-0.75 h-0.75", 
  md: "w-1 h-1",
  lg: "w-1.5 h-1.5",
  xl: "w-2 h-2"
};

const barSizeClasses: Record<ComponentSize, string> = {
  xs: "w-0.5",
  sm: "w-0.75",
  md: "w-1",
  lg: "w-1.5",
  xl: "w-2"
};

const getSpinnerClasses = (size: ComponentSize, className?: string) => {
  return mergeClasses(
    "inline-flex items-center justify-center",
    sizeClasses[size],
    className
  );
};

const getDotClasses = (size: ComponentSize) => {
  return mergeClasses(
    "rounded-full animate-bounce",
    dotSizeClasses[size]
  );
};

const getBarClasses = (size: ComponentSize) => {
  return mergeClasses(
    "h-full animate-pulse",
    barSizeClasses[size]
  );
};

export const Spinner = component$<SpinnerProps>((props) => {
  const {
    size = "md",
    variant = "circular",
    color = "currentColor",
    label = "Loading...",
    class: qwikClass,
    className,
    style,
    ...rest
  } = props;

  const spinnerClasses = getSpinnerClasses(size, mergeClasses(qwikClass, className));

  const renderSpinner = () => {
    switch (variant) {
      case "circular":
        return (
          <svg class="w-full h-full animate-spin" viewBox="0 0 24 24" fill="none">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke={color}
              stroke-width="2"
              stroke-linecap="round"
              opacity="0.25"
            />
            <path
              fill={color}
              d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              opacity="0.75"
            />
          </svg>
        );
      
      case "dots":
        return (
          <div class="flex items-center justify-center gap-1 w-full h-full">
            <div class={getDotClasses(size)} style={{ backgroundColor: color, animationDelay: '-0.32s' }}></div>
            <div class={getDotClasses(size)} style={{ backgroundColor: color, animationDelay: '-0.16s' }}></div>
            <div class={getDotClasses(size)} style={{ backgroundColor: color }}></div>
          </div>
        );
      
      case "bars":
        return (
          <div class="flex items-center justify-center gap-0.5 w-full h-full">
            <div class={getBarClasses(size)} style={{ backgroundColor: color, animationDelay: '-1.1s' }}></div>
            <div class={getBarClasses(size)} style={{ backgroundColor: color, animationDelay: '-1.0s' }}></div>
            <div class={getBarClasses(size)} style={{ backgroundColor: color, animationDelay: '-0.9s' }}></div>
            <div class={getBarClasses(size)} style={{ backgroundColor: color, animationDelay: '-0.8s' }}></div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div
      class={spinnerClasses}
      style={style}
      role="status"
      aria-label={label}
      {...rest}
    >
      {renderSpinner()}
      <span class="sr-only">{label}</span>
    </div>
  );
});
