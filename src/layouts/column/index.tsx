import { component$, Slot } from '@builder.io/qwik';
import type { Spacing, Alignment, Justify } from '../../design-system/types';
import { BaseComponentProps, mergeClasses } from '../../design-system/props';

// Responsive column size type (12-column grid system like Radzen)
export interface ResponsiveSize {
  xs?: number; // 0-12 columns for mobile
  sm?: number; // 0-12 columns for small screens
  md?: number; // 0-12 columns for medium screens  
  lg?: number; // 0-12 columns for large screens
  xl?: number; // 0-12 columns for extra large screens
}

export interface ColumnProps extends Omit<BaseComponentProps<HTMLDivElement>, 'size'> {
  gap?: Spacing;
  alignItems?: Alignment;
  justifyContent?: Justify;
  size?: ResponsiveSize | number; // Radzen-style responsive column sizing  
  offset?: ResponsiveSize | number; // Column offset
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

// Mapping from tokenized alignment to Tailwind classes
const alignClasses: Record<Alignment, string> = {
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

// Generate responsive column classes (12-column grid system)
const generateColumnClasses = (cols?: ResponsiveSize | number): string[] => {
  if (!cols) return [];
  
  const colToTailwind = (col: number): string => {
    switch (col) {
      case 1: return 'w-1/12';
      case 2: return 'w-1/6';  
      case 3: return 'w-1/4';
      case 4: return 'w-1/3';
      case 5: return 'w-5/12';
      case 6: return 'w-1/2';
      case 7: return 'w-7/12';
      case 8: return 'w-2/3';
      case 9: return 'w-3/4';
      case 10: return 'w-5/6';
      case 11: return 'w-11/12';
      case 12: return 'w-full';
      default: return 'w-auto';
    }
  };
  
  if (typeof cols === 'number') {
    return [colToTailwind(cols)];
  }
  
  const classes: string[] = [];
  
  // Generate responsive classes
  if (cols.xs) classes.push(colToTailwind(cols.xs));
  if (cols.sm) classes.push(`sm:${colToTailwind(cols.sm)}`);
  if (cols.md) classes.push(`md:${colToTailwind(cols.md)}`);
  if (cols.lg) classes.push(`lg:${colToTailwind(cols.lg)}`);
  if (cols.xl) classes.push(`xl:${colToTailwind(cols.xl)}`);
  
  return classes;
};

// Generate responsive offset classes
const generateOffsetClasses = (offset?: ResponsiveSize | number): string[] => {
  if (!offset) return [];
  
  const offsetToTailwind = (offset: number): string => {
    switch (offset) {
      case 1: return 'ml-1/12';
      case 2: return 'ml-2/12';
      case 3: return 'ml-3/12';  
      case 4: return 'ml-4/12';
      case 5: return 'ml-5/12';
      case 6: return 'ml-6/12';
      case 7: return 'ml-7/12';
      case 8: return 'ml-8/12';
      case 9: return 'ml-9/12';
      case 10: return 'ml-10/12';
      case 11: return 'ml-11/12';
      default: return 'ml-0';
    }
  };
  
  if (typeof offset === 'number') {
    return [offsetToTailwind(offset)];
  }
  
  const classes: string[] = [];
  
  if (offset.xs) classes.push(offsetToTailwind(offset.xs));
  if (offset.sm) classes.push(`sm:${offsetToTailwind(offset.sm).replace('ml-', 'ml-')}`);
  if (offset.md) classes.push(`md:${offsetToTailwind(offset.md).replace('ml-', 'ml-')}`);
  if (offset.lg) classes.push(`lg:${offsetToTailwind(offset.lg).replace('ml-', 'ml-')}`);
  if (offset.xl) classes.push(`xl:${offsetToTailwind(offset.xl).replace('ml-', 'ml-')}`);
  
  return classes;
};

/**
 * Column component for vertical layout with responsive sizing (Radzen-style).
 * Uses 12-column grid system for responsive layouts.
 * 
 * @example
 * <Row>
 *   <Column cols={{ sm: 12, md: 4 }}>Content</Column>
 *   <Column cols={{ sm: 12, md: 8 }}>Main</Column>
 * </Row>
 */
export const Column = component$<ColumnProps>((props) => {
  const {
    gap = "4", // Default to spacing token "4" (equivalent to gap-4)
    alignItems = 'stretch',
    justifyContent = 'start',
    size: cols,
    offset,
    class: qwikClass,
    className,
    style,
    ...rest
  } = props;

  const columnClasses = generateColumnClasses(cols);
  const offsetClasses = generateOffsetClasses(offset);

  const finalClass = mergeClasses(
    'flex',
    'flex-col',
    gapClasses[gap],
    alignClasses[alignItems],
    justifyClasses[justifyContent],
    ...columnClasses,
    ...offsetClasses,
    qwikClass,
    className
  );

  return (
    <div class={finalClass} style={style} {...rest}>
      <Slot />
    </div>
  );
});
