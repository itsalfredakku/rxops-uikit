import { component$, Slot, $, type QRL } from '@builder.io/qwik';
import type { ComponentSize, Color, TextStyle, TextWeight, TextAlign, TextTransform, TextDecoration } from '../../../design-system/types';
import { BaseComponentProps, mergeClasses } from '../../../design-system/props';

export interface LinkProps extends BaseComponentProps<HTMLAnchorElement> {
  // All Text component typography props
  /** Typography style that determines semantic styling */
  textStyle?: TextStyle;
  /** Size override (takes precedence over textStyle size) */
  size?: ComponentSize;
  /** Font weight */
  weight?: TextWeight;
  /** Text alignment */
  align?: TextAlign;
  /** Text transform */
  transform?: TextTransform;
  /** Text decoration */
  decoration?: TextDecoration;
  /** Color (design token, hex, rgb, rgba, hsl, or CSS color value) */
  color?: Color | string;
  /** Whether text should be italic */
  italic?: boolean;
  /** Whether text should be truncated with ellipsis */
  truncate?: boolean;
  /** Number of lines to clamp (requires truncate) */
  lineClamp?: number;
  /** Whether text should be selectable */
  selectable?: boolean;

  // Link-specific props
  /** URL to navigate to */
  href?: string;
  /** Target window/frame */
  target?: '_blank' | '_self' | '_parent' | '_top' | string;
  /** Relationship between current document and linked document */
  rel?: string;
  /** Download attribute for file downloads */
  download?: string | boolean;
  /** Whether link is external (adds external link icon and appropriate rel) */
  external?: boolean;
  /** Whether link is disabled */
  disabled?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Visual variant for link styling */
  variant?: 'default' | 'underlined' | 'hover-underline' | 'button' | 'unstyled';
  /** Icon to display before text */
  startIcon?: string;
  /** Icon to display after text */
  endIcon?: string;
  /** Custom click handler */
  onClick$?: QRL<(event: MouseEvent, element: HTMLAnchorElement) => void>;
}

// Reuse typography logic from Text component
// Base size classes for each textStyle
const textStyleSizeClasses: Record<TextStyle, string> = {
  title: "text-2xl md:text-3xl lg:text-4xl",      // Responsive heading
  subtitle: "text-lg md:text-xl",                 // Subheading size
  body: "text-base",                              // Standard body text
  caption: "text-sm",                             // Small text
  overline: "text-xs"                             // Very small text
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

// Color classes (semantic intent-based colors)
const colorClasses: Record<Color, string> = {
  primary: "text-primary-600",
  secondary: "text-neutral-600",
  success: "text-success-600",
  warning: "text-warning-600",
  error: "text-error-600",
  info: "text-info-600"
};

// Default font weights for textStyles
const textStyleWeights: Record<TextStyle, TextWeight> = {
  title: "bold",        // Headings are bold
  subtitle: "medium",   // Subheadings are medium weight
  body: "normal",       // Body text is normal weight
  caption: "normal",    // Caption text is normal weight  
  overline: "medium"    // Overline labels are medium weight
};

/**
 * Link component built on top of the Text component logic.
 * Inherits all typography capabilities from Text while adding link-specific functionality.
 * 
 * Features:
 * - All Text component props (textStyle, weight, color, etc.)
 * - Link-specific functionality (href, target, rel, etc.)
 * - Auto-detection of external links
 * - Loading states with spinner
 * - Icons (start/end)
 * - Proper accessibility
 * - Visual variants (default, underlined, button, etc.)
 * 
 * Usage:
 * ```tsx
 * <Link href="/page" textStyle="body" color="primary">Internal Link</Link>
 * <Link href="https://example.com" external textStyle="subtitle" weight="medium">External Link</Link>
 * <Link href="/download" download variant="button" color="success">Download File</Link>
 * <Link href="/disabled" disabled color="secondary">Disabled Link</Link>
 * ```
 */
export const LinkNew = component$<LinkProps>((props) => {
  const {
    // Text props
    textStyle = "body",
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
    
    // Link props
    href,
    target,
    rel,
    download,
    external = false,
    disabled = false,
    loading = false,
    variant = 'default',
    startIcon,
    endIcon,
    onClick$,
    class: qwikClass,
    className,
    style,
    ...rest
  } = props;

  // Auto-detect external links if not explicitly set
  const isExternal = external || (href && (href.startsWith('http') || href.startsWith('//')) && typeof window !== 'undefined' && !href.includes(window?.location?.hostname));
  
  // Set appropriate rel attribute for external links
  const finalRel = rel || (isExternal && target === '_blank' ? 'noopener noreferrer' : rel);
  
  // Handle click events
  const handleClick = $((event: MouseEvent, element: HTMLAnchorElement) => {
    if (disabled || loading) {
      event.preventDefault();
      return;
    }
    
    onClick$?.(event, element);
  });

  // Build typography classes (same logic as Text component)
  const typographyClasses = mergeClasses(
    // Base size (textStyle or size override)
    size ? sizeClasses[size] : textStyleSizeClasses[textStyle],
    
    // Font weight (explicit or textStyle default)
    weightClasses[weight || textStyleWeights[textStyle]],
    
    // Alignment
    alignClasses[align],
    
    // Transform
    transformClasses[transform],
    
    // Decoration (will be overridden by variant styles)
    decoration !== 'none' && decorationClasses[decoration],
    
    // Color (semantic color or custom color)
    color ? (
      typeof color === 'string' && color in colorClasses 
        ? colorClasses[color as Color]
        : (color.startsWith('text-') ? color : `text-[${color}]`)
    ) : "text-neutral-900",
    
    // Italic
    italic && "italic",
    
    // Truncation
    truncate && (lineClamp ? `line-clamp-${lineClamp}` : "truncate"),
    
    // Text selection
    !selectable && "select-none",
    
    // Line height adjustments for headings and titles
    (textStyle === 'title' || textStyle === 'subtitle') && "leading-tight",
    
    // Letter spacing for overline
    textStyle === 'overline' && "tracking-wide uppercase"
  );

  // Build variant-specific classes
  const variantClasses = {
    default: 'hover:underline transition-colors duration-200',
    underlined: 'underline decoration-1 underline-offset-2 hover:decoration-2 transition-all duration-200',
    'hover-underline': 'no-underline hover:underline transition-colors duration-200',
    button: 'inline-flex items-center justify-center px-4 py-2 rounded-md border border-transparent font-medium transition-all hover:shadow-sm active:scale-95 bg-current/10 hover:bg-current/20',
    unstyled: 'no-underline text-inherit hover:text-inherit'
  };

  // Build combined classes
  const finalClasses = mergeClasses(
    typographyClasses,
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current/50',
    variantClasses[variant],
    disabled && 'pointer-events-none opacity-50 cursor-not-allowed',
    loading && 'pointer-events-none cursor-wait',
    qwikClass,
    className
  );

  const content = (
    <>
      {/* Loading spinner */}
      {loading && (
        <span class="inline-block w-4 h-4 mr-2 animate-spin">
          <svg class="w-full h-full" viewBox="0 0 24 24" fill="none">
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </span>
      )}

      {/* Start icon */}
      {startIcon && !loading && (
        <span class="inline-block w-4 h-4 mr-2">
          {startIcon}
        </span>
      )}

      {/* Link content */}
      <Slot />

      {/* External link indicator */}
      {isExternal && !endIcon && (
        <span class="inline-block w-3 h-3 ml-1 opacity-60">
          <svg viewBox="0 0 12 12" fill="currentColor">
            <path d="M6 1H11V6" stroke="currentColor" stroke-width="1.5" fill="none"/>
            <path d="M11 1L6 6" stroke="currentColor" stroke-width="1.5"/>
            <path d="M9 7V10C9 10.5523 8.55228 11 8 11H2C1.44772 11 1 10.5523 1 10V4C1 3.44772 1.44772 3 2 3H5" stroke="currentColor" stroke-width="1.5" fill="none"/>
          </svg>
        </span>
      )}

      {/* End icon */}
      {endIcon && (
        <span class="inline-block w-4 h-4 ml-2">
          {endIcon}
        </span>
      )}
    </>
  );

  return (
    <a
      href={disabled ? undefined : href}
      target={target}
      rel={finalRel}
      download={download}
      class={finalClasses}
      style={style}
      onClick$={handleClick}
      aria-disabled={disabled}
      {...rest}
    >
      {content}
    </a>
  );
});

export default LinkNew;
