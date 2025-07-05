# Card Component: Semantic-First Approach

## Overview

The Card component has been enhanced with a semantic-first approach using the `purpose` prop to automatically apply appropriate styling, behavior, and accessibility features based on the intended use case.

## Purpose-Based API

### Core Concept
Instead of manually configuring variants, padding, hover states, and interactions, developers specify the `purpose` and the component automatically applies optimal settings.

```tsx
// ❌ Before: Manual configuration
<Card variant="elevated" padding="6" hoverable interactive color="primary">
  <Card.Header>Patient Information</Card.Header>
  <Card.Body>...</Card.Body>
</Card>

// ✅ After: Semantic purpose-driven
<Card purpose="patient-profile">
  <Card.Header>Patient Information</Card.Header>
  <Card.Body>...</Card.Body>
</Card>
```

## Available Purposes

### Healthcare Domain Purposes

#### `purpose="patient-profile"`
- **Styling**: Elevated card with subtle shadow and rounded corners
- **Behavior**: Hover effects for better UX, interactive keyboard navigation
- **Accessibility**: Role="main", aria-label="Patient Profile Card"
- **Use Case**: Patient information displays, demographics, contact details

#### `purpose="medical-record"`
- **Styling**: Clean, clinical appearance with subtle borders
- **Behavior**: Focus states for navigation, expandable sections
- **Accessibility**: Semantic medical document structure
- **Use Case**: Medical history, lab results, clinical notes

#### `purpose="appointment"`
- **Styling**: Time-sensitive styling with status indicators
- **Behavior**: Interactive states for booking actions
- **Accessibility**: Time-based announcements, status descriptions
- **Use Case**: Appointment cards, scheduling interfaces

#### `purpose="medication"`
- **Styling**: Pharmacy-themed colors, clear typography
- **Behavior**: Dosage-specific interactions, reminder capabilities
- **Accessibility**: Medication instruction reading patterns
- **Use Case**: Prescription cards, medication trackers

#### `purpose="emergency"`
- **Styling**: High-contrast, urgent styling with alert colors
- **Behavior**: Priority focus management, urgent interaction patterns
- **Accessibility**: Emergency announcement capabilities
- **Use Case**: Emergency alerts, critical notifications

#### `purpose="vitals"`
- **Styling**: Data-focused layout with metric visualization
- **Behavior**: Real-time update animations, trend indicators
- **Accessibility**: Numeric data screen reader optimization
- **Use Case**: Vital signs displays, health metrics

#### `purpose="billing"`
- **Styling**: Financial document styling, clear cost presentation
- **Behavior**: Transaction-focused interactions
- **Accessibility**: Financial data accessibility patterns
- **Use Case**: Bills, insurance cards, payment information

### General Purposes

#### `purpose="content"`
- **Styling**: Clean, readable content presentation
- **Behavior**: Standard document flow, reading patterns
- **Accessibility**: Content structure semantics
- **Use Case**: Articles, documentation, general content

#### `purpose="navigation"`
- **Styling**: Navigation-focused design, clear action areas
- **Behavior**: Navigation keyboard patterns, focus management
- **Accessibility**: Navigation landmark semantics
- **Use Case**: Menu cards, navigation panels

#### `purpose="form"`
- **Styling**: Form-optimized spacing and typography
- **Behavior**: Form validation integration, field focus
- **Accessibility**: Form structure and validation announcements
- **Use Case**: Form sections, input groups

#### `purpose="data"`
- **Styling**: Data table and grid optimizations
- **Behavior**: Sortable, filterable data interactions
- **Accessibility**: Data table navigation patterns
- **Use Case**: Data grids, table cards, dashboards

#### `purpose="media"`
- **Styling**: Media-optimized aspect ratios and spacing
- **Behavior**: Media controls and fullscreen capabilities
- **Accessibility**: Media content descriptions
- **Use Case**: Image galleries, video cards, media previews

## Implementation Example

```tsx
import { Card } from "@rxops/uikit";

// Patient Profile Card
<Card purpose="patient-profile">
  <Card.Header>
    <Avatar src={patient.avatar} alt={patient.name} />
    <div>
      <h3>{patient.name}</h3>
      <p>{patient.age} years old</p>
    </div>
  </Card.Header>
  <Card.Body>
    <PatientDetails patient={patient} />
  </Card.Body>
  <Card.Footer>
    <Button intent="primary">View Full Profile</Button>
  </Card.Footer>
</Card>

// Medical Record Card
<Card purpose="medical-record">
  <Card.Header>
    <h4>Lab Results - {date}</h4>
    <Badge variant="success">Normal</Badge>
  </Card.Header>
  <Card.Body>
    <LabResultsTable results={results} />
  </Card.Body>
</Card>

// Emergency Alert Card
<Card purpose="emergency">
  <Card.Header>
    <Icon name="alert-triangle" color="error" />
    <h4>Emergency Alert</h4>
  </Card.Header>
  <Card.Body>
    <p>{emergencyMessage}</p>
  </Card.Body>
  <Card.Footer>
    <Button intent="destructive">Acknowledge</Button>
    <Button intent="secondary">More Info</Button>
  </Card.Footer>
</Card>
```

## Automatic Enhancements by Purpose

### Healthcare Context Enhancements

| Purpose | Auto-Applied Features |
|---------|---------------------|
| `patient-profile` | HIPAA-compliant display, hover previews, patient-specific ARIA labels |
| `medical-record` | Clinical document structure, date/time formatting, medical terminology support |
| `appointment` | Time zone awareness, calendar integration hints, booking state management |
| `medication` | Dosage formatting, allergy warnings, prescription validation context |
| `emergency` | High-contrast mode, urgent announcements, priority focus management |
| `vitals` | Numeric formatting, trend indicators, real-time update animations |
| `billing` | Currency formatting, insurance verification status, payment state tracking |

### Accessibility Enhancements

- **Semantic HTML**: Appropriate ARIA roles and landmarks based on purpose
- **Screen Reader Optimization**: Purpose-specific content descriptions
- **Keyboard Navigation**: Context-appropriate focus management
- **Color Contrast**: Medical-grade contrast ratios for clinical content
- **Announcements**: Live region updates for dynamic content

### Performance Optimizations

- **Lazy Loading**: Media and non-critical content based on purpose
- **Interaction Optimization**: Touch targets and hover states optimized for use case
- **Animation Control**: Respectful motion based on medical context sensitivity

## Migration Guide

### From Manual Configuration

```tsx
// ❌ Before: Manual variant configuration
<Card variant="elevated" padding="6" hoverable interactive>
  <Card.Header className="border-b">
    <h3>Patient: John Doe</h3>
  </Card.Header>
  <Card.Body className="space-y-4">
    {/* patient content */}
  </Card.Body>
</Card>

// ✅ After: Purpose-driven semantic approach
<Card purpose="patient-profile">
  <Card.Header>
    <h3>{patient.name}</h3>
  </Card.Header>
  <Card.Body>
    {/* patient content */}
  </Card.Body>
</Card>
```

### Backward Compatibility

All existing Card props remain supported. The `purpose` prop enhances but doesn't replace manual configuration:

```tsx
// ✅ Enhanced with purpose but custom overrides still work
<Card 
  purpose="patient-profile" 
  padding="8"  // Override default purpose padding
  className="custom-patient-styling"  // Additional custom styles
>
  <Card.Body>Patient Information</Card.Body>
</Card>
```

## Benefits

1. **Reduced Cognitive Load**: Developers don't need to remember styling combinations
2. **Consistent Healthcare UX**: Automatic application of domain-specific patterns
3. **Accessibility by Default**: Purpose-driven ARIA attributes and behaviors
4. **Maintainable**: Centralized styling logic, easier to update globally
5. **Performant**: Optimized for specific use cases automatically

## Next Steps

1. Implement purpose-based enhancement logic in Card component
2. Create migration script for existing Card usage
3. Update documentation with healthcare-specific examples
4. Add comprehensive demo showcasing all purposes
5. Train team on semantic-first Card usage patterns
