import { component$, Slot, $, useStore, QRL } from "@builder.io/qwik";
import { BaseComponentProps, mergeClasses, mergeStyles } from "../../../design-system/props";
import { Container } from "../container/container";
import { Row } from "../../../layouts/row";

export interface HeaderProps extends BaseComponentProps<HTMLElement> {
  variant?: 'public' | 'admin' | 'user' | 'provider';
  sticky?: boolean;
  transparent?: boolean;
  /** Medical device keyboard support with enhanced focus indicators */
  medicalDeviceMode?: boolean;
  /** Emergency mode for critical medical headers */
  emergencyMode?: boolean;
  /** Enable healthcare workflow shortcuts */
  enableWorkflowShortcuts?: boolean;
  /** Emergency alert status */
  emergencyAlertActive?: boolean;
}

/**
 * Reusable Header Component with Medical Device Accessibility
 * Flexible header that can be customized with slots for different layouts
 * Enhanced keyboard navigation for healthcare environments
 */
export const Header = component$<HeaderProps>((props) => {
  const { 
    variant = 'public',
    sticky = true,
    transparent = false,
    medicalDeviceMode = false,
    emergencyMode = false,
    enableWorkflowShortcuts = false,
    emergencyAlertActive = false,
    class: qwikClass,
    className,
    style,
    onKeyDown$,
    ...rest
  } = props;

  // Enhanced keyboard state for medical devices
  const keyboardState = useStore({
    currentNavIndex: -1,
    emergencyHighlight: false,
    shortcutPressed: false,
    mobileMenuVisible: false
  });

  // Enhanced keyboard support for medical devices
  const handleKeyDown = $((event: KeyboardEvent) => {
    if (event.defaultPrevented) return;

    // Healthcare workflow shortcuts
    if (enableWorkflowShortcuts) {
      const isCtrlOrCmd = event.ctrlKey || event.metaKey;
      
      if (isCtrlOrCmd) {
        switch (event.key.toLowerCase()) {
          case 'h':
            // Quick navigate to home
            event.preventDefault();
            keyboardState.shortcutPressed = true;
            setTimeout(() => keyboardState.shortcutPressed = false, 200);
            break;
          case 'e':
            // Emergency action
            if (emergencyMode) {
              event.preventDefault();
              keyboardState.emergencyHighlight = true;
              setTimeout(() => keyboardState.emergencyHighlight = false, 1000);
            }
            break;
          case 'm':
            // Toggle mobile menu
            event.preventDefault();
            keyboardState.mobileMenuVisible = !keyboardState.mobileMenuVisible;
            break;
        }
      }
    }

    // Medical device navigation shortcuts
    if (medicalDeviceMode) {
      switch (event.key) {
        case 'F1':
          if (emergencyAlertActive) {
            event.preventDefault();
            keyboardState.emergencyHighlight = true;
          }
          break;
        case 'F2':
          // Quick access to navigation
          event.preventDefault();
          keyboardState.currentNavIndex = 0;
          break;
        case 'F3':
          // Quick access to actions
          event.preventDefault();
          keyboardState.currentNavIndex = 1;
          break;
        case 'Escape':
          // Clear all highlights and close mobile menu
          keyboardState.emergencyHighlight = false;
          keyboardState.mobileMenuVisible = false;
          keyboardState.currentNavIndex = -1;
          break;
        case 'Tab':
          // Enhanced tab navigation for medical devices
          if (event.shiftKey) {
            // Reverse tab navigation
            keyboardState.currentNavIndex = Math.max(-1, keyboardState.currentNavIndex - 1);
          } else {
            // Forward tab navigation
            keyboardState.currentNavIndex = Math.min(2, keyboardState.currentNavIndex + 1);
          }
          break;
      }
    }
  });

  const headerClasses = mergeClasses(
    "header",
    `header-${variant}`,
    sticky && "header-sticky",
    transparent && "header-transparent",
    medicalDeviceMode && "medical-device-mode",
    emergencyMode && "emergency-mode",
    emergencyAlertActive && "emergency-alert-active",
    enableWorkflowShortcuts && "workflow-shortcuts-enabled",
    keyboardState.emergencyHighlight && "emergency-highlight",
    keyboardState.shortcutPressed && "shortcut-pressed",
    qwikClass,
    className
  );

  // Enhanced ARIA attributes for medical contexts
  const headerRole = medicalDeviceMode ? 'banner' : undefined;
  const ariaLabel = medicalDeviceMode 
    ? `${variant} header - Medical device mode enabled${emergencyAlertActive ? ' - Emergency alert active' : ''}`
    : undefined;

  const ariaDescription = [
    emergencyMode && 'Emergency header',
    enableWorkflowShortcuts && 'Ctrl+H for home, Ctrl+M for menu',
    emergencyAlertActive && 'Emergency alert is active'
  ].filter(Boolean).join('. ');

  // Merge styles if provided
  const finalStyle = mergeStyles(undefined, style);

  return (
    <div class="themed-content">
      <header 
        class={headerClasses}
        style={finalStyle}
        onKeyDown$={handleKeyDown}
        role={headerRole}
        aria-label={ariaLabel}
        aria-describedby={ariaDescription ? 'header-description' : undefined}
        tabIndex={medicalDeviceMode ? 0 : undefined}
        {...rest}
      >
        <Container 
          size="xl" 
          padding="4"
          medicalDeviceMode={medicalDeviceMode}
        >
          <Row alignItems="center" justifyContent="between" gap="6" class="min-h-14">
            {/* Emergency Alert Indicator */}
            {emergencyAlertActive && (
              <div 
                class="emergency-alert-indicator"
                role="alert"
                aria-live="assertive"
                aria-label="Emergency alert active"
              >
                🚨
              </div>
            )}
            
            <div 
              class={mergeClasses(
                "header-brand flex-shrink-0",
                keyboardState.currentNavIndex === 0 && medicalDeviceMode && "keyboard-focused"
              )}
            >
              <Slot name="brand" />
            </div>
            
            <div 
              class={mergeClasses(
                "header-nav flex-1 flex justify-center hidden md:flex",
                keyboardState.currentNavIndex === 1 && medicalDeviceMode && "keyboard-focused"
              )}
            >
              <Slot name="navigation" />
            </div>
            
            <div 
              class={mergeClasses(
                "header-actions flex-shrink-0 flex items-center",
                keyboardState.currentNavIndex === 2 && medicalDeviceMode && "keyboard-focused"
              )}
            >
              <Slot name="actions" />
            </div>
            
            <div 
              class={mergeClasses(
                "header-mobile-toggle block md:hidden",
                keyboardState.mobileMenuVisible && "mobile-menu-visible"
              )}
            >
              <Slot name="mobile-toggle" />
            </div>
          </Row>
        </Container>
        
        {/* Medical device keyboard shortcuts help */}
        {medicalDeviceMode && enableWorkflowShortcuts && (
          <div 
            id="header-description"
            class="sr-only"
            aria-live="polite"
          >
            {ariaDescription}
          </div>
        )}
        
        <style>{`
          .header {
            background: var(--white);
            border-bottom: 1px solid var(--gray-200);
            z-index: 1000;
            width: 100%;
          }
          
          .header-sticky {
            position: sticky;
            top: 0;
          }
          
          .header-transparent {
            background: transparent;
            border-bottom: none;
          }
          
          .header-public {
            box-shadow: var(--shadow-sm);
          }
          
          .header-admin {
            background: var(--white);
            box-shadow: var(--shadow-sm);
          }
          
          .header-user {
            background: var(--white);
            border-bottom: 1px solid var(--gray-200);
          }
          
          .header-provider {
            background: var(--white);
            border-bottom: 1px solid var(--gray-200);
          }
          
          /* Medical Device Mode Enhancements */
          .medical-device-mode {
            border: 2px solid transparent;
            transition: all 0.2s ease;
          }
          
          .medical-device-mode:focus {
            border-color: var(--primary-500);
            box-shadow: 0 0 0 2px var(--primary-200);
          }
          
          .emergency-mode {
            background: linear-gradient(90deg, var(--error-50) 0%, var(--white) 100%);
            border-bottom-color: var(--error-300);
          }
          
          .emergency-alert-active {
            background: var(--error-100);
            border-bottom-color: var(--error-500);
          }
          
          .emergency-highlight {
            animation: emergencyPulse 1s ease-in-out;
          }
          
          .shortcut-pressed {
            background: var(--primary-50);
            transform: scale(1.01);
          }
          
          .keyboard-focused {
            outline: 2px solid var(--primary-500);
            outline-offset: 2px;
            border-radius: 4px;
          }
          
          .emergency-alert-indicator {
            font-size: 1.2rem;
            animation: pulse 2s infinite;
          }
          
          @keyframes emergencyPulse {
            0%, 100% { background: var(--error-100); }
            50% { background: var(--error-200); }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </header>
    </div>
  );
});

export default Header;
