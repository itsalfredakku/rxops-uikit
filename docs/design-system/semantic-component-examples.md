# Semantic Component Examples

## Overview

This document provides comprehensive examples of semantic-first component usage, demonstrating how semantic meaning drives styling and behavior in the RxOpslibrary.

## Text Component Examples

### Basic Semantic Usage
```tsx
// Semantic HTML elements automatically get appropriate styling
<Text as="h1">Page Title</Text>                    // Large, bold title styling
<Text as="h2">Section Heading</Text>               // Medium, semibold subtitle styling
<Text as="h3">Subsection</Text>                    // Smaller subtitle styling
<Text as="p">This is body text content.</Text>     // Standard paragraph styling
<Text as="small">Fine print or caption text</Text> // Small, secondary styling
```

### Semantic Override Examples
```tsx
// Maintain semantics while adjusting styling
<Text as="h1" size="md">Smaller Main Heading</Text>        // h1 semantics, medium size
<Text as="h2" weight="normal">Light Section Heading</Text>  // h2 semantics, normal weight
<Text as="p" size="lg" color="primary">Important body text</Text>  // Enhanced paragraph
```

### Accessibility-First Examples
```tsx
// Proper heading hierarchy for screen readers
<Text as="h1">Main Page Title</Text>
  <Text as="h2">Section 1</Text>
    <Text as="h3">Subsection 1.1</Text>
    <Text as="h3">Subsection 1.2</Text>
  <Text as="h2">Section 2</Text>
    <Text as="h3">Subsection 2.1</Text>
```

---

## Button Component Examples (Planned)

### Intent-Based Usage (Relatable Prop Names)
```tsx
// Semantic intentions with intuitive naming
<Button intent="primary">Save Changes</Button>        // Main action (everyone understands "primary")
<Button intent="secondary">Cancel</Button>            // Supporting action (clear hierarchy)
<Button intent="destructive">Delete Account</Button>  // Dangerous action (immediate warning)
<Button intent="success">Confirm Payment</Button>     // Positive action (emotional connection)
<Button intent="neutral">Close Dialog</Button>        // Safe, non-committal action
```

### Context-Aware Examples with Natural Language
```tsx
// Buttons adapt to their context with readable props
<Form purpose="registration">
  <Button intent="primary">Create Account</Button>     // Clear call-to-action
  <Button intent="secondary">Back</Button>             // Navigation action
</Form>

<Card purpose="article">
  <Button intent="primary">Read More</Button>          // Content engagement
  <Button intent="secondary">Share</Button>            // Social action
</Card>
```

### Advanced Intent Examples (Real-World Healthcare Scenarios)
```tsx
// Complex medical interactions with semantic clarity
<Button 
  intent="destructive" 
  loading={isDeleting}
  confirmationRequired          // Readable boolean prop
>
  Delete Patient Record
</Button>

<Button 
  intent="primary" 
  icon="save"
  disabled={!isFormValid}      // Standard HTML attribute
>
  Submit Prescription
</Button>

<Button 
  intent="urgent"
  size="lg"
  pulsing                      // Visual urgency indicator (readable name)
>
  Emergency Alert
</Button>

{/* Healthcare workflow examples */}
<Button intent="primary">Admit Patient</Button>
<Button intent="neutral">Transfer Care</Button>
<Button intent="destructive">Cancel Procedure</Button>
<Button intent="success">Approve Treatment</Button>
```
>
  Save Draft
</Button>

// Healthcare-specific intents (domain-specific but relatable)
<Button intent="emergency">Call 911</Button>
<Button intent="appointment">Schedule Visit</Button>
<Button intent="prescription">Refill Medication</Button>
```

---

## Card Component Examples (Planned)

### Purpose-Driven Layout (Intuitive Purpose Names)
```tsx
// Card purpose determines layout with relatable names
<Card purpose="article">
  <CardHeader>
    <Text as="h2">Blog Post Title</Text>
    <Text as="small">Published 2 days ago</Text>
  </CardHeader>
  <CardBody>
    <Text as="p">Article excerpt content...</Text>
  </CardBody>
  <CardFooter>
    <Button intent="primary">Read More</Button>
    <Button intent="secondary">Share</Button>
  </CardFooter>
</Card>

<Card purpose="navigation">
  <CardBody>
    <Text as="h3">Quick Actions</Text>
    <Button intent="secondary">Dashboard</Button>
    <Button intent="secondary">Settings</Button>
    <Button intent="secondary">Help</Button>
  </CardBody>
</Card>

<Card purpose="form">
  <CardHeader>
    <Text as="h2">Contact Information</Text>
  </CardHeader>
  <CardBody>
    <Input type="email" label="Email Address" />
    <Input type="tel" label="Phone Number" />
  </CardBody>
  <CardFooter>
    <Button intent="primary">Update</Button>
    <Button intent="secondary">Cancel</Button>
  </CardFooter>
</Card>

{/* Healthcare-specific purposes (domain-relatable) */}
<Card purpose="patient">
  <CardHeader>
    <Text as="h3">Patient Summary</Text>
  </CardHeader>
  <CardBody>
    <Text as="p">John Doe, Age 45</Text>
    <Text as="small">Last visit: March 10, 2025</Text>
  </CardBody>
</Card>

<Card purpose="appointment">
  <CardHeader>
    <Text as="h3">Upcoming Appointment</Text>
  </CardHeader>
  <CardBody>
    <Text as="p">Dr. Smith - Cardiology</Text>
    <Text as="small">Tomorrow at 2:00 PM</Text>
  </CardBody>
  <CardFooter>
    <Button intent="neutral">Reschedule</Button>
    <Button intent="destructive">Cancel</Button>
  </CardFooter>
</Card>
```

### Dashboard Card Examples
```tsx
<Card purpose="dashboard" metric="primary">
  <CardHeader>
    <Text as="h3">Total Revenue</Text>
  </CardHeader>
  <CardBody>
    <Text as="div" size="xl" weight="bold">$42,350</Text>
    <Text as="small" color="success">+12% from last month</Text>
  </CardBody>
</Card>

<Card purpose="dashboard" metric="secondary">
  <CardHeader>
    <Text as="h3">Active Users</Text>
  </CardHeader>
  <CardBody>
    <Text as="div" size="xl" weight="bold">1,234</Text>
    <Text as="small" color="warning">-3% from last week</Text>
  </CardBody>
</Card>
```

---

## Form Component Examples (Planned)

### Purpose-Based Form Structure
```tsx
// Form purpose drives layout and validation patterns
<Form purpose="login">
  <FormSection>
    <Text as="h2">Sign In</Text>
    <Input type="email" label="Email" required />
    <Input type="password" label="Password" required />
  </FormSection>
  
  <FormActions>
    <Button intent="primary" type="submit">Sign In</Button>
    <Button intent="secondary" type="button">Forgot Password?</Button>
  </FormActions>
</Form>

<Form purpose="registration">
  <FormSection title="Personal Information">
    <Input type="text" label="First Name" required />
    <Input type="text" label="Last Name" required />
    <Input type="email" label="Email Address" required />
  </FormSection>
  
  <FormSection title="Account Security">
    <Input type="password" label="Password" required />
    <Input type="password" label="Confirm Password" required />
  </FormSection>
  
  <FormActions>
    <Button intent="primary" type="submit" fullWidth>Create Account</Button>
    <Button intent="secondary" type="button">Back to Sign In</Button>
  </FormActions>
</Form>
```

### Contextual Input Enhancement
```tsx
// Input types drive automatic enhancements
<Form purpose="contact">
  <Input type="email" />          // Auto email validation + @ icon
  <Input type="tel" />            // Auto phone formatting + phone icon
  <Input type="url" />            // Auto URL validation + link icon
  <Input type="search" />         // Auto search behavior + search icon
  <Input type="password" />       // Auto show/hide toggle + strength meter
</Form>
```

---

## Semantic Layout Examples (Planned)

### Document Structure
```tsx
// Semantic HTML5 structure with automatic styling
<Header>
  <Navigation>
    <Text as="h1">RxOps</Text>
    <NavigationMenu>
      <NavigationItem href="/dashboard">Dashboard</NavigationItem>
      <NavigationItem href="/patients">Patients</NavigationItem>
      <NavigationItem href="/appointments">Appointments</NavigationItem>
    </NavigationMenu>
  </Navigation>
</Header>

<Main>
  <Section>
    <Text as="h2">Dashboard Overview</Text>
    <Card purpose="dashboard">...</Card>
  </Section>
  
  <Section>
    <Text as="h2">Recent Activity</Text>
    <Card purpose="article">...</Card>
  </Section>
</Main>

<Aside>
  <Text as="h3">Quick Actions</Text>
  <Card purpose="navigation">...</Card>
</Aside>

<Footer>
  <Text as="small">© 2025 RxOps. All rights reserved.</Text>
</Footer>
```

### Content Layout Examples
```tsx
// Article layout with semantic structure
<Article>
  <header>
    <Text as="h1">Understanding Patient Care</Text>
    <Text as="small">Published on March 15, 2025</Text>
  </header>
  
  <Section>
    <Text as="h2">Introduction</Text>
    <Text as="p">Patient care is the cornerstone...</Text>
  </Section>
  
  <Section>
    <Text as="h2">Best Practices</Text>
    <Text as="p">Following these guidelines...</Text>
  </Section>
  
  <footer>
    <Text as="small">Last updated: March 20, 2025</Text>
  </footer>
</Article>
```

---

## Alert/Notification Examples (Planned)

### Context-Driven Alerts
```tsx
// Alert context determines styling and behavior
<Alert context="validation">
  Your email address format is invalid. Please check and try again.
</Alert>

<Alert context="system">
  System maintenance scheduled for tonight at 2:00 AM EST.
</Alert>

<Alert context="success">
  Your profile has been successfully updated!
</Alert>

<Alert context="info">
  New features are available in the latest update.
</Alert>
```

### Contextual Alert Examples
```tsx
// Form validation context
<Form purpose="registration">
  <Input type="email" error="Invalid email format" />
  <Alert context="validation">
    Please correct the errors above before continuing.
  </Alert>
</Form>

// System notification context
<Header>
  <Alert context="system" dismissible>
    Scheduled maintenance: System will be unavailable tonight from 2-4 AM EST.
  </Alert>
</Header>

// Success feedback context
<Card purpose="form">
  <Alert context="success" autoHide duration={5000}>
    Settings saved successfully!
  </Alert>
</Card>
```

---

## Real-World Application Examples

### Healthcare Dashboard
```tsx
function HealthcareDashboard() {
  return (
    <Main>
      <Section>
        <Text as="h1">Patient Dashboard</Text>
        
        <div className="grid grid-cols-3 gap-4">
          <Card purpose="dashboard" metric="primary">
            <Text as="h3">Total Patients</Text>
            <Text as="div" size="xl" weight="bold">1,247</Text>
            <Text as="small" color="success">+5% this month</Text>
          </Card>
          
          <Card purpose="dashboard" metric="secondary">
            <Text as="h3">Appointments Today</Text>
            <Text as="div" size="xl" weight="bold">23</Text>
            <Text as="small" color="info">12 completed</Text>
          </Card>
          
          <Card purpose="dashboard" metric="warning">
            <Text as="h3">Urgent Cases</Text>
            <Text as="div" size="xl" weight="bold">3</Text>
            <Text as="small" color="error">Requires attention</Text>
          </Card>
        </div>
      </Section>
      
      <Section>
        <Text as="h2">Recent Activities</Text>
        <Card purpose="article">
          <Text as="h3">Patient Check-in Updates</Text>
          <Text as="p">Recent patient check-ins and updates...</Text>
          <Button intent="secondary">View All Activities</Button>
        </Card>
      </Section>
    </Main>
  );
}
```

### Patient Registration Form
```tsx
function PatientRegistrationForm() {
  return (
    <Form purpose="registration">
      <Text as="h1">New Patient Registration</Text>
      
      <FormSection title="Personal Information">
        <Input type="text" label="First Name" required />
        <Input type="text" label="Last Name" required />
        <Input type="email" label="Email Address" required />
        <Input type="tel" label="Phone Number" required />
      </FormSection>
      
      <FormSection title="Medical Information">
        <Input type="text" label="Insurance Provider" />
        <Input type="text" label="Policy Number" />
        <textarea label="Medical History" />
      </FormSection>
      
      <FormSection title="Emergency Contact">
        <Input type="text" label="Contact Name" required />
        <Input type="tel" label="Contact Phone" required />
      </FormSection>
      
      <FormActions>
        <Button intent="primary" type="submit" fullWidth>
          Register Patient
        </Button>
        <Button intent="secondary" type="button">
          Save as Draft
        </Button>
      </FormActions>
    </Form>
  );
}
```

### Navigation and Layout
```tsx
function AppLayout({ children }) {
  return (
    <>
      <Header>
        <Navigation>
          <Text as="h1">RxOps</Text>
          <NavigationMenu>
            <NavigationItem href="/dashboard" intent="primary">
              Dashboard
            </NavigationItem>
            <NavigationItem href="/patients">
              Patients
            </NavigationItem>
            <NavigationItem href="/appointments">
              Appointments
            </NavigationItem>
            <NavigationItem href="/reports">
              Reports
            </NavigationItem>
          </NavigationMenu>
          
          <div className="ml-auto">
            <Button intent="secondary" size="sm">
              Profile
            </Button>
            <Button intent="neutral" size="sm">
              Logout
            </Button>
          </div>
        </Navigation>
      </Header>
      
      <Main>
        {children}
      </Main>
      
      <Footer>
        <Text as="small">
          © 2025 RxOps Healthcare Solutions. All rights reserved.
        </Text>
      </Footer>
    </>
  );
}
```

## Best Practices Demonstrated

### 1. Semantic HTML Structure
- Use proper heading hierarchy (h1 → h2 → h3)
- Use semantic layout components (Header, Main, Section, Aside, Footer)
- Choose HTML elements based on meaning, not appearance

### 2. Intent-Driven Interactions
- Button intents match user goals (primary, secondary, destructive)
- Form purposes drive layout and validation patterns
- Card purposes determine styling and behavior

### 3. Context-Aware Components
- Components adapt styling based on their container context
- Alert contexts determine appropriate styling and behavior
- Input types trigger automatic enhancements

### 4. Accessibility by Default
- Proper ARIA landmarks through semantic components
- Screen reader friendly heading structures
- Keyboard navigation support built-in

### 5. Maintainable Code Patterns
- Self-documenting component usage
- Consistent styling through semantic mapping
- Easy global style updates through design tokens

These examples demonstrate how semantic-first design creates more intuitive, accessible, and maintainable user interfaces while reducing the complexity of component APIs.
