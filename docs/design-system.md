# 🎨 RxOps UI Design System

## Overview

The RxOps design system provides a consistent visual language and interaction patterns specifically designed for healthcare applications. It prioritizes accessibility, medical accuracy, and emergency readiness.

## 🧠 Semantic-First Architecture

Our design system follows a **semantic-first approach** where component styling and behavior are driven by the meaning and purpose of content, rather than purely visual styling decisions. This creates more maintainable, accessible, and intuitive healthcare interfaces.

### Key Benefits for Healthcare
- **Reduced Cognitive Load**: Healthcare professionals can focus on patient care, not UI decisions
- **Improved Accessibility**: Proper semantic markup enhances screen reader support for visually impaired users
- **Faster Development**: Less time spent on styling decisions, more time on healthcare functionality
- **Better Compliance**: Semantic HTML supports HIPAA and accessibility requirements

### Documentation
- [Semantic-First Architecture](./design-system/semantic-first-architecture.md)
- [Design Principles](./design-system/semantic-first-principles.md)
- [Component Examples](./design-system/semantic-component-examples.md)
- [Migration Guide](./design-system/migration-semantic-first.md)
- [Implementation Roadmap](./design-system/semantic-components-roadmap.md)

## 🏥 Healthcare Design Principles

### 1. **Clarity First**
- Information must be immediately comprehensible
- Use clear, medical-standard terminology
- Prioritize scannable layouts for quick decisions

### 2. **Error Prevention**
- Design interfaces that prevent medical errors
- Use confirmation dialogs for critical actions
- Provide clear visual feedback for state changes

### 3. **Accessibility Always**
- WCAG 2.1 AA compliance minimum
- Support for assistive technologies
- High contrast ratios for all text

### 4. **Emergency-Ready**
- Components must work under high stress
- Quick access to critical functions
- Clear visual hierarchy for urgent information

### 5. **Mobile-First**
- Many healthcare workers use mobile devices
- Touch-friendly interface elements
- Responsive layouts that work in all contexts

## 🎨 Color Palette

### Primary Colors
```scss
// Healthcare Blue - Primary actions and branding
$primary-50:  #e3f2fd;
$primary-100: #bbdefb;
$primary-500: #2196f3;  // Main primary
$primary-700: #1976d2;
$primary-900: #0d47a1;
```

### Semantic Colors
```scss
// Success - Positive indicators, stable vitals
$success-50:  #e8f5e8;
$success-100: #c8e6c9;
$success-500: #4caf50;  // Main success
$success-700: #388e3c;
$success-900: #1b5e20;

// Warning - Caution, attention needed
$warning-50:  #fff8e1;
$warning-100: #ffecb3;
$warning-500: #ffc107;  // Main warning
$warning-700: #f57c00;
$warning-900: #e65100;

// Error - Critical alerts, emergencies
$error-50:   #ffebee;
$error-100:  #ffcdd2;
$error-500:  #f44336;  // Main error
$error-700:  #d32f2f;
$error-900:  #b71c1c;
```

### Neutral Colors
```scss
// Gray scale for text, borders, backgrounds
$gray-50:  #fafafa;
$gray-100: #f5f5f5;
$gray-200: #eeeeee;
$gray-300: #e0e0e0;
$gray-400: #bdbdbd;
$gray-500: #9e9e9e;
$gray-600: #757575;
$gray-700: #616161;
$gray-800: #424242;
$gray-900: #212121;
```

### Healthcare-Specific Colors
```scss
// Medical severity indicators
$critical:    #d32f2f;  // Life-threatening
$urgent:      #f57c00;  // Needs immediate attention
$stable:      #4caf50;  // Normal/healthy
$monitor:     #2196f3;  // Needs monitoring

// Vital signs colors
$heart-rate:  #e91e63;  // Pink/red for cardiac
$blood-pressure: #9c27b0; // Purple for BP
$temperature: #ff5722;  // Orange/red for temp
$oxygen:      #2196f3;  // Blue for O2
```

## 📝 Typography

### Font Family
```scss
// Primary font stack
$font-family: 'Inter', 'Segoe UI', 'Roboto', sans-serif;

// Monospace for data/codes
$font-mono: 'Fira Code', 'Monaco', 'Consolas', monospace;
```

### Font Scales
```scss
// Text sizes
$text-xs:  0.75rem;   // 12px - Small labels
$text-sm:  0.875rem;  // 14px - Body text
$text-base: 1rem;     // 16px - Default
$text-lg:  1.125rem;  // 18px - Emphasis
$text-xl:  1.25rem;   // 20px - Headings
$text-2xl: 1.5rem;    // 24px - Section titles
$text-3xl: 1.875rem;  // 30px - Page titles
$text-4xl: 2.25rem;   // 36px - Display text

// Line heights
$leading-tight: 1.25;   // Headings
$leading-normal: 1.5;   // Body text
$leading-relaxed: 1.75; // Large text blocks
```

### Font Weights
```scss
$font-normal:   400;  // Regular text
$font-medium:   500;  // Emphasis
$font-semibold: 600;  // Strong emphasis
$font-bold:     700;  // Headings
```

## 📐 Spacing & Layout

### Spacing Scale
```scss
// Consistent spacing scale
$space-px: 1px;
$space-0:  0;
$space-1:  0.25rem;  // 4px
$space-2:  0.5rem;   // 8px
$space-3:  0.75rem;  // 12px
$space-4:  1rem;     // 16px
$space-5:  1.25rem;  // 20px
$space-6:  1.5rem;   // 24px
$space-8:  2rem;     // 32px
$space-10: 2.5rem;   // 40px
$space-12: 3rem;     // 48px
$space-16: 4rem;     // 64px
$space-20: 5rem;     // 80px
$space-24: 6rem;     // 96px
```

### Container Sizes
```scss
// Container max-widths
$container-sm:  640px;   // Mobile
$container-md:  768px;   // Tablet
$container-lg:  1024px;  // Desktop
$container-xl:  1280px;  // Large desktop
$container-2xl: 1536px;  // Extra large
```

### Breakpoints
```scss
// Responsive breakpoints
$breakpoint-sm:  640px;   // Mobile landscape
$breakpoint-md:  768px;   // Tablet
$breakpoint-lg:  1024px;  // Desktop
$breakpoint-xl:  1280px;  // Large desktop
$breakpoint-2xl: 1536px;  // Extra large
```

## 🎯 Component Patterns

### Button Variants
```tsx
// Primary - Main actions
<Button variant="primary">Save Patient</Button>

// Secondary - Supporting actions  
<Button variant="secondary">Cancel</Button>

// Success - Positive confirmations
<Button variant="success">Approve Treatment</Button>

// Warning - Caution required
<Button variant="warning">Discharge Patient</Button>

// Error - Critical/emergency
<Button variant="error">Emergency Alert</Button>
```

### Status Indicators
```tsx
// Health status badges
<Badge variant="critical">Critical</Badge>
<Badge variant="urgent">Urgent</Badge>
<Badge variant="stable">Stable</Badge>
<Badge variant="monitor">Monitor</Badge>
```

### Loading States
```tsx
// Skeleton loading for medical data
<PatientCard loading={true} />

// Spinner for actions
<Button loading={true}>Saving...</Button>

// Progressive loading for large datasets
<MedicalHistory loading="partial" />
```

## 🔧 Component Architecture

### Composition Pattern
```tsx
// Composable layout components
<Container size="lg">
  <Grid cols={3} gap={6}>
    <GridItem span={2}>
      <PatientProfile />
    </GridItem>
    <GridItem>
      <VitalsMonitor />
    </GridItem>
  </Grid>
</Container>
```

### Prop Consistency
```tsx
// Consistent prop patterns across components
interface BaseProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

// Healthcare-specific props
interface HealthcareProps {
  hipaaCompliant?: boolean;
  emergencyMode?: boolean;
  readOnly?: boolean;
  auditTrail?: boolean;
}
```

## ♿ Accessibility Standards

### Minimum Requirements
- WCAG 2.1 AA compliance
- Color contrast ratio ≥ 4.5:1 for normal text
- Color contrast ratio ≥ 3:1 for large text
- Keyboard navigation support
- Screen reader compatibility

### Healthcare Accessibility
```tsx
// Proper ARIA labels for medical data
<div role="region" aria-label="Patient vital signs">
  <VitalsDisplay />
</div>

// Alert announcements for critical changes
<div aria-live="assertive" aria-atomic="true">
  {emergencyAlert && <EmergencyAlert />}
</div>

// Medical terminology with definitions
<abbr title="Blood Pressure">BP</abbr>: 120/80 mmHg
```

### Focus Management
```scss
// Visible focus indicators
:focus-visible {
  outline: 2px solid $primary-500;
  outline-offset: 2px;
}

// High contrast mode support
@media (prefers-contrast: high) {
  .btn {
    border: 2px solid currentColor;
  }
}
```

## 🌓 Dark Mode Support

### Color Adjustments
```scss
// Dark mode variables
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #{$gray-900};
    --bg-secondary: #{$gray-800};
    --text-primary: #{$gray-100};
    --text-secondary: #{$gray-300};
    
    // Adjusted healthcare colors for dark mode
    --critical-dark: #{lighten($critical, 20%)};
    --warning-dark: #{lighten($warning-500, 15%)};
  }
}
```

## 📊 Data Visualization

### Chart Colors
```scss
// Accessible color palette for medical charts
$chart-colors: (
  primary: #2196f3,
  secondary: #4caf50,
  tertiary: #ff9800,
  quaternary: #9c27b0,
  quinary: #f44336
);

// Vital signs specific colors
$vitals-colors: (
  heart-rate: #e91e63,
  blood-pressure: #9c27b0,
  temperature: #ff5722,
  oxygen: #2196f3,
  glucose: #795548
);
```

### Medical Data Patterns
```scss
// Standard medical ranges
.normal-range { color: $success-500; }
.caution-range { color: $warning-500; }
.critical-range { color: $error-500; }

// Trending indicators
.trending-up::after { content: "↗"; color: $error-500; }
.trending-down::after { content: "↘"; color: $success-500; }
.trending-stable::after { content: "→"; color: $gray-500; }
```

## 🎮 Interactive States

### Button States
```scss
.btn {
  // Default state
  background-color: $primary-500;
  
  // Hover state
  &:hover {
    background-color: $primary-600;
    transform: translateY(-1px);
  }
  
  // Active state
  &:active {
    background-color: $primary-700;
    transform: translateY(0);
  }
  
  // Disabled state
  &:disabled {
    background-color: $gray-300;
    cursor: not-allowed;
  }
  
  // Loading state
  &.loading {
    position: relative;
    color: transparent;
    
    &::after {
      content: "";
      position: absolute;
      width: 16px;
      height: 16px;
      border: 2px solid currentColor;
      border-radius: 50%;
      border-top-color: transparent;
      animation: spin 0.8s linear infinite;
    }
  }
}
```

## 📱 Mobile Patterns

### Touch Targets
```scss
// Minimum touch target size (44px x 44px)
.touch-target {
  min-height: 44px;
  min-width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

// Increased spacing for mobile
@media (max-width: $breakpoint-md) {
  .mobile-spacing {
    padding: $space-6;
    gap: $space-4;
  }
}
```

### Mobile Navigation
```tsx
// Thumb-friendly navigation
<nav className="fixed bottom-0 left-0 right-0">
  <div className="flex justify-around p-2">
    <Button size="lg" variant="ghost">Patients</Button>
    <Button size="lg" variant="ghost">Schedule</Button>
    <Button size="lg" variant="ghost">Messages</Button>
  </div>
</nav>
```

## 🚀 Performance Guidelines

### Bundle Size Optimization
- Tree-shakeable component exports
- Lazy loading for large components
- Minimal runtime CSS

### Loading Priorities
```tsx
// Critical components load first
import { Button, Alert } from '@rxops/uikit/core';

// Non-critical components lazy load
const PatientChart = lazy(() => import('@rxops/uikit/healthcare'));
```

This design system ensures consistency, accessibility, and healthcare-specific optimization across all RxOps UI components. For implementation details, see the individual component documentation in `COMPONENT_GUIDE.md`.
