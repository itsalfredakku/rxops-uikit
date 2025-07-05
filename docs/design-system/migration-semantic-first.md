# Migration Guide: Styling-First to Semantic-First

## Overview

This guide helps you migrate from the traditional "styling-first" approach to the new "semantic-first" approach in the RxOpslibrary. The semantic-first approach reduces component complexity while improving accessibility and developer experience.

## Migration Philosophy

### Before: Styling-First
```tsx
// Developer specifies both semantic meaning AND visual styling
<Text as="h1" textStyle="title">Page Title</Text>
<Button variant="outlined" color="error">Delete</Button>
<Card variant="elevated" padding="4">Content</Card>
```

### After: Semantic-First (Intuitive & Healthcare-Friendly)
```tsx
// Semantic meaning drives styling automatically with relatable prop names
<Text as="h1">Page Title</Text>                    // h1 → title styling (natural)
<Button intent="destructive">Delete</Button>        // destructive → error styling (clear purpose)
<Card purpose="article">Content</Card>              // article → elevated styling (readable intent)

// Healthcare-specific examples with familiar terminology
<Button intent="primary">Schedule Appointment</Button>     // Clear main action
<Button intent="urgent">Emergency Contact</Button>         // Medical urgency
<Card purpose="patient">Patient Summary</Card>             // Healthcare context
<Alert context="medical">Drug Interaction Warning</Alert>  // Clinical alert
```

## Component Migration Guides

## Text Component ✅ Available Now

### Migration Steps

#### 1. Remove Redundant `textStyle` Props
```tsx
// ❌ Before (redundant)
<Text as="h1" textStyle="title">Main Heading</Text>
<Text as="h2" textStyle="subtitle">Section Heading</Text>
<Text as="p" textStyle="body">Paragraph text</Text>

// ✅ After (semantic-first)
<Text as="h1">Main Heading</Text>
<Text as="h2">Section Heading</Text>
<Text as="p">Paragraph text</Text>
```

#### 2. Use Size Overrides When Needed
```tsx
// ❌ Before
<Text as="h1" textStyle="subtitle">Smaller Heading</Text>

// ✅ After
<Text as="h1" size="lg">Smaller Heading</Text>
```

#### 3. Handle Edge Cases
```tsx
// ❌ Before
<Text textStyle="title">Title without semantic element</Text>

// ✅ After (choose appropriate semantic element)
<Text as="h2">Title with proper semantics</Text>

// Or if truly needed:
<Text as="div" size="xl" weight="bold">Non-semantic title</Text>
```

### Automatic Migration Script

Run this script to automatically migrate your Text components:

```bash
# Run the Text component migration script
npm run migrate:text-semantic-first

# Or manually with the tool
node tools/migration-scripts/text-semantic-first.js
```

### Breaking Changes
- `textStyle` prop is deprecated (still works but shows warnings)
- Default element mapping may change some visual appearances
- TypeScript types have been updated

---

## Button Component ✅ Available Now

### Migration Steps

#### 1. Replace Variant + Color with Intent
```tsx
// ❌ Before (complex combinations)
<Button variant="filled" color="primary">Save Changes</Button>
<Button variant="outlined" color="error">Delete Item</Button>
<Button variant="text" color="secondary">Cancel</Button>

// ✅ After (semantic-first)
<Button intent="primary">Save Changes</Button>
<Button intent="destructive">Delete Item</Button>
<Button intent="secondary">Cancel</Button>
```

#### 2. Intent Mapping Reference (Healthcare-Enhanced)
| Current Pattern | Semantic-First Intent | Use Case | Healthcare Example |
|----------------|---------------------|----------|-------------------|
| `variant="filled" color="primary"` | `intent="primary"` | Main call-to-action | "Schedule Appointment" |
| `variant="outlined" color="primary"` | `intent="secondary"` | Supporting action | "View Patient History" |
| `variant="filled" color="error"` | `intent="destructive"` | Delete/remove | "Cancel Procedure" |
| `variant="filled" color="success"` | `intent="success"` | Confirm/save | "Approve Treatment" |
| `variant="text"` | `intent="neutral"` | Cancel/close | "Dismiss Alert" |
| `variant="filled" color="warning"` | `intent="urgent"` | Emergency/critical | "Emergency Contact" |

### Automatic Migration Script

Run this script to automatically migrate your Button components:

```bash
# Run the Button component migration script  
npm run migrate:button-intent

# Or manually with the tool
node tools/migration-scripts/button-intent.js
```

### Breaking Changes
- Legacy `variant` and `color` props are deprecated (still work but show warnings)
- New `intent` prop is the preferred semantic approach
- TypeScript types have been updated to support both patterns

### Migration Timeline
- **Phase 2.1**: ✅ **Complete** - Add `intent` prop alongside existing props
- **Phase 2.2**: ✅ **Complete** - Add deprecation warnings for old patterns
- **Phase 2.3**: ✅ **Complete** - Provide migration script  
- **Phase 2.4**: ✅ **Complete** - Update documentation and examples

---

## Card Component 🚧 Coming Soon

### Planned Migration (Phase 3)

#### 1. Replace Variant with Purpose
```tsx
// ❌ Current
<Card variant="elevated" padding="4">Article content</Card>
<Card variant="outlined" padding="2">Navigation menu</Card>

// ✅ Future Semantic-First
<Card purpose="article">Article content</Card>
<Card purpose="navigation">Navigation menu</Card>
```

#### 2. Purpose Mapping Reference (Healthcare Context)
| Current Pattern | Semantic-First Purpose | Automatic Styling | Healthcare Use Case |
|----------------|----------------------|------------------|-------------------|
| `variant="elevated"` + content | `purpose="article"` | Elevated, readable spacing | Medical articles, treatment info |
| `variant="outlined"` + interactive | `purpose="navigation"` | Interactive, hover states | Patient navigation, quick actions |
| Form-related cards | `purpose="form"` | Form-optimized spacing | Patient intake, medical forms |
| Metric displays | `purpose="dashboard"` | Data-focused styling | Health metrics, vital signs |
| Patient info cards | `purpose="patient"` | HIPAA-compliant styling | Patient summary cards |
| Schedule items | `purpose="appointment"` | Time-focused layout | Appointment scheduling |

---

## Form Components 🚧 Coming Later

### Planned Migration (Phase 4)

#### 1. Form Purpose-Based Structure
```tsx
// ❌ Current
<Form layout="vertical" spacing="normal">
  <Input type="email" />
  <Input type="password" />
  <Button type="submit">Login</Button>
</Form>

// ✅ Future Semantic-First (Healthcare-Optimized)
<Form purpose="login">
  <Input type="email" />     {/* Auto email validation & styling */}
  <Input type="password" />  {/* Auto security indicators */}
  <Button intent="primary">Login</Button>
</Form>

{/* Healthcare-specific form examples */}
<Form purpose="patient-intake">
  <Input type="text" label="Patient Name" />
  <Input type="date" label="Date of Birth" />
  <Input type="tel" label="Emergency Contact" />
  <Button intent="primary">Submit Intake</Button>
</Form>

<Form purpose="prescription">
  <Input type="text" label="Medication Name" />
  <Input type="number" label="Dosage (mg)" />
  <Button intent="primary">Submit Prescription</Button>
  <Button intent="destructive">Cancel Order</Button>
</Form>
```

---

## Input Component ✅ Available Now

### Migration Overview

The Input component now uses semantic-first type-based enhancements where HTML input types automatically provide appropriate styling, icons, validation, and behavior.

### Migration Steps

#### 1. Remove Redundant Type-Based Props
```tsx
// ❌ Before (manual configuration)
<Input 
  type="email"
  leftIcon={<EmailIcon />}
  pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
  placeholder="user@example.com"
  helperText="Enter a valid email address"
  inputMode="email"
  autoComplete="email"
/>

// ✅ After (semantic-first)
<Input type="email" />
```

#### 2. Type-Based Enhancement Reference
| Input Type | Auto Icon | Auto Validation | Auto Helper Text | Auto Keyboard |
|------------|-----------|-----------------|------------------|---------------|
| `email` | 📧 | Email pattern | "Enter a valid email address" | Email keyboard |
| `password` | 🔒 | - | "Password is case sensitive" | - |
| `search` | 🔍 | - | "Enter search terms" | Search keyboard |
| `tel` | 📞 | Phone pattern | "Enter phone number with area code" | Tel keyboard |
| `url` | 🔗 | URL pattern | "Enter a complete URL including https://" | URL keyboard |
| `number` | 🔢 | - | "Enter a number" | Numeric keyboard |
| `date` | 📅 | - | "Select a date" | - |
| `time` | 🕐 | - | "Select a time" | - |
| `file` | 📎 | - | "Choose file to upload" | - |
| `color` | 🎨 | - | "Choose a color" | - |

#### 3. Healthcare-Specific Enhancements
```tsx
// Healthcare context automatically applied based on type
<Input type="email" label="Patient Contact Email" />     // → "patient@email.com" placeholder
<Input type="tel" label="Emergency Contact" />           // → "Emergency contact number" helper
<Input type="date" label="Appointment Date" />           // → "Appointment or birth date" helper
<Input type="number" label="Blood Pressure" />           // → "Enter medical value" helper
```

#### 4. Custom Overrides Still Work
```tsx
// Override automatic enhancements when needed
<Input 
  type="email" 
  placeholder="Custom placeholder"     // Overrides default
  helperText="Custom helper text"      // Overrides default
  semanticEnhancements={false}         // Disables all auto enhancements
/>
```

### Automatic Migration Script

Run this script to automatically migrate your Input components:

```bash
# Run the Input component migration script  
npm run migrate:input-semantic

# Or manually with the tool
node tools/migration-scripts/input-semantic.js "src/**/*.tsx"
```

### Breaking Changes
- None - all existing Input props continue to work
- New automatic enhancements are additive and can be overridden
- Set `semanticEnhancements={false}` to disable automatic behavior

### Migration Timeline
- **Phase 2.5**: ✅ **Complete** - Add type-based semantic enhancements
- **Phase 2.6**: ✅ **Complete** - Healthcare-specific contextual improvements
- **Phase 2.7**: ✅ **Complete** - Provide migration script
- **Phase 2.8**: ✅ **Complete** - Update documentation and examples

---

## TextArea Component ✅ Available Now

### Migration Overview

The TextArea component uses a semantic-first purpose-based approach where the `purpose` prop automatically provides appropriate styling, placeholder text, validation, and healthcare-specific enhancements for clinical documentation.

### Migration Steps

#### 1. Replace Raw Textarea Elements
```tsx
// ❌ Before (raw HTML textarea)
<textarea
  value={clinicalNotes.value}
  onInput$={(e) => clinicalNotes.value = e.target.value}
  rows={4}
  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
  placeholder="Enter clinical observations..."
/>

// ✅ After (semantic-first)
<Textarea purpose="notes" label="Clinical Notes" />
```

#### 2. Purpose-Based Enhancement Reference
| Purpose | Auto Placeholder | Auto Helper Text | Rows | Max Length | Healthcare Context |
|---------|------------------|------------------|------|------------|-------------------|
| `notes` | "Enter clinical notes and observations..." | "Record clinical observations, findings, and notes" | 4 | 2000 | Clinical documentation |
| `symptoms` | "Describe symptoms and presentation..." | "Detail patient symptoms, onset, and characteristics" | 4 | 2000 | Patient symptom docs |
| `history` | "Document medical history..." | "Record patient's medical background and history" | 5 | 3000 | Medical history |
| `treatment` | "Outline treatment plan..." | "Describe treatment approach and care plan" | 5 | 3000 | Treatment planning |
| `medication` | "List medications and dosages..." | "Document medications, dosages, and administration notes" | 4 | 2000 | Medication instructions |
| `consultation` | "Document consultation notes..." | "Record consultation findings and recommendations" | 6 | 4000 | Consultation records |
| `emergency` | "Enter emergency details..." | "Document emergency situation and actions taken" | 4 | 2000 | Emergency communications |
| `diagnosis` | "Enter diagnosis and assessment..." | "Document diagnosis, differential, and clinical assessment" | 4 | 2500 | Clinical assessment |
| `discharge` | "Enter discharge instructions..." | "Provide discharge summary and follow-up instructions" | 5 | 3000 | Discharge planning |

#### 3. Healthcare-Specific Enhancements
```tsx
// Healthcare context automatically applied based on purpose
<Textarea purpose="notes" label="Clinical Observations" />       // → Clinical documentation setup
<Textarea purpose="symptoms" label="Patient Symptoms" />         // → Symptom documentation format
<Textarea purpose="medication" label="Prescription Notes" />     // → Medication instruction formatting
<Textarea purpose="emergency" label="Emergency Details" />       // → Emergency communication styling
```

#### 4. Custom Overrides Still Work
```tsx
// Override automatic enhancements when needed
<Textarea 
  purpose="notes" 
  placeholder="Custom placeholder"     // Overrides default
  helperText="Custom helper text"      // Overrides default
  rows={6}                            // Overrides default
  maxLength={5000}                    // Overrides default
/>
```

### Automatic Migration Script

Run this script to automatically migrate raw textarea elements:

```bash
# Run the TextArea component migration script  
npm run migrate:textarea

# Or manually with the tool
node tools/migration-scripts/textarea-migration.js "src/healthcare/**/*.tsx"
```

### Breaking Changes
- None - all existing textarea functionality continues to work
- New automatic enhancements are additive and can be overridden
- Raw HTML textareas should be replaced with Textarea components for consistency

### Critical Migration Priority
**High Priority Files** (using raw `<textarea>` elements):
- `src/healthcare/billing/billing-card/billing-card.tsx`
- `src/healthcare/medical/medication-tracker/medication-tracker.tsx`
- `src/healthcare/emergency/emergency-alert/emergency-alert.tsx`
- `src/healthcare/patient/vitals-signs/vitals-signs.tsx`
- `src/healthcare/provider/consultation-notes/consultation-notes.tsx`

### Migration Timeline
- **Phase 2.9**: ✅ **Complete** - Add purpose-based semantic enhancements
- **Phase 2.10**: ✅ **Complete** - Healthcare-specific contextual improvements
- **Phase 2.11**: ✅ **Complete** - Create migration script
- **Phase 2.12**: 🚧 **In Progress** - Migrate raw textarea elements in healthcare components
- **Phase 2.13**: ⏳ **Planned** - Update documentation and examples

---

## General Migration Strategies

### Strategy 1: Gradual Migration
1. **Start with New Code**: Use semantic-first patterns in all new components
2. **Migrate High-Traffic Areas**: Update frequently-used components first
3. **Team Training**: Ensure team understands semantic-first principles
4. **Update Style Guides**: Reflect new patterns in documentation

### Strategy 2: Automated Migration
1. **Use Migration Scripts**: Run provided automated migration tools
2. **Batch Updates**: Migrate entire directories at once
3. **Test Thoroughly**: Ensure visual consistency after migration
4. **Code Review**: Review automated changes for correctness

### Strategy 3: Hybrid Approach
1. **New Features First**: All new features use semantic-first patterns
2. **Bug Fix Opportunities**: Migrate during bug fixes and maintenance
3. **Refactoring Sessions**: Dedicated migration sessions for large changes
4. **Deprecation Timeline**: Set clear timeline for removing old patterns

## Testing Your Migration

### Visual Regression Testing
```bash
# Run visual regression tests after migration
npm run test:visual

# Update snapshots if changes are expected
npm run test:visual -- --updateSnapshot
```

### Accessibility Testing
```bash
# Run accessibility tests
npm run test:a11y

# Test with screen readers
npm run test:screen-reader
```

### Performance Testing
```bash
# Ensure performance is maintained
npm run test:performance

# Bundle size analysis
npm run analyze:bundle
```

## Common Migration Issues

### Issue 1: Visual Changes After Migration
**Problem**: Component looks different after semantic migration

**Solution**: 
```tsx
// If automatic styling doesn't match expectations
<Text as="h1" size="xl" weight="medium">Custom styled heading</Text>

// Or use className for specific overrides
<Text as="h1" className="custom-heading-style">Special case</Text>
```

### Issue 2: TypeScript Errors
**Problem**: TypeScript errors after updating component props

**Solution**:
```bash
# Update TypeScript types
npm run build:types

# Check for type errors
npm run type-check
```

### Issue 3: Deprecated Prop Warnings
**Problem**: Console warnings about deprecated props

**Solution**: Follow the migration guide for each component or use the migration scripts provided.

## Migration Checklist

### Before Migration
- [ ] Review current component usage patterns
- [ ] Run existing tests to establish baseline
- [ ] Take screenshots for visual regression testing
- [ ] Backup current codebase
- [ ] Update development dependencies

### During Migration
- [ ] Follow component-specific migration guides
- [ ] Use provided migration scripts where available
- [ ] Update tests to match new component APIs
- [ ] Address TypeScript errors
- [ ] Update documentation and examples

### After Migration
- [ ] Run full test suite
- [ ] Perform visual regression testing
- [ ] Test accessibility improvements
- [ ] Verify performance metrics
- [ ] Update team documentation
- [ ] Deploy to staging for review

## Getting Help

### Resources
- [Semantic-First Architecture](./semantic-first-architecture.md)
- [Component Roadmap](./semantic-components-roadmap.md)
- [API Documentation](../components/)

### Support Channels
- **Slack**: #design-system-help
- **GitHub Issues**: [UI Library Issues](https://github.com/rxops/ui/issues)
- **Office Hours**: Tuesdays 2-3 PM EST

### Migration Scripts Location
```
tools/migration-scripts/
├── text-semantic-first.js     ✅ Available
├── button-intent.js           ✅ Available  
├── card-purpose.js            🚧 Coming Soon
└── form-semantic.js           🚧 Coming Later
```

## Version Compatibility

| Library Version | Migration Support | Deprecated Features | Breaking Changes |
|----------------|------------------|-------------------|------------------|
| v2.x | Full backward compatibility | Warnings only | None |
| v3.x | Migration scripts available | Some prop removal | Minor |
| v4.x | Semantic-first default | Legacy prop removal | Major |

**Recommendation**: Plan migration during v2.x → v3.x upgrade cycle for smoothest transition.
