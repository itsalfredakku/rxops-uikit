import { component$, Slot, $, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { BaseComponentProps, mergeClasses, mergeStyles } from "../../../design-system/props";

export type EmergencyAlertSeverity = "critical" | "high" | "medium" | "low";
export type EmergencyAlertType = "medical" | "medication" | "vital-signs" | "allergy" | "system";

export interface EmergencyAlertProps extends Omit<BaseComponentProps<HTMLDivElement>, 'children'> {
  severity: EmergencyAlertSeverity;
  type: EmergencyAlertType;
  title: string;
  urgent?: boolean;
  dismissible?: boolean;
  autoExpire?: number; // Auto-dismiss after N seconds
  onDismiss?: () => void;
  onAction?: () => void;
  actionLabel?: string;
  patientId?: string;
  timestamp?: Date;
}

// Critical visual hierarchy for patient safety
const emergencyAlertStyles = {
  critical: [
    "border-4 border-error-600 bg-gradient-to-r from-error-50 to-error-100",
    "shadow-xl shadow-error-200/50",
    "ring-4 ring-error-300/40",
    "animate-pulse",
  ].join(" "),
  
  high: [
    "border-3 border-warning-500 bg-gradient-to-r from-warning-50 to-warning-100", 
    "shadow-lg shadow-warning-200/40",
    "ring-2 ring-warning-300/30",
  ].join(" "),
  
  medium: [
    "border-2 border-warning-400 bg-warning-50",
    "shadow-md shadow-warning-200/30",
  ].join(" "),
  
  low: [
    "border border-neutral-light bg-neutral-lighter",
    "shadow-sm",
  ].join(" "),
};

const severityIcons = {
  critical: (
    <svg class="h-8 w-8 text-error-600 animate-bounce" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-2h2v2h-2zm0-4V7h2v6h-2z"/>
    </svg>
  ),
  high: (
    <svg class="h-7 w-7 text-warning-600" fill="currentColor" viewBox="0 0 24 24">
      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
    </svg>
  ),
  medium: (
    <svg class="h-6 w-6 text-warning-500" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-2h2v2h-2zm0-4V7h2v6h-2z"/>
    </svg>
  ),
  low: (
    <svg class="h-5 w-5 text-neutral-normal" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-2h2v2h-2zm0-4V7h2v6h-2z"/>
    </svg>
  ),
};

const typeLabels = {
  medical: "MEDICAL ALERT",
  medication: "MEDICATION ALERT", 
  "vital-signs": "VITAL SIGNS ALERT",
  allergy: "ALLERGY ALERT",
  system: "SYSTEM ALERT",
};

export const EmergencyAlert = component$<EmergencyAlertProps>((props) => {
  const {
    severity,
    type,
    title,
    urgent = false,
    dismissible = true,
    autoExpire,
    onDismiss,
    onAction,
    actionLabel = "Acknowledge",
    patientId,
    timestamp = new Date(),
    class: qwikClass,
    className,
    style,
    testId,
    'data-testid': dataTestId,
    ...rest
  } = props;

  const isVisible = useSignal(true);
  const timeRemaining = useSignal(autoExpire || 0);

  // Auto-expire functionality
  useVisibleTask$(({ cleanup }) => {
    if (!autoExpire) return;
    
    const interval = setInterval(() => {
      timeRemaining.value -= 1;
      if (timeRemaining.value <= 0) {
        isVisible.value = false;
        onDismiss?.();
      }
    }, 1000);
    
    cleanup(() => clearInterval(interval));
  });

  const handleDismiss = $(() => {
    isVisible.value = false;
    onDismiss?.();
  });

  const handleAction = $(() => {
    onAction?.();
    if (severity !== "critical") {
      isVisible.value = false;
    }
  });

  if (!isVisible.value) return null;

  const baseClasses = [
    "relative rounded-lg p-6 transition-all duration-300",
    "min-h-[80px]", // Ensure adequate touch target size
    emergencyAlertStyles[severity],
    urgent && severity === "critical" ? "animate-pulse" : "",
  ].join(" ");

  const finalClass = mergeClasses(baseClasses, qwikClass, className);
  const finalStyle = mergeStyles(undefined, style);

  return (
    <div class="themed-content">
      <div
        class={finalClass}
        style={finalStyle}
        role="alert"
      aria-live={severity === "critical" ? "assertive" : "polite"}
      aria-atomic="true"
      data-testid={testId || dataTestId || `emergency-alert-${severity}`}
      data-severity={severity}
      data-type={type}
      data-patient-id={patientId}
      {...rest}
    >
      {/* Alert Header */}
      <div class="flex items-start justify-between mb-3">
        <div class="flex items-center gap-3">
          {/* Severity Icon */}
          <div class="flex-shrink-0">
            {severityIcons[severity]}
          </div>
          
          {/* Type Label & Timestamp */}
          <div class="flex flex-col">
            <span class={[
              "text-xs font-bold uppercase tracking-wider",
              severity === "critical" ? "text-error-700" : 
              severity === "high" ? "text-warning-700" :
              severity === "medium" ? "text-warning-600" : "text-neutral-normal"
            ].join(" ")}>
              {typeLabels[type]}
            </span>
            <span class="text-xs text-neutral-normal mt-1">
              {timestamp.toLocaleTimeString()}
              {patientId && ` • Patient: ${patientId}`}
            </span>
          </div>
        </div>

        {/* Auto-expire countdown */}
        {autoExpire && timeRemaining.value > 0 && (
          <div class="text-xs text-neutral-normal min-w-[60px] text-right">
            {timeRemaining.value}s
          </div>
        )}
      </div>

      {/* Alert Title */}
      <h3 class={[
        "font-semibold mb-2 leading-tight",
        severity === "critical" ? "text-lg text-error-800" :
        severity === "high" ? "text-base text-warning-800" :
        "text-sm text-neutral-darker"
      ].join(" ")}>
        {title}
      </h3>

      {/* Alert Content */}
      <div class={[
        "text-sm leading-relaxed mb-4",
        severity === "critical" ? "text-error-700" :
        severity === "high" ? "text-warning-700" :
        "text-neutral-dark"
      ].join(" ")}>
        <Slot />
      </div>

      {/* Action Buttons */}
      <div class="flex items-center justify-between">
        <div class="flex gap-3">
          {/* Primary Action */}
          {onAction && (
            <button
              type="button"
              onClick$={handleAction}
              class={[
                "min-h-[44px] px-4 py-2 rounded-md font-medium text-sm",
                "transition-all duration-200 focus:outline-none focus:ring-2",
                severity === "critical" 
                  ? "bg-error-600 text-white hover:bg-error-700 focus:ring-error-500"
                  : severity === "high"
                  ? "bg-warning-600 text-white hover:bg-warning-700 focus:ring-warning-500"
                  : "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500"
              ].join(" ")}
              aria-label={`${actionLabel} ${typeLabels[type].toLowerCase()}`}
            >
              {actionLabel}
            </button>
          )}

          {/* Secondary Action Slot */}
          <Slot name="secondary-action" />
        </div>

        {/* Dismiss Button */}
        {dismissible && (
          <button
            type="button"
            onClick$={handleDismiss}
            class={[
              "min-h-[44px] min-w-[44px] p-2 rounded-md",
              "transition-colors duration-200 focus:outline-none focus:ring-2",
              "text-neutral-normal hover:text-neutral-dark hover:bg-neutral-lighter",
              "focus:ring-neutral-normal"
            ].join(" ")}
            aria-label={`Dismiss ${typeLabels[type].toLowerCase()}`}
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Critical Alert Pulse Border */}
      {severity === "critical" && urgent && (
        <div class="absolute inset-0 rounded-lg border-2 border-error-500 animate-ping pointer-events-none" />
      )}
    </div>
    </div>
  );
});
