# 🏥 RxOps UIKit

<div align="center">

![RxOpsOverview](docs/images/hero-image.png)

**A modern, Medical industry-focused UI UIKit built with Qwik**

[![npm version](https://badge.fury.io/js/@rxops%2Fui.svg)](https://badge.fury.io/js/@rxops%2Fui)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://github.com/your-org/rxops/workflows/UI%20Library%20CI%2FCD/badge.svg)](https://github.com/your-org/rxops/actions)
[![Coverage](https://codecov.io/gh/your-org/rxops/branch/main/graph/badge.svg)](https://codecov.io/gh/your-org/rxops)

[📚 Documentation](https://rxops-ui.vercel.app) • [🎮 Interactive Demo](https://rxops-ui.vercel.app/demo) • [📦 NPM Package](https://www.npmjs.com/package/@rxops/uikit)

</div>

## ✨ Features

- 🏥 **Medical industry-focused** components designed for medical applications
- ⚡ **Qwik-powered** for maximum performance and minimal JavaScript
- 🎨 **Modern design** with Tailwind CSS and healthcare color palette
- ♿ **Accessibility-first** with WCAG 2.1 AA compliance
- 📱 **Responsive** design that works on all devices
- 🧪 **Fully tested** with 80%+ coverage and visual regression tests
- 📦 **TypeScript** support with comprehensive type definitions
- 🔧 **Tree-shakeable** for optimal bundle sizes

## 🚀 Quick Start

### Installation

```bash
npm install @rxops/uikit
```

### Font Setup

The UI library uses the **Inter** font family for optimal readability in healthcare applications. Add these font links to your HTML `<head>` section:

```html
<head>
  <!-- Font optimization -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  
  <!-- Inter font family -->
  <link 
    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" 
    rel="stylesheet" 
  />
</head>
```

**Note:** The font import is colorionally excluded from CSS to avoid `@import` order issues with Tailwind CSS and other build tools.

### Basic Usage

```tsx
import { 
  Button, 
  DoctorCard, 
  AppointmentCard,
  Container,
  Text,
  Row,
  Stack
} from '@rxops/uikit';

export default component$(() => {
  return (
    <Container size="lg" padding="6">
      <Stack gap="6">
        <Text as="h1" size="3xl" weight="bold" color="primary">
          Welcome to RxOps
        </Text>
        
        <Row gap="4" alignItems="center" flexWrap="wrap">
          <DoctorCard 
            doctor={{
              id: "1",
              name: "Dr. Sarah Wilson",
              specialization: "Cardiologist",
              rating: 4.8,
              isAvailable: true
            }}
            onConsult$={(doctorId) => console.log('Consult:', doctorId)}
          />
          
          <Button variant="primary" size="lg">
            Book Appointment
          </Button>
        </Row>
      </Stack>
    </Container>
  );
});
```

## 🏥 Healthcare Components

### Doctor Management
![Healthcare Components](docs/images/components/demo-healthcare-cards.png)

```tsx
<Container padding="4">
  <Stack gap="4">
    <Text as="h2" size="xl" weight="semibold">
      Available Doctors
    </Text>
    
    <Row gap="4" flexWrap="wrap">
      <DoctorCard 
        doctor={doctorData}
        onConsult$={handleConsult}
        onViewProfile$={handleViewProfile}
      />
    </Row>
  </Stack>
</Container>
```

### Appointment System
![Appointment Card](docs/images/components/demo-appointment-card.png)

```tsx
<Container padding="4">
  <Stack gap="4">
    <Text as="h2" size="xl" weight="semibold">
      Your Appointments
    </Text>
    
    <Stack gap="3">
      <AppointmentCard 
        appointment={appointmentData}
        onJoin$={handleJoin}
        onReschedule$={handleReschedule}
        onCancel$={handleCancel}
      />
    </Stack>
  </Stack>
</Container>
```

### Service Booking
![Service Card](docs/images/components/demo-service-card.png)

```tsx
<Container padding="4">
  <Stack gap="4">
    <Text as="h2" size="xl" weight="semibold">
      Available Services
    </Text>
    
    <Row gap="4" flexWrap="wrap">
      <ServiceCard 
        service={serviceData}
        onBook$={handleBooking}
      />
    </Row>
  </Stack>
</Container>
```

## 🎨 UI Components

### Button Variants
![Button Components](docs/images/demos/demo-buttons.png)

```tsx
<Container padding="4">
  <Stack gap="4">
    <Text as="h3" size="lg" weight="medium">
      Button Variants
    </Text>
    
    <Row gap="3" flexWrap="wrap">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="success">Success</Button>
      <Button variant="warning">Warning</Button>
      <Button variant="error">Error</Button>
    </Row>
    
    <Row gap="3" flexWrap="wrap">
      <Button variant="primary" size="sm">Small</Button>
      <Button variant="primary" size="md">Medium</Button>
      <Button variant="primary" size="lg">Large</Button>
    </Row>
    
    <Row gap="3" flexWrap="wrap">
      <Button variant="primary" loading>Loading</Button>
      <Button variant="primary" disabled>Disabled</Button>
    </Row>
  </Stack>
</Container>
```

### Form Components
![Form Components](docs/images/demos/demo-form-components.png)

```tsx
<Form onSubmit$={handleSubmit}>
  <Stack gap="4">
    <FormField label="Email" error={errors.email}>
      <Input 
        type="email" 
        placeholder="doctor@rxops.com"
        bind:value={formData.email}
      />
    </FormField>
    
    <FormField label="Specialization">
      <Select 
        options={specializations}
        bind:value={formData.specialization}
      />
    </FormField>
    
    <Row justifyContent="end">
      <Button type="submit" variant="primary">
        Save Profile
      </Button>
    </Row>
  </Stack>
</Form>
```

### Data Components
![Data Table](docs/images/demos/demo-data-table-desktop.png)

```tsx
<DataGrid 
  data={patientData}
  columns={[
    { key: 'name', title: 'Patient Name', sortable: true },
    { key: 'age', title: 'Age', sortable: true },
    { key: 'lastVisit', title: 'Last Visit', sortable: true },
    { key: 'status', title: 'Status' }
  ]}
  loading={isLoading}
/>
```

## 📱 Mobile Responsive

All components are fully responsive and optimized for mobile healthcare workflows:

![Mobile Data Table](docs/images/mobile/demo-data-table-mobile.png)

## 🧪 Interactive Components

### Modal Dialogs
![Modal Component](docs/images/demos/demo-modal-component.png)

### Toast Notifications
![Toast Notification](docs/images/demos/demo-toast-notification.png)

### Tooltips & Popovers
![Tooltip Component](docs/images/demos/demo-tooltip-component.png)

## 📦 Component Categories

### Core Components
- `Button` - Multi-variant buttons with loading states
- `Input` - Form inputs with validation
- `Card` - Content containers
- `Avatar` - User profile images
- `Badge` - Status indicators
- `Spinner` - Loading states

### Layout Components
- `Container` - Content wrapper with responsive sizing
- `Row` - Horizontal flex layout with gap and alignment
- `Column` - Vertical flex layout with gap and alignment
- `Stack` - Directional layout with gap (replaces flexbox)
- `Grid` - CSS Grid-based layout system with responsive features
- `GridItem` - Grid item with span and positioning
- `Divider` - Visual separators

## 🎯 Modern Layout Patterns

### Responsive Layout with Container + Stack
```tsx
<Container size="xl" padding="6">
  <Stack gap="8">
    <Text as="h1" size="3xl" weight="bold">Healthcare Dashboard</Text>
    
    <Row gap="6" alignItems="start">
      <Stack gap="4" class="flex-1">
        <PatientProfile patient={patient} />
        <VitalSigns vitals={vitals} />
      </Stack>
      
      <Stack gap="4" class="flex-1">
        <AppointmentCard appointment={nextAppointment} />
        <MedicalHistory history={recentHistory} />
      </Stack>
    </Row>
  </Stack>
</Container>
```

### Grid Layout for Cards
```tsx
<Container padding="4">
  <Grid cols="1" md:cols="2" lg:cols="3" gap="6">
    <GridItem>
      <DoctorCard doctor={doctor1} />
    </GridItem>
    <GridItem>
      <DoctorCard doctor={doctor2} />
    </GridItem>
    <GridItem>
      <DoctorCard doctor={doctor3} />
    </GridItem>
  </Grid>
</Container>
```

### Form Layout with Proper Spacing
```tsx
<Container size="md" padding="6">
  <Card>
    <Stack gap="6">
      <Text as="h2" size="xl" weight="semibold">Patient Registration</Text>
      
      <Form onSubmit$={handleSubmit}>
        <Stack gap="4">
          <Row gap="4">
            <FormField label="First Name" class="flex-1">
              <Input bind:value={form.firstName} />
            </FormField>
            <FormField label="Last Name" class="flex-1">
              <Input bind:value={form.lastName} />
            </FormField>
          </Row>
          
          <FormField label="Email">
            <Input type="email" bind:value={form.email} />
          </FormField>
          
          <Row justifyContent="end" gap="3">
            <Button variant="outline">Cancel</Button>
            <Button variant="primary" type="submit">Register</Button>
          </Row>
        </Stack>
      </Form>
    </Stack>
  </Card>
</Container>
```

### Healthcare Components
- `DoctorCard` - Doctor profiles with consultation booking
- `AppointmentCard` - Appointment management interface
- `ServiceCard` - Medical service booking
- `HealthMetric` - Health data visualization
- `PatientCard` - Patient information display
- `MedicalRecordCard` - Medical history presentation

### Form Components
- `Form` - Form wrapper with validation
- `FormField` - Labeled form fields
- `Select` - Dropdown selection
- `Checkbox` - Boolean inputs
- `Radio` - Single selection
- `Switch` - Toggle inputs
- `Textarea` - Multi-line text
- `DatePicker` - Date selection

### Data Components
- `Table` - Structured data tables
- `DataGrid` - Advanced data management
- `List` - Ordered/unordered lists
- `Pagination` - Data pagination

### Feedback Components
- `Alert` - System messages
- `Toast` - Notifications
- `Modal` - Dialog overlays
- `Tooltip` - Contextual help

### Navigation Components
- `Tabs` - Tab navigation
- `Breadcrumb` - Navigation paths
- `Pagination` - Page navigation

## 🎯 Design System

### Healthcare Color Palette
- **Primary**: Healthcare blue (`#2196F3`)
- **Success**: Health green (`#4CAF50`) 
- **Warning**: Alert orange (`#FFC107`)
- **Error**: Critical red (`#F44336`)
- **Neutral**: Professional grays

### Typography
- Clean, accessible fonts optimized for medical interfaces
- Consistent sizing scale (sm, md, lg, xl)
- Proper contrast ratios for accessibility

### Spacing System
- Consistent gap system: `xs`, `sm`, `md`, `lg`, `xl`
- Responsive padding and margins
- Healthcare-appropriate touch targets

## 🧪 Testing & Quality

This library maintains high quality standards:

- ✅ **80%+ test coverage** with unit and integration tests
- ✅ **Visual regression testing** across 5 browsers
- ✅ **Accessibility testing** for WCAG 2.1 AA compliance
- ✅ **Cross-browser compatibility** (Chrome, Firefox, Safari, Edge)
- ✅ **Mobile responsiveness** testing
- ✅ **Performance optimization** with Qwik

### Running Tests

```bash
# Unit tests
npm run test

# Visual regression tests  
npm run test:visual

# Accessibility tests
npm run test:a11y

# Generate demo screenshots
npm run demo:screenshots
```

## 🔧 Development

### Prerequisites
- Node.js 18+ 
- npm 8+

### Setup
```bash
git clone https://github.com/your-org/rxops.git
cd rxops/ui
npm install
npm run dev
```

### Building
```bash
npm run build.lib    # Build library
npm run build.types  # Generate types
```

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Run `npm run test` and `npm run lint`
5. Submit a pull request

## 📚 Documentation

- [📖 Component Guide](COMPONENT_GUIDE.md) - Detailed component documentation
- [🧪 Testing Guide](docs/TESTING_GUIDE.md) - Testing and quality assurance
- [🎨 Design System](docs/design-system.md) - Colors, typography, spacing
- [🗺️ Component Roadmap](COMPONENT_ROADMAP.md) - Development priorities and features
- [🤝 Contributing Guide](CONTRIBUTING.md) - How to contribute to the project

## 🚀 Deployment

### NPM Package
```bash
npm install @rxops/uikit
```

### CDN
```html
<script type="module" src="https://unpkg.com/@rxops/uikit"></script>
```

### Vercel/Netlify
The library works seamlessly with modern deployment platforms.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. **Feature Development**: Work on feature branches
2. **Quality Checks**: Automated linting and testing
3. **Visual Testing**: Screenshot comparisons
4. **Accessibility**: WCAG compliance verification
5. **Review Process**: Code review and approval
6. **Automated Release**: Semantic versioning and NPM publishing

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Qwik](https://qwik.builder.io/) for optimal performance
- Styled with [Tailwind CSS](https://tailwindcss.com/) for consistency
- Tested with [Playwright](https://playwright.dev/) for reliability
- Inspired by healthcare professionals worldwide 🏥

---

<div align="center">

**Made with ❤️ for healthcare professionals**

[🏥 RxOps](https://rxops.com) • [📧 Contact](mailto:support@rxops.com) • [💬 Discord](https://discord.gg/rxops)

</div>
