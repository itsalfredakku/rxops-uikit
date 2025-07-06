/**
 * Design Token Usage Guide
 * 
 * This guide helps developers use design tokens consistently across components.
 * Always prefer design tokens over hardcoded values for maintainability and consistency.
 */

import { 
  createColorVariant, 
  getColorClass, 
  getHealthcareColorClass,
  getInteractiveClasses,
  getSpacingClass,
  getRadiusClass,
  getShadowClass 
} from './token-utils';

// ✅ GOOD: Using design tokens
export const goodExamples = {
  
  // Color usage
  primaryButton: createColorVariant('primary', 'solid'),
  successAlert: getColorClass('bg', 'success', 'lighter') + ' ' + getColorClass('text', 'success', 'darker'),
  healthcareStatus: getHealthcareColorClass('bg', 'healthy', 'lighter'),
  
  // Spacing usage  
  cardPadding: getSpacingClass('p', 6),
  itemGap: getSpacingClass('gap', 4),
  
  // Interactive states
  interactiveElement: getInteractiveClasses('primary'),
  
  // Border radius
  cardRadius: getRadiusClass('lg'),
  
  // Shadows
  cardShadow: getShadowClass('md'),
  
  // Complete component example
  wellDesignedCard: [
    // Layout
    'flex flex-col',
    getSpacingClass('p', 6),
    getSpacingClass('gap', 4),
    
    // Visual design using tokens
    'bg-white',
    getRadiusClass('lg'),
    getShadowClass('md'),
    'border border-neutral-light',
    
    // Interactive behavior
    getInteractiveClasses('primary'),
    'hover:shadow-lg',
    
    // Typography
    'text-neutral-darker'
  ].join(' ')
};

// ❌ BAD: Hardcoded values - Examples of what NOT to do
export const badExamples = {
  
  // Avoid hardcoded colors
  hardcodedColors: 'bg-primary text-white',  // Better: Use createColorVariant('primary', 'solid')
  hexColors: 'background-color: var(--color-primary)',     // Better: Use semantic color classes
  
  // Avoid hardcoded spacing
  hardcodedSpacing: 'padding: 24px',          // Better: Use getSpacingClass('p', 6)
  arbitrarySpacing: 'p-[24px]',               // Better: Use getSpacingClass('p', 6)
  
  // Avoid missing interactive states
  missingHover: 'bg-primary',             // Better: Use createColorVariant('primary', 'solid')
  
  // Avoid arbitrary values without tokens
  arbitraryValues: 'rounded-[12px] shadow-[0_4px_8px_rgba(0,0,0,0.1)]'
};

/**
 * Component Development Checklist
 * 
 * ✅ Colors
 * - Use design tokens (primary, success, error, etc.)
 * - Use semantic healthcare colors where appropriate
 * - Include proper hover, active, focus states
 * - Ensure sufficient contrast for accessibility
 * 
 * ✅ Spacing  
 * - Use spacing tokens (0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32)
 * - Be consistent with gap, padding, margin usage
 * 
 * ✅ Typography
 * - Use typography tokens for font sizes and weights
 * - Follow semantic hierarchy (h1, h2, h3, etc.)
 * 
 * ✅ Interactive States
 * - Include hover states for all interactive elements
 * - Use focus rings for accessibility
 * - Provide visual feedback for loading/disabled states
 * 
 * ✅ Border Radius
 * - Use radius tokens (none, sm, base, md, lg, xl, 2xl, 3xl, full)
 * - Be consistent within component families
 * 
 * ✅ Shadows
 * - Use shadow tokens (sm, base, md, lg, xl, inner, none)
 * - Use appropriate shadow for component elevation
 */

/**
 * Healthcare-Specific Guidelines
 */
export const healthcareGuidelines = {
  
  // Patient status colors
  patientStatus: {
    healthy: getHealthcareColorClass('bg', 'healthy', 'lighter'),
    stable: getHealthcareColorClass('bg', 'stable', 'lighter'), 
    monitoring: getHealthcareColorClass('bg', 'monitoring', 'lighter'),
    critical: getHealthcareColorClass('bg', 'critical', 'lighter')
  },
  
  // Medical priority levels
  priority: {
    low: getHealthcareColorClass('text', 'low', 'dark'),
    medium: getHealthcareColorClass('text', 'medium', 'dark'),
    high: getHealthcareColorClass('text', 'high', 'dark'),
    urgent: getHealthcareColorClass('text', 'urgent', 'dark') + ' animate-pulse'
  },
  
  // Medical categories
  categories: {
    consultation: getHealthcareColorClass('bg', 'consultation', 'lighter'),
    procedure: getHealthcareColorClass('bg', 'procedure', 'lighter'),
    medication: getHealthcareColorClass('bg', 'medication', 'lighter'),
    lab: getHealthcareColorClass('bg', 'lab', 'lighter'),
    imaging: getHealthcareColorClass('bg', 'imaging', 'lighter'),
    emergency: getHealthcareColorClass('bg', 'emergency', 'lighter')
  }
};

/**
 * Migration Helper
 * 
 * Use this function to identify and migrate legacy color usage:
 */
export function migrationHelper() {
  console.log(`
🔧 Token Migration Checklist:

1. Replace legacy colors:
   ❌ bg-primary-500    ✅ bg-primary
   ❌ bg-neutral-lighter    ✅ bg-neutral-light  
   ❌ bg-success-500   ✅ bg-success
   ❌ bg-error-500     ✅ bg-error
   ❌ bg-warning-500  ✅ bg-warning

2. Add missing hover states:
   ❌ bg-primary
   ✅ bg-primary hover:bg-primary-dark

3. Use token utilities:
   ❌ Manual class strings
   ✅ createColorVariant('primary', 'solid')

4. Use semantic healthcare colors:
   ❌ bg-success-lighter text-success-darker  // Example of old approach
   ✅ createColorVariant('success', 'soft')

5. Validate with audit tool:
   npm run color:audit
  `);
}

/**
 * Example Component with Proper Token Usage
 */
export const ExampleComponent = {
  // Base styling with tokens
  base: [
    // Layout
    'flex items-center',
    getSpacingClass('p', 4),
    getSpacingClass('gap', 3),
    
    // Visual design
    'bg-white',
    getRadiusClass('md'),
    getShadowClass('sm'),
    'border border-neutral-light',
    
    // Typography
    'text-sm font-medium text-neutral-darker',
    
    // Interactive behavior  
    getInteractiveClasses('primary'),
    'hover:shadow-md',
    'cursor-pointer'
  ].join(' '),
  
  // Variant examples
  variants: {
    primary: createColorVariant('primary', 'solid'),
    success: createColorVariant('success', 'soft'),
    warning: createColorVariant('warning', 'outline'),
    error: createColorVariant('error', 'ghost')
  },
  
  // Healthcare-specific variants
  healthcare: {
    patientCard: [
      getHealthcareColorClass('bg', 'stable', 'lighter'),
      getHealthcareColorClass('border', 'stable', 'light'),
      'border'
    ].join(' '),
    
    emergencyAlert: [
      getHealthcareColorClass('bg', 'emergency', 'lighter'),
      getHealthcareColorClass('text', 'emergency', 'darker'),
      getRadiusClass('lg'),
      getSpacingClass('p', 4),
      'animate-pulse'
    ].join(' ')
  }
};
