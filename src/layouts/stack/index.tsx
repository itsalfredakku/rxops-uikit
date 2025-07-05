import { component$, Slot } from '@builder.io/qwik';
import type { Spacing, Alignment, Justify } from '../../design-system/types';
import { BaseComponentProps, mergeClasses } from '../../design-system/props';

// Enhanced Stack component following Radzen's proven approach
export type StackDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';
export type FlexWrap = 'wrap' | 'nowrap' | 'wrap-reverse';

export interface StackProps extends BaseComponentProps<HTMLDivElement> {
  /** Stack direction - similar to flex-direction. Replaces orientation for more flexibility */
  direction?: 'row' | 'column';
  /** Gap between items using design system spacing tokens */
  gap?: Spacing;
  /** Cross-axis alignment */
  alignItems?: Alignment | 'baseline';
  /** Main-axis alignment */
  justifyContent?: Justify;
  /** Whether items should wrap */
  wrap?: FlexWrap | boolean; // Support both string and boolean for convenience
  /** Reverse the direction */
  reverse?: boolean;
  
  // Legacy support - will be deprecated
  /** @deprecated Use direction="row" instead */
  orientation?: 'horizontal' | 'vertical';
}

// Mapping from tokenized spacing to Tailwind gap classes
const gapClasses: Record<Spacing, string> = {
  "0": 'gap-0',
  "1": 'gap-1',
  "2": 'gap-2',
  "3": 'gap-3',
  "4": 'gap-4',
  "6": 'gap-6',
  "8": 'gap-8',
  "12": 'gap-12',
  "16": 'gap-16',
  "20": 'gap-20',
  "24": 'gap-24',
};

// Enhanced alignment classes for Stack (includes baseline)
const alignClasses: Record<Alignment | 'baseline', string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
};

// Mapping from tokenized justify to Tailwind classes
const justifyClasses: Record<Justify, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
};

// Flex wrap classes
const wrapClasses: Record<string, string> = {
  wrap: 'flex-wrap',
  nowrap: 'flex-nowrap',
  'wrap-reverse': 'flex-wrap-reverse',
  true: 'flex-wrap',
  false: 'flex-nowrap',
};

/**
 * Flexible Stack component following Radzen's proven design patterns.
 * 
 * A single, powerful layout component that can handle all flex layout scenarios:
 * - Vertical stacks (column direction)
 * - Horizontal stacks (row direction) 
 * - Wrapping content
 * - All alignment and justification options
 * - Gap spacing using design system tokens
 * 
 * This replaces the need for separate Row/Column components in most cases.
 * 
 * @example
 * ```tsx
 * // Vertical stack (default)
 * <Stack gap="4" alignItems="center">
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 * </Stack>
 * 
 * // Horizontal stack with wrapping
 * <Stack direction="row" wrap="wrap" gap="2" justifyContent="between">
 *   <Button>Action 1</Button>
 *   <Button>Action 2</Button>
 * </Stack>
 * 
 * // Reverse direction
 * <Stack direction="column" reverse gap="6">
 *   <Text>Last item (appears first)</Text>
 *   <Text>First item (appears last)</Text>
 * </Stack>
 * ```
 */
export const Stack = component$<StackProps>((props) => {
  const {
    // New API (Radzen-style)
    direction,
    gap = "4",
    alignItems,
    justifyContent = 'start',
    wrap = false,
    reverse = false,
    
    // Legacy support
    orientation,
    
    // Base props
    class: qwikClass,
    className,
    style,
    ...rest
  } = props;

  // Handle direction with fallback to legacy orientation
  const finalDirection = direction || (orientation === 'horizontal' ? 'row' : 'column');
  const isRow = finalDirection === 'row';
  
  // Smart defaults for alignItems based on direction
  const defaultAlignItems = isRow ? 'center' : 'stretch';
  const finalAlignItems = alignItems || defaultAlignItems;

  // Direction classes with reverse support
  const directionClass = isRow 
    ? (reverse ? 'flex-row-reverse' : 'flex-row')
    : (reverse ? 'flex-col-reverse' : 'flex-col');

  // Handle wrap prop (support both boolean and string)
  const wrapClass = wrapClasses[String(wrap)] || 'flex-nowrap';

  const finalClass = mergeClasses(
    'flex',
    directionClass,
    gapClasses[gap],
    alignClasses[finalAlignItems],
    justifyClasses[justifyContent],
    wrapClass,
    qwikClass,
    className
  );

  return (
    <div class={finalClass} style={style} {...rest}>
      <Slot />
    </div>
  );
});
