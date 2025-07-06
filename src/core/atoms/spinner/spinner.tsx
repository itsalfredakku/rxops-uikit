import { component$, $, useStore } from "@builder.io/qwik";
import type { ComponentSize } from "../../../design-system/types";
import { BaseComponentProps, mergeClasses } from "../../../design-system/props";

export type SpinnerVariant = "circular" | "dots" | "bars";

export interface SpinnerProps extends BaseComponentProps<HTMLDivElement> {
  size?: ComponentSize;
  variant?: SpinnerVariant;
  color?: string;
  label?: string;
  /** Whether the spinner is interactive (can be cancelled with keyboard) */
  interactive?: boolean;
  /** Cancel handler for interactive spinners */
  onCancel$?: () => void;
  /** Medical device mode with enhanced accessibility */
  medicalDeviceMode?: boolean;
  /** Emergency mode for critical medical processes */
  emergencyMode?: boolean;
  /** Healthcare workflow shortcuts */
  enableWorkflowShortcuts?: boolean;
  /** Spinner purpose for healthcare contexts */
  purpose?: 'loading' | 'processing' | 'saving' | 'emergency' | 'critical';
  /** Progress percentage for medical processes (0-100) */
  progress?: number;
}

const sizeClasses: Record<ComponentSize, string> = {
  xs: "w-4 h-4",
  sm: "w-5 h-5",
  md: "w-6 h-6",
  lg: "w-8 h-8",
  xl: "w-10 h-10"
};

const dotSizeClasses: Record<ComponentSize, string> = {
  xs: "w-0.5 h-0.5",
  sm: "w-0.75 h-0.75", 
  md: "w-1 h-1",
  lg: "w-1.5 h-1.5",
  xl: "w-2 h-2"
};

const barSizeClasses: Record<ComponentSize, string> = {
  xs: "w-0.5",
  sm: "w-0.75",
  md: "w-1",
  lg: "w-1.5",
  xl: "w-2"
};

const getSpinnerClasses = (
  size: ComponentSize, 
  interactive: boolean = false,
  className?: string
) => {
  return mergeClasses(
    "inline-flex items-center justify-center relative",
    sizeClasses[size],
    interactive && [
      'cursor-pointer',
      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
    ],
    className
  );
};

const getDotClasses = (size: ComponentSize) => {
  return mergeClasses(
    "rounded-full animate-bounce",
    dotSizeClasses[size]
  );
};

const getBarClasses = (size: ComponentSize) => {
  return mergeClasses(
    "h-full animate-pulse",
    barSizeClasses[size]
  );
};

// Purpose-based colors for medical contexts
const purposeColors = {
  loading: 'currentColor',
  processing: '#3b82f6', // blue
  saving: '#10b981', // green
  emergency: '#f59e0b', // orange
  critical: '#ef4444' // red
};

/**
 * Spinner component with Medical Device Keyboard Accessibility.
 * 
 * Medical Device Keyboard Accessibility (for interactive spinners):
 * - Escape: Cancel loading operation (when interactive=true)
 * - Enhanced ARIA live regions for screen readers
 * - Progress announcements for medical processes
 * - WCAG 2.1 AA+ compliance with Section 508 support
 * - Emergency mode for critical medical operations
 */
export const Spinner = component$<SpinnerProps>((props) => {
  const {
    size = "md",
    variant = "circular",
    color,
    label = "Loading...",
    interactive = false,
    onCancel$,
    medicalDeviceMode = false,
    emergencyMode = false,
    enableWorkflowShortcuts = true,
    purpose = 'loading',
    progress,
    class: qwikClass,
    className,
    style,
    ...rest
  } = props;

  // Medical device keyboard accessibility state
  const keyboardState = useStore({
    hasFocus: false,
    isEmergencyMode: emergencyMode,
    shortcutPressed: false
  });

  // Determine color based on purpose or prop
  const effectiveColor = color || purposeColors[purpose];

  // Enhanced keyboard navigation for medical devices
  const handleKeyDown = $((event: KeyboardEvent) => {
    if (!interactive || !enableWorkflowShortcuts) return;
    
    switch (event.key) {
      case 'Escape':
        // Cancel loading operation
        event.preventDefault();
        if (onCancel$) {
          onCancel$();
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
    if (interactive) {
      keyboardState.hasFocus = true;
    }
  });

  const handleBlur = $(() => {
    keyboardState.hasFocus = false;
  });

  const spinnerClasses = mergeClasses(
    getSpinnerClasses(size, interactive, mergeClasses(qwikClass, className)),
    // Medical device enhanced focus indicators
    interactive && medicalDeviceMode && keyboardState.hasFocus && [
      'ring-4 ring-blue-200 shadow-lg'
    ],
    // Emergency mode styling
    keyboardState.isEmergencyMode && [
      'ring-2 ring-orange-400 bg-warning-lighter p-1 rounded'
    ]
  );

  // Enhanced label for medical contexts
  const effectiveLabel = medicalDeviceMode 
    ? `${label}${progress !== undefined ? ` - ${progress}% complete` : ''}${purpose === 'emergency' ? ' (Emergency)' : ''}`
    : label;

  const renderSpinner = () => {
    switch (variant) {
      case "circular":
        return (
          <svg class="w-full h-full animate-spin" viewBox="0 0 24 24" fill="none">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke={effectiveColor}
              stroke-width="2"
              stroke-linecap="round"
              opacity="0.25"
            />
            <path
              fill={effectiveColor}
              d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              opacity="0.75"
            />
            {/* Progress indicator for medical processes */}
            {progress !== undefined && (
              <circle
                cx="12"
                cy="12" 
                r="10"
                stroke={effectiveColor}
                stroke-width="3"
                stroke-linecap="round"
                fill="none"
                stroke-dasharray={`${progress * 0.628} 62.8`}
                transform="rotate(-90 12 12)"
                opacity="0.9"
              />
            )}
          </svg>
        );
      
      case "dots":
        return (
          <div class="flex items-center justify-center gap-1 w-full h-full">
            <div class={getDotClasses(size)} style={{ backgroundColor: effectiveColor, animationDelay: '-0.32s' }}></div>
            <div class={getDotClasses(size)} style={{ backgroundColor: effectiveColor, animationDelay: '-0.16s' }}></div>
            <div class={getDotClasses(size)} style={{ backgroundColor: effectiveColor }}></div>
          </div>
        );
      
      case "bars":
        return (
          <div class="flex items-center justify-center gap-0.5 w-full h-full">
            <div class={getBarClasses(size)} style={{ backgroundColor: effectiveColor, animationDelay: '-1.1s' }}></div>
            <div class={getBarClasses(size)} style={{ backgroundColor: effectiveColor, animationDelay: '-1.0s' }}></div>
            <div class={getBarClasses(size)} style={{ backgroundColor: effectiveColor, animationDelay: '-0.9s' }}></div>
            <div class={getBarClasses(size)} style={{ backgroundColor: effectiveColor, animationDelay: '-0.8s' }}></div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div class="themed-content">
      <div
        class={spinnerClasses}
        style={style}
        role="status"
        aria-label={
          interactive && medicalDeviceMode
            ? `${effectiveLabel} - Press Escape to cancel`
            : effectiveLabel
        }
        aria-live={medicalDeviceMode ? "polite" : undefined}
        aria-busy="true"
        tabIndex={interactive ? 0 : undefined}
        onKeyDown$={interactive ? handleKeyDown : undefined}
        onFocus$={interactive ? handleFocus : undefined}
        onBlur$={interactive ? handleBlur : undefined}
        data-medical-device={medicalDeviceMode}
        data-emergency-mode={keyboardState.isEmergencyMode}
        data-purpose={purpose}
        {...rest}
      >
        {renderSpinner()}
        
        {/* Medical device progress indicator */}
        {medicalDeviceMode && progress !== undefined && (
          <div class="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-neutral-normal whitespace-nowrap">
            {progress}%
          </div>
        )}
        
        {/* Emergency mode indicator */}
        {keyboardState.isEmergencyMode && (
          <div class="absolute -top-1 -right-1 w-3 h-3 bg-warning-normal rounded-full border-2 border-white animate-pulse">
            <span class="sr-only">Emergency mode active</span>
          </div>
        )}
        
        {/* Medical device keyboard shortcut indicator */}
        {interactive && medicalDeviceMode && keyboardState.shortcutPressed && (
          <div class="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-info-lighter text-primary-darker px-2 py-1 rounded text-xs font-medium whitespace-nowrap">
            Shortcut Active
          </div>
        )}
        
        <span class="sr-only">{effectiveLabel}</span>
      </div>
      
      {/* Medical device keyboard shortcuts help */}
      {interactive && medicalDeviceMode && enableWorkflowShortcuts && keyboardState.hasFocus && (
        <div class="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-neutral-normal whitespace-nowrap bg-white px-2 py-1 rounded shadow-sm border">
          Keys: Esc (cancel), Ctrl+E (emergency)
        </div>
      )}
    </div>
  );
});
