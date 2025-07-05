/**
 * Link Component
 * 
 * Radzen-inspired link component that extends HTML anchor functionality
 * with design system consistency and enhanced accessibility.
 */

import { component$, Slot, $, type QRL } from '@builder.io/qwik';
import type { BaseComponentProps } from '../../../design-system/props';
import type { ComponentSize, Color } from '../../../design-system/types';
import { createVariantClass } from '../../../design-system/component-base';
import { componentTokens } from '../../../design-system/tokens';

export interface LinkProps extends BaseComponentProps<HTMLAnchorElement> {
  /** URL to navigate to */
  href?: string;
  /** Target window/frame */
  target?: '_blank' | '_self' | '_parent' | '_top' | string;
  /** Relationship between current document and linked document */
  rel?: string;
  /** Download attribute for file downloads */
  download?: string | boolean;
  /** Link text content (alternative to children) */
  text?: string;
  /** Visual variant */
  variant?: 'default' | 'underlined' | 'button' | 'unstyled';
  /** Link state/color */
  color?: Color;
  /** Size variant */
  size?: ComponentSize;
  /** Whether link should be bold */
  bold?: boolean;
  /** Whether link is external (adds external link icon) */
  external?: boolean;
  /** Whether link is disabled */
  disabled?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Icon to display before text */
  startIcon?: string;
  /** Icon to display after text */
  endIcon?: string;
  /** Custom click handler */
  onClick$?: QRL<(event: MouseEvent, element: HTMLAnchorElement) => void>;
}

// Link variant configuration
const linkVariants = createVariantClass({
  base: [
    'link-component',
    'transition-colors duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
  ].join(' '),
  
  variants: {
    default: [
      'text-current hover:underline',
      'focus:ring-primary-500',
    ].join(' '),
    underlined: [
      'underline decoration-1 underline-offset-2',
      'hover:decoration-2',
      'focus:ring-primary-500',
    ].join(' '),
    button: [
      'inline-flex items-center justify-center',
      'px-4 py-2 rounded-md',
      'border border-transparent',
      'font-medium transition-all',
      'hover:shadow-sm active:scale-95',
      'focus:ring-2 focus:ring-offset-2',
    ].join(' '),
    unstyled: [
      'no-underline text-inherit',
      'hover:text-inherit',
      'focus:ring-primary-500',
    ].join(' '),
    
    // Color-based colors for text links
    "color-primary": [
      'text-primary-600',
      'hover:text-primary-700',
      'focus:ring-primary-500',
    ].join(' '),
    
    "color-secondary": [
      'text-neutral-600',
      'hover:text-neutral-700',
      'focus:ring-neutral-500',
    ].join(' '),
    
    "color-success": [
      'text-success-600',
      'hover:text-success-700',
      'focus:ring-success-500',
    ].join(' '),
    
    "color-warning": [
      'text-warning-600',
      'hover:text-warning-700',
      'focus:ring-warning-500',
    ].join(' '),
    
    "color-error": [
      'text-error-600',
      'hover:text-error-700',
      'focus:ring-error-500',
    ].join(' '),
    
    "color-info": [
      'text-info-600',
      'hover:text-info-700',
      'focus:ring-info-500',
    ].join(' '),

    // Button variant with color colors
    "button-primary": [
      'bg-primary-600 text-white',
      'hover:bg-primary-700',
      'focus:ring-primary-500',
    ].join(' '),
    
    "button-secondary": [
      'bg-neutral-600 text-white',
      'hover:bg-neutral-700',
      'focus:ring-neutral-500',
    ].join(' '),
    
    "button-success": [
      'bg-success-600 text-white',
      'hover:bg-success-700',
      'focus:ring-success-500',
    ].join(' '),
    
    "button-warning": [
      'bg-warning-600 text-white',
      'hover:bg-warning-700',
      'focus:ring-warning-500',
    ].join(' '),
    
    "button-error": [
      'bg-error-600 text-white',
      'hover:bg-error-700',
      'focus:ring-error-500',
    ].join(' '),
    
    "button-info": [
      'bg-info-600 text-white',
      'hover:bg-info-700',
      'focus:ring-info-500',
    ].join(' '),
  } as Record<string, string>,
  
  compoundVariants: [
    // Text size variants
    {
      conditions: { size: "xs" },
      className: componentTokens.button.sizes.xs.text
    },
    {
      conditions: { size: "sm" },
      className: componentTokens.button.sizes.sm.text
    },
    {
      conditions: { size: "md" },
      className: componentTokens.button.sizes.md.text
    },
    {
      conditions: { size: "lg" },
      className: componentTokens.button.sizes.lg.text
    },
    {
      conditions: { size: "xl" },
      className: componentTokens.button.sizes.xl.text
    },
  ],
  
  defaultVariant: "default"
});

/**
 * Link Component
 * 
 * A flexible link component that supports various styles and behaviors
 * while maintaining semantic HTML anchor functionality.
 * 
 * @example
 * ```tsx
 * // Basic link
 * <Link href="/dashboard">Dashboard</Link>
 * 
 * // External link with icon
 * <Link href="https://example.com" external target="_blank">
 *   External Site
 * </Link>
 * 
 * // Button-style link
 * <Link href="/action" variant="button" color="primary">
 *   Take Action
 * </Link>
 * 
 * // Disabled link
 * <Link href="/disabled" disabled>
 *   Disabled Link
 * </Link>
 * ```
 */
export const Link = component$<LinkProps>(({
  href,
  target,
  rel,
  download,
  text,
  variant = 'default',
  color = 'primary',
  size = 'md',
  bold = false,
  external = false,
  disabled = false,
  loading = false,
  startIcon,
  endIcon,
  onClick$,
  class: className,
  testId,
  children: _children,
  ...rest
}) => {
  // Auto-detect external links if not explicitly set
  const isExternal = external || (href && (href.startsWith('http') || href.startsWith('//')) && !href.includes(window?.location?.hostname));
  
  // Set appropriate rel attribute for external links
  const finalRel = rel || (isExternal && target === '_blank' ? 'noopener noreferrer' : rel);
  
  // Determine the variant to use
  const variantKey = variant === 'button' ? `button-${color}` : (variant === 'default' ? `color-${color}` : variant);
  
  const finalClasses = linkVariants({
    [variantKey]: true,
    size,
    className: [
      disabled && 'pointer-events-none opacity-50',
      loading && 'pointer-events-none',
      bold && 'font-semibold',
      className,
    ].filter(Boolean).join(' ')
  });

  // Handle click events
  const handleClick = $((event: MouseEvent, element: HTMLAnchorElement) => {
    if (disabled || loading) {
      event.preventDefault();
      return;
    }
    
    onClick$?.(event, element);
  });

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

      {/* Link text content */}
      {text || <Slot />}

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
    <div class="themed-content">
      <a
        href={disabled ? undefined : href}
        target={target}
        rel={finalRel}
        download={download}
        class={finalClasses}
        data-testid={testId}
        onClick$={handleClick}
        aria-disabled={disabled}
        {...rest}
      >
        {content}
      </a>
    </div>
  );
});

export default Link;
