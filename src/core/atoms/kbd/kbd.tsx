/**
 * Kbd Component
 * For displaying keyboard shortcuts and key combinations
 * 
 * Features:
 * - Healthcare-specific shortcuts (medical device keys)
 * - Accessibility support with proper semantics
 * - Medical workflow key combinations
 * - Platform detection (Mac/Windows/Linux)
 */

import { component$, Slot } from "@builder.io/qwik";
import { BaseComponentProps, mergeClasses } from "../../../design-system/props";

export interface KbdProps extends BaseComponentProps<HTMLElement> {
  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Visual variant
   */
  variant?: 'default' | 'outlined' | 'subtle';
  
  /**
   * Key combination separator (for multiple keys)
   */
  separator?: string;
  
  /**
   * Platform-specific styling
   */
  platform?: 'mac' | 'windows' | 'linux' | 'auto';
  
  /**
   * Healthcare context styling
   */
  healthcare?: boolean;
}

const sizeClasses = {
  sm: 'text-xs px-1.5 py-0.5 min-w-[1.25rem]',
  md: 'text-sm px-2 py-1 min-w-[1.5rem]',
  lg: 'text-base px-2.5 py-1.5 min-w-[2rem]',
};

const variantClasses = {
  default: 'bg-neutral-lighter border border-neutral-light text-neutral-dark shadow-sm',
  outlined: 'bg-transparent border border-neutral-light text-neutral-normal',
  subtle: 'bg-neutral-lighter border border-neutral-lighter text-neutral-normal',
};

const healthcareClasses = {
  default: 'bg-primary-50 border border-primary-200 text-primary-700',
  outlined: 'bg-transparent border border-primary-300 text-primary-600', 
  subtle: 'bg-primary-25 border border-primary-150 text-primary-600',
};

export const Kbd = component$<KbdProps>((props) => {
  const {
    size = 'md',
    variant = 'default',
    separator: _separator = '+',
    platform: _platform = 'auto',
    healthcare = false,
    class: className,
    ...rest
  } = props;

  const baseClasses = [
    'kbd',
    'inline-flex items-center justify-center',
    'font-mono font-medium',
    'rounded border',
    'whitespace-nowrap',
    'leading-none',
    sizeClasses[size],
    healthcare ? healthcareClasses[variant] : variantClasses[variant],
  ];

  return (
    <div class="themed-content">
      <kbd
        class={mergeClasses(...baseClasses, className)}
        {...rest}
      >
        <Slot />
      </kbd>
    </div>
  );
});

/**
 * KbdSequence - For displaying key combinations
 */
export interface KbdSequenceProps extends Omit<KbdProps, 'children'> {
  /**
   * Array of keys in the sequence
   */
  keys: string[];
}

export const KbdSequence = component$<KbdSequenceProps>((props) => {
  const {
    keys,
    separator = '+',
    size = 'md',
    variant = 'default',
    platform = 'auto',
    healthcare = false,
    class: className,
    ...rest
  } = props;

  return (
    <div class="themed-content">
      <span
        class={mergeClasses('kbd-sequence inline-flex items-center gap-1', className)}
        {...rest}
      >
        {keys.map((key, index) => (
          <>
            <Kbd
              key={index}
              size={size}
              variant={variant}
              platform={platform}
              healthcare={healthcare}
            >
              {key}
            </Kbd>
            {index < keys.length - 1 && (
              <span class="text-neutral-light text-sm">{separator}</span>
            )}
          </>
        ))}
      </span>
    </div>
  );
});

/**
 * Common healthcare keyboard shortcuts
 */
export const healthcareShortcuts = {
  // Emergency shortcuts
  emergency: ['F1'],
  codeBlue: ['Ctrl', 'Shift', 'B'],
  codeRed: ['Ctrl', 'Shift', 'R'],
  
  // Clinical documentation
  saveNote: ['Ctrl', 'S'],
  newPatient: ['Ctrl', 'N'],
  searchPatient: ['Ctrl', 'F'],
  
  // Medical device shortcuts
  vitalSigns: ['Alt', 'V'],
  medication: ['Alt', 'M'],
  labResults: ['Alt', 'L'],
  
  // Navigation
  nextPatient: ['Tab'],
  prevPatient: ['Shift', 'Tab'],
  dashboard: ['Alt', 'D'],
} as const;

export default Kbd;
