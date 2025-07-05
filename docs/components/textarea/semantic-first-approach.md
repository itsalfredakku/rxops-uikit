# Textarea Component: Semantic-First with Purpose-Based Enhancement

## Overview

The Textarea component has been enhanced with a semantic-first approach where the `purpose` prop automatically provides appropriate styling, character limits, helper text, and formatting optimized for healthcare documentation workflows.

## Key Benefits

### 🎯 **Purpose-Driven Configuration**
- Purpose props like `notes`, `symptoms`, `treatment`, etc. automatically configure the textarea
- Healthcare-specific character limits, row counts, and helper text
- Specialized formatting for different medical documentation types

### 🏥 **Healthcare-Optimized Defaults**
- Medical documentation patterns built into each purpose
- Appropriate character limits based on clinical documentation standards
- Healthcare-specific placeholder text and guidance

### ♿ **Enhanced Accessibility**
- Automatic ARIA attributes based on purpose
- Character counting with accessibility announcements
- Proper labeling and helper text association

## Semantic-First Usage

### Basic Examples

```tsx
// Clinical notes with automatic healthcare optimization
<Textarea purpose="notes" label="Clinical Observations" />
// Automatically adds: 4 rows, 2000 char limit, clinical placeholder

// Patient symptoms documentation
<Textarea purpose="symptoms" label="Current Symptoms" />
// Automatically adds: 4 rows, 2000 char limit, symptoms placeholder

// Treatment planning
<Textarea purpose="treatment" label="Treatment Plan" />
// Automatically adds: 5 rows, 3000 char limit, treatment placeholder

// Emergency documentation with special styling
<Textarea purpose="emergency" label="Emergency Details" />
// Automatically adds: 4 rows, 2000 char limit, orange border styling
```

### Healthcare-Specific Examples

```tsx
// Patient intake and history
<Textarea purpose="history" label="Medical History" />
// → 5 rows, 3000 chars, "Document patient's medical background..."

// Clinical assessment
<Textarea purpose="diagnosis" label="Clinical Assessment" />
// → 4 rows, 2500 chars, "Document diagnosis, differential..."

// Medication documentation
<Textarea purpose="medication" label="Medication Instructions" />
// → 4 rows, 2000 chars, monospace font, "List medications and dosages..."

// Consultation notes
<Textarea purpose="consultation" label="Consultation Summary" />
// → 6 rows, 4000 chars, "Document consultation findings..."

// Discharge planning
<Textarea purpose="discharge" label="Discharge Instructions" />
// → 6 rows, 4000 chars, "Provide discharge summary..."
```

## Purpose Enhancement Reference

| Purpose | Rows | Max Chars | Placeholder | Special Styling | Healthcare Context |
|---------|------|-----------|-------------|-----------------|-------------------|
| `notes` | 4 | 2000 | "Enter clinical notes..." | Leading relaxed | General clinical documentation |
| `symptoms` | 4 | 2000 | "Describe symptoms..." | Leading relaxed | Patient symptom documentation |
| `history` | 5 | 3000 | "Document medical history..." | Leading relaxed | Patient medical background |
| `diagnosis` | 4 | 2500 | "Enter diagnosis..." | Leading relaxed | Clinical assessment |
| `treatment` | 5 | 3000 | "Outline treatment plan..." | Leading relaxed | Care planning |
| `medication` | 4 | 2000 | "List medications..." | Monospace font | Prescription documentation |
| `instructions` | 4 | 2500 | "Enter detailed instructions..." | Leading relaxed | Patient instructions |
| `consultation` | 6 | 4000 | "Document consultation..." | Leading relaxed | Specialist consultation |
| `discharge` | 6 | 4000 | "Enter discharge instructions..." | Leading relaxed | Discharge planning |
| `emergency` | 4 | 2000 | "Document emergency details..." | Orange border | Emergency documentation |
| `reason` | 3 | 1000 | "Explain the reason..." | Leading normal | Justification/explanation |
| `comments` | 3 | 1000 | "Add your comments..." | Leading normal | General feedback |
| `description` | 3 | 1500 | "Provide detailed description..." | Leading relaxed | Descriptive text |
| `general` | 3 | 1000 | "Enter text..." | Leading normal | Default fallback |

## Customization and Overrides

### Disable Semantic Enhancements
```tsx
// Turn off automatic enhancements for full control
<Textarea 
  purpose="notes" 
  semanticEnhancements={false}
  placeholder="Custom placeholder"
  helperText="Custom helper text"
  rows={2}
  maxLength={500}
/>
```

### Override Specific Properties
```tsx
// Keep automatic behavior but override specific props
<Textarea 
  purpose="notes"
  placeholder="Custom clinical notes placeholder"    // Overrides automatic
  rows={6}                                          // Overrides automatic (4)
  maxLength={3000}                                  // Overrides automatic (2000)
  // Other purpose-based enhancements still apply
/>
```

### Custom Styling
```tsx
// Custom CSS classes combined with purpose
<Textarea 
  purpose="medication"
  className="custom-medication-styling"
  // Automatic monospace font still applies, plus custom styles
/>
```

## Size and Visual Variants

### Size Variants
```tsx
<Textarea purpose="notes" size="sm" label="Compact Notes" />
<Textarea purpose="notes" size="md" label="Standard Notes" />  {/* Default */}
<Textarea purpose="notes" size="lg" label="Large Notes" />
```

### Visual Variants
```tsx
<Textarea purpose="notes" variant="default" />   {/* Default border */}
<Textarea purpose="notes" variant="filled" />    {/* Filled background */}
<Textarea purpose="notes" variant="outline" />   {/* Bold border */}
```

### Resize Behavior
```tsx
<Textarea purpose="notes" resize="vertical" />    {/* Default - vertical only */}
<Textarea purpose="notes" resize="none" />        {/* Fixed size */}
<Textarea purpose="notes" resize="both" />        {/* Both directions */}
<Textarea purpose="notes" autoResize={true} />    {/* Auto height adjustment */}
```

## States and Validation

### Required Fields
```tsx
<Textarea 
  purpose="notes" 
  label="Required Clinical Notes"
  required
/>
```

### Error Handling
```tsx
<Textarea 
  purpose="notes" 
  label="Clinical Notes"
  error="Please provide clinical observations"
/>
```

### Character Counting
```tsx
<Textarea 
  purpose="comments" 
  label="Comments"
  maxLength={500}  // Overrides automatic limit
/>
```

## Migration Guide

### From Raw HTML textarea to Semantic-First

```tsx
// ❌ Before: Raw HTML textarea
<textarea
  rows={4}
  maxLength={2000}
  placeholder="Enter clinical notes and observations..."
  className="w-full p-2 border border-gray-300 rounded-md leading-relaxed"
  value={notes}
  onChange={(e) => setNotes(e.target.value)}
/>

// ✅ After: Semantic-first (same result!)
<Textarea 
  purpose="notes" 
  value={notes}
  onChange$={(value) => setNotes(value)}
/>
```

### Migration Script
```bash
# Automatically migrate textarea elements
node tools/migration-scripts/textarea-semantic.js "src/**/*.tsx"
```

The script will:
- Detect textarea elements in JSX/TSX files
- Analyze context to suggest appropriate purpose
- Convert HTML attributes to component props
- Add necessary imports

## Best Practices

### 1. Choose Appropriate Purpose
```tsx
// ✅ Good: Use specific purposes for medical contexts
<Textarea purpose="symptoms" />     // for symptom documentation
<Textarea purpose="diagnosis" />    // for clinical assessment
<Textarea purpose="treatment" />    // for treatment planning
<Textarea purpose="emergency" />    // for emergency situations

// ❌ Avoid: Generic purpose when specific ones exist
<Textarea purpose="general" />      // for medical documentation
```

### 2. Healthcare-Specific Labeling
```tsx
// ✅ Good: Medical context labels
<Textarea purpose="notes" label="Clinical Findings" />
<Textarea purpose="symptoms" label="Chief Complaint" />
<Textarea purpose="history" label="Past Medical History" />
<Textarea purpose="medication" label="Current Medications" />

// ❌ Generic: Less contextual
<Textarea purpose="notes" label="Notes" />
<Textarea purpose="symptoms" label="Text" />
```

### 3. Leverage Purpose-Based Limits
```tsx
// ✅ Good: Let purpose determine appropriate limits
<Textarea purpose="comments" />        // 1000 chars - appropriate for comments
<Textarea purpose="consultation" />    // 4000 chars - appropriate for consultation
<Textarea purpose="history" />         // 3000 chars - appropriate for history

// ⚠️ Manual: Only when you need different limits
<Textarea purpose="notes" maxLength={5000} />  // Override when needed
```

### 4. Consider Auto-Resize for Dynamic Content
```tsx
// ✅ Good: Auto-resize for forms where content length varies
<Textarea 
  purpose="symptoms" 
  autoResize={true}
  label="Describe symptoms in detail..."
/>

// ✅ Good: Fixed size for structured documentation
<Textarea 
  purpose="medication" 
  label="Medication List"
  // Fixed rows work well for structured data
/>
```

## Accessibility Features

### Automatic ARIA Support
- `aria-invalid` set based on error state
- `aria-describedby` links to helper text and character counter
- Proper labeling with required field indicators
- Error states trigger screen reader announcements

### Character Counter Accessibility
- Character count is announced to screen readers
- Color changes and warnings for approaching limits
- Proper association with textarea element

### Keyboard Navigation
- Standard textarea keyboard behavior
- Tab order maintained
- Auto-resize doesn't interfere with keyboard navigation

## Testing

### Unit Testing
```tsx
import { render, screen } from '@testing-library/react';
import { Textarea } from './textarea';

test('notes purpose has appropriate defaults', () => {
  render(<Textarea purpose="notes" label="Clinical Notes" />);
  
  const textarea = screen.getByLabelText('Clinical Notes');
  expect(textarea).toHaveAttribute('rows', '4');
  expect(textarea).toHaveAttribute('maxLength', '2000');
  expect(textarea).toHaveAttribute('placeholder', expect.stringContaining('clinical notes'));
  
  // Check for helper text
  expect(screen.getByText(/clinical observations/i)).toBeInTheDocument();
});
```

### Integration Testing
```tsx
test('semantic enhancements can be disabled', () => {
  render(
    <Textarea 
      purpose="notes"
      semanticEnhancements={false}
      placeholder="Custom placeholder"
      helperText="Custom helper"
      rows={2}
      maxLength={100}
    />
  );
  
  const textarea = screen.getByRole('textbox');
  expect(textarea).toHaveAttribute('rows', '2');
  expect(textarea).toHaveAttribute('maxLength', '100');
  expect(textarea).toHaveAttribute('placeholder', 'Custom placeholder');
  
  expect(screen.getByText('Custom helper')).toBeInTheDocument();
  expect(screen.queryByText(/clinical observations/i)).not.toBeInTheDocument();
});
```

## Healthcare Workflow Integration

### Patient Intake Forms
```tsx
<div class="patient-intake-form">
  <Textarea purpose="symptoms" label="Chief Complaint" required />
  <Textarea purpose="history" label="Medical History" />
  <Textarea purpose="medication" label="Current Medications" />
</div>
```

### Clinical Documentation
```tsx
<div class="clinical-documentation">
  <Textarea purpose="notes" label="Clinical Findings" />
  <Textarea purpose="diagnosis" label="Assessment" />
  <Textarea purpose="treatment" label="Treatment Plan" />
</div>
```

### Emergency Documentation
```tsx
<div class="emergency-form">
  <Textarea purpose="emergency" label="Emergency Details" required />
  <Textarea purpose="symptoms" label="Presenting Symptoms" />
  <Textarea purpose="treatment" label="Immediate Treatment" />
</div>
```

## Examples

See the comprehensive demo at: `demo/src/components/examples/textarea-semantic-demo.tsx`

This demo showcases:
- All purpose types with automatic enhancements
- Healthcare-specific workflow examples
- Size and variant combinations
- State examples (required, error, disabled)
- Custom override examples
- Before/after migration comparisons

## Related Documentation

- [Semantic-First Architecture](./semantic-first-architecture.md)
- [Migration Guide](./migration-semantic-first.md)
- [Component Roadmap](./semantic-components-roadmap.md)
- [Form Component Integration](./form-integration.md)
