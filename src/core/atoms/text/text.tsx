import { component$, Slot } from "@builder.io/qwik";
import type { ComponentSize, Color, TextWeight, TextAlign, TextTransform, TextDecoration } from "../../../design-system/types";
import type { BaseComponentProps } from "../../../design-system/props";
import { mergeClasses, mergeStyles } from "../../../design-system/props";

export interface TextProps extends BaseComponentProps<HTMLElement> {
  /** 
   * HTML element tag name to render.
   * This determines the semantic meaning and will automatically apply the appropriate default styling.
   */
  as?: keyof HTMLElementTagNameMap;
  
  /** Size override (takes precedence over element-inferred size) */
  size?: ComponentSize;
  
  /** Font weight */
  weight?: TextWeight;
  
  /** Text alignment */
  align?: TextAlign;
  
  /** Text transform */
  transform?: TextTransform;
  
  /** Text decoration */
  decoration?: TextDecoration;
  
  /** Color (design token or CSS color value) */
  color?: Color | string;
  
  /** Whether text should be italic */
  italic?: boolean;
  
  /** Whether text should be truncated with ellipsis */
  truncate?: boolean;
  
  /** Number of lines to clamp (requires truncate) */
  lineClamp?: number;
  
  /** Whether text should be selectable */
  selectable?: boolean;
}

// HTML element to style mapping
const elementSizeClasses: Record<string, string> = {
  h1: "text-2xl md:text-3xl lg:text-4xl",
  h2: "text-xl md:text-2xl",
  h3: "text-lg md:text-xl",
  h4: "text-base md:text-lg",
  h5: "text-base",
  h6: "text-sm md:text-base",
  p: "text-base",
  span: "text-base",
  small: "text-sm",
  label: "text-sm",
  div: "text-base"
};

// HTML element to weight mapping
const elementWeights: Record<string, TextWeight> = {
  h1: "bold",
  h2: "bold",
  h3: "semibold",
  h4: "semibold",
  h5: "medium",
  h6: "medium",
  p: "normal",
  span: "normal",
  small: "normal",
  label: "medium",
  div: "normal"
};

// Size override classes
const sizeClasses: Record<ComponentSize, string> = {
  xs: "text-xs",
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl"
};

// Font weight classes
const weightClasses: Record<TextWeight, string> = {
  thin: "font-thin",
  light: "font-light", 
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
  extrabold: "font-extrabold",
  black: "font-black"
};

// Text alignment classes
const alignClasses: Record<TextAlign, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
  justify: "text-justify"
};

// Text transform classes
const transformClasses: Record<TextTransform, string> = {
  none: "normal-case",
  uppercase: "uppercase",
  lowercase: "lowercase",
  capitalize: "capitalize"
};

// Text decoration classes
const decorationClasses: Record<TextDecoration, string> = {
  none: "no-underline",
  underline: "underline",
  "line-through": "line-through",
  overline: "overline"
};

// Color classes for design tokens
const colorClasses: Record<Color | "default", string> = {
  default: "text-neutral-900",
  primary: "text-primary-600",
  secondary: "text-neutral-600",
  success: "text-success-600",
  warning: "text-warning-600",
  error: "text-error-600",
  info: "text-info-600"
};

// Helper function to determine if a color is a design token
const isDesignToken = (color: string): color is Color => {
  return (Object.keys(colorClasses) as (Color | "default")[]).includes(color as Color | "default") && color !== "default";
};

// Helper function to determine if a color is a CSS color value
const isCssColor = (color: string): boolean => {
  return color.startsWith('#') || 
         color.startsWith('rgb') || 
         color.startsWith('hsl') || 
         ['red', 'blue', 'green', 'black', 'white', 'gray', 'transparent', 'inherit', 'currentColor'].includes(color);
};

// Helper function to get color styling
const getColorStyling = (color?: Color | string): { className?: string; style?: Record<string, string> } => {
  if (!color || color === "default") {
    return { className: colorClasses.default };
  }
  
  // Design token
  if (isDesignToken(color)) {
    return { className: colorClasses[color as Color] };
  }
  
  // Tailwind class (starts with text-)
  if (color.startsWith('text-')) {
    return { className: color };
  }
  
  // CSS color value
  if (isCssColor(color)) {
    return { style: { color } };
  }
  
  // Fallback: treat as arbitrary Tailwind value
  return { className: `text-[${color}]` };
};

export const Text = component$<TextProps>((props) => {
  const {
    size,
    weight,
    align = "left",
    transform = "none",
    decoration = "none",
    color,
    italic = false,
    truncate = false,
    lineClamp,
    selectable = true,
    as = "p",
    
    // Styling props
    class: qwikClass,
    className,
    style,
    
    // Forward all other HTML attributes
    ...rest
  } = props;

  // Get element defaults
  const elementTag = as.toLowerCase();
  const defaultSize = elementSizeClasses[elementTag] || elementSizeClasses.p;
  const defaultWeight = elementWeights[elementTag] || elementWeights.p;

  // Get color styling
  const colorStyling = getColorStyling(color);
  
  // Build component classes with proper precedence
  const textClasses = mergeClasses(
    // Base size (element default or size override)
    size ? sizeClasses[size] : defaultSize,
    
    // Font weight (explicit or element default)
    weightClasses[weight || defaultWeight],
    
    // Alignment
    alignClasses[align],
    
    // Transform
    transformClasses[transform],
    
    // Decoration
    decorationClasses[decoration],
    
    // Color class (if using class-based coloring)
    colorStyling.className,
    
    // State classes
    italic && "italic",
    truncate && (lineClamp ? `line-clamp-${lineClamp}` : "truncate"),
    !selectable && "select-none",
    (elementTag.startsWith('h')) && "leading-tight",
    
    // Custom classes (highest priority)
    qwikClass,
    className
  );

  // Merge styles properly
  const textStyle = mergeStyles(
    colorStyling.style,
    style
  );

  // Element props for forwarding
  const elementProps = {
    class: textClasses,
    style: textStyle,
    ...rest
  };

  // Render based on element type
  switch (as) {
    case 'h1':
      return <h1 {...elementProps}><Slot /></h1>;
    case 'h2':
      return <h2 {...elementProps}><Slot /></h2>;
    case 'h3':
      return <h3 {...elementProps}><Slot /></h3>;
    case 'h4':
      return <h4 {...elementProps}><Slot /></h4>;
    case 'h5':
      return <h5 {...elementProps}><Slot /></h5>;
    case 'h6':
      return <h6 {...elementProps}><Slot /></h6>;
    case 'p':
      return <p {...elementProps}><Slot /></p>;
    case 'span':
      return <span {...elementProps}><Slot /></span>;
    case 'div':
      return <div {...elementProps}><Slot /></div>;
    case 'small':
      return <small {...elementProps}><Slot /></small>;
    case 'label':
      return <label {...elementProps}><Slot /></label>;
    default:
      return <p {...elementProps}><Slot /></p>;
  }
});
