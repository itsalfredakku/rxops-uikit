import { component$, Slot, useSignal, useVisibleTask$, type JSXOutput, type Signal } from '@builder.io/qwik';
import { mergeClasses } from '../../../design-system/props';

/**
 * Healthcare Drawer/Sidebar Component
 * 
 * A slide-out panel component optimized for healthcare interfaces.
 * Supports medical navigation, patient information panels, and clinical tools.
 * 
 * Features:
 * - Multiple positions (left, right, top, bottom)
 * - Healthcare-specific variants
 * - Keyboard navigation and focus management
 * - Responsive design for medical devices
 * - Emergency override for critical alerts
 * 
 * @example
 * ```tsx
 * <Drawer
 *   open={isOpen}
 *   position="right"
 *   variant="patient-info"
 *   onClose={handleClose}
 * >
 *   <PatientProfile patient={currentPatient} />
 * </Drawer>
 * ```
 */

export interface DrawerProps {
  /** Whether the drawer is open */
  open: boolean | Signal<boolean>;
  
  /** Position of the drawer */
  position?: 'left' | 'right' | 'top' | 'bottom';
  
  /** Size of the drawer */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  
  /** Healthcare-specific drawer variants */
  variant?: 'default' | 'patient-info' | 'medical-tools' | 'emergency' | 'navigation' | 'chart-notes';
  
  /** Whether to show backdrop overlay */
  showBackdrop?: boolean;
  
  /** Whether clicking backdrop closes drawer */
  closeOnBackdropClick?: boolean;
  
  /** Whether pressing Escape closes drawer */
  closeOnEscape?: boolean;
  
  /** Priority level for emergency overrides */
  priority?: 'normal' | 'high' | 'critical' | 'emergency';
  
  /** Callback when drawer should close */
  onClose?: () => void;
  
  /** Custom CSS classes */
  class?: string;
  
  /** Test identifier */
  'data-testid'?: string;
  
  /** ARIA label for accessibility */
  'aria-label'?: string;
  
  /** ARIA labelledby for accessibility */
  'aria-labelledby'?: string;
  
  /** Whether drawer can be dismissed by user */
  dismissible?: boolean;
}

export const Drawer = component$<DrawerProps>((props) => {
  const {
    open,
    position = 'right',
    size = 'md',
    variant = 'default',
    showBackdrop = true,
    closeOnBackdropClick = true,
    closeOnEscape = true,
    priority = 'normal',
    onClose,
    class: className,
    dismissible = true,
    'data-testid': testId,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    ...rest
  } = props;

  const drawerRef = useSignal<HTMLElement>();
  const backdropRef = useSignal<HTMLElement>();
  const isOpen = typeof open === 'boolean' ? open : open.value;

  // Handle keyboard events
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    track(() => isOpen);

    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape && dismissible && onClose) {
        e.preventDefault();
        onClose();
      }
    };

    // Focus management
    const handleFocusTrap = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && drawerRef.value) {
        const focusableElements = drawerRef.value.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keydown', handleFocusTrap);

    // Focus first focusable element when opened
    setTimeout(() => {
      const firstFocusable = drawerRef.value?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      
      firstFocusable?.focus();
    }, 100);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keydown', handleFocusTrap);
    };
  });

  // Position-based styles
  const positionStyles = {
    left: {
      transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
      left: '0',
      top: '0',
      height: '100%',
      borderRight: '1px solid var(--color-border-subtle)'
    },
    right: {
      transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
      right: '0',
      top: '0',
      height: '100%',
      borderLeft: '1px solid var(--color-border-subtle)'
    },
    top: {
      transform: isOpen ? 'translateY(0)' : 'translateY(-100%)',
      top: '0',
      left: '0',
      width: '100%',
      borderBottom: '1px solid var(--color-border-subtle)'
    },
    bottom: {
      transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
      bottom: '0',
      left: '0',
      width: '100%',
      borderTop: '1px solid var(--color-border-subtle)'
    }
  };

  // Size styles
  const sizeStyles = {
    sm: position === 'left' || position === 'right' ? { width: '256px' } : { height: '200px' },
    md: position === 'left' || position === 'right' ? { width: '384px' } : { height: '320px' },
    lg: position === 'left' || position === 'right' ? { width: '512px' } : { height: '480px' },
    xl: position === 'left' || position === 'right' ? { width: '640px' } : { height: '600px' },
    full: position === 'left' || position === 'right' ? { width: '100%' } : { height: '100%' }
  };

  // Variant styles
  const variantClasses = {
    default: 'bg-white',
    'patient-info': 'bg-gradient-to-b from-info-lighter to-white border-info-light',
    'medical-tools': 'bg-gradient-to-b from-success-lighter to-white border-success-light',
    emergency: 'bg-gradient-to-b from-error-lighter to-white border-error-light shadow-lg shadow-red-100',
    navigation: 'bg-neutral-lighter border-neutral-light',
    'chart-notes': 'bg-gradient-to-b from-warning-lighter to-white border-warning-light'
  };

  // Priority styles for emergency overrides
  const priorityClasses = {
    normal: '',
    high: 'ring-2 ring-amber-400',
    critical: 'ring-2 ring-error-normal shadow-lg',
    emergency: 'ring-4 ring-error-normal shadow-xl shadow-red-200 animate-pulse'
  };

  return (
    <div class="themed-content">
      <>
        {/* Backdrop */}
      {showBackdrop && isOpen && (
        <div
          ref={backdropRef}
          class={mergeClasses(
            'fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300',
            priority === 'emergency' && 'bg-opacity-70'
          )}
          onClick$={() => {
            if (closeOnBackdropClick && dismissible && onClose) {
              onClose();
            }
          }}
          data-testid={`${testId}-backdrop`}
        />
      )}

      {/* Drawer */}
      <div
        ref={drawerRef}
        class={mergeClasses(
          // Base styles
          'fixed z-50 flex flex-col',
          'transition-transform duration-300 ease-in-out',
          'shadow-xl',
          
          // Variant styles
          variantClasses[variant],
          
          // Priority styles
          priorityClasses[priority],
          
          // Custom classes
          className
        )}
        style={{
          ...positionStyles[position],
          ...sizeStyles[size]
        }}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        data-testid={testId || 'drawer'}
        {...rest}
      >
        {/* Header */}
        <div class={mergeClasses(
          'flex items-center justify-between p-4 border-b',
          variant === 'emergency' ? 'border-error-light bg-error-lighter' : 'border-neutral-light',
          priority === 'emergency' && 'animate-pulse'
        )}>
          <div class="flex items-center space-x-2">
            {/* Priority indicator */}
            {priority !== 'normal' && (
              <div class={mergeClasses(
                'w-2 h-2 rounded-full',
                priority === 'high' && 'bg-warning-normal',
                priority === 'critical' && 'bg-error-normal',
                priority === 'emergency' && 'bg-error-normal animate-ping'
              )} />
            )}
            
            {/* Variant icons */}
            {variant === 'patient-info' && (
              <svg class="w-5 h-5 text-primary-normal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
            
            {variant === 'medical-tools' && (
              <svg class="w-5 h-5 text-success-normal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            )}
            
            {variant === 'emergency' && (
              <svg class="w-5 h-5 text-error-normal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.865-.833-2.635 0L4.232 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            )}
            
            {variant === 'chart-notes' && (
              <svg class="w-5 h-5 text-warning-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            )}
          </div>

          {/* Close button */}
          {dismissible && onClose && (
            <button
              type="button"
              onClick$={onClose}
              class={mergeClasses(
                'p-2 rounded-lg transition-colors',
                'hover:bg-neutral-lighter focus:outline-none focus:ring-2 focus:ring-primary-normal',
                'min-w-[44px] min-h-[44px]', // Touch target size
                variant === 'emergency' && 'hover:bg-error-lighter focus:ring-error-normal'
              )}
              aria-label="Close drawer"
              data-testid={`${testId}-close`}
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Content */}
        <div class="flex-1 overflow-auto p-4">
          <Slot />
        </div>
      </div>
      </>
    </div>
  );
});

/**
 * Sidebar Component - A specialized drawer for navigation
 */
export interface SidebarProps extends Omit<DrawerProps, 'position'> {
  /** Sidebar position */
  position?: 'left' | 'right';
  
  /** Navigation items */
  navigation?: {
    label: string;
    href?: string;
    icon?: JSXOutput;
    active?: boolean;
    badge?: string;
    onClick?: () => void;
  }[];
}

export const Sidebar = component$<SidebarProps>((props) => {
  const {
    navigation,
    position = 'left',
    variant = 'navigation',
    size = 'md',
    ...drawerProps
  } = props;

  return (
    <Drawer
      {...drawerProps}
      position={position}
      variant={variant}
      size={size}
    >
      {navigation && (
        <nav class="space-y-1">
          {navigation.map((item, index) => (
            <a
              key={index}
              href={item.href}
              onClick$={item.onClick}
              class={mergeClasses(
                'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                'min-h-[44px]', // Touch target
                item.active
                  ? 'bg-info-lighter text-primary-dark border-l-4 border-primary-normal'
                  : 'text-neutral-dark hover:bg-neutral-lighter hover:text-neutral-darker'
              )}
            >
              {item.icon && (
                <span class="mr-3 flex-shrink-0">
                  {item.icon}
                </span>
              )}
              
              <span class="flex-1">{item.label}</span>
              
              {item.badge && (
                <span class="ml-2 px-2 py-1 text-xs rounded-full bg-error-lighter text-error-dark">
                  {item.badge}
                </span>
              )}
            </a>
          ))}
        </nav>
      )}
      
      <Slot />
    </Drawer>
  );
});
