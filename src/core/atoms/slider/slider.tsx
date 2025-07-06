/**
 * Slider/Range Component
 * Medical industry-focused range input component for medical measurements
 * 
 * Features:
 * - Medical measurement ranges (vital signs, pain scales, dosages)
 * - Dual range sliders for normal ranges
 * - Accessibility with proper ARIA labels and keyboard navigation
 * - Visual indicators for critical values
 * - Touch-friendly for medical device usage
 * - High contrast mode for clinical environments
 */

import { component$, useSignal, $, type QRL } from "@builder.io/qwik";
import { BaseComponentProps, mergeClasses } from "../../../design-system/props";
import type { Color } from "../../../design-system/types";

export type SliderVariant = 'default' | 'range' | 'stepped' | 'medical';
export type SliderSize = 'sm' | 'md' | 'lg' | 'xl';
export type MedicalScale = 'pain' | 'pressure' | 'temperature' | 'dosage' | 'weight' | 'height';

export interface SliderProps extends Omit<BaseComponentProps<HTMLDivElement>, 'onChange$' | 'onInput$'> {
  /**
   * Current value (single slider) or array for range
   */
  value?: number | [number, number];
  
  /**
   * Default value
   */
  defaultValue?: number | [number, number];
  
  /**
   * Minimum value
   */
  min?: number;
  
  /**
   * Maximum value
   */
  max?: number;
  
  /**
   * Step increment
   */
  step?: number;
  
  /**
   * Slider variant
   */
  variant?: SliderVariant;
  
  /**
   * Size of the slider
   */
  size?: SliderSize;
  
  /**
   * Color theme
   */
  color?: Color;
  
  /**
   * Medical scale context
   */
  medicalScale?: MedicalScale;
  
  /**
   * Show value labels
   */
  showLabels?: boolean;
  
  /**
   * Show tick marks
   */
  showTicks?: boolean;
  
  /**
   * Tick mark positions (overrides automatic ticks)
   */
  ticks?: number[];
  
  /**
   * Critical value indicators
   */
  criticalValues?: {
    low?: number;
    high?: number;
    target?: number;
  };
  
  /**
   * Normal range indicators
   */
  normalRange?: [number, number];
  
  /**
   * Disabled state
   */
  disabled?: boolean;
  
  /**
   * High contrast mode
   */
  highContrast?: boolean;
  
  /**
   * Touch-friendly mode (larger touch targets)
   */
  touchFriendly?: boolean;
  
  /**
   * Value formatter function
   */
  formatValue?: (value: number) => string;
  
  /**
   * Unit label
   */
  unit?: string;
  
  /**
   * Help text
   */
  helpText?: string;
}

const sizeClasses = {
  sm: {
    track: 'h-1',
    thumb: 'w-3 h-3',
    label: 'text-xs',
    container: 'py-2',
  },
  md: {
    track: 'h-2',
    thumb: 'w-4 h-4',
    label: 'text-sm',
    container: 'py-3',
  },
  lg: {
    track: 'h-3',
    thumb: 'w-5 h-5',
    label: 'text-base',
    container: 'py-4',
  },
  xl: {
    track: 'h-4',
    thumb: 'w-6 h-6',
    label: 'text-lg',
    container: 'py-5',
  },
};

const touchFriendlySizeClasses = {
  sm: {
    track: 'h-2',
    thumb: 'w-5 h-5',
    label: 'text-sm',
    container: 'py-3',
  },
  md: {
    track: 'h-3',
    thumb: 'w-6 h-6',
    label: 'text-base',
    container: 'py-4',
  },
  lg: {
    track: 'h-4',
    thumb: 'w-7 h-7',
    label: 'text-lg',
    container: 'py-5',
  },
  xl: {
    track: 'h-5',
    thumb: 'w-8 h-8',
    label: 'text-xl',
    container: 'py-6',
  },
};

const colorClasses = {
  primary: 'bg-primary-500',
  secondary: 'bg-secondary-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  error: 'bg-error-500',
  info: 'bg-info-500',
  neutral: 'bg-neutral-normal',
};

const medicalScaleDefaults = {
  pain: { min: 0, max: 10, step: 1, unit: '/10', criticalValues: { high: 7 } },
  pressure: { min: 60, max: 200, step: 1, unit: 'mmHg', normalRange: [90, 140] as [number, number] },
  temperature: { min: 95, max: 110, step: 0.1, unit: '°F', normalRange: [97.8, 99.1] as [number, number] },
  dosage: { min: 0, max: 1000, step: 1, unit: 'mg' },
  weight: { min: 0, max: 500, step: 0.1, unit: 'lbs' },
  height: { min: 0, max: 96, step: 0.1, unit: 'in' },
} as const;

export const Slider = component$<SliderProps>((props) => {
  const {
    value,
    defaultValue = 0,
    min = 0,
    max = 100,
    step = 1,
    variant: _variant = 'default',
    size = 'md',
    color = 'primary',
    medicalScale,
    showLabels = false,
    showTicks = false,
    ticks,
    criticalValues,
    normalRange,
    disabled = false,
    highContrast = false,
    touchFriendly = false,
    formatValue,
    unit,
    helpText,
    class: className,
    ...rest
  } = props;

  // Apply medical scale defaults with proper typing
  const medicalDefaults = medicalScale ? medicalScaleDefaults[medicalScale] : undefined;
  const finalMin = medicalDefaults?.min ?? min;
  const finalMax = medicalDefaults?.max ?? max;
  const finalStep = medicalDefaults?.step ?? step;
  const finalUnit = medicalDefaults?.unit ?? unit;
  const finalCriticalValues = (medicalDefaults as Record<string, unknown>)?.criticalValues as { low?: number; high?: number; target?: number } | undefined ?? criticalValues;
  const finalNormalRange = (medicalDefaults as Record<string, unknown>)?.normalRange as [number, number] | undefined ?? normalRange;

  const currentValue = useSignal<number | [number, number]>(value ?? defaultValue);
  const isDragging = useSignal(false);
  const activeThumb = useSignal<number | null>(null); // For range sliders: 0 = first thumb, 1 = second thumb

  const sizeConfig = touchFriendly ? touchFriendlySizeClasses[size] : sizeClasses[size];
  
  const isRange = Array.isArray(currentValue.value);
  const percentage = isRange
    ? [
        (((currentValue.value as [number, number])[0] - finalMin) / (finalMax - finalMin)) * 100,
        (((currentValue.value as [number, number])[1] - finalMin) / (finalMax - finalMin)) * 100,
      ]
    : ((currentValue.value as number - finalMin) / (finalMax - finalMin)) * 100;

  const handleValueChange = $((newValue: number | [number, number]) => {
    currentValue.value = newValue;
    // Component now works with controlled value updates
  });

  const handleKeyDown = $((event: KeyboardEvent, element: HTMLDivElement) => {
    if (disabled) return;
    
    const thumbIndex = element.dataset.thumbIndex ? parseInt(element.dataset.thumbIndex) : undefined;
    
    const { key } = event;
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(key)) {
      return;
    }
    
    event.preventDefault();
    
    let delta = 0;
    switch (key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        delta = -finalStep;
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        delta = finalStep;
        break;
      case 'Home':
        if (isRange && thumbIndex !== undefined) {
          const newValue = [...(currentValue.value as [number, number])] as [number, number];
          newValue[thumbIndex] = finalMin;
          handleValueChange(newValue);
        } else {
          handleValueChange(finalMin);
        }
        return;
      case 'End':
        if (isRange && thumbIndex !== undefined) {
          const newValue = [...(currentValue.value as [number, number])] as [number, number];
          newValue[thumbIndex] = finalMax;
          handleValueChange(newValue);
        } else {
          handleValueChange(finalMax);
        }
        return;
    }
    
    if (isRange && thumbIndex !== undefined) {
      const currentValues = currentValue.value as [number, number];
      const newValue = Math.max(finalMin, Math.min(finalMax, currentValues[thumbIndex] + delta));
      const newValues = [...currentValues] as [number, number];
      newValues[thumbIndex] = newValue;
      
      // Ensure thumbs don't cross
      if (thumbIndex === 0 && newValue > newValues[1]) {
        newValues[1] = newValue;
      } else if (thumbIndex === 1 && newValue < newValues[0]) {
        newValues[0] = newValue;
      }
      
      handleValueChange(newValues);
    } else {
      const newValue = Math.max(finalMin, Math.min(finalMax, (currentValue.value as number) + delta));
      handleValueChange(newValue);
    }
  });

  const handlePointerDown = $((event: PointerEvent, element: HTMLDivElement) => {
    if (disabled) return;
    
    const thumbIndex = element.dataset.thumbIndex ? parseInt(element.dataset.thumbIndex) : undefined;
    
    event.preventDefault();
    isDragging.value = true;
    activeThumb.value = thumbIndex ?? null;
    
    // Set pointer capture for smooth dragging
    element.setPointerCapture(event.pointerId);
  });

  const handlePointerMove = $((event: PointerEvent) => {
    if (!isDragging.value || disabled) return;
    
    event.preventDefault();
    
    // Calculate the new value based on pointer position
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const newValue = finalMin + percentage * (finalMax - finalMin);
    
    // Round to nearest step
    const steppedValue = Math.round(newValue / finalStep) * finalStep;
    const clampedValue = Math.max(finalMin, Math.min(finalMax, steppedValue));
    
    if (isRange && activeThumb.value !== null) {
      const currentValues = currentValue.value as [number, number];
      const newValues = [...currentValues] as [number, number];
      newValues[activeThumb.value] = clampedValue;
      
      // Ensure thumbs don't cross
      if (activeThumb.value === 0 && clampedValue > newValues[1]) {
        newValues[1] = clampedValue;
      } else if (activeThumb.value === 1 && clampedValue < newValues[0]) {
        newValues[0] = clampedValue;
      }
      
      handleValueChange(newValues);
    } else {
      handleValueChange(clampedValue);
    }
  });

  const handleTrackClick = $((event: PointerEvent) => {
    if (disabled || isDragging.value) return;
    
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const newValue = finalMin + percentage * (finalMax - finalMin);
    
    // Round to nearest step
    const steppedValue = Math.round(newValue / finalStep) * finalStep;
    const clampedValue = Math.max(finalMin, Math.min(finalMax, steppedValue));
    
    if (isRange) {
      const currentValues = currentValue.value as [number, number];
      // Determine which thumb to move based on which is closer
      const distanceToMin = Math.abs(clampedValue - currentValues[0]);
      const distanceToMax = Math.abs(clampedValue - currentValues[1]);
      
      const newValues = [...currentValues] as [number, number];
      if (distanceToMin <= distanceToMax) {
        newValues[0] = clampedValue;
        if (newValues[0] > newValues[1]) {
          newValues[1] = newValues[0];
        }
      } else {
        newValues[1] = clampedValue;
        if (newValues[1] < newValues[0]) {
          newValues[0] = newValues[1];
        }
      }
      
      handleValueChange(newValues);
    } else {
      handleValueChange(clampedValue);
    }
  });

  const handlePointerUp = $((event: PointerEvent) => {
    if (!isDragging.value) return;
    
    isDragging.value = false;
    activeThumb.value = null;
    
    // Release pointer capture
    (event.target as Element).releasePointerCapture(event.pointerId);
  });

  const formatDisplayValue = (val: number) => {
    if (formatValue) return formatValue(val);
    if (finalUnit) return `${val}${finalUnit}`;
    return val.toString();
  };

  const containerClasses = mergeClasses(
    'slider-container relative',
    sizeConfig.container,
    disabled && 'opacity-50 cursor-not-allowed',
    className
  );

  const trackClasses = mergeClasses(
    'slider-track relative w-full rounded-full',
    sizeConfig.track,
    highContrast ? 'bg-neutral-darker' : 'bg-neutral-light',
    'focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-1'
  );

  const fillClasses = mergeClasses(
    'slider-fill absolute top-0 left-0 h-full rounded-full transition-all duration-200',
    colorClasses[color],
    highContrast && 'border-2 border-white'
  );

  const thumbClasses = mergeClasses(
    'slider-thumb absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full',
    'border-2 border-white shadow-md cursor-pointer transition-all duration-200',
    'hover:scale-110 focus:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1',
    sizeConfig.thumb,
    colorClasses[color],
    disabled && 'cursor-not-allowed hover:scale-100 focus:scale-100',
    highContrast && 'border-4 border-black shadow-lg'
  );

  return (
    <div class="themed-content">
      <div class={containerClasses} {...rest}>
      {/* Labels */}
      {showLabels && (
        <div class="slider-labels flex justify-between mb-2">
          <span class={mergeClasses(sizeConfig.label, 'text-neutral-normal')}>
            {formatDisplayValue(finalMin)}
          </span>
          <span class={mergeClasses(sizeConfig.label, 'text-neutral-normal')}>
            {formatDisplayValue(finalMax)}
          </span>
        </div>
      )}

      {/* Current Value Display */}
      <div class="slider-value-display flex justify-center mb-2">
        <span class={mergeClasses(sizeConfig.label, 'font-medium text-neutral-darker')}>
          {isRange
            ? `${formatDisplayValue((currentValue.value as [number, number])[0])} - ${formatDisplayValue((currentValue.value as [number, number])[1])}`
            : formatDisplayValue(currentValue.value as number)
          }
        </span>
      </div>

      {/* Slider Track */}
      <div 
        class={trackClasses}
        onPointerDown$={handleTrackClick}
        onPointerMove$={handlePointerMove}
        onPointerUp$={handlePointerUp}
      >
        {/* Normal Range Indicator */}
        {finalNormalRange && (
          <div
            class="absolute top-0 h-full bg-success-200 rounded-full opacity-60"
            style={{
              left: `${((finalNormalRange[0] - finalMin) / (finalMax - finalMin)) * 100}%`,
              width: `${((finalNormalRange[1] - finalNormalRange[0]) / (finalMax - finalMin)) * 100}%`,
            }}
          />
        )}

        {/* Critical Value Indicators */}
        {finalCriticalValues?.low && (
          <div
            class="absolute top-0 w-0.5 h-full bg-error-500"
            style={{
              left: `${((finalCriticalValues.low - finalMin) / (finalMax - finalMin)) * 100}%`,
            }}
          />
        )}
        {finalCriticalValues?.high && (
          <div
            class="absolute top-0 w-0.5 h-full bg-error-500"
            style={{
              left: `${((finalCriticalValues.high - finalMin) / (finalMax - finalMin)) * 100}%`,
            }}
          />
        )}
        {finalCriticalValues?.target && (
          <div
            class="absolute top-0 w-0.5 h-full bg-success-600"
            style={{
              left: `${((finalCriticalValues.target - finalMin) / (finalMax - finalMin)) * 100}%`,
            }}
          />
        )}

        {/* Fill */}
        <div
          class={fillClasses}
          style={{
            left: isRange ? `${(percentage as number[])[0]}%` : '0%',
            width: isRange ? `${(percentage as number[])[1] - (percentage as number[])[0]}%` : `${percentage}%`,
          }}
        />

        {/* Tick Marks */}
        {showTicks && (
          <div class="slider-ticks absolute top-0 w-full h-full">
            {(ticks || Array.from({ length: Math.floor((finalMax - finalMin) / finalStep) + 1 }, (_, i) => finalMin + i * finalStep))
              .map((tick) => (
                <div
                  key={tick}
                  class="absolute top-0 w-px h-full bg-neutral-normal"
                  style={{
                    left: `${((tick - finalMin) / (finalMax - finalMin)) * 100}%`,
                  }}
                />
              ))}
          </div>
        )}

        {/* Thumb(s) */}
        {isRange ? (
          <>
            <div
              class={thumbClasses}
              style={{ left: `${(percentage as number[])[0]}%` }}
              tabIndex={disabled ? -1 : 0}
              role="slider"
              aria-valuemin={finalMin}
              aria-valuemax={finalMax}
              aria-valuenow={(currentValue.value as [number, number])[0]}
              aria-label={`Minimum value: ${formatDisplayValue((currentValue.value as [number, number])[0])}`}
              data-thumb-index="0"
              onKeyDown$={handleKeyDown}
              onPointerDown$={handlePointerDown}
            />
            <div
              class={thumbClasses}
              style={{ left: `${(percentage as number[])[1]}%` }}
              tabIndex={disabled ? -1 : 0}
              role="slider"
              aria-valuemin={finalMin}
              aria-valuemax={finalMax}
              aria-valuenow={(currentValue.value as [number, number])[1]}
              aria-label={`Maximum value: ${formatDisplayValue((currentValue.value as [number, number])[1])}`}
              data-thumb-index="1"
              onKeyDown$={handleKeyDown}
              onPointerDown$={handlePointerDown}
            />
          </>
        ) : (
          <div
            class={thumbClasses}
            style={{ left: `${percentage}%` }}
            tabIndex={disabled ? -1 : 0}
            role="slider"
            aria-valuemin={finalMin}
            aria-valuemax={finalMax}
            aria-valuenow={currentValue.value as number}
            aria-label={`Value: ${formatDisplayValue(currentValue.value as number)}`}
            onKeyDown$={handleKeyDown}
            onPointerDown$={handlePointerDown}
          />
        )}
      </div>

      {/* Help Text */}
      {helpText && (
        <div class={mergeClasses('mt-2', sizeConfig.label, 'text-neutral-normal')}>
          {helpText}
        </div>
      )}
    </div>
    </div>
  );
});

/**
 * Healthcare-specific slider components
 */
export const PainScaleSlider = component$<Omit<SliderProps, 'medicalScale'>>((props) => (
  <Slider medicalScale="pain" showLabels={true} showTicks={true} {...props} />
));

export const BloodPressureSlider = component$<Omit<SliderProps, 'medicalScale'>>((props) => (
  <Slider medicalScale="pressure" showLabels={true} normalRange={[90, 140]} {...props} />
));

export const TemperatureSlider = component$<Omit<SliderProps, 'medicalScale'>>((props) => (
  <Slider medicalScale="temperature" showLabels={true} normalRange={[97.8, 99.1]} {...props} />
));

export const DosageSlider = component$<Omit<SliderProps, 'medicalScale'>>((props) => (
  <Slider medicalScale="dosage" showLabels={true} {...props} />
));

export const WeightSlider = component$<Omit<SliderProps, 'medicalScale'>>((props) => (
  <Slider medicalScale="weight" showLabels={true} {...props} />
));

export const HeightSlider = component$<Omit<SliderProps, 'medicalScale'>>((props) => (
  <Slider medicalScale="height" showLabels={true} {...props} />
));

/**
 * Range Slider Component
 * For selecting value ranges
 */
export interface RangeSliderProps extends Omit<SliderProps, 'value' | 'defaultValue'> {
  value?: [number, number];
  defaultValue?: [number, number];
}

export const RangeSlider = component$<RangeSliderProps>((props) => {
  const { defaultValue = [20, 80], ...rest } = props;
  return <Slider variant="range" defaultValue={defaultValue} {...rest} />;
});

/**
 * Medical Range Slider
 * For normal value ranges in medical contexts
 */
export const MedicalRangeSlider = component$<RangeSliderProps>((props) => (
  <RangeSlider touchFriendly={true} highContrast={true} showLabels={true} {...props} />
));

export default Slider;
