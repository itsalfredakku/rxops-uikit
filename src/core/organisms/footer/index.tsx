import { component$, Slot, $, useStore } from '@builder.io/qwik';
import { BaseComponentProps, mergeClasses, mergeStyles } from '../../../design-system/props';
import { Row } from '../../../layouts/row';
import { Column } from '../../../layouts/column';

export interface FooterProps extends BaseComponentProps<HTMLElement> {
  variant?: 'public' | 'simple' | 'minimal';
  /** Medical device keyboard support with enhanced focus indicators */
  medicalDeviceMode?: boolean;
  /** Emergency mode for critical medical footers */
  emergencyMode?: boolean;
  /** Enable healthcare workflow shortcuts */
  enableWorkflowShortcuts?: boolean;
  /** Show emergency contact information */
  showEmergencyContact?: boolean;
  /** System status indicator */
  systemStatus?: 'online' | 'maintenance' | 'emergency' | 'offline';
}

export const Footer = component$<FooterProps>((props) => {
  const { 
    variant = 'public',
    medicalDeviceMode = false,
    emergencyMode = false,
    enableWorkflowShortcuts = false,
    showEmergencyContact = false,
    systemStatus = 'online',
    class: qwikClass,
    className,
    style,
    onKeyDown$,
    ...rest 
  } = props;

  // Enhanced keyboard state for medical devices
  const keyboardState = useStore({
    currentSectionIndex: -1,
    emergencyHighlight: false,
    shortcutPressed: false,
    statusIndicatorActive: false
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
            // Quick navigate to footer help
            event.preventDefault();
            keyboardState.shortcutPressed = true;
            setTimeout(() => keyboardState.shortcutPressed = false, 200);
            break;
          case 'e':
            // Emergency contact
            if (emergencyMode || showEmergencyContact) {
              event.preventDefault();
              keyboardState.emergencyHighlight = true;
              setTimeout(() => keyboardState.emergencyHighlight = false, 1000);
            }
            break;
          case 's':
            // System status
            event.preventDefault();
            keyboardState.statusIndicatorActive = !keyboardState.statusIndicatorActive;
            break;
        }
      }
    }

    // Medical device navigation shortcuts
    if (medicalDeviceMode) {
      switch (event.key) {
        case 'F1':
          if (showEmergencyContact) {
            event.preventDefault();
            keyboardState.emergencyHighlight = true;
          }
          break;
        case 'F9':
          // System status toggle
          event.preventDefault();
          keyboardState.statusIndicatorActive = !keyboardState.statusIndicatorActive;
          break;
        case 'ArrowLeft':
        case 'ArrowRight':
          // Navigate between footer sections
          if (variant === 'public') {
            event.preventDefault();
            const maxSections = 3; // brand, content, apps
            if (event.key === 'ArrowLeft') {
              keyboardState.currentSectionIndex = Math.max(-1, keyboardState.currentSectionIndex - 1);
            } else {
              keyboardState.currentSectionIndex = Math.min(maxSections - 1, keyboardState.currentSectionIndex + 1);
            }
          }
          break;
        case 'Escape':
          // Clear all highlights and navigation
          keyboardState.emergencyHighlight = false;
          keyboardState.statusIndicatorActive = false;
          keyboardState.currentSectionIndex = -1;
          break;
      }
    }
  });
  
  const baseClasses = 'bg-neutral-darker text-white';
  
  const variantClasses = {
    public: 'py-12',
    simple: 'py-8',
    minimal: 'py-6'
  };

  const statusClasses = {
    online: 'status-online',
    maintenance: 'status-maintenance',
    emergency: 'status-emergency',
    offline: 'status-offline'
  };

  const footerClasses = mergeClasses(
    baseClasses,
    variantClasses[variant],
    medicalDeviceMode && "medical-device-mode",
    emergencyMode && "emergency-mode",
    enableWorkflowShortcuts && "workflow-shortcuts-enabled",
    systemStatus !== 'online' && statusClasses[systemStatus],
    keyboardState.emergencyHighlight && "emergency-highlight",
    keyboardState.shortcutPressed && "shortcut-pressed",
    qwikClass,
    className
  );

  // Enhanced ARIA attributes for medical contexts
  const footerRole = medicalDeviceMode ? 'contentinfo' : undefined;
  const ariaLabel = medicalDeviceMode 
    ? `${variant} footer - Medical device mode enabled - System status: ${systemStatus}`
    : undefined;

  const ariaDescription = [
    emergencyMode && 'Emergency footer',
    enableWorkflowShortcuts && 'Ctrl+H for help, Ctrl+E for emergency contact',
    showEmergencyContact && 'Emergency contact information available',
    `System status: ${systemStatus}`
  ].filter(Boolean).join('. ');

  // Merge styles if provided
  const finalStyle = mergeStyles(undefined, style);

  return (
    <div class="themed-content">
      <footer 
        class={footerClasses}
        style={finalStyle}
        onKeyDown$={handleKeyDown}
        role={footerRole}
        aria-label={ariaLabel}
        aria-describedby={ariaDescription ? 'footer-description' : undefined}
        tabIndex={medicalDeviceMode ? 0 : undefined}
        {...rest}
      >
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* System Status Indicator */}
          {(medicalDeviceMode || systemStatus !== 'online') && (
            <div 
              class={mergeClasses(
                "system-status-bar",
                `status-${systemStatus}`,
                keyboardState.statusIndicatorActive && "status-active"
              )}
              role="status"
              aria-live="polite"
              aria-label={`System status: ${systemStatus}`}
            >
              <div class="flex items-center justify-center py-2 text-sm">
                <span class="status-indicator mr-2">●</span>
                <span>System Status: {systemStatus.charAt(0).toUpperCase() + systemStatus.slice(1)}</span>
                {systemStatus === 'emergency' && <span class="ml-2">⚠️</span>}
              </div>
            </div>
          )}

          {variant === 'public' && (
            <Row gap="8" class="mb-8">
              {/* Brand Section */}
              <Column 
                size={{ sm: 12, lg: 3 }}
                class={keyboardState.currentSectionIndex === 0 && medicalDeviceMode ? "keyboard-focused" : ""}
              >
                <Slot name="brand" />
              </Column>
              
              {/* Content Links */}
              <Column 
                size={{ sm: 12, lg: 6 }}
                class={keyboardState.currentSectionIndex === 1 && medicalDeviceMode ? "keyboard-focused" : ""}
              >
                <Row gap="8">
                  <Slot name="content" />
                </Row>
              </Column>
              
              {/* Apps and Newsletter */}
              <Column 
                size={{ sm: 12, lg: 3 }} 
                class={mergeClasses(
                  "space-y-6",
                  keyboardState.currentSectionIndex === 2 && medicalDeviceMode && "keyboard-focused"
                )}
              >
                <Slot name="apps" />
                <Slot name="newsletter" />
              </Column>
            </Row>
          )}
          
          {variant === 'simple' && (
            <div class="space-y-4">
              <Slot />
            </div>
          )}
          
          {variant === 'minimal' && (
            <Slot />
          )}
          
          {/* Emergency Contact Section */}
          {showEmergencyContact && (
            <div 
              class={mergeClasses(
                "emergency-contact-section py-4 border-t border-neutral-darker",
                keyboardState.emergencyHighlight && "emergency-contact-highlight"
              )}
              role="alert"
              aria-live="assertive"
            >
              <div class="text-center">
                <span class="text-error-400 font-semibold">🚨 Emergency: </span>
                <a href="tel:911" class="text-error-300 hover:text-error-200 underline">Call 911</a>
                <span class="mx-2">|</span>
                <a href="tel:+1-800-MEDICAL" class="text-error-300 hover:text-error-200 underline">Medical Hotline: 1-800-MEDICAL</a>
              </div>
            </div>
          )}
          
          {/* Bottom Section */}
          <div class={variant === 'public' ? 'pt-8 border-t border-neutral-darker' : ''}>
            <Slot name="bottom" />
          </div>

          {/* Medical device keyboard shortcuts help */}
          {medicalDeviceMode && enableWorkflowShortcuts && (
            <div 
              id="footer-description"
              class="sr-only"
              aria-live="polite"
            >
              {ariaDescription}
            </div>
          )}
        </div>

        <style>{`
          /* Medical Device Mode Enhancements */
          .medical-device-mode {
            border-top: 2px solid transparent;
            transition: all 0.2s ease;
          }
          
          .medical-device-mode:focus {
            border-top-color: var(--primary-500);
            box-shadow: 0 -2px 0 2px var(--primary-200);
          }
          
          .emergency-mode {
            background: linear-gradient(180deg, var(--neutral-900) 0%, var(--error-900) 100%);
          }
          
          .emergency-highlight {
            animation: emergencyPulse 1s ease-in-out;
          }
          
          .shortcut-pressed {
            background: var(--primary-900);
            transform: scale(1.01);
          }
          
          .keyboard-focused {
            outline: 2px solid var(--primary-500);
            outline-offset: 2px;
            border-radius: 4px;
          }
          
          /* System Status Bar */
          .system-status-bar {
            background: var(--neutral-800);
            border-bottom: 1px solid var(--neutral-700);
            margin: -12px -4px 12px -4px;
            padding: 0 16px;
          }
          
          .status-online .status-indicator { color: var(--success-400); }
          .status-maintenance .status-indicator { color: var(--warning-400); }
          .status-emergency .status-indicator { color: var(--error-400); animation: pulse 2s infinite; }
          .status-offline .status-indicator { color: var(--neutral-500); }
          
          .status-active {
            background: var(--primary-800);
          }
          
          /* Emergency Contact */
          .emergency-contact-section {
            background: var(--error-900);
          }
          
          .emergency-contact-highlight {
            animation: emergencyContactPulse 1s ease-in-out;
          }
          
          @keyframes emergencyPulse {
            0%, 100% { background: var(--error-900); }
            50% { background: var(--error-800); }
          }
          
          @keyframes emergencyContactPulse {
            0%, 100% { background: var(--error-900); }
            50% { background: var(--error-700); }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </footer>
    </div>
  );
});
