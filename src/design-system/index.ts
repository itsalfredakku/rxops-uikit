/**
 * RxOps UIKit - Design System with Theme Support
 * Main entry point for design system with healthcare theme system
 */

// Theme System
export { ThemeProvider, ThemeContext } from './theme-provider';
export { ThemeToggle, ThemeStatusIndicator, EmergencyThemeControls } from './theme-toggle';

// Design System Core
export * from './tokens';
export * from './types';
export * from './token-utils';
export * from './token-guide';

// Theme Types
export type {
  SemanticShade,
  ThemeContext as ThemeContextType,
  ThemeMode,
  ThemeModifiers,
  ThemeState,
  ThemeProviderProps
} from './theme-provider';

// Theme Utilities
export {
  themePresets,
  getThemeColor,
  isHighContrastTheme,
  getClinicalPriorityColor,
  applyEmergencyThemeOverride,
  removeEmergencyThemeOverride
} from './theme-provider';
