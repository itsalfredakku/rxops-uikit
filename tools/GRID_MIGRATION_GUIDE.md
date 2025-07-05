# Grid Layout Migration Guide

## Overview

This document outlines the comprehensive strategy for migrating all native HTML | Component | Status | Grid Layouts | Date |
|-----------|--------|--------------|------|
| health-dashboard.tsx | ✅ Complete | 3 | July 3, 2025 |
| patient-profile.tsx | 🔄 Complex | 6 | - |
| lab-results.tsx | ✅ Complete | 2 | July 3, 2025 |
| billing-card.tsx | 📝 Planned | 5 | - |
| alert demo | 📝 Planned | 4 | - |youts to our standardized `Grid` component. This migration is part of the LAYOUT-002 initiative to replace all `<div class="grid">` elements with semantic `Grid` and `GridItem` components.

## Benefits of Migration

- **Design System Consistency**: All grid layouts will use the same component API
- **Responsive Behavior**: Standardized approach to responsive grid layouts
- **Semantic Structure**: Improved readability and developer experience
- **Accessibility**: Enhanced accessibility through consistent structure
- **Maintainability**: Centralized updates and enhancements to grid behavior
- **Bundle Optimization**: Reduced duplication of CSS classes

## Migration Strategy

### 1. Analysis Phase

We'll first identify all grid layouts in the codebase using the `fix-grid-layouts.js` script, which:

- Searches for all `<div>` elements with `grid` and `grid-cols` classes
- Extracts column configurations and gap values
- Generates a report of all grid layouts to migrate

### 2. Implementation Phase

For each identified grid layout:

1. Replace `<div class="grid grid-cols-X gap-Y">` with `<Grid cols={X} gap="Y">`
2. Replace responsive variants (e.g., `md:grid-cols-2`) with responsive props
3. Convert semantic gap values to numeric values (`sm` → `3`, `md` → `4`, etc.)
4. Add proper `Grid` import statement if not already present
5. Replace nested grid items with `GridItem` components where appropriate

### 3. Pattern Translation

| HTML Pattern | Grid Component Equivalent |
|--------------|---------------------------|
| `<div class="grid grid-cols-3 gap-4">` | `<Grid cols={3} gap="4">` |
| `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">` | `<Grid cols={{ sm: 1, md: 2, lg: 4 }} gap="4">` |
| `<div class="grid grid-cols-1 gap-md">` | `<Grid cols={1} gap="4">` |
| `<div class="grid grid-cols-2 gap-lg">` | `<Grid cols={2} gap="8">` |
| `<div class="grid grid-cols-1 md:grid-cols-3 gap-sm">` | `<Grid cols={{ sm: 1, md: 3 }} gap="3">` |

### 4. Semantic Gap Conversion

We're standardizing on numeric gap values:

| Semantic Gap | Numeric Gap |
|--------------|-------------|
| `none` | `0` |
| `xs` | `2` |
| `sm` | `3` |
| `md` | `4` |
| `lg` | `8` |
| `xl` | `16` |

### 5. Priority Components

Based on analysis, we'll focus on migrating these components first:

1. Healthcare Patient Components:
   - `/src/healthcare/patient/health-dashboard/health-dashboard.tsx`
   - `/src/healthcare/patient/patient-profile/patient-profile.tsx`

2. Healthcare Medical Components:
   - `/src/healthcare/medical/lab-results/lab-results.tsx`
   - `/src/healthcare/medical/medication-tracker/medication-tracker.tsx`

3. Healthcare Billing Components:
   - `/src/healthcare/billing/billing-card/billing-card.tsx`

4. Demo Routes:
   - `/demo/src/routes/components/alert/index.tsx`

## Migration Tools

### Grid Layout Analyzer

```bash
node tools/fix-grid-layouts.js
```

Scans the entire codebase for grid layouts and generates a report.

### Grid Layout Transformer

```bash
node tools/transform-grid-layouts.js
```

Processes files and transforms grid div elements to Grid components (generates transformed files for review).

### Component-Specific Migration

```bash
node tools/migrate-health-dashboard-grid.js
```

Migrates grid layouts in the health-dashboard component to Grid components.

## Implementation Steps

1. Run the analyzer script to identify all grid layouts
2. Review the generated report to prioritize components
3. Run component-specific migration scripts for high-priority components
4. Review the migrated files and test for visual regressions
5. Apply changes to the original files after verification
6. Run the transformer script for remaining components
7. Review and apply changes in batches
8. Test each batch for functionality and visual consistency
9. Update documentation and examples with new patterns

## Testing Requirements

- Visual regression testing to ensure layouts appear identical
- Responsive behavior testing across breakpoints
- Accessibility testing for proper structure
- Component interaction testing for nested components
- Browser compatibility testing

## Migration Progress Tracking

| Component | Status | Grid Layouts | Date |
|-----------|--------|--------------|------|
| health-dashboard.tsx | ✅ Complete | 3 | July 3, 2025 |
| patient-profile.tsx | � Complex | 6 | - |
| lab-results.tsx | 📝 Planned | 2 | - |
| billing-card.tsx | 📝 Planned | 5 | - |
| alert demo | 📝 Planned | 4 | - |

## Examples

### Before Migration

```tsx
<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
  <div>Item 4</div>
</div>
```

### After Migration

```tsx
<Grid cols={{ sm: 1, md: 4 }} gap="4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
  <div>Item 4</div>
</Grid>
```

## Advanced Grid Features

Our `Grid` component supports advanced features that should be used when migrating:

```tsx
<Grid 
  cols={{ sm: 1, md: 2, lg: 3 }} 
  gap="4"
  autoRows={true}
  autoFit={true}
>
  <GridItem colSpan={2} rowSpan={1}>Wide Item</GridItem>
  <GridItem>Normal Item</GridItem>
  <GridItem colStart={2} rowStart={3}>Positioned Item</GridItem>
</Grid>
```

## Troubleshooting

**Common Issues:**

1. **Missing Imports**: Ensure Grid/GridItem imports are added
2. **Responsive Props**: Check for proper responsive object syntax
3. **Gap Values**: Verify gap values are strings, not numbers
4. **Nested Grids**: Handle properly with child Grid components
5. **Special Classes**: Preserve non-grid classes from original divs
