# UI Library Integration Plan

## Current Issue

You're absolutely right! The demo should be demonstrating **actual reusable components** from our UI library, not custom implementations built just for the demo. This is a critical architectural improvement.

## Current State

- **Problem**: Demo components (DataDisplay, FeedbackDemo, etc.) contain custom implementations
- **Better Approach**: Demo should import and use actual components from `@rxops/uikit`
- **Library Status**: We have a comprehensive UI library with 40+ components
- **Import Issue**: TypeScript can't find `@rxops/uikit` module (needs investigation)

## Available UI Library Components

From `/ui/src/index.ts`, we have these components ready to use:

### Core Components
- ✅ `Button, Input, Card, Alert, Avatar, Badge, Spinner`

### Layout System  
- ✅ `Container, Grid, Stack, Divider, Header, Footer`

### Navigation
- ✅ `Tabs, Breadcrumb, Pagination`

### Feedback
- ✅ `Toast, Modal, Tooltip`

### Data Display
- ✅ `Table, TableHeader, TableBody, TableRow, TableCell`
- ✅ `DataGrid, List, ListItem`

### Form Components
- ✅ `Form, FormField, Select, Checkbox, Radio, Switch, Textarea`
- ✅ `DateTimePicker, FileUpload, SearchAndFilter`

### Healthcare Specific
- ✅ `DoctorCard, ServiceCard, AppointmentCard, HealthMetric`
- ✅ `MedicalRecordCard, AppointmentStatusIndicator`
- ✅ `Skeleton` variations

## Refactoring Plan

### Phase 1: Fix Library Import (PRIORITY)
1. **Investigate why `@rxops/uikit` imports fail**
   - Check package.json linking
   - Verify build outputs in `/ui/lib/`
   - Test direct file imports
   - Consider workspace configuration

### Phase 2: Refactor Demo Components
Replace custom implementations with library components:

#### DataDisplay → Use Library Components
- ❌ Custom `PatientTable` → ✅ `Table, TableHeader, TableBody, TableRow, TableCell`
- ❌ Custom `StatusBadge` → ✅ `Badge`  
- ❌ Custom `UserAvatar` → ✅ `Avatar`

#### FeedbackDemo → Use Library Components
- ❌ Custom `Toast` → ✅ `Toast`
- ❌ Custom `ProgressBar` → ✅ Use library implementation
- ❌ Custom `LoadingState` → ✅ `Spinner`
- ❌ Custom `Modal` → ✅ `Modal`

#### NavigationDemo → Use Library Components
- ❌ Custom `MedicalTabs` → ✅ `Tabs`
- ❌ Custom `PatientBreadcrumbs` → ✅ `Breadcrumb`
- ❌ Custom `Pagination` → ✅ `Pagination`

#### AdvancedDemo → Use Library Components
- ❌ Custom `DateTimePicker` → ✅ `DateTimePicker`
- ❌ Custom `FileUpload` → ✅ `FileUpload`
- ❌ Custom `SearchFilter` → ✅ `SearchAndFilter`
- ❌ Custom `Modal` → ✅ `Modal`

#### LayoutDemo → Use Library Components
- ❌ Custom layouts → ✅ `Grid, Container, Stack`

### Phase 3: Enhance Missing Components
If demo needs components not in library:
1. **Add to UI library first**
2. **Then import in demo**

### Phase 4: Update Documentation
- Demo becomes **true documentation** of library capabilities
- Each demo shows **exactly what developers get**
- No gap between demo and reality

## Expected Benefits

### ✅ True Representation
- Demo = actual library capabilities
- No false advertising
- Real component behavior

### ✅ Better Architecture  
- Single source of truth
- No code duplication
- Consistent API usage

### ✅ Enhanced Library
- Forces completion of missing components
- Real-world testing
- Better component design

### ✅ Developer Trust
- What you see = what you get
- Actual import examples
- Reliable documentation

## Next Steps

1. **IMMEDIATE**: Fix `@rxops/uikit` import issue
2. **PHASE 1**: Refactor DataDisplay as example
3. **PHASE 2**: Systematically replace all custom implementations
4. **PHASE 3**: Add missing components to library
5. **PHASE 4**: Validate demo represents 100% real library

## Implementation Notes

```tsx
// BEFORE (Custom Implementation)
const CustomTable = component$(() => {
  // Custom table implementation...
});

// AFTER (Library Component)
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@rxops/uikit";

const PatientTableDemo = component$(() => {
  return (
    <Table responsive hoverable>
      <TableHeader>
        <TableRow>
          <TableCell header>Name</TableCell>
          <TableCell header>Status</TableCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {/* Use actual library components */}
      </TableBody>
    </Table>
  );
});
```

This approach ensures the demo is a **genuine representation** of our UI library capabilities, not a marketing facade.
