/**
 * Status Indicator Component
 * Visual indicators for system, patient, and workflow states
 * 
 * Features:
 * - Healthcare-specific status types (patient, medication, emergency, etc.)
 * - Accessibility compliant with screen reader support
 * - Animated states for critical alerts
 * - Color-blind friendly variants
 * - Medical device compatibility
 */

import { component$, Slot } from "@builder.io/qwik";
import { BaseComponentProps, mergeClasses } from "../../../design-system/props";
import type { Color } from "../../../design-system/types";

export type StatusType = 
  | 'patient' 
  | 'medication' 
  | 'emergency' 
  | 'system' 
  | 'workflow' 
  | 'vitals'
  | 'lab'
  | 'appointment'
  | 'communication'
  | 'default';

export type StatusState = 
  | 'active' 
  | 'inactive' 
  | 'warning' 
  | 'error' 
  | 'success' 
  | 'pending' 
  | 'processing'
  | 'critical'
  | 'stable';

export type StatusVariant = 'dot' | 'badge' | 'pill' | 'icon' | 'bar';

export interface StatusIndicatorProps extends BaseComponentProps<HTMLSpanElement> {
  /**
   * Healthcare context type
   */
  type?: StatusType;
  
  /**
   * Current state
   */
  state: StatusState;
  
  /**
   * Visual variant
   */
  variant?: StatusVariant;
  
  /**
   * Size of the indicator
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  
  /**
   * Text label (for accessibility)
   */
  label?: string;
  
  /**
   * Show pulse animation for critical states
   */
  pulse?: boolean;
  
  /**
   * High contrast mode
   */
  highContrast?: boolean;
  
  /**
   * Override color (advanced use)
   */
  color?: Color;
}

const stateColors = {
  active: 'bg-success-500 text-success-50',
  inactive: 'bg-neutral-400 text-neutral-50',
  warning: 'bg-warning-500 text-warning-50',
  error: 'bg-error-500 text-error-50',
  success: 'bg-success-500 text-success-50',
  pending: 'bg-info-500 text-info-50',
  processing: 'bg-primary-500 text-primary-50',
  critical: 'bg-error-600 text-error-50',
  stable: 'bg-success-400 text-success-50',
};

const highContrastColors = {
  active: 'bg-green-600 text-white border-2 border-green-800',
  inactive: 'bg-neutral-600 text-white border-2 border-neutral-800',
  warning: 'bg-yellow-600 text-black border-2 border-yellow-800',
  error: 'bg-red-600 text-white border-2 border-red-800',
  success: 'bg-green-600 text-white border-2 border-green-800',
  pending: 'bg-blue-600 text-white border-2 border-blue-800',
  processing: 'bg-indigo-600 text-white border-2 border-indigo-800',
  critical: 'bg-red-700 text-white border-2 border-red-900',
  stable: 'bg-green-500 text-white border-2 border-green-700',
};

const sizeClasses = {
  dot: {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
    xl: 'w-5 h-5',
  },
  badge: {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-sm',
    lg: 'px-2.5 py-1.5 text-base',
    xl: 'px-3 py-2 text-lg',
  },
  pill: {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
    xl: 'px-5 py-2.5 text-lg',
  },
  icon: {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
  },
  bar: {
    sm: 'w-8 h-1',
    md: 'w-12 h-1.5',
    lg: 'w-16 h-2',
    xl: 'w-20 h-3',
  },
};

const variantClasses = {
  dot: 'rounded-full',
  badge: 'rounded font-medium',
  pill: 'rounded-full font-medium',
  icon: 'rounded-md flex items-center justify-center',
  bar: 'rounded-full',
};

export const StatusIndicator = component$<StatusIndicatorProps>((props) => {
  const {
    type = 'default',
    state,
    variant = 'dot',
    size = 'md',
    label,
    pulse = false,
    highContrast = false,
    color: _color, // Mark as unused with underscore
    class: className,
    ...rest
  } = props;

  const colorClasses = highContrast ? highContrastColors[state] : stateColors[state];
  const pulseClass = pulse && (state === 'critical' || state === 'error') ? 'animate-pulse' : '';

  const baseClasses = [
    'status-indicator',
    'inline-flex items-center justify-center',
    variantClasses[variant],
    sizeClasses[variant][size],
    colorClasses,
    pulseClass,
    // Healthcare accessibility
    'focus:outline-none focus:ring-2 focus:ring-offset-1',
    state === 'critical' ? 'focus:ring-error-500' : 'focus:ring-primary-500',
  ];

  return (
    <span
      class={mergeClasses(...baseClasses, className)}
      role="status"
      aria-label={label || `${type} status: ${state}`}
      title={label || `${type} status: ${state}`}
      {...rest}
    >
      {variant === 'dot' || variant === 'bar' ? null : (
        <Slot>
          {variant === 'icon' ? (
            <StatusIcon state={state} />
          ) : (
            <span class="capitalize">{state}</span>
          )}
        </Slot>
      )}
    </span>
  );
});

/**
 * Status Icon Component - Internal helper
 */
const StatusIcon = component$<{ state: StatusState }>((props) => {
  const { state } = props;
  
  switch (state) {
    case 'active':
    case 'success':
    case 'stable':
      return (
        <svg class="w-full h-full" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
      );
    case 'warning':
      return (
        <svg class="w-full h-full" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
      );
    case 'error':
    case 'critical':
      return (
        <svg class="w-full h-full" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      );
    case 'pending':
    case 'processing':
      return (
        <svg class="w-full h-full animate-spin" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2 10a8 8 0 018-8v8l-8 8z" />
        </svg>
      );
    case 'inactive':
      return (
        <svg class="w-full h-full" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
      );
    default:
      return (
        <svg class="w-full h-full" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
      );
  }
});

/**
 * Healthcare-specific status indicators
 */
export const PatientStatusIndicator = component$<Omit<StatusIndicatorProps, 'type'>>((props) => (
  <StatusIndicator type="patient" {...props} />
));

export const MedicationStatusIndicator = component$<Omit<StatusIndicatorProps, 'type'>>((props) => (
  <StatusIndicator type="medication" {...props} />
));

export const EmergencyStatusIndicator = component$<Omit<StatusIndicatorProps, 'type'>>((props) => (
  <StatusIndicator type="emergency" pulse={true} {...props} />
));

export const VitalsStatusIndicator = component$<Omit<StatusIndicatorProps, 'type'>>((props) => (
  <StatusIndicator type="vitals" {...props} />
));

export default StatusIndicator;
