import { component$, type JSXOutput, useStore, $ } from "@builder.io/qwik";
import { BaseComponentProps, mergeClasses } from "../../../design-system/props";
import { Text } from "../../atoms/text/text";
import { Stack } from "../../../layouts/stack/index";
import { Icon, type IconName } from "../../atoms/icon/index";

export interface MetricCardProps extends BaseComponentProps<HTMLDivElement> {
  title: string;
  value: string | number;
  unit?: string;
  trend?: "up" | "down" | "stable";
  trendValue?: string;
  icon?: IconName | JSXOutput;
  color?: "red" | "green" | "blue" | "yellow" | "purple" | "gray";
  /** Medical device keyboard support with enhanced focus indicators */
  medicalDeviceMode?: boolean;
  /** Enable healthcare workflow shortcuts */
  enableWorkflowShortcuts?: boolean;
  /** Metric context for healthcare applications */
  metricContext?: 'vitals' | 'lab-results' | 'medication' | 'patient-stats' | 'system-metrics' | 'default';
  /** Make metric card interactive (focusable) */
  interactive?: boolean;
  /** Callback when metric card is activated (clicked or Enter pressed) */
  onActivate?: () => void;
  /** Critical threshold indicator */
  critical?: boolean;
}

const colorClasses = {
  red: {
    bg: "bg-error-100",
    text: "text-error-600",
    border: "border-error-light",
  },
  green: {
    bg: "bg-success-100", 
    text: "text-success-normal",
    border: "border-success-light",
  },
  blue: {
    bg: "bg-primary-100",
    text: "text-primary-600", 
    border: "border-primary-200",
  },
  yellow: {
    bg: "bg-warning-100",
    text: "text-warning-600",
    border: "border-warning-light",
  },
  purple: {
    bg: "bg-primary-lighter",
    text: "text-primary-normal",
    border: "border-primary-light",
  },
  gray: {
    bg: "bg-neutral-lighter",
    text: "text-neutral-normal",
    border: "border-neutral-light",
  },
};

const trendIcons = {
  up: "↗",
  down: "↘", 
  stable: "→",
};

export const MetricCard = component$<MetricCardProps>((props) => {
  const {
    title,
    value,
    unit,
    trend,
    trendValue,
    icon,
    color = "blue",
    medicalDeviceMode = false,
    enableWorkflowShortcuts = false,
    metricContext = 'default',
    interactive = false,
    onActivate,
    critical = false,
    class: qwikClass,
    className,
    style,
    ...rest
  } = props;
  
  // Medical device keyboard state
  const keyboardState = useStore({
    instructionsId: `metric-card-instructions-${Math.random().toString(36).substr(2, 9)}`,
  });

  // Handle metric card activation (click or keyboard)
  const handleActivate = $(() => {
    if (interactive && onActivate) {
      onActivate();
    }
  });
  
  const colors = colorClasses[color as keyof typeof colorClasses];
  
  const metricClasses = mergeClasses(
    "ui-metric-card bg-white rounded-lg border p-4",
    colors.border,
    // Medical device enhancements
    medicalDeviceMode && "focus:outline-none focus:ring-2 focus:ring-offset-1",
    critical ? "focus:ring-error-500 ring-2 ring-error-500" : "focus:ring-primary-500",
    interactive && "cursor-pointer hover:shadow-lg transition-shadow duration-200",
    medicalDeviceMode && interactive && "focus:ring-2 focus:ring-offset-2",
    qwikClass,
    className
  );
  
  return (
    <div class="themed-content">
      <div 
        class={metricClasses}
        style={style}
        role={interactive ? "button" : undefined}
        tabIndex={interactive ? 0 : -1}
        aria-label={interactive ? `${title}: ${value}${unit || ''}, press Enter to view details` : undefined}
        aria-describedby={medicalDeviceMode ? keyboardState.instructionsId : undefined}
        onClick$={interactive ? handleActivate : undefined}
        onKeyDown$={(event) => {
          if (!interactive) return;
          
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleActivate();
          } else if (event.key === 'Escape') {
            event.preventDefault();
            (event.target as HTMLElement).blur();
          } else if (medicalDeviceMode && enableWorkflowShortcuts) {
            // Healthcare workflow shortcuts based on context
            if (metricContext === 'vitals') {
              if (event.key === 'h') {
                event.preventDefault();
                // Navigate to historical data
                console.log('Navigate to historical vitals');
              } else if (event.key === 't') {
                event.preventDefault();
                // Navigate to trends
                console.log('Navigate to vital trends');
              } else if (event.key === 'a') {
                event.preventDefault();
                // Set alert thresholds
                console.log('Set vital alert thresholds');
              }
            } else if (metricContext === 'lab-results') {
              if (event.key === 'r') {
                event.preventDefault();
                // View full report
                console.log('View full lab report');
              } else if (event.key === 'n') {
                event.preventDefault();
                // View normal ranges
                console.log('View normal ranges');
              } else if (event.key === 'c') {
                event.preventDefault();
                // Compare with previous results
                console.log('Compare lab results');
              }
            } else if (metricContext === 'medication') {
              if (event.key === 'd') {
                event.preventDefault();
                // View dosage details
                console.log('View medication dosage');
              } else if (event.key === 's') {
                event.preventDefault();
                // View schedule
                console.log('View medication schedule');
              } else if (event.key === 'i') {
                event.preventDefault();
                // View interactions
                console.log('View drug interactions');
              }
            } else if (metricContext === 'patient-stats') {
              if (event.key === 'p') {
                event.preventDefault();
                // View patient profile
                console.log('View patient profile');
              } else if (event.key === 'h') {
                event.preventDefault();
                // View health history
                console.log('View health history');
              }
            }
          }
        }}
        {...rest}
      >
        <Stack direction="row" alignItems="center" justifyContent="between" wrap="wrap" class="mb-3">
          <Text as="h3" weight="medium" size="sm" color="gray-600">
            {title}
          </Text>
          {icon && (
            <div class={[
              "w-8 h-8 rounded-full flex items-center justify-center",
              colors.bg
            ]}>
              <div class={[colors.text]}>
                {typeof icon === 'string' ? (
                  <Icon icon={icon as IconName} size={20} />
                ) : (
                  icon
                )}
              </div>
            </div>
          )}
        </Stack>
        
        <Stack direction="row" alignItems="baseline" gap="1" wrap="wrap" class="mb-2">
          <span class="text-2xl font-bold text-neutral-darker">
            {value}
          </span>
          {unit && (
            <span class="text-sm text-neutral-normal">
              {unit}
            </span>
          )}
        </Stack>
        
        {trend && trendValue && (
          <Stack 
            direction="row"
            alignItems="center" 
            wrap="wrap"
            class={`text-xs ${
              trend === "up" && color === "green" ? "text-success-normal" : 
              trend === "down" && color === "red" ? "text-error-600" :
              "text-neutral-normal"
            }`}
          >
            <span class="mr-1">
              {trendIcons[trend as keyof typeof trendIcons]}
            </span>
            <span>
              {trendValue}
            </span>
          </Stack>
        )}
      </div>
      
      {/* Medical Device Keyboard Instructions */}
      {medicalDeviceMode && interactive && (
        <div 
          id={keyboardState.instructionsId}
          class="sr-only"
        >
          Interactive metric card: Press Enter or Space to view details.
          {enableWorkflowShortcuts && metricContext === 'vitals' && ' Quick access: H for history, T for trends, A for alerts.'}
          {enableWorkflowShortcuts && metricContext === 'lab-results' && ' Quick access: R for full report, N for normal ranges, C to compare.'}
          {enableWorkflowShortcuts && metricContext === 'medication' && ' Quick access: D for dosage, S for schedule, I for interactions.'}
          {enableWorkflowShortcuts && metricContext === 'patient-stats' && ' Quick access: P for patient profile, H for health history.'}
          {enableWorkflowShortcuts && ' Healthcare shortcuts enabled.'}
          Escape to exit focus.
        </div>
      )}
    </div>
  );
});
