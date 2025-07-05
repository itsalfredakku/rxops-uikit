/**
 * Toggle Component - Healthcare-Enhanced Switch
 * Binary on/off control optimized for medical environments
 * 
 * Features:
 * - WCAG 2.1 AA compliant with high contrast modes
 * - Healthcare-specific states and contexts
 * - Medical device friendly (large touch targets)
 * - Clinical workflow integration
 * - Emergency/safety toggle variants
 */

import { component$ } from '@builder.io/qwik';
import { Switch, type SwitchProps } from '../switch/switch';
import { mergeClasses } from '../../../design-system/props';

export interface ToggleProps extends SwitchProps {
  /** Healthcare context for the toggle */
  context?: 'medication' | 'alarm' | 'monitoring' | 'emergency' | 'privacy' | 'safety' | 'default';
  /** High contrast mode for medical devices */
  highContrast?: boolean;
  /** Emergency override styling */
  emergency?: boolean;
}

/**
 * Healthcare Toggle Component
 * Enhanced switch for medical environments
 */
export const Toggle = component$<ToggleProps>((props) => {
  const {
    context = 'default',
    highContrast = false,
    emergency = false,
    size = 'lg', // Default to large for healthcare
    class: className,
    ...switchProps
  } = props;

  const contextClasses = {
    medication: 'toggle-medication',
    alarm: 'toggle-alarm', 
    monitoring: 'toggle-monitoring',
    emergency: 'toggle-emergency',
    privacy: 'toggle-privacy',
    safety: 'toggle-safety',
    default: 'toggle-default'
  };

  const toggleClasses = mergeClasses(
    'healthcare-toggle',
    contextClasses[context],
    highContrast && 'high-contrast',
    emergency && 'emergency-priority',
    className
  );

  return (
    <Switch
      {...switchProps}
      size={size}
      class={toggleClasses}
    />
  );
});

/**
 * Medication Toggle
 * For medication administration controls
 */
export const MedicationToggle = component$<Omit<ToggleProps, 'context'>>((props) => {
  return (
    <Toggle
      {...props}
      context="medication"
      label={props.label || 'Medication Active'}
    />
  );
});

/**
 * Alarm Toggle
 * For medical alarm system controls
 */
export const AlarmToggle = component$<Omit<ToggleProps, 'context'>>((props) => {
  return (
    <Toggle
      {...props}
      context="alarm"
      label={props.label || 'Alarm Enabled'}
      highContrast={true}
    />
  );
});

/**
 * Monitoring Toggle
 * For patient monitoring system controls
 */
export const MonitoringToggle = component$<Omit<ToggleProps, 'context'>>((props) => {
  return (
    <Toggle
      {...props}
      context="monitoring"
      label={props.label || 'Monitoring Active'}
    />
  );
});

/**
 * Emergency Toggle
 * For emergency system controls with high visibility
 */
export const EmergencyToggle = component$<Omit<ToggleProps, 'context' | 'emergency'>>((props) => {
  return (
    <Toggle
      {...props}
      context="emergency"
      emergency={true}
      highContrast={true}
      size="xl"
      label={props.label || 'Emergency System'}
    />
  );
});

/**
 * Privacy Toggle
 * For patient privacy and data protection controls
 */
export const PrivacyToggle = component$<Omit<ToggleProps, 'context'>>((props) => {
  return (
    <Toggle
      {...props}
      context="privacy"
      label={props.label || 'Privacy Protection'}
    />
  );
});

/**
 * Safety Toggle
 * For safety system and protocol controls
 */
export const SafetyToggle = component$<Omit<ToggleProps, 'context'>>((props) => {
  return (
    <Toggle
      {...props}
      context="safety"
      label={props.label || 'Safety System'}
      highContrast={true}
    />
  );
});

export type { SwitchProps };
