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
 * - Full medical device keyboard support
 */

import { component$, $ } from '@builder.io/qwik';
import { Switch, type SwitchProps } from '../switch/switch';
import { mergeClasses } from '../../../design-system/props';

export interface ToggleProps extends Omit<SwitchProps, 'context'> {
  /** Healthcare context for the toggle */
  context?: 'medication' | 'alarm' | 'monitoring' | 'emergency' | 'privacy' | 'safety' | 'default';
  /** High contrast mode for medical devices */
  highContrast?: boolean;
  /** Emergency override styling */
  emergency?: boolean;
}

/**
 * Healthcare Toggle Component
 * Enhanced switch for medical environments with comprehensive keyboard accessibility
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

  // Determine medical device settings based on context
  const medicalDeviceMode = emergency || context === 'emergency' || context === 'alarm' || context === 'safety';
  const enableWorkflowShortcuts = context !== 'default';
  const requireConfirmation = emergency || context === 'emergency' || context === 'medication';

  return (
    <div class="themed-content">
      <Switch
        {...switchProps}
        size={size}
        class={toggleClasses}
        medicalDeviceMode={medicalDeviceMode}
        enableWorkflowShortcuts={enableWorkflowShortcuts}
        requireConfirmation={requireConfirmation}
        emergencyMode={emergency}
        aria-label={props['aria-label'] || `${context} toggle control`}
        aria-describedby={props['aria-describedby'] || `${context}-toggle-description`}
      />
    </div>
  );
});

/**
 * Medication Toggle
 * For medication administration controls with confirmation
 */
export const MedicationToggle = component$<Omit<ToggleProps, 'context'>>((props) => {
  return (
    <Toggle
      {...props}
      context="medication"
      label={props.label || 'Medication Active'}
      size="lg"
    />
  );
});

/**
 * Alarm Toggle
 * For medical alarm system controls with high contrast
 */
export const AlarmToggle = component$<Omit<ToggleProps, 'context'>>((props) => {
  return (
    <Toggle
      {...props}
      context="alarm"
      label={props.label || 'Alarm Enabled'}
      highContrast={true}
      size="lg"
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
      size="lg"
    />
  );
});

/**
 * Emergency Toggle
 * For emergency system controls with maximum visibility and confirmation
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
      size="lg"
    />
  );
});

/**
 * Safety Toggle
 * For safety system and protocol controls with high contrast
 */
export const SafetyToggle = component$<Omit<ToggleProps, 'context'>>((props) => {
  return (
    <Toggle
      {...props}
      context="safety"
      label={props.label || 'Safety System'}
      highContrast={true}
      size="lg"
    />
  );
});

export type { SwitchProps };
