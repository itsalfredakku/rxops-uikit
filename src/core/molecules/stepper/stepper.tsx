/**
 * Stepper Component
 * Multi-step workflow navigation for healthcare processes
 * 
 * Features:
 * - Linear and non-linear step navigation
 * - Healthcare-optimized step states (pending, active, completed, error)
 * - Medical workflow context support (treatment plans, patient onboarding)
 * - Accessibility compliant with proper ARIA attributes
 * - Responsive design for mobile healthcare workflows
 * - Progress indication and step validation
 */

import { component$, Slot } from '@builder.io/qwik';
import type { BaseComponentProps } from '../../../design-system/props';
import { mergeClasses } from '../../../design-system/props';

// Step Status Icons
const CheckIcon = component$<{ class?: string }>((props) => (
  <svg
    class={props.class}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    stroke-width="2"
  >
    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
  </svg>
));

const XIcon = component$<{ class?: string }>((props) => (
  <svg
    class={props.class}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    stroke-width="2"
  >
    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
));

const AlertIcon = component$<{ class?: string }>((props) => (
  <svg
    class={props.class}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    stroke-width="2"
  >
    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
));

// Stepper Variants
const getStepperClasses = (
  orientation: string = 'horizontal',
  variant: string = 'default',
  healthcare: boolean = false
) => {
  const baseClasses = 'stepper';
  
  const orientationClasses = {
    horizontal: 'flex items-center',
    vertical: 'flex flex-col',
  };
  
  const variantClasses = {
    default: '',
    compact: 'gap-2',
    detailed: 'gap-6',
  };
  
  const healthcareClasses = healthcare ? 'healthcare-stepper' : '';
  
  return mergeClasses(
    baseClasses,
    orientationClasses[orientation as keyof typeof orientationClasses] || orientationClasses.horizontal,
    variantClasses[variant as keyof typeof variantClasses] || variantClasses.default,
    healthcareClasses
  );
};

const getStepClasses = (
  status: string = 'pending',
  interactive: boolean = false,
  healthcare: boolean = false,
  orientation: string = 'horizontal'
) => {
  const baseClasses = [
    'step relative flex items-center',
    'transition-all duration-200',
  ].join(' ');
  
  const orientationClasses = {
    horizontal: 'flex-row',
    vertical: 'flex-col items-start',
  };
  
  const statusClasses = {
    pending: 'step-pending',
    active: 'step-active',
    completed: 'step-completed',
    error: 'step-error',
    disabled: 'step-disabled opacity-50 cursor-not-allowed',
  };
  
  const interactiveClasses = interactive && status !== 'disabled' ? [
    'cursor-pointer',
    'hover:opacity-80',
    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
  ].join(' ') : '';
  
  const healthcareClasses = healthcare ? 'healthcare-step' : '';
  
  return mergeClasses(
    baseClasses,
    orientationClasses[orientation as keyof typeof orientationClasses] || orientationClasses.horizontal,
    statusClasses[status as keyof typeof statusClasses] || statusClasses.pending,
    interactiveClasses,
    healthcareClasses
  );
};

const getStepIndicatorClasses = (
  status: string = 'pending',
  size: string = 'md',
  healthcare: boolean = false
) => {
  const baseClasses = [
    'step-indicator flex items-center justify-center',
    'rounded-full border-2 font-medium',
    'transition-all duration-200',
  ].join(' ');
  
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
    xl: 'w-12 h-12 text-lg',
  };
  
  const statusClasses = {
    pending: 'bg-neutral-lighter border-neutral-light text-neutral-normal',
    active: healthcare 
      ? 'bg-primary-100 border-primary-500 text-primary-700 ring-4 ring-primary-100'
      : 'bg-primary-100 border-primary-500 text-primary-700',
    completed: 'bg-success-500 border-success-500 text-white',
    error: 'bg-error-500 border-error-500 text-white',
    disabled: 'bg-neutral-lighter border-neutral-light text-neutral-light',
  };
  
  return mergeClasses(
    baseClasses,
    sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.md,
    statusClasses[status as keyof typeof statusClasses] || statusClasses.pending
  );
};

const getStepConnectorClasses = (
  status: string = 'pending',
  orientation: string = 'horizontal',
  healthcare: boolean = false
) => {
  const baseClasses = 'step-connector transition-all duration-200';
  
  const orientationClasses = {
    horizontal: 'h-0.5 flex-1 mx-4',
    vertical: 'w-0.5 h-8 ml-4 my-2',
  };
  
  const statusClasses = {
    pending: 'bg-neutral-light',
    active: 'bg-neutral-light',
    completed: healthcare ? 'bg-primary-400' : 'bg-success-400',
    error: 'bg-error-400',
    disabled: 'bg-neutral-lighter',
  };
  
  return mergeClasses(
    baseClasses,
    orientationClasses[orientation as keyof typeof orientationClasses] || orientationClasses.horizontal,
    statusClasses[status as keyof typeof statusClasses] || statusClasses.pending
  );
};

// Types
export interface StepperProps extends BaseComponentProps<HTMLDivElement> {
  /**
   * Current active step (0-based index)
   * @default 0
   */
  activeStep?: number;
  
  /**
   * Orientation of the stepper
   * @default 'horizontal'
   */
  orientation?: 'horizontal' | 'vertical';
  
  /**
   * Visual variant
   * @default 'default'
   */
  variant?: 'default' | 'compact' | 'detailed';
  
  /**
   * Size of step indicators
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  
  /**
   * Allow clicking on completed steps
   * @default false
   */
  nonLinear?: boolean;
  
  /**
   * Healthcare-optimized styling
   * @default false
   */
  healthcare?: boolean;
  
  /**
   * Alternative labeling (for accessibility)
   */
  'aria-label'?: string;
}

export interface StepProps extends BaseComponentProps<HTMLDivElement> {
  /**
   * Step identifier/index
   */
  index: number;
  
  /**
   * Step status
   * @default 'pending'
   */
  status?: 'pending' | 'active' | 'completed' | 'error' | 'disabled';
  
  /**
   * Step label
   */
  label?: string;
  
  /**
   * Step description
   */
  description?: string;
  
  /**
   * Optional content for the step
   */
  optional?: boolean;
  
  /**
   * Custom icon for the step
   */
  icon?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  
  /**
   * Show connector line after this step
   * @default true
   */
  showConnector?: boolean;
}

// Main Stepper Component
export const Stepper = component$<StepperProps>((props) => {
  const {
    activeStep = 0,
    orientation = 'horizontal',
    variant = 'default',
    size: _size = 'md',
    nonLinear: _nonLinear = false,
    healthcare = false,
    class: className = '',
    'aria-label': ariaLabel,
    ...rest
  } = props;

  return (
    <div class="themed-content">
      <div
        class={mergeClasses(getStepperClasses(orientation, variant, healthcare), className)}
        role="tablist"
        aria-label={ariaLabel || 'Step navigation'}
        aria-orientation={orientation}
        data-healthcare={healthcare}
        data-active-step={activeStep}
        {...rest}
      >
        <Slot />
      </div>
    </div>
  );
});

// Step Component
export const Step = component$<StepProps>((props) => {
  const {
    index,
    status = 'pending',
    label,
    description,
    optional = false,
    icon,
    showConnector = true,
    class: className = '',
    ...rest
  } = props;

  // Get stepper context (this would be passed via context in a complete implementation)
  const orientation = 'horizontal'; // Default for now
  const size = 'md'; // Default for now
  const healthcare = false; // Default for now
  const nonLinear = false; // Default for now
  const _activeStep = 0; // Default for now

  const isClickable = nonLinear && (status === 'completed' || status === 'active');
  
  const getStepIcon = () => {
    if (icon) return icon;
    
    switch (status) {
      case 'completed':
        return <CheckIcon class="w-4 h-4" />;
      case 'error':
        return <XIcon class="w-4 h-4" />;
      case 'active':
        return optional ? <AlertIcon class="w-4 h-4" /> : index + 1;
      default:
        return index + 1;
    }
  };

  return (
    <div class="themed-content">
      <>
        <div
          class={mergeClasses(getStepClasses(status, isClickable, healthcare, orientation), className)}
        role="tab"
        aria-selected={status === 'active'}
        aria-disabled={status === 'disabled'}
        tabIndex={isClickable ? 0 : -1}
        data-step-index={index}
        data-step-status={status}
        {...rest}
      >
        {/* Step Indicator */}
        <div class={getStepIndicatorClasses(status, size, healthcare)}>
          {getStepIcon()}
        </div>
        
        {/* Step Content */}
        {(label || description) && (
          <div class={orientation === 'horizontal' ? 'ml-3' : 'mt-2'}>
            {label && (
              <div class={mergeClasses(
                'step-label font-medium',
                status === 'active' ? 'text-primary-700' : 'text-neutral-darker',
                status === 'disabled' ? 'text-neutral-light' : '',
                'text-base' // Simplified - use consistent sizing
              )}>
                {label}
                {optional && (
                  <span class="text-neutral-normal text-sm ml-1">(Optional)</span>
                )}
              </div>
            )}
            
            {description && (
              <div class={mergeClasses(
                'step-description text-neutral-normal mt-1',
                'text-sm', // Simplified - use consistent sizing
                status === 'disabled' ? 'text-neutral-light' : ''
              )}>
                {description}
              </div>
            )}
          </div>
        )}
        
        {/* Step Content Slot */}
        <div class="step-content">
          <Slot />
        </div>
      </div>
      
      {/* Connector */}
      {showConnector && (
        <div class={getStepConnectorClasses(status, orientation, healthcare)} />
      )}
      </>
    </div>
  );
});

// Specialized Healthcare Steppers

/**
 * Treatment Plan Stepper
 * For multi-step medical treatment workflows
 */
export const TreatmentStepper = component$<{
  currentPhase: number;
  phases: Array<{
    name: string;
    description?: string;
    status?: 'pending' | 'active' | 'completed' | 'error';
    duration?: string;
  }>;
  class?: string;
}>((props) => {
  const { currentPhase, phases, class: className } = props;
  
  return (
    <div class="themed-content">
      <Stepper
        activeStep={currentPhase}
        orientation="horizontal"
        healthcare={true}
        nonLinear={true}
        class={mergeClasses('treatment-stepper', className)}
        aria-label="Treatment plan progress"
      >
        {phases.map((phase, index) => (
          <Step
            key={index}
            index={index}
            status={phase.status || (index < currentPhase ? 'completed' : index === currentPhase ? 'active' : 'pending')}
            label={phase.name}
            description={phase.description || phase.duration}
            showConnector={index < phases.length - 1}
          />
        ))}
      </Stepper>
    </div>
  );
});

/**
 * Patient Onboarding Stepper
 * For patient registration and setup workflows
 */
export const PatientOnboardingStepper = component$<{
  currentStep: number;
  steps: Array<{
    title: string;
    description?: string;
    required?: boolean;
    completed?: boolean;
  }>;
  class?: string;
}>((props) => {
  const { currentStep, steps, class: className } = props;
  
  return (
    <div class="themed-content">
      <Stepper
        activeStep={currentStep}
        orientation="vertical"
        variant="detailed"
        healthcare={true}
        size="lg"
        class={mergeClasses('patient-onboarding-stepper', className)}
        aria-label="Patient onboarding steps"
      >
        {steps.map((step, index) => (
          <Step
            key={index}
            index={index}
            status={
              step.completed 
                ? 'completed' 
                : index === currentStep 
                  ? 'active' 
                  : 'pending'
            }
            label={step.title}
            description={step.description}
            optional={!step.required}
            showConnector={index < steps.length - 1}
          />
        ))}
      </Stepper>
    </div>
  );
});

/**
 * Medical Assessment Stepper
 * For clinical assessment and diagnostic workflows
 */
export const AssessmentStepper = component$<{
  currentSection: number;
  sections: Array<{
    name: string;
    status?: 'pending' | 'active' | 'completed' | 'error';
    critical?: boolean;
  }>;
  class?: string;
}>((props) => {
  const { currentSection, sections, class: className } = props;
  
  return (
    <Stepper
      activeStep={currentSection}
      orientation="horizontal"
      variant="compact"
      healthcare={true}
      size="md"
      class={mergeClasses('assessment-stepper', className)}
      aria-label="Medical assessment progress"
    >
      {sections.map((section, index) => (
        <Step
          key={index}
          index={index}
          status={section.status || (index < currentSection ? 'completed' : index === currentSection ? 'active' : 'pending')}
          label={section.name}
          icon={section.critical ? <AlertIcon class="w-4 h-4" /> : undefined}
          showConnector={index < sections.length - 1}
        />
      ))}
    </Stepper>
  );
});
