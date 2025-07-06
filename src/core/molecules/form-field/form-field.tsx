import { component$, Slot, $, useSignal, useStore, QRL } from "@builder.io/qwik";
import type { BaseComponentProps } from "../../../design-system/props";
import { mergeClasses } from "../../../design-system/props";
import { Column } from "../../../layouts/column";

export interface FormFieldProps extends BaseComponentProps<HTMLDivElement> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  /** Medical device keyboard support with enhanced focus indicators */
  medicalDeviceMode?: boolean;
  /** Emergency mode for critical medical form fields */
  emergencyMode?: boolean;
  /** Healthcare validation context */
  validationContext?: 'patient-id' | 'medication' | 'dosage' | 'allergy' | 'vital-signs' | 'emergency' | 'default';
  /** Enable healthcare workflow shortcuts */
  enableWorkflowShortcuts?: boolean;
  /** Real-time validation for medical data */
  enableRealTimeValidation?: boolean;
  /** Keyboard shortcut for quick save */
  onSave$?: QRL<() => void>;
  /** Keyboard shortcut for emergency action */
  onEmergency$?: QRL<() => void>;
}

export const FormField = component$<FormFieldProps>((props) => {
  const { 
    label, 
    error, 
    hint, 
    required,
    medicalDeviceMode = false,
    emergencyMode = false,
    validationContext = 'default',
    enableWorkflowShortcuts = false,
    enableRealTimeValidation = false,
    onSave$,
    onEmergency$,
    class: qwikClass,
    className,
    style,
    testId,
    onKeyDown$,
    size: _size, // Mark as unused with underscore
    ...rest
  } = props;

  // Enhanced keyboard state for medical devices
  const keyboardState = useStore({
    showValidation: false,
    validationMessage: '',
    emergencyHighlight: false,
    shortcutPressed: false
  });

  const fieldId = useSignal(`form-field-${Math.random().toString(36).substr(2, 9)}`);

  // Enhanced keyboard support for medical devices
  const handleKeyDown = $((event: KeyboardEvent) => {
    if (event.defaultPrevented) return;

    // Healthcare workflow shortcuts
    if (enableWorkflowShortcuts) {
      const isCtrlOrCmd = event.ctrlKey || event.metaKey;
      
      if (isCtrlOrCmd) {
        switch (event.key.toLowerCase()) {
          case 's':
            // Quick save for medical data
            event.preventDefault();
            onSave$?.();
            keyboardState.shortcutPressed = true;
            setTimeout(() => keyboardState.shortcutPressed = false, 200);
            break;
          case 'e':
            // Emergency action
            if (emergencyMode) {
              event.preventDefault();
              onEmergency$?.();
              keyboardState.emergencyHighlight = true;
              setTimeout(() => keyboardState.emergencyHighlight = false, 1000);
            }
            break;
          case 'v':
            // Toggle validation display
            if (enableRealTimeValidation) {
              event.preventDefault();
              keyboardState.showValidation = !keyboardState.showValidation;
            }
            break;
        }
      }
    }

    // Medical device standard controls
    if (medicalDeviceMode) {
      switch (event.key) {
        case 'F1':
          if (validationContext === 'emergency') {
            event.preventDefault();
            onEmergency$?.();
          }
          break;
        case 'Escape':
          // Clear validation highlights
          keyboardState.showValidation = false;
          keyboardState.emergencyHighlight = false;
          break;
      }
    }

    // Context-specific shortcuts
    switch (validationContext) {
      case 'patient-id':
        if (event.key === 'F2') {
          event.preventDefault();
          // In real implementation, this would open patient lookup
          keyboardState.validationMessage = 'Patient ID validation triggered';
          keyboardState.showValidation = true;
        }
        break;
      case 'medication':
        if (event.key === 'F3') {
          event.preventDefault();
          // In real implementation, this would open medication lookup
          keyboardState.validationMessage = 'Medication validation triggered';
          keyboardState.showValidation = true;
        }
        break;
      case 'emergency':
        if (event.key === 'F1') {
          event.preventDefault();
          onEmergency$?.();
          keyboardState.emergencyHighlight = true;
        }
        break;
    }
  });

  const wrapperClass = mergeClasses(
    "ui-form-field",
    medicalDeviceMode && "medical-device-mode",
    emergencyMode && "emergency-mode",
    validationContext !== 'default' && `validation-context-${validationContext}`,
    enableWorkflowShortcuts && "workflow-shortcuts-enabled",
    keyboardState.emergencyHighlight && "emergency-highlight",
    keyboardState.shortcutPressed && "shortcut-pressed",
    qwikClass,
    className
  );

  // Enhanced ARIA attributes for medical contexts
  const fieldAriaLabel = medicalDeviceMode 
    ? `${label || 'Form field'} - Medical device mode enabled - ${validationContext} validation`
    : label || 'Form field';

  const fieldAriaDescription = [
    hint,
    enableWorkflowShortcuts && 'Ctrl+S to save, Ctrl+E for emergency',
    medicalDeviceMode && 'Enhanced keyboard navigation enabled',
    validationContext !== 'default' && `${validationContext} validation context`
  ].filter(Boolean).join('. ');
  
  return (
    <div class="themed-content">
      <Column 
        gap="1"
        class={wrapperClass}
        style={style}
        data-testid={testId}
        onKeyDown$={handleKeyDown}
        aria-label={fieldAriaLabel}
        aria-describedby={fieldAriaDescription ? `${fieldId.value}-description` : undefined}
        role={medicalDeviceMode ? 'group' : undefined}
        {...rest}
      >
        {label && (
          <label 
            class={mergeClasses(
              "ui-form-field-label block text-sm font-medium text-neutral-dark",
              emergencyMode && "emergency-label",
              medicalDeviceMode && "medical-device-label"
            )}
            for={fieldId.value}
          >
            {label}
            {required && <span class="text-error-500 ml-1" aria-label="required">*</span>}
            {emergencyMode && <span class="emergency-indicator ml-2" aria-label="emergency field">⚠️</span>}
          </label>
        )}
        
        <div 
          class={mergeClasses(
            "ui-form-field-input",
            medicalDeviceMode && "medical-device-input",
            emergencyMode && "emergency-input"
          )}
          id={fieldId.value}
        >
          <Slot />
        </div>
        
        {/* Enhanced validation and hint display */}
        {(hint || keyboardState.validationMessage) && !error && (
          <p 
            class="ui-form-field-hint text-xs text-neutral-normal"
            id={`${fieldId.value}-description`}
          >
            {keyboardState.showValidation && keyboardState.validationMessage 
              ? keyboardState.validationMessage 
              : hint}
          </p>
        )}
        
        {error && (
          <p 
            class={mergeClasses(
              "ui-form-field-error text-xs text-error-600",
              emergencyMode && "emergency-error",
              medicalDeviceMode && "medical-device-error"
            )}
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}

        {/* Medical device keyboard shortcuts help */}
        {medicalDeviceMode && enableWorkflowShortcuts && (
          <div class="keyboard-shortcuts-help text-xs text-neutral-light mt-1">
            <span>Shortcuts: </span>
            <kbd>Ctrl+S</kbd> Save • 
            {emergencyMode && <><kbd>Ctrl+E</kbd> Emergency • </>}
            <kbd>Esc</kbd> Clear
          </div>
        )}
      </Column>
    </div>
  );
});
