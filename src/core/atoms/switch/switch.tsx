import { component$, useSignal, $, useStore } from "@builder.io/qwik";
import type { ComponentSize } from "../../../design-system/types";
import { BaseComponentProps, mergeClasses } from "../../../design-system/props";

interface SwitchBaseProps {
  label?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  size?: ComponentSize;
  description?: string;
  required?: boolean;
  name?: string;
  id?: string;
  testId?: string;
  onValueChange$?: (checked: boolean) => void;
  /** Medical device keyboard support with enhanced focus indicators */
  medicalDeviceMode?: boolean;
  /** Emergency mode for critical medical toggles */
  emergencyMode?: boolean;
  /** Confirmation required for medical safety */
  requireConfirmation?: boolean;
  /** Healthcare workflow shortcuts */
  enableWorkflowShortcuts?: boolean;
}

export interface SwitchProps extends SwitchBaseProps, Omit<BaseComponentProps<HTMLDivElement>, keyof SwitchBaseProps | `on${string}$`> {}

const switchSizeClasses: Record<ComponentSize, {
  track: string;
  thumb: string;
  translate: (checked: boolean) => string;
  text: string;
  description: string;
}> = {
  xs: {
    track: "h-4 w-8",
    thumb: "h-2 w-2 mt-1",
    translate: (checked: boolean) => checked ? "translate-x-4" : "translate-x-1",
    text: "text-xs",
    description: "text-xs"
  },
  sm: {
    track: "h-5 w-9",
    thumb: "h-3 w-3 mt-1",
    translate: (checked: boolean) => checked ? "translate-x-5" : "translate-x-1",
    text: "text-sm",
    description: "text-xs"
  },
  md: {
    track: "h-6 w-11",
    thumb: "h-4 w-4 mt-1",
    translate: (checked: boolean) => checked ? "translate-x-6" : "translate-x-1",
    text: "text-base",
    description: "text-sm"
  },
  lg: {
    track: "h-7 w-13",
    thumb: "h-5 w-5 mt-1",
    translate: (checked: boolean) => checked ? "translate-x-7" : "translate-x-1",
    text: "text-lg",
    description: "text-base"
  },
  xl: {
    track: "h-8 w-15",
    thumb: "h-6 w-6 mt-1",
    translate: (checked: boolean) => checked ? "translate-x-8" : "translate-x-1",
    text: "text-xl",
    description: "text-lg"
  }
};

/**
 * Switch component with comprehensive keyboard accessibility for medical devices.
 * 
 * Medical Device Keyboard Accessibility:
 * - Enter/Space: Toggle switch state (primary activation)
 * - Escape: Cancel confirmation dialog (if requireConfirmation=true)
 * - Enhanced focus indicators for clinical environments
 * - Confirmation dialogs for critical medical toggles
 * - WCAG 2.1 AA+ compliance with Section 508 support
 * - Screen reader optimization for medical workflows
 */
export const Switch = component$<SwitchProps>((props) => {
  const {
    label,
    checked,
    defaultChecked = false,
    disabled = false,
    size = "md",
    description,
    required = false,
    name,
    id,
    class: qwikClass,
    className,
    style,
    testId,
    onValueChange$,
    medicalDeviceMode = false,
    emergencyMode = false,
    requireConfirmation = false,
    enableWorkflowShortcuts = true,
    ...rest
  } = props;
  
  const internalChecked = useSignal(checked ?? defaultChecked);
  const switchId = id || `switch-${Math.random().toString(36).substr(2, 9)}`;
  const sizeClasses = switchSizeClasses[size];
  
  // Medical device keyboard accessibility state
  const keyboardState = useStore({
    hasFocus: false,
    showConfirmation: false,
    pendingValue: false,
    isEmergencyMode: emergencyMode,
    shortcutPressed: false
  });

  // Enhanced toggle with medical device confirmation
  const handleToggle = $(async () => {
    if (disabled) return;
    
    const newValue = !internalChecked.value;
    
    // Medical device confirmation for critical toggles
    if (requireConfirmation && medicalDeviceMode) {
      keyboardState.showConfirmation = true;
      keyboardState.pendingValue = newValue;
      return;
    }
    
    // Direct toggle for standard operation
    internalChecked.value = newValue;
    onValueChange$?.(newValue);
  });
  
  // Confirmation handlers for medical safety
  const confirmToggle = $(() => {
    internalChecked.value = keyboardState.pendingValue;
    onValueChange$?.(keyboardState.pendingValue);
    keyboardState.showConfirmation = false;
  });
  
  const cancelToggle = $(() => {
    keyboardState.showConfirmation = false;
    keyboardState.pendingValue = false;
  });

  // Enhanced keyboard navigation for medical devices
  const handleKeyDown = $((event: KeyboardEvent) => {
    if (!enableWorkflowShortcuts) return;
    
    switch (event.key) {
      case 'Enter':
      case ' ':
        // Primary activation - Enter and Space both toggle
        event.preventDefault();
        if (keyboardState.showConfirmation) {
          // Confirm if in confirmation mode
          confirmToggle();
        } else {
          // Standard toggle
          handleToggle();
        }
        break;
        
      case 'Escape':
        // Cancel confirmation dialog
        if (keyboardState.showConfirmation) {
          event.preventDefault();
          cancelToggle();
        }
        break;
        
      case 'y':
      case 'Y':
        // Quick "Yes" confirmation in medical contexts
        if (keyboardState.showConfirmation && medicalDeviceMode) {
          event.preventDefault();
          confirmToggle();
        }
        break;
        
      case 'n':
      case 'N':
        // Quick "No" cancellation in medical contexts
        if (keyboardState.showConfirmation && medicalDeviceMode) {
          event.preventDefault();
          cancelToggle();
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
      cancelToggle();
    }
  });

  const wrapperClasses = mergeClasses(
    "flex items-start gap-3",
    qwikClass,
    className
  );

  // Enhanced track styling for medical device accessibility
  const trackClasses = `
    relative inline-flex ${sizeClasses.track} cursor-pointer rounded-full 
    transition-all duration-200 ease-in-out
    focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2
    hover:shadow-md hover:scale-105
    ${disabled ? "cursor-not-allowed opacity-50 hover:shadow-none hover:scale-100" : ""}
    ${internalChecked.value ? "bg-primary-dark hover:bg-primary-darker" : "bg-neutral-light hover:bg-neutral-normal"}
    ${medicalDeviceMode && keyboardState.hasFocus ? "ring-4 ring-blue-200 shadow-lg" : ""}
    ${keyboardState.isEmergencyMode ? "ring-2 ring-orange-400 bg-warning-lighter" : ""}
    ${keyboardState.showConfirmation ? "ring-2 ring-warning-normal bg-warning-lighter" : ""}
  `;

  return (
    <div class="themed-content">
      <div 
        class={wrapperClasses} 
        style={style}
        data-testid={testId}
        data-medical-device={medicalDeviceMode}
        data-emergency-mode={keyboardState.isEmergencyMode}
        {...rest}
      >
      <label 
        for={switchId} 
        class={`flex items-center gap-3 cursor-pointer ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
      >
        <input
          type="checkbox"
          id={switchId}
          name={name}
          checked={internalChecked.value}
          disabled={disabled}
          required={required}
          onChange$={handleToggle}
          onKeyDown$={handleKeyDown}
          onFocus$={handleFocus}
          onBlur$={handleBlur}
          class="sr-only"
          aria-describedby={description ? `${switchId}-desc` : undefined}
          // Enhanced ARIA for medical device accessibility
          aria-label={
            medicalDeviceMode 
              ? `${label || 'Medical switch'} - Use Enter or Space to toggle${requireConfirmation ? ', confirmation required' : ''}`
              : undefined
          }
          role="switch"
          aria-checked={internalChecked.value}
        />
        
        <span class={trackClasses}>
          <span 
            class={`
              inline-block ${sizeClasses.thumb} transform rounded-full bg-white shadow 
              transition-all duration-200 ease-in-out hover:shadow-lg
              ${sizeClasses.translate(internalChecked.value)}
              ${medicalDeviceMode && keyboardState.hasFocus ? "shadow-xl ring-2 ring-info-light" : ""}
              ${keyboardState.isEmergencyMode ? "bg-warning-lighter ring-1 ring-orange-400" : ""}
            `}
          />
          
          {/* Medical device keyboard feedback indicator */}
          {medicalDeviceMode && keyboardState.shortcutPressed && (
            <div class="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-info-lighter text-primary-darker px-2 py-1 rounded text-xs font-medium whitespace-nowrap">
              Shortcut Active
            </div>
          )}
        </span>
        
        {label && (
          <span class={`font-medium text-neutral-darker ${disabled ? "text-neutral" : ""} ${sizeClasses.text}`}>
            {label}
            {required && <span class="text-error ml-1">*</span>}
            {keyboardState.isEmergencyMode && (
              <span class="text-warning-normal ml-2 text-sm font-medium">
                (Emergency)
              </span>
            )}
          </span>
        )}
      </label>
      
      {description && (
        <p 
          id={`${switchId}-desc`} 
          class={`text-neutral-dark mt-1 ${sizeClasses.description}`}
        >
          {description}
          {keyboardState.isEmergencyMode && (
            <span class="text-warning-normal ml-2 font-medium">
              Emergency mode active
            </span>
          )}
        </p>
      )}
      
      {/* Medical device keyboard shortcuts help */}
      {medicalDeviceMode && enableWorkflowShortcuts && (
        <div class="text-xs text-neutral-normal mt-1">
          Keys: Enter/Space (toggle){requireConfirmation && ', Y/N (confirm)'}, Esc (cancel)
        </div>
      )}
      
      {/* Confirmation dialog for medical safety */}
      {keyboardState.showConfirmation && (
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white p-6 rounded-lg shadow-xl max-w-md mx-4">
            <h3 class="text-lg font-semibold text-neutral-darker mb-3">
              Confirm Toggle Action
            </h3>
            <p class="text-neutral-dark mb-4">
              Are you sure you want to {keyboardState.pendingValue ? 'enable' : 'disable'} {label || 'this switch'}?
              {keyboardState.isEmergencyMode && (
                <span class="block text-warning-normal font-medium mt-1">
                  This is an emergency mode operation.
                </span>
              )}
            </p>
            <div class="flex gap-3 justify-end">
              <button 
                type="button"
                onClick$={cancelToggle}
                onKeyDown$={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    cancelToggle();
                  }
                }}
                class="px-4 py-2 border border-neutral-light rounded-md text-neutral-dark hover:bg-neutral-lighter focus:ring-2 focus:ring-neutral-200"
              >
                Cancel (N)
              </button>
              <button 
                type="button"
                onClick$={confirmToggle}
                onKeyDown$={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    confirmToggle();
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
    </div>
  );
});
