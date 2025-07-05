# 🚀 Quick Start Guide

Get up and running with RxOpscomponents in minutes.

## 🏥 Healthcare Dashboard Example

Let's build a simple patient dashboard using core and healthcare-specific components:

```typescript
import { 
  // Layout
  UserLayout,
  
  // Core Components
  Card, CardHeader, CardBody,
  Button, Badge, Grid, GridItem,
  
  // Healthcare Components
  PatientProfile,
  VitalSigns,
  AppointmentCard,
  MedicationTracker,
  HealthMetric
} from '@rxops/uikit';

function PatientDashboard() {
  return (
    <UserLayout>
      <Grid cols={3} gap="md">
        {/* Patient Overview */}
        <GridItem colSpan={2}>
          <Card>
            <CardHeader>
              <h2>Patient Overview</h2>
              <Badge variant="success">Active</Badge>
            </CardHeader>
            <CardBody>
              <PatientProfile 
                patient={{
                  id: "P001",
                  name: "Sarah Johnson",
                  age: 34,
                  gender: "Female",
                  bloodType: "A+",
                  allergies: ["Penicillin", "Shellfish"]
                }}
              />
            </CardBody>
          </Card>
        </GridItem>

        {/* Vital Signs */}
        <GridItem>
          <Card>
            <CardHeader>
              <h3>Current Vitals</h3>
            </CardHeader>
            <CardBody>
              <VitalSigns 
                vitals={{
                  bloodPressure: "120/80",
                  heartRate: 72,
                  temperature: 98.6,
                  oxygenSaturation: 98
                }}
              />
            </CardBody>
          </Card>
        </GridItem>

        {/* Health Metrics */}
        <GridItem colSpan={3}>
          <div className="grid grid-cols-4 gap-4">
            <HealthMetric
              label="Blood Pressure"
              value="120/80"
              unit="mmHg"
              status="normal"
              trend="stable"
            />
            <HealthMetric
              label="Heart Rate"
              value="72"
              unit="bpm"
              status="normal"
              trend="up"
            />
            <HealthMetric
              label="Weight"
              value="68.5"
              unit="kg"
              status="normal"
              trend="down"
            />
            <HealthMetric
              label="BMI"
              value="22.4"
              unit=""
              status="normal"
              trend="stable"
            />
          </div>
        </GridItem>

        {/* Upcoming Appointments */}
        <GridItem colSpan={2}>
          <Card>
            <CardHeader>
              <h3>Upcoming Appointments</h3>
              <Button size="sm" variant="outline">View All</Button>
            </CardHeader>
            <CardBody>
              <AppointmentCard
                appointment={{
                  id: "APT001",
                  type: "General Checkup",
                  doctor: "Dr. Michael Chen",
                  date: "2025-07-15",
                  time: "10:00 AM",
                  duration: 30,
                  status: "confirmed",
                  location: "Room 201"
                }}
              />
            </CardBody>
          </Card>
        </GridItem>

        {/* Medications */}
        <GridItem>
          <Card>
            <CardHeader>
              <h3>Current Medications</h3>
            </CardHeader>
            <CardBody>
              <MedicationTracker
                medications={[
                  {
                    id: "MED001",
                    name: "Lisinopril",
                    dosage: "10mg",
                    frequency: "Once daily",
                    nextDose: "2025-07-02T08:00:00Z",
                    remainingRefills: 2
                  },
                  {
                    id: "MED002", 
                    name: "Metformin",
                    dosage: "500mg",
                    frequency: "Twice daily",
                    nextDose: "2025-07-01T18:00:00Z",
                    remainingRefills: 1
                  }
                ]}
              />
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </UserLayout>
  );
}

export default PatientDashboard;
```

## 🎨 Theming & Customization

Customize the look and feel to match your healthcare brand:

```typescript
import { designTokens } from '@rxops/uikit';

// Override default theme
const customTheme = {
  ...designTokens,
  colors: {
    ...designTokens.colors,
    primary: {
      50: '#f0f9ff',
      500: '#0ea5e9', // Your brand color
      900: '#0c4a6e'
    }
  }
};

// Apply to your app
function App() {
  return (
    <ThemeProvider theme={customTheme}>
      <PatientDashboard />
    </ThemeProvider>
  );
}
```

## 🔍 Form Validation Example

Healthcare forms require robust validation:

```typescript
import { 
  Form, FormField, Input, Button,
  useValidation, healthcareValidationRules 
} from '@rxops/uikit';

function PatientRegistrationForm() {
  const { validateField, errors } = useValidation({
    email: [healthcareValidationRules.email],
    phone: [healthcareValidationRules.phone],
    emergencyContact: [healthcareValidationRules.required],
    bloodType: [healthcareValidationRules.bloodType]
  });

  return (
    <Form onSubmit={handleSubmit}>
      <FormField 
        label="Email Address" 
        error={errors.email}
        required
      >
        <Input
          type="email"
          placeholder="patient@example.com"
          onBlur={(e) => validateField('email', e.target.value)}
        />
      </FormField>

      <FormField 
        label="Phone Number" 
        error={errors.phone}
        required
      >
        <Input
          type="tel"
          placeholder="+1 (555) 123-4567"
          onBlur={(e) => validateField('phone', e.target.value)}
        />
      </FormField>

      <FormField 
        label="Blood Type" 
        error={errors.bloodType}
      >
        <Select
          options={[
            { value: 'A+', label: 'A+' },
            { value: 'A-', label: 'A-' },
            { value: 'B+', label: 'B+' },
            { value: 'B-', label: 'B-' },
            { value: 'AB+', label: 'AB+' },
            { value: 'AB-', label: 'AB-' },
            { value: 'O+', label: 'O+' },
            { value: 'O-', label: 'O-' }
          ]}
          onBlur={(value) => validateField('bloodType', value)}
        />
      </FormField>

      <Button type="submit" variant="primary">
        Register Patient
      </Button>
    </Form>
  );
}
```

## 📱 Responsive Healthcare UI

Components are mobile-first and healthcare-optimized:

```typescript
function ResponsiveHealthDashboard() {
  return (
    <Grid 
      cols={{ sm: 1, md: 2, lg: 3 }} 
      gap="md"
      className="min-h-screen p-4"
    >
      {/* Stacks vertically on mobile, side-by-side on desktop */}
      <GridItem colSpan={{ sm: 1, lg: 2 }}>
        <PatientProfile />
      </GridItem>
      
      <GridItem>
        <VitalSigns />
      </GridItem>
      
      {/* Full width on all screen sizes */}
      <GridItem colSpan={{ sm: 1, md: 2, lg: 3 }}>
        <AppointmentCalendar />
      </GridItem>
    </Grid>
  );
}
```

## 🔄 What's Next?

1. **[Explore Components](../components/core-components.md)** - Detailed component documentation
2. **[Healthcare Workflows](../examples/patient-workflows.md)** - Common healthcare patterns
3. **[Design System](../design-system/design-tokens.md)** - Understand the design principles
4. **[Contributing](../development/contributing.md)** - Help improve the library

## 💡 Need Help?

- Check the [Component Documentation](../components/)
- Browse [Healthcare Examples](../examples/)
- Review [Best Practices](../development/best-practices.md)
