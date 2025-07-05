# 🧱 Core Components

Core components follow atomic design principles and provide the foundation for all healthcare interfaces.

## 🔬 Atomic Design System

### Atoms (Basic Building Blocks)

#### Button
The fundamental interaction element.

```typescript
import { Button, Row, Stack } from '@rxops/uikit';

// Basic usage
<Button>Click me</Button>

// Variants with proper layout
<Row gap="3" flexWrap="wrap">
  <Button variant="primary">Primary Action</Button>
  <Button variant="secondary">Secondary Action</Button>
  <Button variant="error">Delete</Button>
  <Button variant="outline">Subtle Action</Button>
</Row>

// Sizes
<Row gap="3" alignItems="center">
  <Button size="sm">Small</Button>
  <Button size="md">Medium</Button>
  <Button size="lg">Large</Button>
</Row>

// States
<Stack gap="2">
  <Button loading>Processing...</Button>
  <Button disabled>Disabled</Button>
</Stack>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'error' | 'outline' | 'success' | 'warning'
- `size`: 'sm' | 'md' | 'lg'
- `loading`: boolean
- `disabled`: boolean

#### Input
Text input with healthcare-specific validation.

```typescript
import { Input, FormField, Stack } from '@rxops/uikit';

// Basic input with proper form layout
<FormField label="Patient Name">
  <Input placeholder="Enter patient name" />
</FormField>

// Types with form structure
<Stack gap="4">
  <FormField label="Email Address">
    <Input type="email" placeholder="Email address" />
  </FormField>
  
  <FormField label="Phone Number">
    <Input type="tel" placeholder="Phone number" />
  </FormField>
  
  <FormField label="Password">
    <Input type="password" placeholder="Password" />
  </FormField>
</Stack>

// Validation states
<Stack gap="3">
  <FormField label="Required Field" error="This field is required">
    <Input error="This field is required" />
  </FormField>
  
  <FormField label="Valid Field">
    <Input success="Looks good!" />
  </FormField>
</Stack>

// Sizes
<Stack gap="3">
  <Input size="sm" placeholder="Small input" />
  <Input size="md" placeholder="Medium input" />
  <Input size="lg" placeholder="Large input" />
</Stack>
```

**Props:**
- `type`: 'text' | 'email' | 'password' | 'tel' | 'number'
- `size`: 'sm' | 'md' | 'lg' 
- `error`: string
- `success`: string
- `disabled`: boolean

#### Alert
Display important messages and notifications.

```typescript
import { Alert, Button, Stack } from '@rxops/uikit';

// Severity levels with proper spacing
<Stack gap="3">
  <Alert color="blue">Patient record updated</Alert>
  <Alert color="green">Appointment scheduled</Alert>
  <Alert color="yellow">Lab results pending</Alert>
  <Alert color="red">Critical value detected</Alert>
</Stack>

// With actions using layout components
<Alert 
  color="yellow"
  action={<Button size="sm" variant="outline">Review</Button>}
>
  Blood pressure reading is high
</Alert>

// Dismissible alerts
<Stack gap="2">
  <Alert color="blue" onDismiss={() => {}}>
    New message from Dr. Smith
  </Alert>
  
  <Alert color="green" onDismiss={() => {}}>
    Lab results are ready for review
  </Alert>
</Stack>
```

#### Avatar
User profile pictures and initials.

```typescript
import { Avatar } from '@rxops/uikit';

// With image
<Avatar 
  src="/doctor-smith.jpg"
  alt="Dr. Smith"
  size="md"
/>

// With initials
<Avatar 
  initials="DS"
  size="lg"
  color="blue"
/>

// Sizes
<Avatar size="sm" initials="JS" />
<Avatar size="md" initials="JS" />
<Avatar size="lg" initials="JS" />
<Avatar size="xl" initials="JS" />
```

#### Badge
Status indicators and labels.

```typescript
import { Badge } from '@rxops/uikit';

// Status badges
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="danger">Critical</Badge>
<Badge variant="info">New</Badge>

// Appointment status
<Badge variant="success">Confirmed</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="danger">Cancelled</Badge>

// With dot indicator
<Badge variant="success" dot>Online</Badge>
<Badge variant="danger" dot>Offline</Badge>
```

#### Spinner
Loading indicators for async operations.

```typescript
import { Spinner } from '@rxops/uikit';

// Sizes
<Spinner size="sm" />
<Spinner size="md" />
<Spinner size="lg" />

// Colors
<Spinner color="primary" />
<Spinner color="success" />
<Spinner color="warning" />

// With text
<Spinner>Loading patient data...</Spinner>
```

### Molecules (Simple Combinations)

#### FormField
Combines label, input, and validation in one component.

```typescript
import { FormField, Input } from '@rxops/uikit';

<FormField 
  label="Patient Name"
  required
  help="Enter the patient's full legal name"
  error="This field is required"
>
  <Input placeholder="John Doe" />
</FormField>

// Healthcare-specific fields
<FormField label="Blood Type" required>
  <Select options={bloodTypeOptions} />
</FormField>

<FormField label="Emergency Contact" required>
  <Input type="tel" placeholder="+1 (555) 123-4567" />
</FormField>
```

#### SearchAndFilter
Combined search input with filtering options.

```typescript
import { SearchAndFilter } from '@rxops/uikit';

// Basic patient search
<SearchAndFilter
  placeholder="Search patients..."
  filters={[
    { label: 'Active Patients', value: 'active' },
    { label: 'Pending Approval', value: 'pending' },
    { label: 'Inactive', value: 'inactive' }
  ]}
  onSearch={(query) => setSearchQuery(query)}
  onFilter={(filters) => setActiveFilters(filters)}
/>

// Doctor search with specialties
<DoctorSearch 
  placeholder="Find doctors..."
  specialties={['Cardiology', 'Dermatology', 'Neurology']}
  onSearch={handleDoctorSearch}
/>
```

#### DateTimePicker
Date and time selection for appointments.

```typescript
import { DateTimePicker } from '@rxops/uikit';

// Basic date picker
<DateTimePicker
  label="Appointment Date"
  value={appointmentDate}
  onChange={setAppointmentDate}
/>

// With time slots
<AppointmentDatePicker
  label="Schedule Appointment"
  availableSlots={availableSlots}
  blockedDates={blockedDates}
  onSelect={handleAppointmentSelect}
/>

// Date range for reports
<DateTimePicker
  label="Report Period"
  range
  value={[startDate, endDate]}
  onChange={handleRangeChange}
/>
```

#### FileUpload
Upload medical documents and images.

```typescript
import { FileUpload } from '@rxops/uikit';

// Basic file upload
<FileUpload
  accept=".pdf,.jpg,.png"
  maxSize={10} // MB
  onUpload={handleFileUpload}
  onError={handleUploadError}
/>

// Medical document upload
<MedicalDocumentUpload
  acceptedTypes={['lab-report', 'prescription', 'imaging']}
  encryption={true}
  onUpload={handleMedicalDocUpload}
/>

// Multiple files with demo
<FileUpload
  multiple
  demo
  accept="image/*"
  maxFiles={5}
  onUpload={handleImageUpload}
/>
```

### Organisms (Complex Sections)

#### Card
Container component for grouping related content.

```typescript
import { Card, CardHeader, CardBody, CardFooter } from '@rxops/uikit';

// Basic card
<Card>
  <CardHeader>
    <h3>Patient Information</h3>
    <Badge variant="success">Active</Badge>
  </CardHeader>
  <CardBody>
    <p>Patient details go here...</p>
  </CardBody>
  <CardFooter>
    <Button variant="primary">Edit</Button>
    <Button variant="ghost">View History</Button>
  </CardFooter>
</Card>

// Card variants
<Card variant="elevated">Content with shadow</Card>
<Card variant="outlined">Content with border</Card>
<Card variant="filled">Content with background</Card>

// Interactive cards
<Card clickable onClick={handleCardClick}>
  Clickable card content
</Card>
```

#### DataGrid
Table component for displaying structured data.

```typescript
import { DataGrid } from '@rxops/uikit';

// Patient list
<DataGrid
  data={patients}
  columns={[
    { key: 'name', label: 'Patient Name', sortable: true },
    { key: 'age', label: 'Age', sortable: true },
    { key: 'lastVisit', label: 'Last Visit', sortable: true },
    { key: 'status', label: 'Status', render: (value) => 
      <Badge variant={value === 'active' ? 'success' : 'warning'}>
        {value}
      </Badge>
    }
  ]}
  onSort={handleSort}
  onRowClick={handleRowClick}
  pagination={{
    page: currentPage,
    size: pageSize,
    total: totalPatients,
    onChange: handlePageChange
  }}
/>

// Enhanced data grid with filtering
<EnhancedDataGrid
  data={appointments}
  columns={appointmentColumns}
  filters={appointmentFilters}
  searchable
  exportable
  onExport={handleExport}
/>
```

#### Header
Application header with navigation and user menu.

```typescript
import { Header } from '@rxops/uikit';

<Header
  logo={<Logo />}
  navigation={[
    { label: 'Dashboard', href: '/dashboard', active: true },
    { label: 'Patients', href: '/patients' },
    { label: 'Appointments', href: '/appointments' },
    { label: 'Reports', href: '/reports' }
  ]}
  user={{
    name: 'Dr. Sarah Wilson',
    role: 'Cardiologist',
    avatar: '/avatars/dr-wilson.jpg'
  }}
  notifications={{
    count: 3,
    items: recentNotifications
  }}
  onNotificationClick={handleNotificationClick}
  onUserMenuClick={handleUserMenuClick}
/>
```

#### Form
Complete form component with validation.

```typescript
import { Form, FormField, Input, Select, Button } from '@rxops/uikit';

<Form onSubmit={handleSubmit} validation={validationSchema}>
  <FormField label="Patient Name" required>
    <Input name="patientName" />
  </FormField>
  
  <FormField label="Date of Birth" required>
    <DateTimePicker name="dateOfBirth" />
  </FormField>
  
  <FormField label="Blood Type">
    <Select 
      name="bloodType"
      options={bloodTypeOptions}
    />
  </FormField>
  
  <FormField label="Emergency Contact" required>
    <Input 
      name="emergencyContact" 
      type="tel"
    />
  </FormField>
  
  <div className="flex gap-4">
    <Button type="submit" variant="primary">
      Save Patient
    </Button>
    <Button type="button" variant="ghost" onClick={handleCancel}>
      Cancel
    </Button>
  </div>
</Form>
```

## 🎨 Styling & Customization

All core components support consistent styling through design tokens:

```typescript
// Custom button with healthcare branding
<Button 
  className="bg-medical-blue hover:bg-medical-blue-dark"
  style={{ 
    borderRadius: designTokens.borderRadius.lg,
    fontSize: typography.size.md
  }}
>
  Schedule Appointment
</Button>
```

## ♿ Accessibility Features

Core components include built-in accessibility:

- **Keyboard navigation** support
- **Screen reader** compatibility
- **ARIA labels** and descriptions
- **Focus management** for modals and forms
- **Color contrast** compliance for medical environments
- **High contrast mode** support

## 📱 Responsive Design

Components adapt to different screen sizes:

```typescript
// Responsive grid layout
<Grid 
  cols={{ sm: 1, md: 2, lg: 3 }}
  gap={{ sm: 'sm', md: 'md', lg: 'lg' }}
>
  <Card>Mobile-first responsive card</Card>
</Grid>
```

## 🧪 Testing

All components include comprehensive test coverage:

```typescript
import { render, screen } from '@testing-library/react';
import { Button } from '@rxops/uikit';

test('button renders with correct text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByRole('button')).toHaveTextContent('Click me');
});
```

## 📚 Related Documentation

- [Healthcare Components](./healthcare-components.md) - Domain-specific components
- [Design System](../design-system/design-tokens.md) - Design principles and tokens
- [Quick Start](../getting-started/quick-start.md) - Get started building
