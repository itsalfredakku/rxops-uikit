export { Text } from './text';
export type { TextProps } from './text';

// Re-export types from design system for convenience
export type { 
  TextStyle as TextVariant,  // Alias for backward compatibility
  TextWeight, 
  TextAlign, 
  TextTransform, 
  TextDecoration 
} from '../../../design-system/types';
