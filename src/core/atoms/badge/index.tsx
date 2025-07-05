import { component$, Slot } from "@builder.io/qwik";
import type { Variant, Color, BadgeSize, Shade } from "../../../design-system/types";
import { BaseComponentProps, mergeClasses, mergeStyles } from "../../../design-system/props";

export interface BadgeProps extends Omit<BaseComponentProps<HTMLSpanElement>, 'size'> {
  variant?: Variant;
  color?: Color;
  size?: BadgeSize;
  pill?: boolean;
  shade?: Shade;
}

export const Badge = component$<BadgeProps>((props) => {
  const {
    variant = "flat",
    color = "primary",
    size = "sm",
    pill = false,
    shade = "light",
    class: qwikClass,
    className,
    style,
    ...rest
  } = props;
  // Tokenized badge styles with semantic shade system
  const badgeTokens = {
    // Color tokens with semantic shade variations
    colors: {
      primary: {
        "lighter": { bg: "bg-primary-50", text: "text-primary-600", border: "border-primary-100" },
        "light": { bg: "bg-primary-100", text: "text-primary-700", border: "border-primary-200" },
        "normal": { bg: "bg-primary-500", text: "text-white", border: "border-primary-500" },
        "dark": { bg: "bg-primary-600", text: "text-white", border: "border-primary-600" },
        "darker": { bg: "bg-primary-700", text: "text-white", border: "border-primary-700" }
      },
      secondary: {
        "lighter": { bg: "bg-neutral-50", text: "text-neutral-600", border: "border-neutral-100" },
        "light": { bg: "bg-neutral-100", text: "text-neutral-700", border: "border-neutral-200" },
        "normal": { bg: "bg-neutral-500", text: "text-white", border: "border-neutral-500" },
        "dark": { bg: "bg-neutral-600", text: "text-white", border: "border-neutral-600" },
        "darker": { bg: "bg-neutral-700", text: "text-white", border: "border-neutral-700" }
      },
      success: {
        "lighter": { bg: "bg-success-lighter", text: "text-success-dark", border: "border-success-lighter" },
        "light": { bg: "bg-success-light", text: "text-success-darker", border: "border-success-light" },
        "normal": { bg: "bg-success", text: "text-white", border: "border-success" },
        "dark": { bg: "bg-success-dark", text: "text-white", border: "border-success-dark" },
        "darker": { bg: "bg-success-darker", text: "text-white", border: "border-success-darker" }
      },
      warning: {
        "lighter": { bg: "bg-warning-lighter", text: "text-warning-dark", border: "border-warning-lighter" },
        "light": { bg: "bg-warning-light", text: "text-warning-darker", border: "border-warning-light" },
        "normal": { bg: "bg-warning", text: "text-white", border: "border-warning" },
        "dark": { bg: "bg-warning-dark", text: "text-white", border: "border-warning-dark" },
        "darker": { bg: "bg-warning-darker", text: "text-white", border: "border-warning-darker" }
      },
      error: {
        "lighter": { bg: "bg-error-lighter", text: "text-error-dark", border: "border-error-lighter" },
        "light": { bg: "bg-error-light", text: "text-error-darker", border: "border-error-light" },
        "normal": { bg: "bg-error", text: "text-white", border: "border-error" },
        "dark": { bg: "bg-error-dark", text: "text-white", border: "border-error-dark" },
        "darker": { bg: "bg-error-darker", text: "text-white", border: "border-error-darker" }
      },
      info: {
        "lighter": { bg: "bg-info-lighter", text: "text-info-dark", border: "border-info-lighter" },
        "light": { bg: "bg-info-light", text: "text-info-darker", border: "border-info-light" },
        "normal": { bg: "bg-info", text: "text-white", border: "border-info" },
        "dark": { bg: "bg-info-dark", text: "text-white", border: "border-info-dark" },
        "darker": { bg: "bg-info-darker", text: "text-white", border: "border-info-darker" }
      }
    },
    // Size tokens - simplified for badges
    sizes: {
      sm: "px-2 py-0.5 text-xs font-medium", 
      md: "px-2.5 py-1 text-sm font-medium",
      lg: "px-3 py-1.5 text-sm font-semibold"
    },
    // Variant tokens (inspired by Radzen)
    variants: {
      elevated: "shadow-sm border",
      flat: "border-0",
      text: "bg-transparent border-0",
      outlined: "bg-transparent border"
    }
  };

  // Get color tokens based on color and shade
  const colorTokens = badgeTokens.colors[color as keyof typeof badgeTokens.colors][shade as keyof typeof badgeTokens.colors.primary];
  
  // Apply variant-specific styling
  const getVariantClasses = () => {
    const variantBase = badgeTokens.variants[variant];
    
    switch (variant) {
      case "elevated":
        return `${variantBase} ${colorTokens.bg} ${colorTokens.text} ${colorTokens.border}`;
      case "flat":
        return `${variantBase} ${colorTokens.bg} ${colorTokens.text}`;
      case "text":
        return `${variantBase} ${colorTokens.text}`;
      case "outlined":
        return `${variantBase} ${colorTokens.text} ${colorTokens.border}`;
      default:
        return `${variantBase} ${colorTokens.bg} ${colorTokens.text}`;
    }
  };

  // Enhanced hover states for interactive badges
  const getHoverClasses = () => {
    // Only add hover states for clickable badges or when they have event handlers
    const isInteractive = !!rest.onClick$ || !!rest.onMouseEnter$ || !!rest.onMouseLeave$;
    if (!isInteractive) return "";
    
    switch (variant) {
      case "elevated":
        return "hover:shadow-md hover:scale-105 transition-all duration-200 cursor-pointer";
      case "flat":
        return "hover:brightness-110 transition-all duration-200 cursor-pointer";
      case "outlined":
        return "hover:bg-opacity-10 hover:shadow-sm transition-all duration-200 cursor-pointer";
      case "text":
        return "hover:underline transition-all duration-200 cursor-pointer";
      default:
        return "hover:brightness-110 transition-all duration-200 cursor-pointer";
    }
  };

  // Use Tailwind classes for border radius
  const radiusClass = pill ? "rounded-full" : "rounded-md";
  const baseClasses = "inline-flex items-center font-medium select-none";
  const sizeClasses = badgeTokens.sizes[size];
  const variantClasses = getVariantClasses();
  const hoverClasses = getHoverClasses();
  
  const finalClass = mergeClasses(
    baseClasses,
    sizeClasses,
    variantClasses,
    hoverClasses,
    radiusClass,
    qwikClass,
    className
  );

  // Merge styles if provided
  const finalStyle = mergeStyles(undefined, style);

  return (
    <span class={finalClass} style={finalStyle} {...rest}>
      <Slot />
    </span>
  );
});
