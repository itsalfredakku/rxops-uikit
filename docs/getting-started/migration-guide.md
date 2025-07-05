# 🔄 Migration Guide

## Overview

This guide helps you migrate from the old component structure to the new atomic design system organized structure.

## 📋 Breaking Changes

### Import Path Changes

The component imports have been reorganized. Here's how to update your imports:

#### Core Components

**Before (Old Structure):**
```typescript
import { Button } from '@rxops/uikit/components/button';
import { Input } from '@rxops/uikit/components/input';
import { Card } from '@rxops/uikit/components/card';
import { Header } from '@rxops/uikit/components/header';
import { DataGrid } from '@rxops/uikit/components/data-grid';
```

**After (New Structure):**
```typescript
// Atomic Design System Organization
import { 
  // Atoms
  Button, Input, Alert, Avatar, Badge,
  
  // Molecules  
  FormField, SearchAndFilter, DateTimePicker,
  
  // Organisms
  Card, Header, DataGrid
} from '@rxops/uikit';
```

#### Healthcare Components

**Before:**
```typescript
import { DoctorCard } from '@rxops/uikit/components/doctor-card';
import { AppointmentCard } from '@rxops/uikit/components/appointment-card';
import { MedicationTracker } from '@rxops/uikit/components/medication-tracker';
```

**After:**
```typescript
// Domain-specific organization
import { 
  // Provider Domain
  DoctorCard,
  
  // Appointments Domain
  AppointmentCard,
  
  // Medical Domain
  MedicationTracker
} from '@rxops/uikit';
```

## 🛠️ Automated Migration

Use our migration script to automatically update your imports:

```bash
# Install migration tool
npm install -g @rxops/uikit-migration

# Run migration on your project
rxops-migrate --project ./src

# Or use npx for one-time run
npx @rxops/uikit-migration --project ./src
```

### Manual Migration Steps

If you prefer to migrate manually:

1. **Update imports** - Replace old paths with new ones
2. **Check component props** - Most props remain the same
3. **Update tests** - Test imports and mock paths
4. **Verify layouts** - Layout components have new structure

## 📊 Component Mapping

### Core Components

| Old Path | New Category | New Import |
|----------|--------------|------------|
| `components/button` | Core Atom | `Button` |
| `components/input` | Core Atom | `Input` |
| `components/alert` | Core Atom | `Alert` |
| `components/form-field` | Core Molecule | `FormField` |
| `components/search-filter` | Core Molecule | `SearchAndFilter` |
| `components/card` | Core Organism | `Card` |
| `components/header` | Core Organism | `Header` |
| `components/data-grid` | Core Organism | `DataGrid` |

### Healthcare Components

| Old Path | New Domain | New Import |
|----------|------------|------------|
| `components/doctor-card` | Provider | `DoctorCard` |
| `components/patient-profile` | Patient | `PatientProfile` |
| `components/appointment-card` | Appointments | `AppointmentCard` |
| `components/medication-tracker` | Medical | `MedicationTracker` |
| `components/health-metric` | Emergency | `HealthMetric` |

## 🔧 Code Examples

### Before & After Examples

#### Form Component Migration

**Before:**
```typescript
import { Button } from '@rxops/uikit/components/button';
import { Input } from '@rxops/uikit/components/input';
import { FormField } from '@rxops/uikit/components/form-field';
import { Card, CardHeader, CardBody } from '@rxops/uikit/components/card';

function PatientForm() {
  return (
    <Card>
      <CardHeader>Patient Registration</CardHeader>
      <CardBody>
        <FormField label="Name">
          <Input placeholder="Enter patient name" />
        </FormField>
        <Button variant="primary">Save Patient</Button>
      </CardBody>
    </Card>
  );
}
```

**After:**
```typescript
import { 
  // All imports from single entry point
  Button, Input, FormField,
  Card, CardHeader, CardBody 
} from '@rxops/uikit';

function PatientForm() {
  return (
    <Card>
      <CardHeader>Patient Registration</CardHeader>
      <CardBody>
        <FormField label="Name">
          <Input placeholder="Enter patient name" />
        </FormField>
        <Button variant="primary">Save Patient</Button>
      </CardBody>
    </Card>
  );
}
```

#### Healthcare Dashboard Migration

**Before:**
```typescript
import { DoctorCard } from '@rxops/uikit/components/doctor-card';
import { AppointmentCard } from '@rxops/uikit/components/appointment-card';
import { HealthMetric } from '@rxops/uikit/components/health-metric';
import { Grid } from '@rxops/uikit/components/grid';

function HealthDashboard() {
  return (
    <Grid cols={2}>
      <DoctorCard doctor={doctor} />
      <AppointmentCard appointment={appointment} />
      <HealthMetric metric={metric} />
    </Grid>
  );
}
```

**After:**
```typescript
import { 
  // Healthcare components organized by domain
  DoctorCard,        // Provider domain
  AppointmentCard,   // Appointments domain  
  HealthMetric,      // Emergency domain
  Grid              // Core organism
} from '@rxops/uikit';

function HealthDashboard() {
  return (
    <Grid cols={2}>
      <DoctorCard doctor={doctor} />
      <AppointmentCard appointment={appointment} />
      <HealthMetric metric={metric} />
    </Grid>
  );
}
```

## 🧪 Testing Migration

Update your test files:

**Before:**
```typescript
import { render } from '@testing-library/react';
import { Button } from '@rxops/uikit/components/button';

test('button renders correctly', () => {
  render(<Button>Click me</Button>);
  // ...test logic
});
```

**After:**
```typescript
import { render } from '@testing-library/react';
import { Button } from '@rxops/uikit';

test('button renders correctly', () => {
  render(<Button>Click me</Button>);
  // ...test logic
});
```

## 🎨 Style & Theme Migration

Design tokens are now centralized:

**Before:**
```typescript
import { theme } from '@rxops/uikit/theme';
import { colors } from '@rxops/uikit/colors';
```

**After:**
```typescript
import { designTokens, colors, typography } from '@rxops/uikit';
```

## ⚠️ Common Issues & Solutions

### Issue 1: Import Not Found
```
Error: Module '@rxops/uikit/components/button' not found
```

**Solution:** Update to new import path:
```typescript
// Old
import { Button } from '@rxops/uikit/components/button';

// New  
import { Button } from '@rxops/uikit';
```

### Issue 2: Type Definitions Missing
```
Error: Could not find declaration file for module '@rxops/uikit/components/...'
```

**Solution:** Import types from main entry:
```typescript
import type { ButtonProps, CardProps } from '@rxops/uikit';
```

### Issue 3: CSS Styles Not Applied
```
Components render but styling is missing
```

**Solution:** Update CSS import:
```typescript
// Make sure you're importing the main stylesheet
import '@rxops/uikit/dist/styles.css';
```

## 📦 Bundle Size Optimization

The new structure enables better tree-shaking:

**Before:** All components bundled together
```typescript
// This would bundle entire library
import * as UI from '@rxops/uikit';
```

**After:** Import only what you need
```typescript
// Tree-shaking friendly - only bundles Button
import { Button } from '@rxops/uikit';
```

## 🔄 Rollback Plan

If you need to rollback:

1. **Use git** to revert to previous version
2. **Pin old version** in package.json temporarily
3. **Use compatibility layer** (available for 3 months)

```json
{
  "dependencies": {
    "@rxops/uikit": "^1.x.x"  // Previous version
  }
}
```

## 📈 Benefits After Migration

- **Smaller bundle sizes** through better tree-shaking
- **Faster development** with organized component structure  
- **Better discoverability** of healthcare-specific components
- **Improved TypeScript** support with centralized types
- **Consistent imports** from single entry point

## 🆘 Need Help?

- Review the [Component Documentation](../components/)
- Check [Healthcare Examples](../examples/)
- Open an issue on [GitHub](https://github.com/RxOps/ui/issues)
- Contact the team on Slack: `#ui-library`
