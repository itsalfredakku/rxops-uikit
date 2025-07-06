/**
 * Link Component
 * 
 * Radzen-inspired link component that extends HTML anchor functionality
 * with design system consistency and enhanced accessibility.
 */

import { component$, Slot, $, type QRL, useStore } from '@builder.io/qwik';
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
  /** Medical device keyboard support with enhanced focus indicators */
  medicalDeviceMode?: boolean;
  /** Emergency mode for critical medical links */
  emergencyMode?: boolean;
  /** Confirmation required for medical safety (for critical actions) */
  requireConfirmation?: boolean;
  /** Healthcare workflow shortcuts */
  enableWorkflowShortcuts?: boolean;
  /** Link purpose for healthcare contexts */
  purpose?: 'navigation' | 'action' | 'emergency' | 'external' | 'download' | 'general';
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
      'text-neutral-normal',
      'hover:text-neutral-dark',
      'focus:ring-neutral-normal',
    ].join(' '),
    
    "color-success": [
      'text-success-normal',
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
      'bg-neutral-dark text-white',
      'hover:bg-neutral-darker',
      'focus:ring-neutral-normal',
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
 * Link Component with Medical Device Keyboard Accessibility
 * 
 * A flexible link component that supports various styles and behaviors
 * while maintaining semantic HTML anchor functionality.
 * 
 * Medical Device Keyboard Accessibility:
 * - Enter: Activate link (primary activation)
 * - Space: Activate link (alternative activation)
 * - Escape: Cancel confirmation dialog (if requireConfirmation=true)
 * - Enhanced focus indicators for clinical environments
 * - Confirmation dialogs for critical medical actions
 * - WCAG 2.1 AA+ compliance with Section 508 support
 * - Screen reader optimization for medical workflows
 * 
 * @example
 * ```tsx
 * // Basic link
 * <Link href="/dashboard">Dashboard</Link>
 * 
 * // Medical device link with confirmation
 * <Link href="/critical-action" medicalDeviceMode requireConfirmation purpose="action">
 *   Critical Action
 * </Link>
 * 
 * // Emergency link
 * <Link href="/emergency" emergencyMode purpose="emergency">
 *   Emergency Protocol
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
  medicalDeviceMode = false,
  emergencyMode = false,
  requireConfirmation = false,
  enableWorkflowShortcuts = true,
  purpose = 'general',
  class: className,
  testId,
  children: _children,
  ...rest
}) => {
  // Auto-detect external links if not explicitly set
  const isExternal = external || (href && (href.startsWith('http') || href.startsWith('//')) && !href.includes(window?.location?.hostname));
  
  // Set appropriate rel attribute for external links
  const finalRel = rel || (isExternal && target === '_blank' ? 'noopener noreferrer' : rel);
  
  // Medical device keyboard accessibility state
  const keyboardState = useStore({
    hasFocus: false,
    showConfirmation: false,
    isEmergencyMode: emergencyMode,
    shortcutPressed: false
  });
  
  // Determine the variant to use
  const variantKey = variant === 'button' ? `button-${color}` : (variant === 'default' ? `color-${color}` : variant);
  
  const finalClasses = linkVariants({
    [variantKey]: true,
    size,
    className: [
      disabled && 'pointer-events-none opacity-50',
      loading && 'pointer-events-none',
      bold && 'font-semibold',
      // Medical device enhanced focus indicators
      medicalDeviceMode && 'focus:ring-4 focus:ring-blue-200 focus:border-primary-normal',
      keyboardState.isEmergencyMode && 'ring-2 ring-orange-400 bg-warning-lighter',
      keyboardState.hasFocus && medicalDeviceMode && 'ring-4 ring-blue-200 shadow-lg',
      className,
    ].filter(Boolean).join(' ')
  });

  // Enhanced navigation with medical device confirmation
  const performNavigation = $((event?: Event) => {
    if (disabled || loading) return;
    
    // Medical device confirmation for critical actions
    if (requireConfirmation && medicalDeviceMode && purpose === 'action') {
      event?.preventDefault();
      keyboardState.showConfirmation = true;
      return;
    }
    
    // Direct navigation for standard links
    if (href && !event) {
      window.location.href = href;
    }
  });
  
  // Confirmation handlers for medical safety
  const confirmNavigation = $(() => {
    keyboardState.showConfirmation = false;
    if (href) {
      if (target === '_blank') {
        window.open(href, target, finalRel ? 'noopener,noreferrer' : '');
      } else {
        window.location.href = href;
      }
    }
  });
  
  const cancelNavigation = $(() => {
    keyboardState.showConfirmation = false;
  });

  // Enhanced keyboard navigation for medical devices
  const handleKeyDown = $((event: KeyboardEvent) => {
    if (!enableWorkflowShortcuts) return;
    
    switch (event.key) {
      case 'Enter':
      case ' ':
        // Primary activation - Enter and Space both activate
        event.preventDefault();
        if (keyboardState.showConfirmation) {
          // Confirm if in confirmation mode
          confirmNavigation();
        } else {
          // Standard navigation
          performNavigation();
        }
        break;
        
      case 'Escape':
        // Cancel confirmation dialog
        if (keyboardState.showConfirmation) {
          event.preventDefault();
          cancelNavigation();
        }
        break;
        
      case 'y':
      case 'Y':
        // Quick "Yes" confirmation in medical contexts
        if (keyboardState.showConfirmation && medicalDeviceMode) {
          event.preventDefault();
          confirmNavigation();
        }
        break;
        
      case 'n':
      case 'N':
        // Quick "No" cancellation in medical contexts
        if (keyboardState.showConfirmation && medicalDeviceMode) {
          event.preventDefault();
          cancelNavigation();
        }
        break;
    }
    
    // Enhanced visual feedback for medical devices
    if ((event.ctrlKey || event.metaKey) && medicalDeviceMode) {
      keyboardState.shortcutPressed = true;
      
      switch (event.key.toLowerCase()) {
        case 'e':
          // Ctrl+E: Toggle emergency mode
          event.preventDefault();
          keyboardState.isEmergencyMode = !keyboardState.isEmergencyMode;
          break;
      }
      
      // Reset shortcut state
      setTimeout(() => {
        keyboardState.shortcutPressed = false;
      }, 200);
    }
  });

  // Enhanced focus handlers for medical device accessibility
  const handleFocus = $(() => {
    keyboardState.hasFocus = true;
  });

  const handleBlur = $(() => {
    keyboardState.hasFocus = false;
    // Cancel any pending confirmation on blur for safety
    if (keyboardState.showConfirmation) {
      cancelNavigation();
    }
  });

  // Handle click events
  const handleClick = $((event: MouseEvent, element: HTMLAnchorElement) => {
    if (disabled || loading) {
      event.preventDefault();
      return;
    }
    
    // Medical device confirmation check
    if (requireConfirmation && medicalDeviceMode && purpose === 'action') {
      event.preventDefault();
      keyboardState.showConfirmation = true;
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
      
      {/* Emergency mode indicator */}
      {keyboardState.isEmergencyMode && (
        <span class="inline-block ml-2 px-2 py-1 text-xs font-medium bg-warning-lighter text-warning-darker rounded">
          EMERGENCY
        </span>
      )}

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
      
      {/* Medical device keyboard shortcut indicator */}
      {medicalDeviceMode && keyboardState.shortcutPressed && (
        <span class="inline-block ml-2 px-2 py-1 text-xs font-medium bg-info-lighter text-primary-darker rounded">
          Shortcut Active
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
        data-medical-device={medicalDeviceMode}
        data-emergency-mode={keyboardState.isEmergencyMode}
        data-purpose={purpose}
        onClick$={handleClick}
        onKeyDown$={handleKeyDown}
        onFocus$={handleFocus}
        onBlur$={handleBlur}
        aria-disabled={disabled}
        // Enhanced ARIA for medical device accessibility
        aria-label={
          medicalDeviceMode 
            ? `${text || 'Medical link'} - Use Enter or Space to activate${requireConfirmation ? ', confirmation required' : ''}`
            : undefined
        }
        role={variant === 'button' ? 'button' : 'link'}
        {...rest}
      >
        {content}
      </a>
      
      {/* Medical device keyboard shortcuts help */}
      {medicalDeviceMode && enableWorkflowShortcuts && keyboardState.hasFocus && (
        <div class="absolute -bottom-6 left-0 text-xs text-neutral-normal whitespace-nowrap bg-white px-2 py-1 rounded shadow-sm border">
          Keys: Enter/Space (activate){requireConfirmation && ', Y/N (confirm)'}, Esc (cancel)
        </div>
      )}
      
      {/* Confirmation dialog for medical safety */}
      {keyboardState.showConfirmation && (
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white p-6 rounded-lg shadow-xl max-w-md mx-4">
            <h3 class="text-lg font-semibold text-neutral-darker mb-3">
              Confirm Navigation
            </h3>
            <p class="text-neutral-dark mb-4">
              Are you sure you want to navigate to this {purpose === 'action' ? 'action' : 'page'}?
              {keyboardState.isEmergencyMode && (
                <span class="block text-warning-normal font-medium mt-1">
                  This is an emergency mode operation.
                </span>
              )}
            </p>
            <div class="text-sm text-neutral-normal mb-4">
              Destination: <code class="bg-neutral-lighter px-2 py-1 rounded">{href}</code>
            </div>
            <div class="flex gap-3 justify-end">
              <button 
                type="button"
                onClick$={cancelNavigation}
                onKeyDown$={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    cancelNavigation();
                  }
                }}
                class="px-4 py-2 border border-neutral-light rounded-md text-neutral-dark hover:bg-neutral-lighter focus:ring-2 focus:ring-neutral-200"
              >
                Cancel (N)
              </button>
              <button 
                type="button"
                onClick$={confirmNavigation}
                onKeyDown$={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    confirmNavigation();
                  }
                }}
                class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:ring-2 focus:ring-primary-200"
              >
                Confirm (Y)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default Link;
