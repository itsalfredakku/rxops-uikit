/**
 * Motion Sensitivity Utilities for RxOpsKit
 * 
 * Provides healthcare-compliant motion reduction utilities that respect
 * user preferences while maintaining critical medical alert functionality.
 */

import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';

// Motion preference detection hook
export const useMotionPreference = () => {
  const reducedMotion = useSignal(false);
  
  useVisibleTask$(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotion.value = mediaQuery.matches;
    
    // Listen for preference changes
    const handleChange = (e: MediaQueryListEvent) => {
      reducedMotion.value = e.matches;
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  });
  
  return reducedMotion;
};

// Animation class generator that respects motion preferences
export const getAnimationClasses = (
  defaultAnimation: string,
  reducedAnimation: string = '',
  forceAnimation: boolean = false
) => {
  return {
    // Default animation classes
    default: defaultAnimation,
    
    // Reduced motion classes
    reduced: reducedAnimation,
    
    // CSS classes that automatically handle motion preferences
    responsive: `
      ${defaultAnimation}
      motion-reduce:${reducedAnimation || 'transition-none'}
      ${forceAnimation ? 'motion-reduce:animate-pulse' : ''}
    `.trim()
  };
};

// Healthcare-specific animation timing constants
export const HEALTHCARE_TIMING = {
  // Micro-interactions (button hover, focus)
  micro: {
    duration: 'duration-100',
    ease: 'ease-out',
    reduced: 'duration-75'
  },
  
  // Short interactions (tooltips, dropdowns)
  short: {
    duration: 'duration-200',
    ease: 'ease-out',
    reduced: 'duration-150'
  },
  
  // Medium interactions (modals, sidebars)
  medium: {
    duration: 'duration-300',
    ease: 'ease-in-out',
    reduced: 'duration-200'
  },
  
  // Emergency alerts (must be attention-grabbing)
  emergency: {
    duration: 'duration-150',
    ease: 'ease-out',
    reduced: 'duration-100', // Still animated for safety
    pulse: 'animate-pulse',
    reducedPulse: 'animate-pulse' // Keep pulse for critical alerts
  },
  
  // Loading states
  loading: {
    duration: 'duration-1000',
    ease: 'ease-in-out',
    reduced: 'duration-500'
  }
};

// Motion-aware transition component
export const MotionTransition = component$<{
  show: boolean;
  enterAnimation?: string;
  exitAnimation?: string;
  reducedEnter?: string;
  reducedExit?: string;
  forceForEmergency?: boolean;
  children: any;
}>((props) => {
  const reducedMotion = useMotionPreference();
  
  const getTransitionClass = () => {
    if (reducedMotion.value && !props.forceForEmergency) {
      return props.show 
        ? props.reducedEnter || 'opacity-100'
        : props.reducedExit || 'opacity-0';
    }
    
    return props.show
      ? props.enterAnimation || 'transform transition-all duration-200 ease-out scale-100 opacity-100'
      : props.exitAnimation || 'transform transition-all duration-200 ease-out scale-95 opacity-0';
  };
  
  return (
    <div class={`${getTransitionClass()} motion-reduce:transition-none`}>
      {props.children}
    </div>
  );
});

// Healthcare button with motion-aware animations
export const MotionButton = component$<{
  onClick$?: () => void;
  variant?: 'primary' | 'secondary' | 'emergency';
  disabled?: boolean;
  children: any;
}>((props) => {
  const buttonClasses = getAnimationClasses(
    // Default animation
    `transform transition-all ${HEALTHCARE_TIMING.micro.duration} ${HEALTHCARE_TIMING.micro.ease} 
     hover:scale-[1.02] hover:shadow-lg 
     active:scale-[0.98] 
     focus-visible:ring-2 focus-visible:ring-offset-2`,
    
    // Reduced motion animation
    `transition-colors ${HEALTHCARE_TIMING.micro.reduced} 
     hover:brightness-110 
     focus-visible:ring-2 focus-visible:ring-offset-2`,
    
    // Force animation for emergency buttons
    props.variant === 'emergency'
  );
  
  const variantClasses = {
    primary: 'bg-primary-normal text-white hover:bg-primary-dark focus-visible:ring-primary-normal',
    secondary: 'bg-neutral-light text-neutral-darker hover:bg-neutral-light focus-visible:ring-neutral-normal',
    emergency: 'bg-error-normal text-white hover:bg-error-dark focus-visible:ring-error-normal animate-pulse motion-reduce:animate-pulse'
  };
  
  return (
    <button
      onClick$={props.onClick$}
      disabled={props.disabled}
      class={`
        px-4 py-2 rounded-lg font-medium
        disabled:opacity-50 disabled:cursor-not-allowed
        ${buttonClasses.responsive}
        ${variantClasses[props.variant || 'primary']}
      `}
    >
      {props.children}
    </button>
  );
});

// Emergency alert with forced animation for patient safety
export const EmergencyMotionAlert = component$<{
  severity: 'warning' | 'critical' | 'life-threatening';
  title: string;
  message: string;
  onDismiss$?: () => void;
}>((props) => {
  const severityConfig = {
    warning: {
      bgColor: 'bg-warning-lighter border-warning-normal',
      textColor: 'text-warning-darker',
      iconColor: 'text-warning-normal',
      animation: 'animate-pulse motion-reduce:animate-pulse' // Keep for safety
    },
    critical: {
      bgColor: 'bg-error-lighter border-error-normal',
      textColor: 'text-error-darker',
      iconColor: 'text-error-normal',
      animation: 'animate-pulse motion-reduce:animate-pulse' // Keep for safety
    },
    'life-threatening': {
      bgColor: 'bg-error-lighter border-error-normal',
      textColor: 'text-error-darker',
      iconColor: 'text-error-normal',
      animation: 'animate-pulse motion-reduce:animate-pulse' // Always animate for life-threatening
    }
  };
  
  const config = severityConfig[props.severity];
  
  return (
    <div class={`
      border-l-4 p-4 rounded-r-lg
      ${config.bgColor}
      ${config.animation}
      motion-reduce:transition-all motion-reduce:duration-200
    `}>
      <div class="flex items-start">
        <div class={`flex-shrink-0 ${config.iconColor}`}>
          <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3 flex-1">
          <h3 class={`text-sm font-bold ${config.textColor}`}>
            {props.title}
          </h3>
          <p class={`mt-1 text-sm ${config.textColor}`}>
            {props.message}
          </p>
        </div>
        {props.onDismiss$ && (
          <div class="ml-auto pl-3">
            <button
              onClick$={props.onDismiss$}
              class={`
                inline-flex rounded-md p-1.5 
                ${config.textColor} 
                hover:bg-black hover:bg-opacity-10
                transition-colors duration-150
                motion-reduce:transition-none
                focus:outline-none focus:ring-2 focus:ring-offset-2
              `}
            >
              <span class="sr-only">Dismiss</span>
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

// Loading spinner with motion sensitivity
export const MotionSpinner = component$<{
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}>((props) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  };
  
  return (
    <div class={`
      ${sizeClasses[props.size || 'md']}
      ${props.color || 'text-primary-normal'}
      animate-spin motion-reduce:animate-pulse
    `}>
      <svg class="w-full h-full" fill="none" viewBox="0 0 24 24">
        <circle 
          class="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          stroke-width="4"
        />
        <path 
          class="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
});

export default {
  useMotionPreference,
  getAnimationClasses,
  HEALTHCARE_TIMING,
  MotionTransition,
  MotionButton,
  EmergencyMotionAlert,
  MotionSpinner
};
