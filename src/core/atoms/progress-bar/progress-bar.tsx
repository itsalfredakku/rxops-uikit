import { component$, useTask$, useSignal, useStore, $ } from "@builder.io/qwik";
import { BaseComponentProps, mergeClasses } from "../../../design-system/props";
import { Text } from "../../atoms/text/text";
import { Icon, type IconName } from "../../atoms/icon";
import { hipaaAuditor } from "../../../utils/hipaa";

export interface ProgressBarProps extends BaseComponentProps<HTMLDivElement> {
  /** Current progress value (0-100) */
  value: number;
  /** Maximum value (default: 100) */
  max?: number;
  /** Size of the progress bar */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Color variant */
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  /** Visual variant */
  variant?: 'default' | 'striped' | 'animated' | 'medical';
  /** Whether to show percentage text */
  showPercentage?: boolean;
  /** Whether to show value text */
  showValue?: boolean;
  /** Custom label text */
  label?: string;
  /** Whether the progress is indeterminate */
  indeterminate?: boolean;
  /** Custom icon to show at the beginning */
  icon?: IconName;
  /** Healthcare-specific context */
  healthcareContext?: {
    type: 'vital-signs' | 'medication-compliance' | 'recovery-progress' | 'file-upload' | 'form-completion';
    patientId?: string;
    critical?: boolean;
    target?: number;
  };
  /** Medical device keyboard support with enhanced focus indicators */
  medicalDeviceMode?: boolean;
  /** Enable healthcare workflow shortcuts */
  enableWorkflowShortcuts?: boolean;
  /** Progress context for healthcare applications */
  progressContext?: 'vital-monitoring' | 'treatment-progress' | 'medication-schedule' | 'file-transfer' | 'default';
  /** Make progress bar interactive (focusable) */
  interactive?: boolean;
  /** Callback when progress bar is activated (clicked or Enter pressed) */
  onActivate?: () => void;
}

export const ProgressBar = component$<ProgressBarProps>((props) => {
  const animationActive = useSignal(false);
  const max = props.max || 100;
  const percentage = Math.min(Math.max((props.value / max) * 100, 0), 100);
  
  // Track progress changes for healthcare compliance
  useTask$(({ track }) => {
    track(() => props.value);
    
    if (props.healthcareContext) {
      hipaaAuditor.logProgress({
        type: props.healthcareContext.type,
        value: props.value,
        percentage,
        patientId: props.healthcareContext.patientId,
        critical: props.healthcareContext.critical,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Trigger animation for medical variant
  useTask$(({ track }) => {
    track(() => props.variant);
    if (props.variant === 'medical' || props.variant === 'animated') {
      animationActive.value = true;
      setTimeout(() => animationActive.value = false, 1000);
    }
  });

  // Medical device keyboard state
  const keyboardState = useStore({
    instructionsId: `progress-instructions-${Math.random().toString(36).substr(2, 9)}`,
  });

  // Handle progress bar activation (click or keyboard)
  const handleActivate = $(() => {
    if (props.interactive && props.onActivate) {
      props.onActivate();
    }
  });

  const sizeClasses = {
    xs: "h-1",
    sm: "h-2", 
    md: "h-3",
    lg: "h-4",
    xl: "h-6"
  };

  const colorClasses = {
    primary: "bg-primary-600",
    secondary: "bg-secondary-600", 
    success: "bg-success-600",
    warning: "bg-warning-600",
    error: "bg-error-600",
    info: "bg-primary-600"
  };

  const backgroundClasses = {
    primary: "bg-primary-100",
    secondary: "bg-secondary-100",
    success: "bg-success-100", 
    warning: "bg-warning-100",
    error: "bg-error-100",
    info: "bg-primary-100"
  };

  const getProgressClasses = () => {
    const baseClasses = [
      "transition-all duration-300 ease-out",
      colorClasses[props.color || 'primary']
    ];

    if (props.variant === 'striped') {
      baseClasses.push(
        "bg-gradient-to-r from-transparent via-white/20 to-transparent",
        "bg-size-8 bg-repeat-x"
      );
    }

    if (props.variant === 'animated' || (props.variant === 'medical' && animationActive.value)) {
      baseClasses.push("animate-pulse");
    }

    if (props.variant === 'medical') {
      baseClasses.push(
        "shadow-sm",
        props.healthcareContext?.critical ? "animate-pulse" : ""
      );
    }

    return mergeClasses(...baseClasses);
  };

  const getStatusIcon = () => {
    if (!props.healthcareContext) return null;
    
    if (percentage >= 100) {
      return <Icon icon="check-circle" size={16} class="text-success-normal" />;
    }
    
    if (props.healthcareContext.critical && percentage < 50) {
      return <Icon icon="alert-triangle" size={16} class="text-error-600" />;
    }
    
    if (props.icon) {
      return <Icon icon={props.icon} size={16} />;
    }
    
    return null;
  };

  const formatValue = () => {
    if (props.showPercentage) {
      return `${Math.round(percentage)}%`;
    }
    if (props.showValue) {
      return `${props.value}${props.healthcareContext?.target ? `/${props.healthcareContext.target}` : `/${max}`}`;
    }
    return null;
  };

  return (
    <div class="themed-content">
      <div 
        class={mergeClasses(
          "progress-bar-container",
          // Medical device enhancements
          props.medicalDeviceMode && "focus:outline-none focus:ring-2 focus:ring-offset-1",
          props.healthcareContext?.critical ? "focus:ring-error-500" : "focus:ring-primary-500",
          props.interactive && "cursor-pointer hover:opacity-80 transition-opacity",
          props.medicalDeviceMode && props.interactive && "focus:ring-2 focus:ring-offset-2",
          props.class
        )} 
        tabIndex={props.interactive ? 0 : (props.medicalDeviceMode ? 0 : -1)}
        role={props.interactive ? "button" : "progressbar"}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={props.value}
        aria-label={props.interactive ? 
          `${props.label || 'Progress indicator'}: ${formatValue() || `${props.value} of ${max}`}, press Enter to view details` :
          `${props.label || 'Progress indicator'}: ${formatValue() || `${props.value} of ${max}`}`
        }
        aria-describedby={props.medicalDeviceMode ? keyboardState.instructionsId : undefined}
        onClick$={props.interactive ? handleActivate : undefined}
        onKeyDown$={$((event: KeyboardEvent) => {
          // Space or Enter to announce current progress (screen reader support)
          if (event.key === ' ' || event.key === 'Enter') {
            event.preventDefault();
            
            if (props.interactive) {
              handleActivate();
            } else {
              // Create accessible announcement
              const announcement = `${props.label || 'Progress'}: ${formatValue() || `${props.value} of ${max}`}`;
              
              // For healthcare contexts, add critical information
              if (props.healthcareContext?.critical && percentage < 30) {
                const criticalAnnouncement = `${announcement}. Critical level - immediate attention required.`;
                // Announce to screen readers
                const announcer = document.createElement('div');
                announcer.setAttribute('aria-live', 'assertive');
                announcer.setAttribute('aria-atomic', 'true');
                announcer.setAttribute('class', 'sr-only');
                announcer.textContent = criticalAnnouncement;
                document.body.appendChild(announcer);
                setTimeout(() => document.body.removeChild(announcer), 1000);
              }
            }
          }
          
          // Escape to remove focus
          if (event.key === 'Escape') {
            event.preventDefault();
            (event.target as HTMLElement).blur();
          }
          
          // Medical device workflow shortcuts
          if (props.medicalDeviceMode && props.enableWorkflowShortcuts) {
            if (props.progressContext === 'vital-monitoring') {
              if (event.key === 'h') {
                event.preventDefault();
                // View historical data
                console.log('View vital signs history');
              } else if (event.key === 'a') {
                event.preventDefault();
                // Set alerts for thresholds
                console.log('Set vital signs alerts');
              } else if (event.key === 't') {
                event.preventDefault();
                // View target values
                console.log('View target vital signs');
              }
            } else if (props.progressContext === 'treatment-progress') {
              if (event.key === 'p') {
                event.preventDefault();
                // View treatment plan
                console.log('View treatment plan');
              } else if (event.key === 'n') {
                event.preventDefault();
                // Navigate to next milestone
                console.log('Navigate to next treatment milestone');
              } else if (event.key === 'r') {
                event.preventDefault();
                // View recovery metrics
                console.log('View recovery metrics');
              }
            } else if (props.progressContext === 'medication-schedule') {
              if (event.key === 'm') {
                event.preventDefault();
                // View medication details
                console.log('View medication details');
              } else if (event.key === 's') {
                event.preventDefault();
                // View full schedule
                console.log('View medication schedule');
              } else if (event.key === 'd') {
                event.preventDefault();
                // View dosage information
                console.log('View dosage information');
              }
            } else if (props.progressContext === 'file-transfer') {
              if (event.key === 'c') {
                event.preventDefault();
                // Cancel transfer (if applicable)
                console.log('Cancel file transfer');
              } else if (event.key === 'r') {
                event.preventDefault();
                // Resume transfer
                console.log('Resume file transfer');
              }
            }
          }
        })}
      >
      {/* Label and Status Row */}
      {(props.label || props.showPercentage || props.showValue || props.healthcareContext) && (
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            {getStatusIcon()}
            {props.label && (
              <Text 
                size="sm" 
                weight="medium"
                class={props.healthcareContext?.critical ? "text-error-700" : ""}
              >
                {props.label}
              </Text>
            )}
          </div>
          
          {(props.showPercentage || props.showValue) && (
            <Text 
              size="sm" 
              color="secondary"
              class="tabular-nums"
            >
              {formatValue()}
            </Text>
          )}
        </div>
      )}

      {/* Progress Bar */}
      <div
        class={mergeClasses(
          "progress-bar-track w-full rounded-full overflow-hidden",
          sizeClasses[props.size || 'md'],
          backgroundClasses[props.color || 'primary'],
          props.variant === 'medical' ? "border border-neutral-light shadow-inner" : ""
        )}
        role="progressbar"
        aria-valuenow={props.indeterminate ? undefined : props.value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={props.label || "Progress"}
      >
        {props.indeterminate ? (
          <div
            class={mergeClasses(
              "progress-bar-fill h-full rounded-full animate-pulse",
              colorClasses[props.color || 'primary']
            )}
            style={{ width: "60%" }}
          />
        ) : (
          <div
            class={mergeClasses(
              "progress-bar-fill h-full rounded-full",
              getProgressClasses()
            )}
            style={{ width: `${percentage}%` }}
          />
        )}
      </div>

      {/* Healthcare-specific alerts */}
      {props.healthcareContext?.critical && percentage < 30 && (
        <div class="mt-2 p-2 bg-error-50 border border-error-light rounded-md">
          <div class="flex items-center gap-2">
            <Icon icon="alert-triangle" size={14} class="text-error-600" />
            <Text size="xs" class="text-error-700">
              Critical level reached - immediate attention required
            </Text>
          </div>
        </div>
      )}

      {/* Success message */}
      {percentage >= 100 && props.healthcareContext && (
        <div class="mt-2 p-2 bg-success-50 border border-success-light rounded-md">
          <div class="flex items-center gap-2">
            <Icon icon="check-circle" size={14} class="text-success-normal" />
            <Text size="xs" class="text-success-700">
              {props.healthcareContext.type === 'medication-compliance' ? 'Medication schedule completed' :
               props.healthcareContext.type === 'recovery-progress' ? 'Recovery milestone achieved' :
               props.healthcareContext.type === 'form-completion' ? 'Form completed successfully' :
               'Target achieved'}
            </Text>
          </div>
        </div>
      )}
      
      {/* Medical Device Keyboard Instructions */}
      {props.medicalDeviceMode && (
        <div 
          id={keyboardState.instructionsId}
          class="sr-only"
        >
          Progress indicator: {props.interactive ? 'Press Enter or Space to view details.' : 'Press Enter or Space to announce current progress.'}
          {props.enableWorkflowShortcuts && props.progressContext === 'vital-monitoring' && ' Quick access: H for history, A for alerts, T for targets.'}
          {props.enableWorkflowShortcuts && props.progressContext === 'treatment-progress' && ' Quick access: P for plan, N for next milestone, R for recovery metrics.'}
          {props.enableWorkflowShortcuts && props.progressContext === 'medication-schedule' && ' Quick access: M for medication details, S for schedule, D for dosage.'}
          {props.enableWorkflowShortcuts && props.progressContext === 'file-transfer' && ' Quick access: C to cancel, R to resume.'}
          {props.enableWorkflowShortcuts && ' Healthcare shortcuts enabled.'}
          Escape to exit focus.
        </div>
      )}
    </div>
    </div>
  );
});

export default ProgressBar;
