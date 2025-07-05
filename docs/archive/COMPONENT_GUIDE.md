# RxOps UI Component Library

A healthcare-focused UI component library built with Qwik, inspired by Radzen Blazor components but simplified for healthcare applications.

## 🏗️ Architecture

The library follows a two-tier approach:

### 1. **Atomic Components** (Building Blocks)
Small, reusable components that can be composed to build larger interfaces:

- **Layout**: `Container`, `Grid`, `GridItem`, `Stack`, `Divider`
- **Core**: `Button`, `Input`, `Select`, `Card`, `Avatar`, `Badge`, `Spinner`
- **Form**: `Form`, `FormField`, `FormSection`, `Checkbox`, `Radio`, `Switch`, `Textarea`
- **Data**: `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell`, `DataGrid`
- **Feedback**: `Alert`, `Toast`, `Modal`, `Tooltip`
- **Navigation**: `Pagination`, `Tabs`, `TabPanel`, `Breadcrumb`

### 2. **Template Components** (Data-Specific)
Healthcare-specific components that handle domain data:

- **PatientCard**: Display patient information with medical details
- **AppointmentCard**: Show appointment details with status management
- **MedicalRecordCard**: Present medical records with vitals, medications, and notes

## 🎨 Design System

### Colors
- **Primary**: Healthcare blue palette (`#2196F3` family)
- **Success**: Health/positive green (`#4CAF50` family)
- **Warning**: Alert orange (`#FFC107` family)
- **Error**: Critical red (`#F44336` family)
- **Gray**: Neutral grays for text and borders

### Typography
- Clean, accessible fonts optimized for medical interfaces
- Consistent sizing scale (sm, md, lg)

### Spacing
- Consistent gap system: `xs`, `sm`, `md`, `lg`, `xl`
- Responsive padding and margins

## 🚀 Quick Start

```tsx
import { 
  Container, 
  Grid, 
  PatientCard, 
  AppointmentCard,
  type PatientInfo 
} from '@rxops/uikit';

const patient: PatientInfo = {
  id: "P001",
  name: "Sarah Johnson",
  age: 34,
  gender: "female",
  bloodType: "A+",
  allergies: ["Penicillin"],
  conditions: ["Hypertension"]
};

export default component$(() => {
  return (
    <Container size="lg">
      <Grid cols={2} gap="md">
        <PatientCard patient={patient} showDetails />
        <AppointmentCard appointment={appointmentData} />
      </Grid>
    </Container>
  );
});
```

## 🏥 Healthcare Features

### Patient Management
- **Patient Cards**: Comprehensive patient information display
- **Medical History**: Timeline of medical records
- **Emergency Contacts**: Quick access to patient emergency information

### Appointment System
- **Status Management**: Visual indicators for appointment states
- **Type Classification**: In-person, virtual, follow-up, emergency
- **Action Buttons**: Context-aware actions based on appointment status

### Medical Records
- **Vital Signs Display**: Organized presentation of health metrics
- **Medication Lists**: Current and historical medication tracking
- **Lab Results**: Formatted lab data with abnormal value highlighting

### Data Presentation
- **Responsive Tables**: Medical data tables with sorting and filtering
- **Data Grids**: Advanced data management for large datasets
- **Search & Filter**: Patient and appointment search capabilities

## 🔧 Development

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Build library
npm run build

# Run linting
npm run lint
```

## 📦 Components Overview

### Atomic Components

#### Layout Components
- `Container`: Responsive content wrapper with size constraints
- `Grid`: CSS Grid-based layout system with responsive breakpoints  
- `GridItem`: Individual grid items with flexible positioning
- `Stack`: Flexbox-based component for directional layouts
- `Divider`: Visual separation with customizable styles

#### Core Components
- `Button`: Multi-variant button with loading states and sizes
- `Input`: Form input with validation, helper text, and icons
- `Select`: Dropdown with search, grouping, and custom options
- `Card`: Content container with multiple variants and hover effects
- `Avatar`: User profile images with fallback initials
- `Badge`: Status indicators with color variants and sizes
- `Spinner`: Loading indicators with multiple variants

#### Form Components
- `Form`: Form wrapper with validation context
- `FormField`: Individual form field with label and validation
- `FormSection`: Grouped form sections with collapsible options
- `Checkbox`: Styled checkboxes with validation states
- `Radio`: Radio button groups with descriptions
- `Switch`: Toggle switches with variants and sizes
- `Textarea`: Multi-line text input with auto-resize

#### Data Display Components
- `Table`: Structured data presentation with sorting
- `TableHeader`, `TableBody`, `TableRow`, `TableCell`: Table sub-components
- `DataGrid`: Advanced data table with pagination and filtering

#### Feedback Components  
- `Alert`: Contextual alerts with severity levels and actions
- `Toast`: Temporary notifications with positioning options
- `ToastContainer`: Container for managing multiple toasts
- `Modal`: Overlay dialogs with backdrop and focus management
- `Tooltip`: Helpful hints with positioning and variants

#### Navigation Components
- `Pagination`: Page navigation with customizable buttons
- `Tabs`: Horizontal and vertical tab navigation
- `TabPanel`: Individual tab content panels
- `Breadcrumb`: Navigation trail with separators and variants

### Template Components (Healthcare-Specific)

#### Patient Management
- `PatientCard`: Patient information with medical context and emergency contacts
- `AppointmentCard`: Appointment details with status management and actions
- `MedicalRecordCard`: Medical records with vitals, medications, and notes

### Legacy Components
- `Logo`: Brand logo component
- `Counter`: Interactive counter (demo component)

## 🎯 Next Steps

### Completed ✅
- ✅ **Core Form Components**: Radio, Switch, Checkbox, Textarea
- ✅ **Navigation Components**: Tabs, Breadcrumb, Pagination  
- ✅ **Feedback Components**: Toast, Modal, Tooltip, Alert
- ✅ **Healthcare Templates**: Patient, Appointment, Medical Record cards
- ✅ **Layout System**: Container, Grid, Stack, Divider
- ✅ **Data Components**: Table, DataGrid with sorting and pagination

### Future Enhancements
1. **Advanced Form Components**: DatePicker, TimePicker, MultiSelect, FileUpload
2. **Data Visualization**: Charts, Metrics, Dashboard widgets, Progress indicators
3. **Advanced Navigation**: Stepper, Sidebar, CommandPalette
4. **Accessibility Improvements**: Enhanced ARIA labels, keyboard navigation, screen reader support
5. **Internationalization**: Multi-language support for global healthcare
6. **Advanced Interactions**: Drag & drop, resizable panels, virtualized lists
7. **Mobile Optimization**: Touch gestures, responsive breakpoints
8. **Testing**: Unit tests, visual regression tests, accessibility tests

## 🧪 Testing & Documentation

- Component demos available in `src/demo.tsx`
- Comprehensive TypeScript types for all components
- CSS-in-JS styling system with healthcare color palette
- Responsive design for mobile and desktop healthcare applications

---

Built with ❤️ for healthcare professionals using Qwik framework.
