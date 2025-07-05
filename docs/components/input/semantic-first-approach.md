# Input Component: Semantic-First Approach

## Overview

The Input component has been enhanced with a semantic-first approach where HTML input types automatically provide appropriate styling, icons, validation patterns, and keyboard behavior. This reduces the need for manual configuration while improving accessibility and user experience.

## Key Benefits

### 🎯 **Automatic Type-Based Enhancements**
- Input types like `email`, `password`, `tel`, etc. automatically provide contextual styling
- Icons, validation patterns, and helper text are applied based on semantic meaning
- Keyboard types and autocomplete behavior are optimized for each input type

### 🏥 **Healthcare-Specific Context**
- Placeholder text and helper messages are tailored for medical contexts
- Emergency contact, patient information, and appointment inputs receive appropriate styling
- Medical measurement inputs get specialized formatting and validation

### ♿ **Enhanced Accessibility**
- ARIA attributes are automatically configured based on input type
- Screen reader announcements are optimized for each input context
- Keyboard navigation is enhanced with appropriate input modes

## Semantic-First Usage

### Basic Examples

```tsx
// Email input with automatic enhancements
<Input type="email" label="Patient Email" />
// Automatically adds: @ icon, email validation, email keyboard, healthcare-specific placeholder

// Password input with security styling  
<Input type="password" label="Password" />
// Automatically adds: 🔒 icon, secure styling, password helper text

// Phone input with formatting
<Input type="tel" label="Emergency Contact" />
// Automatically adds: 📞 icon, phone validation, tel keyboard, emergency context

// Search input with search behavior
<Input type="search" label="Search Patients" />
// Automatically adds: 🔍 icon, search keyboard, clear functionality
```

### Healthcare-Specific Examples

```tsx
// Patient contact information
<Input type="email" label="Patient Contact Email" />
// → "patient@email.com" placeholder, "Patient contact email" helper

// Emergency contact with medical context
<Input type="tel" label="Emergency Contact Number" />
// → "Emergency contact number" helper text, medical context styling

// Medical measurements  
<Input type="number" label="Blood Pressure (Systolic)" min="70" max="200" />
// → "Enter medical value (dosage, measurement, etc.)" helper text

// Appointment scheduling
<Input type="date" label="Next Appointment" />
// → "Appointment or birth date" helper text, calendar icon
<Input type="time" label="Appointment Time" />
// → "Appointment time" helper text, clock icon
```

## Type Enhancement Reference

| Input Type | Auto Icon | Validation Pattern | Helper Text | Keyboard | Healthcare Context |
|------------|-----------|-------------------|-------------|----------|-------------------|
| `text` | - | - | - | Default | Standard text input |
| `email` | 📧 | Email regex | "Enter a valid email address" | Email | "Patient contact email" |
| `password` | 🔒 | - | "Password is case sensitive" | Default | Secure authentication |
| `search` | 🔍 | - | "Enter search terms" | Search | Patient/record lookup |
| `tel` | 📞 | Phone pattern | "Enter phone number with area code" | Tel | "Emergency contact number" |
| `url` | 🔗 | URL regex | "Enter a complete URL including https://" | URL | Medical resource links |
| `number` | 🔢 | - | "Enter a number" | Numeric | "Enter medical value" |
| `date` | 📅 | - | "Select a date" | - | "Appointment or birth date" |
| `time` | 🕐 | - | "Select a time" | - | "Appointment time" |
| `datetime-local` | 📅 | - | "Select date and time" | - | Medical record timestamps |
| `month` | 📅 | - | "Select a month" | - | Insurance periods |
| `week` | 📅 | - | "Select a week" | - | Treatment schedules |
| `file` | 📎 | - | "Choose file to upload" | - | Medical documents |
| `range` | - | - | "Adjust value using slider" | - | Pain scales, ratings |
| `color` | 🎨 | - | "Choose a color" | - | Chart color coding |
| `hidden` | - | - | - | - | Form state management |

## Customization and Overrides

### Disable Semantic Enhancements
```tsx
// Turn off automatic enhancements for full control
<Input 
  type="email" 
  semanticEnhancements={false}
  placeholder="Custom placeholder"
  helperText="Custom helper text"
/>
```

### Override Specific Enhancements
```tsx
// Keep automatic behavior but override specific props
<Input 
  type="email"
  placeholder="Custom email placeholder"    // Overrides automatic placeholder
  helperText="Custom email helper"          // Overrides automatic helper text
  // Icon and validation patterns still automatic
/>
```

### Custom Icons
```tsx
// Use custom icons while keeping other enhancements
<Input type="email" leftIcon={false}>
  <CustomEmailIcon q:slot="leftIcon" />
</Input>
```

## Size and Visual Variants

### Size Variants
```tsx
<Input type="email" size="sm" label="Compact Email" />
<Input type="email" size="md" label="Standard Email" />  {/* Default */}
<Input type="email" size="lg" label="Large Email" />
```

### Visual Variants
```tsx
<Input type="email" variant="default" />   {/* Default border */}
<Input type="email" variant="filled" />    {/* Filled background */}
<Input type="email" variant="outline" />   {/* Bold border */}
```

### State Colors
```tsx
<Input type="email" color="success" helperText="Email verified" />
<Input type="email" color="warning" helperText="Email needs verification" />
<Input type="email" error="Please enter a valid email address" />
<Input type="email" disabled />
```

## Accessibility Features

### Automatic ARIA Attributes
- `aria-invalid` is set automatically based on error states
- `aria-describedby` links to helper text and error messages
- Icons include appropriate `aria-label` attributes
- Input types provide semantic meaning to screen readers

### Keyboard Navigation
- Input modes are set automatically based on type (`email`, `tel`, `numeric`, etc.)
- Tab order is maintained with proper focus management
- Required fields are indicated visually and to screen readers

### Screen Reader Support
- Helper text is announced when input receives focus
- Error states trigger appropriate screen reader announcements
- Icon meanings are conveyed through accessible labels

## Migration Guide

### From Manual to Semantic-First

```tsx
// ❌ Before: Manual configuration
<Input 
  type="email"
  leftIcon={<EmailIcon />}
  pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
  placeholder="user@example.com"
  helperText="Enter a valid email address"
  inputMode="email"
  autoComplete="email"
/>

// ✅ After: Semantic-first (same result!)
<Input type="email" />
```

### Migration Script
```bash
# Automatically migrate Input components
node tools/migration-scripts/input-semantic.js "src/**/*.tsx"
```

## Best Practices

### 1. Choose Semantic Types
```tsx
// ✅ Good: Use semantic types
<Input type="email" />      // for email addresses
<Input type="tel" />        // for phone numbers  
<Input type="search" />     // for search functionality
<Input type="date" />       // for date selection

// ❌ Avoid: Generic types when semantic types exist
<Input type="text" />       // for email addresses
```

### 2. Healthcare Context Labeling
```tsx
// ✅ Good: Healthcare-specific labels
<Input type="tel" label="Emergency Contact Number" />
<Input type="email" label="Patient Contact Email" />
<Input type="date" label="Appointment Date" />
<Input type="number" label="Dosage Amount (mg)" />

// ❌ Generic: Less contextual
<Input type="tel" label="Phone" />
<Input type="email" label="Email" />
```

### 3. Leverage Automatic Validation
```tsx
// ✅ Good: Let semantic types handle validation
<Input type="email" />              // Email validation automatic
<Input type="url" />                // URL validation automatic
<Input type="tel" />                // Phone validation automatic

// ⚠️ Manual: Only when you need custom validation
<Input type="text" pattern="custom-pattern" />
```

### 4. Override When Necessary
```tsx
// ✅ Good: Override for specific use cases
<Input 
  type="email" 
  placeholder="doctor@clinic.com"  // Medical context override
  helperText="Physician email for consultation"
/>

// ✅ Good: Disable when you need full control
<Input 
  type="email" 
  semanticEnhancements={false}
  // Custom implementation
/>
```

## Testing

### Unit Testing
```tsx
import { render, screen } from '@testing-library/react';
import { Input } from './input';

test('email input has automatic enhancements', () => {
  render(<Input type="email" label="Email" />);
  
  const input = screen.getByLabelText('Email');
  expect(input).toHaveAttribute('type', 'email');
  expect(input).toHaveAttribute('inputMode', 'email');
  expect(input).toHaveAttribute('autoComplete', 'email');
  
  // Check for email icon
  expect(screen.getByRole('img', { name: 'email icon' })).toBeInTheDocument();
  
  // Check for automatic helper text
  expect(screen.getByText('Enter a valid email address')).toBeInTheDocument();
});
```

### Integration Testing
```tsx
test('semantic enhancements can be disabled', () => {
  render(
    <Input 
      type="email" 
      semanticEnhancements={false}
      placeholder="Custom placeholder"
      helperText="Custom helper"
    />
  );
  
  expect(screen.getByPlaceholderText('Custom placeholder')).toBeInTheDocument();
  expect(screen.getByText('Custom helper')).toBeInTheDocument();
  expect(screen.queryByRole('img')).not.toBeInTheDocument(); // No automatic icon
});
```

## Examples

See the comprehensive demo at: `demo/src/components/examples/input-semantic-demo.tsx`

This demo showcases:
- All input types with automatic enhancements
- Healthcare-specific contextual examples
- Size and variant combinations
- State examples (success, warning, error, disabled)
- Custom override examples
- Before/after migration comparisons

## Related Documentation

- [Semantic-First Architecture](./semantic-first-architecture.md)
- [Migration Guide](./migration-semantic-first.md)
- [Component Roadmap](./semantic-components-roadmap.md)
- [Accessibility Guidelines](./accessibility-guidelines.md)
