/**
 * Rating Component
 * Interactive rating system for healthcare feedback and assessments
 * 
 * Features:
 * - Star, numeric, and emoji rating systems
 * - Healthcare-specific scales (pain, satisfaction, severity)
 * - Read-only and interactive modes
 * - Accessibility compliant with keyboard navigation
 * - Clinical assessment contexts (1-10 pain scale, satisfaction surveys)
 * - Half-star and custom icon support
 */

import { component$, useSignal, $, useStore } from '@builder.io/qwik';
import type { BaseComponentProps } from '../../../design-system/props';
import { mergeClasses } from '../../../design-system/props';

// Rating Icons
const StarIcon = component$<{ class?: string; filled?: boolean }>((props) => (
  <svg
    class={props.class}
    fill={props.filled ? 'currentColor' : 'none'}
    viewBox="0 0 24 24"
    stroke="currentColor"
    stroke-width="2"
  >
    <path 
      stroke-linecap="round" 
      stroke-linejoin="round" 
      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" 
    />
  </svg>
));

const HeartIcon = component$<{ class?: string; filled?: boolean }>((props) => (
  <svg
    class={props.class}
    fill={props.filled ? 'currentColor' : 'none'}
    viewBox="0 0 24 24"
    stroke="currentColor"
    stroke-width="2"
  >
    <path 
      stroke-linecap="round" 
      stroke-linejoin="round" 
      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
    />
  </svg>
));

const ThumbsUpIcon = component$<{ class?: string; filled?: boolean }>((props) => (
  <svg
    class={props.class}
    fill={props.filled ? 'currentColor' : 'none'}
    viewBox="0 0 24 24"
    stroke="currentColor"
    stroke-width="2"
  >
    <path 
      stroke-linecap="round" 
      stroke-linejoin="round" 
      d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2v0a2 2 0 00-2 2v5m4 0H9m5 0v6M9 9h1m-1 0v6" 
    />
  </svg>
));

// Rating Variants
const getRatingClasses = (
  size: string = 'md',
  variant: string = 'default',
  healthcare: boolean = false
) => {
  const baseClasses = 'rating flex items-center gap-1';
  
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm', 
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };
  
  const variantClasses = {
    default: '',
    compact: 'gap-0.5',
    spaced: 'gap-2',
  };
  
  const healthcareClasses = healthcare ? 'healthcare-rating' : '';
  
  return mergeClasses(
    baseClasses,
    sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.md,
    variantClasses[variant as keyof typeof variantClasses] || variantClasses.default,
    healthcareClasses
  );
};

const getRatingItemClasses = (
  active: boolean = false,
  interactive: boolean = false,
  intent: string = 'neutral'
) => {
  const baseClasses = [
    'rating-item transition-colors duration-150',
    'focus:outline-none',
  ].join(' ');
  
  const interactiveClasses = interactive ? [
    'cursor-pointer',
    'hover:scale-110',
    'focus:ring-2 focus:ring-primary-500 focus:ring-offset-1',
    'active:scale-95',
  ].join(' ') : '';
  
  const intentClasses = {
    neutral: active ? 'text-neutral-normal' : 'text-neutral-light',
    primary: active ? 'text-primary-500' : 'text-neutral-light',
    warning: active ? 'text-warning-500' : 'text-neutral-light',
    error: active ? 'text-error-500' : 'text-neutral-light',
    success: active ? 'text-success-500' : 'text-neutral-light',
  };
  
  return mergeClasses(
    baseClasses,
    interactiveClasses,
    intentClasses[intent as keyof typeof intentClasses] || intentClasses.neutral
  );
};

// Types
export interface RatingProps extends BaseComponentProps<HTMLDivElement> {
  /**
   * Current rating value
   * @default 0
   */
  value?: number;
  
  /**
   * Maximum rating value
   * @default 5
   */
  max?: number;
  
  /**
   * Rating step (e.g., 0.5 for half stars)
   * @default 1
   */
  step?: number;
  
  /**
   * Size variant
   * @default 'md'
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  
  /**
   * Visual variant
   * @default 'default'
   */
  variant?: 'default' | 'compact' | 'spaced';
  
  /**
   * Color intent
   * @default 'primary'
   */
  intent?: 'neutral' | 'primary' | 'warning' | 'error' | 'success';
  
  /**
   * Rating icon type
   * @default 'star'
   */
  icon?: 'star' | 'heart' | 'thumb' | 'custom';
  
  /**
   * Custom icon component (when icon='custom')
   */
  customIcon?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  
  /**
   * Read-only mode
   * @default false
   */
  readOnly?: boolean;
  
  /**
   * Healthcare-optimized styling
   * @default false
   */
  healthcare?: boolean;
  
  /**
   * Show rating labels
   * @default false
   */
  showLabels?: boolean;
  
  /**
   * Custom labels for each rating
   */
  labels?: string[];
  
  /**
   * Show current value
   * @default false
   */
  showValue?: boolean;
  
  /**
   * Clear button
   * @default false
   */
  allowClear?: boolean;
  
  /**
   * Disabled state
   * @default false
   */
  disabled?: boolean;
  
  /** Medical device keyboard support with enhanced focus indicators */
  medicalDeviceMode?: boolean;
  /** Enable healthcare workflow shortcuts */
  enableWorkflowShortcuts?: boolean;
  /** Rating context for healthcare applications */
  ratingContext?: 'pain-scale' | 'satisfaction' | 'severity' | 'compliance' | 'quality' | 'default';
}

// Main Rating Component
export const Rating = component$<RatingProps>((props) => {
  const {
    value = 0,
    max = 5,
    step = 1,
    size = 'md',
    variant = 'default',
    intent = 'primary',
    icon = 'star',
    customIcon,
    readOnly = false,
    healthcare = false,
    showLabels = false,
    labels = [],
    showValue = false,
    allowClear = false,
    disabled = false,
    medicalDeviceMode = false,
    enableWorkflowShortcuts = false,
    ratingContext = 'default',
    class: className = '',
    ...rest
  } = props;

  const hoverValue = useSignal<number>(0);
  const displayValue = hoverValue.value || value;

  // Handle rating click/selection
  const handleRatingClick = (rating: number) => {
    if (disabled || readOnly) return;
    
    // Allow clearing if allowClear is enabled and same value is clicked
    const newValue = allowClear && value === rating ? 0 : rating;
    
    // Trigger onChange event if provided (treat as custom event)
    if (rest.onChange$) {
      const customEvent = new CustomEvent('change', { detail: newValue });
      if (typeof rest.onChange$ === 'function') {
        rest.onChange$(customEvent, null as any);
      }
    }
  };

  // Medical device keyboard state
  const keyboardState = useStore({
    instructionsId: `rating-instructions-${Math.random().toString(36).substr(2, 9)}`,
  });

  const getIcon = (filled: boolean) => {
    const iconClass = size === 'xs' ? 'w-3 h-3' : 
                     size === 'sm' ? 'w-4 h-4' : 
                     size === 'lg' ? 'w-6 h-6' : 
                     size === 'xl' ? 'w-8 h-8' : 'w-5 h-5';
    
    if (customIcon) return customIcon;
    
    switch (icon) {
      case 'heart':
        return <HeartIcon class={iconClass} filled={filled} />;
      case 'thumb':
        return <ThumbsUpIcon class={iconClass} filled={filled} />;
      default:
        return <StarIcon class={iconClass} filled={filled} />;
    }
  };

  const generateRatingItems = () => {
    const items = [];
    
    for (let i = step; i <= max; i += step) {
      const isActive = displayValue >= i;
      const isPartiallyActive = displayValue > i - step && displayValue < i;
      
      // Generate healthcare context labels
      const getHealthcareLabel = (rating: number) => {
        if (medicalDeviceMode) {
          if (ratingContext === 'pain-scale') {
            if (rating <= 2) return 'Mild pain';
            if (rating <= 4) return 'Moderate pain';
            if (rating <= 6) return 'Severe pain';
            if (rating <= 8) return 'Very severe pain';
            return 'Worst possible pain';
          } else if (ratingContext === 'satisfaction') {
            if (rating <= 2) return 'Very dissatisfied';
            if (rating <= 4) return 'Dissatisfied';
            if (rating <= 6) return 'Neutral';
            if (rating <= 8) return 'Satisfied';
            return 'Very satisfied';
          } else if (ratingContext === 'quality') {
            if (rating <= 2) return 'Poor quality';
            if (rating <= 4) return 'Fair quality';
            if (rating <= 6) return 'Good quality';
            if (rating <= 8) return 'Very good quality';
            return 'Excellent quality';
          }
        }
        return labels[i - 1] || '';
      };

      const healthcareLabel = getHealthcareLabel(i);
      const ariaLabel = `Rate ${i} out of ${max}${healthcareLabel ? ': ' + healthcareLabel : ''}`;
      
      items.push(
        <button
          key={i}
          type="button"
          class={getRatingItemClasses(isActive || isPartiallyActive, !readOnly && !disabled, intent)}
          disabled={disabled || readOnly}
          tabIndex={readOnly ? -1 : 0}
          onMouseEnter$={() => !readOnly && !disabled && (hoverValue.value = i)}
          onMouseLeave$={() => !readOnly && !disabled && (hoverValue.value = 0)}
          onClick$={() => !readOnly && !disabled && handleRatingClick(i)}
          onKeyDown$={(event) => {
            if (readOnly || disabled) return;
            
            const currentTarget = event.target as HTMLButtonElement;
            const currentRating = parseInt(currentTarget.dataset.rating || '0');
            
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              handleRatingClick(currentRating);
            } else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
              event.preventDefault();
              const nextRating = Math.min(currentRating + step, max);
              const nextButton = currentTarget.parentElement?.querySelector(`[data-rating="${nextRating}"]`) as HTMLButtonElement;
              if (nextButton) {
                nextButton.focus();
                if (medicalDeviceMode && enableWorkflowShortcuts) {
                  hoverValue.value = nextRating;
                }
              }
            } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
              event.preventDefault();
              const prevRating = Math.max(currentRating - step, step);
              const prevButton = currentTarget.parentElement?.querySelector(`[data-rating="${prevRating}"]`) as HTMLButtonElement;
              if (prevButton) {
                prevButton.focus();
                if (medicalDeviceMode && enableWorkflowShortcuts) {
                  hoverValue.value = prevRating;
                }
              }
            } else if (event.key === 'Home') {
              event.preventDefault();
              const firstButton = currentTarget.parentElement?.querySelector(`[data-rating="${step}"]`) as HTMLButtonElement;
              if (firstButton) {
                firstButton.focus();
                if (medicalDeviceMode && enableWorkflowShortcuts) {
                  hoverValue.value = step;
                }
              }
            } else if (event.key === 'End') {
              event.preventDefault();
              const lastButton = currentTarget.parentElement?.querySelector(`[data-rating="${max}"]`) as HTMLButtonElement;
              if (lastButton) {
                lastButton.focus();
                if (medicalDeviceMode && enableWorkflowShortcuts) {
                  hoverValue.value = max;
                }
              }
            } else if (event.key === 'Escape') {
              event.preventDefault();
              hoverValue.value = 0;
              currentTarget.blur();
            } else if (medicalDeviceMode && enableWorkflowShortcuts) {
              // Quick rating shortcuts for medical contexts
              if (ratingContext === 'pain-scale') {
                if (event.key === '0') {
                  event.preventDefault();
                  handleRatingClick(0);
                } else if (event.key === '5') {
                  event.preventDefault();
                  handleRatingClick(5);
                }
              } else if (ratingContext === 'satisfaction') {
                if (event.key === '1') {
                  event.preventDefault();
                  handleRatingClick(1);
                } else if (event.key === '3') {
                  event.preventDefault();
                  handleRatingClick(3);
                } else if (event.key === '5') {
                  event.preventDefault();
                  handleRatingClick(5);
                }
              }
            }
            
            // Number key direct selection
            const numberKey = parseInt(event.key);
            if (!isNaN(numberKey) && numberKey >= 1 && numberKey <= max) {
              event.preventDefault();
              handleRatingClick(numberKey);
            }
          }}
          aria-label={ariaLabel}
          aria-describedby={medicalDeviceMode ? keyboardState.instructionsId : undefined}
          data-rating={i}
        >
          {getIcon(isActive || isPartiallyActive)}
        </button>
      );
    }
    
    return items;
  };

  return (
    <div class="themed-content">
      <div
        class={mergeClasses(getRatingClasses(size, variant, healthcare), className)}
        role="radiogroup"
        aria-label={`Rating out of ${max}`}
        data-healthcare={healthcare}
        data-readonly={readOnly}
        data-value={value}
        {...rest}
      >
        {/* Rating Items */}
        <div class="flex items-center gap-1">
          {generateRatingItems()}
          
          {/* Clear Button */}
          {allowClear && value > 0 && !readOnly && !disabled && (
            <button
              type="button"
              class="ml-2 text-neutral-light hover:text-neutral-normal text-sm"
              aria-label="Clear rating"
            >
              ×
            </button>
          )}
        </div>
        
        {/* Value Display */}
        {showValue && (
          <span class="ml-2 text-sm text-neutral-normal">
            {value}{max && `/${max}`}
          </span>
        )}
        
        {/* Labels */}
        {showLabels && labels[Math.ceil(displayValue) - 1] && (
          <span class="ml-2 text-sm text-neutral-dark">
            {labels[Math.ceil(displayValue) - 1]}
          </span>
        )}
        
        {/* Medical Device Keyboard Instructions */}
        {medicalDeviceMode && (
          <div 
            id={keyboardState.instructionsId}
            class="sr-only"
          >
            Rating controls: Use arrow keys to navigate, Enter or Space to select, 
            number keys for direct selection, Home/End for first/last rating, 
            Escape to cancel.
            {ratingContext === 'pain-scale' && ' Quick access: 0 for no pain, 5 for moderate pain.'}
            {ratingContext === 'satisfaction' && ' Quick access: 1, 3, 5 for different satisfaction levels.'}
            {enableWorkflowShortcuts && ' Healthcare shortcuts enabled.'}
          </div>
        )}
      </div>
    </div>
  );
});

// Specialized Healthcare Rating Components

/**
 * Pain Scale Rating
 * Standard 1-10 pain assessment scale
 */
export const PainScaleRating = component$<{
  value: number;
  readOnly?: boolean;
  class?: string;
}>((props) => {
  const { value, readOnly = false, class: className } = props;
  
  const painLabels = [
    'No pain',
    'Mild pain',
    'Mild pain',
    'Moderate pain',
    'Moderate pain',
    'Moderate pain',
    'Severe pain',
    'Severe pain',
    'Very severe pain',
    'Worst possible pain'
  ];
  
  return (
    <div class={mergeClasses('pain-scale-rating', className)}>
      <div class="mb-2 text-sm font-medium text-neutral-darker">
        Pain Level (0-10 scale)
      </div>
      <Rating
        value={value}
        max={10}
        step={1}
        size="lg"
        intent="error"
        icon="custom"
        customIcon={<div class="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-xs font-bold" />}
        healthcare={true}
        showLabels={true}
        labels={painLabels}
        showValue={true}
        readOnly={readOnly}
      />
    </div>
  );
});

/**
 * Satisfaction Rating
 * 5-star satisfaction assessment
 */
export const SatisfactionRating = component$<{
  value: number;
  readOnly?: boolean;
  title?: string;
  class?: string;
}>((props) => {
  const { value, readOnly = false, title = 'Satisfaction Rating', class: className } = props;
  
  const satisfactionLabels = [
    'Very dissatisfied',
    'Dissatisfied', 
    'Neutral',
    'Satisfied',
    'Very satisfied'
  ];
  
  return (
    <div class={mergeClasses('satisfaction-rating', className)}>
      <div class="mb-2 text-sm font-medium text-neutral-darker">
        {title}
      </div>
      <Rating
        value={value}
        max={5}
        size="lg"
        intent="warning"
        icon="star"
        healthcare={true}
        showLabels={true}
        labels={satisfactionLabels}
        allowClear={!readOnly}
        readOnly={readOnly}
      />
    </div>
  );
});

/**
 * Severity Rating
 * Medical condition severity assessment
 */
export const SeverityRating = component$<{
  value: number;
  readOnly?: boolean;
  condition?: string;
  class?: string;
}>((props) => {
  const { value, readOnly = false, condition = 'Condition', class: className } = props;
  
  const severityLabels = [
    'Mild',
    'Moderate',
    'Severe',
    'Critical'
  ];
  
  const severityColors = ['success', 'warning', 'error', 'error'] as const;
  
  return (
    <div class={mergeClasses('severity-rating', className)}>
      <div class="mb-2 text-sm font-medium text-neutral-darker">
        {condition} Severity
      </div>
      <Rating
        value={value}
        max={4}
        size="md"
        intent={severityColors[Math.ceil(value) - 1] || 'neutral'}
        icon="custom"
        customIcon={<div class="w-4 h-4 rounded bg-current" />}
        healthcare={true}
        showLabels={true}
        labels={severityLabels}
        readOnly={readOnly}
      />
    </div>
  );
});

/**
 * Numeric Scale Rating
 * Simple numeric rating for clinical assessments
 */
export const NumericScaleRating = component$<{
  value: number;
  min?: number;
  max?: number;
  readOnly?: boolean;
  title?: string;
  class?: string;
}>((props) => {
  const { 
    value, 
    min = 1, 
    max = 10, 
    readOnly = false, 
    title = 'Rating Scale',
    class: className 
  } = props;
  
  return (
    <div class={mergeClasses('numeric-scale-rating', className)}>
      <div class="mb-2 text-sm font-medium text-neutral-darker">
        {title} ({min}-{max})
      </div>
      <div class="flex items-center gap-2">
        {Array.from({ length: max - min + 1 }, (_, i) => {
          const num = min + i;
          const isActive = value === num;
          
          return (
            <button
              key={num}
              type="button"
              class={mergeClasses(
                'w-10 h-10 rounded-lg border-2 font-medium transition-all duration-150',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1',
                isActive 
                  ? 'bg-primary-500 border-primary-500 text-white' 
                  : 'border-neutral-light text-neutral-dark hover:border-primary-300',
                readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-105'
              )}
              disabled={readOnly}
              aria-label={`Rate ${num} out of ${max}`}
              aria-pressed={isActive}
            >
              {num}
            </button>
          );
        })}
      </div>
    </div>
  );
});
