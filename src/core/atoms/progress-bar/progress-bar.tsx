import { component$, useTask$, useSignal } from "@builder.io/qwik";
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
      return <Icon icon="check-circle" size={16} class="text-success-600" />;
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
    <div class={mergeClasses("progress-bar-container", props.class)} {...props}>
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
          props.variant === 'medical' ? "border border-neutral-200 shadow-inner" : ""
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
        <div class="mt-2 p-2 bg-error-50 border border-red-200 rounded-md">
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
        <div class="mt-2 p-2 bg-success-50 border border-green-200 rounded-md">
          <div class="flex items-center gap-2">
            <Icon icon="check-circle" size={14} class="text-success-600" />
            <Text size="xs" class="text-success-700">
              {props.healthcareContext.type === 'medication-compliance' ? 'Medication schedule completed' :
               props.healthcareContext.type === 'recovery-progress' ? 'Recovery milestone achieved' :
               props.healthcareContext.type === 'form-completion' ? 'Form completed successfully' :
               'Target achieved'}
            </Text>
          </div>
        </div>
      )}
    </div>
  );
});

export default ProgressBar;
