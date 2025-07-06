import { component$, useSignal, useStore, $ } from "@builder.io/qwik";
import { createVariantClass } from "../../../design-system/component-base";
import type { ComponentSize } from "../../../design-system/types";
import type { BaseComponentProps } from "../../../design-system/props";
import { mergeClasses } from "../../../design-system/props";

export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
}

export type RadioSize = ComponentSize;
export type RadioDirection = "horizontal" | "vertical";

export type RadioContext = 
  | 'treatment-selection'
  | 'symptom-assessment'
  | 'medication-dosage'
  | 'priority-level'
  | 'diagnostic-option'
  | 'therapy-type'
  | 'consent-type'
  | 'default';

interface RadioBaseProps {
  name: string;
  options: RadioOption[];
  value?: string;
  defaultValue?: string;  
  direction?: RadioDirection;
  size?: RadioSize;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  helperText?: string;
  onValueChange$?: (value: string) => void;
  
  // Medical device keyboard accessibility props
  medicalDeviceMode?: boolean;
  enableWorkflowShortcuts?: boolean;
  radioContext?: RadioContext;
  requireConfirmation?: boolean;
  audioFeedback?: boolean;
}

export interface RadioProps extends RadioBaseProps, Omit<BaseComponentProps<HTMLDivElement>, keyof RadioBaseProps | `on${string}$`> {}

// Radio variant configuration
const radioGroupVariants = createVariantClass({
  base: "radio-group",
  variants: {
    vertical: "space-y-3",
    horizontal: "flex flex-wrap gap-4",
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  }
});

const radioOptionVariants = createVariantClass({
  base: "radio-option relative flex items-start",
  variants: {
    sm: "gap-2",
    md: "gap-3",
    lg: "gap-4"
  }
});

const radioInputVariants = createVariantClass({
  base: [
    "peer absolute h-full w-full appearance-none rounded-full border-2 cursor-pointer",
    "transition-all duration-200 ease-in-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500",
    "disabled:cursor-not-allowed disabled:opacity-50"
  ].join(" "),
  variants: {
    default: [
      "border-neutral-light bg-white",
      "hover:border-neutral-normal",
      "checked:bg-primary-600 checked:border-primary-600"
    ].join(" ")
  }
});

const radioIndicatorVariants = createVariantClass({
  base: [
    "radio-indicator relative flex items-center justify-center rounded-full border-2",
    "transition-all duration-200 ease-in-out",
    "peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-primary-500",
    "peer-disabled:opacity-50"
  ].join(" "),
  variants: {
    default: [
      "border-neutral-light bg-white",
      "peer-hover:border-neutral-normal",
      "peer-checked:bg-primary-600 peer-checked:border-primary-600"
    ].join(" "),
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6"
  }
});

const radioDotVariants = createVariantClass({
  base: [
    "radio-dot rounded-full bg-white opacity-0 transition-opacity duration-200",
    "peer-checked:opacity-100"
  ].join(" "),
  variants: {
    sm: "h-1.5 w-1.5",
    md: "h-2 w-2",
    lg: "h-2.5 w-2.5"
  }
});

const radioLabelVariants = createVariantClass({
  base: [
    "radio-label cursor-pointer font-medium text-neutral-darker flex items-start gap-3",
    "peer-disabled:cursor-not-allowed peer-disabled:text-neutral-normal"
  ].join(" "),
  variants: {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  }
});

const radioDescriptionVariants = createVariantClass({
  base: "radio-description text-neutral-normal mt-1",
  variants: {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  }
});

export const Radio = component$<RadioProps>((props) => {
  const {
    name,
    options,
    value,
    defaultValue,
    direction = "vertical",
    size = "md",
    disabled = false,
    required = false,
    error,
    helperText,
    onValueChange$,
    
    // Medical device keyboard accessibility props
    medicalDeviceMode = false,
    enableWorkflowShortcuts = false,
    radioContext = 'default',
    requireConfirmation = false,
    audioFeedback = false,
    
    class: qwikClass,
    className,
    style,
    testId,
    ...rest
  } = props;
  
  const internalValue = useSignal(value || defaultValue || "");
  const hasError = !!error;
  
  // Medical device keyboard state for enhanced accessibility
  const keyboardState = useStore({
    confirmationPending: false,
    pendingValue: '',
    confirmationTimeout: 3000,
    lastShortcutTime: 0
  });

  const handleChange = $((newValue: string) => {
    if (requireConfirmation && medicalDeviceMode) {
      // Start confirmation process for critical radio selections
      keyboardState.confirmationPending = true;
      keyboardState.pendingValue = newValue;
      
      if (audioFeedback) {
        console.log(`Confirmation required for ${radioContext} selection: ${newValue}`);
      }
      
      // Auto-cancel confirmation after timeout
      setTimeout(() => {
        if (keyboardState.confirmationPending) {
          keyboardState.confirmationPending = false;
          keyboardState.pendingValue = '';
        }
      }, keyboardState.confirmationTimeout);
      
      return;
    }
    
    // Standard or confirmed selection
    internalValue.value = newValue;
    onValueChange$?.(newValue);
    
    if (audioFeedback) {
      console.log(`${radioContext} selected: ${newValue}`);
    }
  });

  const handleConfirmedChange = $((confirmedValue: string) => {
    keyboardState.confirmationPending = false;
    keyboardState.pendingValue = '';
    internalValue.value = confirmedValue;
    onValueChange$?.(confirmedValue);
    
    if (audioFeedback) {
      console.log(`${radioContext} confirmed: ${confirmedValue}`);
    }
  });

  // Enhanced keyboard event handler for medical device radio groups
  const handleKeyDown$ = $((event: KeyboardEvent) => {
    if (disabled) return;
    
    const currentIndex = options.findIndex(opt => opt.value === internalValue.value);
    let nextIndex = currentIndex;
    
    // Medical device workflow shortcuts
    if (medicalDeviceMode && enableWorkflowShortcuts) {
      const now = Date.now();
      
      // Rate limit shortcuts to prevent accidental activation
      if (now - keyboardState.lastShortcutTime < 500) return;
      
      switch (radioContext) {
        case 'treatment-selection':
          if (event.ctrlKey && event.key === 't') {
            event.preventDefault();
            keyboardState.lastShortcutTime = now;
            console.log('Treatment guidelines opened');
            return;
          }
          break;
        case 'symptom-assessment':
          if (event.ctrlKey && event.key === 's') {
            event.preventDefault();
            keyboardState.lastShortcutTime = now;
            console.log('Symptom severity guide opened');
            return;
          }
          break;
        case 'medication-dosage':
          if (event.ctrlKey && event.key === 'd') {
            event.preventDefault();
            keyboardState.lastShortcutTime = now;
            console.log('Dosage calculator opened');
            return;
          }
          break;
        case 'priority-level':
          if (event.ctrlKey && event.key === 'p') {
            event.preventDefault();
            keyboardState.lastShortcutTime = now;
            console.log('Priority protocol opened');
            return;
          }
          break;
        case 'diagnostic-option':
          if (event.ctrlKey && event.key === 'r') {
            event.preventDefault();
            keyboardState.lastShortcutTime = now;
            console.log('Reference materials opened');
            return;
          }
          break;
      }
    }
    
    // Handle confirmation pending state
    if (keyboardState.confirmationPending) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleConfirmedChange(keyboardState.pendingValue);
        return;
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        keyboardState.confirmationPending = false;
        keyboardState.pendingValue = '';
        return;
      }
    }
    
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        // Move to next non-disabled option
        do {
          nextIndex = (nextIndex + 1) % options.length;
        } while (options[nextIndex].disabled && nextIndex !== currentIndex);
        break;
        
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        // Move to previous non-disabled option
        do {
          nextIndex = nextIndex === 0 ? options.length - 1 : nextIndex - 1;
        } while (options[nextIndex].disabled && nextIndex !== currentIndex);
        break;
        
      case 'Home':
        event.preventDefault();
        // Move to first non-disabled option
        nextIndex = 0;
        while (options[nextIndex].disabled && nextIndex < options.length - 1) {
          nextIndex++;
        }
        break;
        
      case 'End':
        event.preventDefault();
        // Move to last non-disabled option
        nextIndex = options.length - 1;
        while (options[nextIndex].disabled && nextIndex > 0) {
          nextIndex--;
        }
        break;
        
      case 'Escape':
        event.preventDefault();
        (event.target as HTMLElement).blur();
        return;
        
      // Enhanced navigation for medical devices
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
        if (medicalDeviceMode) {
          event.preventDefault();
          const numberIndex = parseInt(event.key) - 1;
          if (numberIndex >= 0 && numberIndex < options.length && !options[numberIndex].disabled) {
            nextIndex = numberIndex;
          }
        }
        break;
        
      default:
        return;
    }
    
    if (nextIndex !== currentIndex && !options[nextIndex].disabled) {
      handleChange(options[nextIndex].value);
      // Focus the newly selected radio button
      setTimeout(() => {
        const nextRadio = document.getElementById(`${name}-${options[nextIndex].value}`);
        if (nextRadio) nextRadio.focus();
      }, 0);
    }
  });

  const groupClass = mergeClasses(radioGroupVariants({
      [direction]: true,
      [size]: true
    }),
    hasError && "text-error-600",
    medicalDeviceMode && "focus-within:ring-2 focus-within:ring-offset-1 focus-within:ring-primary-500",
    keyboardState.confirmationPending && "ring-2 ring-warning-500 ring-offset-2",
    qwikClass,
    className
  );

  return (
    <div class="themed-content">
      <div 
        class={groupClass} 
        style={style}
        data-testid={testId}
        role="radiogroup"
        aria-invalid={hasError}
        aria-describedby={error ? `${name}-error` : helperText ? `${name}-helper` : undefined}
        onKeyDown$={handleKeyDown$}
        {...rest}
      >
        <div class="radio-options">
          {options.map((option) => {
            const isChecked = internalValue.value === option.value;
            const optionId = `${name}-${option.value}`;
            const isDisabled = disabled || option.disabled;

            const optionClass = radioOptionVariants({
              [size]: true
            });

            return (
            <div key={option.value} class={optionClass}>
              <div class="relative">
                <input
                  type="radio"
                  id={optionId}
                  name={name}
                  value={option.value}
                  checked={isChecked}
                  disabled={isDisabled}
                  required={required}
                  class={mergeClasses(radioInputVariants({ default: true }),
                    // Enhanced focus indicators for medical devices
                    medicalDeviceMode && "focus:ring-4 focus:ring-primary-500/70 focus:ring-offset-4",
                    medicalDeviceMode && "focus:shadow-xl focus:border-primary-600",
                    // Standard focus indicators for clinical environments
                    !medicalDeviceMode && "focus:ring-4 focus:ring-primary-500/70 focus:ring-offset-2",
                    !medicalDeviceMode && "focus:shadow-lg focus:border-primary-600"
                  )}
                  aria-invalid={hasError}
                  tabIndex={isChecked ? 0 : -1}
                  onChange$={(event) => {
                    const target = event.target as HTMLInputElement;
                    handleChange(target.value);
                  }}
                />
                <div class={radioIndicatorVariants({ default: true, [size]: true })}>
                  <div class={radioDotVariants({ [size]: true })} />
                </div>
              </div>

              <label for={optionId} class={radioLabelVariants({ [size]: true })}>
                <div class="radio-content flex-1">
                  <span class="radio-text">{option.label}</span>
                  {option.description && (
                    <div class={radioDescriptionVariants({ [size]: true })}>
                      {option.description}
                    </div>
                  )}
                </div>
              </label>
            </div>
          );
        })}        </div>

        {/* Medical device confirmation prompt */}
        {medicalDeviceMode && keyboardState.confirmationPending && (
          <div class="mt-4 p-3 bg-warning-50 border border-warning-200 rounded-lg">
            <div class="flex items-center gap-2">
              <div class="h-2 w-2 bg-warning-500 rounded-full animate-pulse" />
              <p class="text-warning-800 text-sm font-medium">
                Confirmation Required
              </p>
            </div>
            <p class="text-warning-700 text-sm mt-1">
              Press <kbd class="px-1 py-0.5 bg-warning-200 rounded text-xs">Enter</kbd> to confirm 
              selection: "<span class="font-semibold">{options.find(opt => opt.value === keyboardState.pendingValue)?.label}</span>"
            </p>
            <p class="text-warning-600 text-xs mt-1">
              Press <kbd class="px-1 py-0.5 bg-warning-200 rounded text-xs">Esc</kbd> to cancel
            </p>
          </div>
        )}

        {/* Medical device workflow shortcuts help */}
        {medicalDeviceMode && enableWorkflowShortcuts && !keyboardState.confirmationPending && (
          <div class="mt-3 p-2 bg-primary-50 border border-primary-200 rounded text-xs text-primary-700">
            <p class="font-medium mb-1">Quick Actions:</p>
            <div class="flex flex-wrap gap-2">
              {radioContext === 'treatment-selection' && (
                <span><kbd class="px-1 bg-primary-200 rounded">Ctrl+T</kbd> Guidelines</span>
              )}
              {radioContext === 'symptom-assessment' && (
                <span><kbd class="px-1 bg-primary-200 rounded">Ctrl+S</kbd> Severity Guide</span>
              )}
              {radioContext === 'medication-dosage' && (
                <span><kbd class="px-1 bg-primary-200 rounded">Ctrl+D</kbd> Calculator</span>
              )}
              {radioContext === 'priority-level' && (
                <span><kbd class="px-1 bg-primary-200 rounded">Ctrl+P</kbd> Protocol</span>
              )}
              {radioContext === 'diagnostic-option' && (
                <span><kbd class="px-1 bg-primary-200 rounded">Ctrl+R</kbd> References</span>
              )}
              <span><kbd class="px-1 bg-primary-200 rounded">1-9</kbd> Quick Select</span>
            </div>
          </div>
        )}

      {(error || helperText) && (
        <div class="radio-footer mt-2">
          {error && (
            <p id={`${name}-error`} class="text-error-600 text-sm" role="alert">
              {error}
            </p>
          )}
          {!error && helperText && (
            <p id={`${name}-helper`} class="text-neutral-normal text-sm">
              {helperText}
            </p>
          )}
        </div>
      )}
      </div>
    </div>
  );
});
