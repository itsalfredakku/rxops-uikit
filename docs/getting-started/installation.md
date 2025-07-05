# 📦 Installation Guide

## Quick Start

Install RxOpscomponents in your healthcare application:

```bash
npm install @rxops/uikit
# or
yarn add @rxops/uikit
# or
pnpm add @rxops/uikit
```

## Requirements

- **Node.js**: 18.0.0 or higher
- **React**: 18.0.0 or higher (for React integration)
- **Qwik**: 1.0.0 or higher (native framework)

## Setup

### 1. Basic Setup

```typescript
// main.tsx or _app.tsx
import '@rxops/uikit/dist/styles.css';
import { Button, Card } from '@rxops/uikit';

function App() {
  return (
    <div>
      <Card>
        <Button variant="primary">Get Started</Button>
      </Card>
    </div>
  );
}
```

### 2. Healthcare-Specific Setup

For healthcare applications, import domain-specific components:

```typescript
import { 
  PatientProfile, 
  AppointmentCard, 
  MedicationTracker,
  HealthDashboard 
} from '@rxops/uikit';

function HealthcareApp() {
  return (
    <HealthDashboard>
      <PatientProfile patientId="123" />
      <AppointmentCard appointment={appointment} />
      <MedicationTracker medications={medications} />
    </HealthDashboard>
  );
}
```

### 3. Design System Integration

Import design tokens for consistent styling:

```typescript
import { designTokens, colors, typography } from '@rxops/uikit';

// Use in your custom components
const customStyles = {
  background: colors.primary[500],
  fontSize: typography.size.lg,
  spacing: designTokens.spacing.md
};
```

## TypeScript Support

RxOpsis built with TypeScript and provides full type definitions:

```typescript
import type { 
  ButtonProps, 
  PatientProfileProps,
  AppointmentCardProps 
} from '@rxops/uikit';

const MyButton: React.FC<ButtonProps> = (props) => {
  return <Button {...props} />;
};
```

## Next Steps

- [Quick Start Guide](./quick-start.md) - Build your first healthcare UI
- [Component Overview](../components/core-components.md) - Explore available components
- [Healthcare Workflows](../examples/patient-workflows.md) - Common healthcare patterns
