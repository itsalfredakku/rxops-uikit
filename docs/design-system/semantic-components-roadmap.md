# Semantic Components Roadmap

## Overview

This roadmap outlines the planned evolution of RxOpscomponents toward semantic-first design principles. Each component will be enhanced to automatically infer styling from semantic meaning and purpose.

## Phase 1: Foundation Components

### Text Component ✅ Complete
**Status**: Implemented
**Semantic Pattern**: HTML element drives typography styling

```tsx
// Before
<Text as="h1" textStyle="title">Title</Text>

// After  
<Text as="h1">Title</Text>
```

**Benefits Achieved**:
- 40% reduction in component props
- Improved accessibility scores
- Better developer experience

---

## Phase 2: Interactive Components

### Button Component ✅ Complete
**Status**: Implemented (July 3, 2025)
**Semantic Pattern**: Intent-based styling with relatable prop names

```tsx
// Current
<Button variant="outlined" color="error">Delete</Button>
<Button variant="filled" color="primary">Save</Button>

// Planned Semantic-First
<Button intent="destructive">Delete</Button>
<Button intent="primary">Save</Button>
<Button intent="secondary">Cancel</Button>
```

**Intent Mapping** (Intuitive & Medical-Context Friendly):
| Intent | Visual Style | Use Case | HTML Semantics | Alternative Names |
|--------|-------------|----------|----------------|-------------------|
| `primary` | Prominent filled button | Main call-to-action | `type="submit"` default | `main`, `action`, `submit` |
| `secondary` | Outlined or text button | Supporting actions | `type="button"` default | `support`, `outline`, `helper` |
| `destructive` | Error-colored, prominent | Delete, remove actions | Confirmation patterns | `danger`, `delete`, `remove` |
| `success` | Success-colored | Confirm, save actions | Form submissions | `confirm`, `save`, `approve` |
| `neutral` | Subtle styling | Cancel, close actions | Safe actions | `cancel`, `subtle`, `dismiss` |
| `urgent` | High-contrast alert styling | Emergency, critical actions | ARIA alerts | `emergency`, `critical`, `immediate` |

**Implementation Plan**:
- [x] Add intent prop to ButtonProps
- [x] Create intent-to-style mapping  
- [x] Add deprecation warnings for old patterns
- [x] Update documentation
- [x] Create migration script
- [x] Create comprehensive demo examples

**Estimated Timeline**: ✅ **Completed in 2 weeks**

---

### Input Component ✅ **Completed**
**Semantic Pattern**: Input type drives styling and behavior

```tsx
// Before
<Input 
  type="email"
  leftIcon={<EmailIcon />}
  pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
  placeholder="user@example.com"
  helperText="Enter a valid email address"
  inputMode="email"
  autoComplete="email"
/>

// After: Semantic-First
<Input type="email" />     // All enhancements applied automatically!
<Input type="password" />  // Auto security styling + lock icon
<Input type="search" />    // Auto search behavior + search icon
<Input type="tel" />       // Auto phone formatting + phone icon
```

**Type-Based Enhancements** (Medical industry-focused):
| Input Type | Automatic Behavior | Visual Enhancements | Healthcare Context |
|------------|-------------------|-------------------|-------------------|
| `email` | Email validation pattern | @ icon, email keyboard | Patient contact info |
| `password` | Security styling | 🔒 icon, monospace font | Secure login systems |
| `search` | Search behavior | 🔍 icon, search keyboard | Patient/record lookup |
| `tel` | Phone formatting | 📞 icon, tel keyboard | Emergency contacts |
| `url` | URL validation | 🔗 icon, URL keyboard | Medical resource links |
| `number` | Number controls | 🔢 icon, numeric keyboard | Dosage, measurements |
| `date` | Date picker integration | 📅 icon, date picker | Appointment scheduling |
| `time` | Time picker | 🕐 icon, time picker | Appointment times |
| `file` | File upload styling | 📎 icon, upload hints | Medical documents |
| `color` | Color picker | 🎨 icon, color selection | Chart color coding |

**Implementation Status**:
- [x] Create type-based styling system
- [x] Add automatic validation patterns  
- [x] Implement type-specific icons and controls
- [x] Add healthcare-specific contextual enhancements
- [x] Create comprehensive demo examples
- [x] Create migration script
- [x] Update documentation

**Estimated Timeline**: ✅ **Completed in 3 weeks**

**Estimated Timeline**: 3 weeks

---

## Phase 3: Layout Components

### Card Component 🔄 Medium Priority
**Semantic Pattern**: Purpose drives layout and styling with intuitive prop names

```tsx
// Current
<Card variant="elevated" padding="4">

// Planned Semantic-First
<Card purpose="article">Article content</Card>
<Card purpose="navigation">Nav items</Card>
<Card purpose="form">Form fields</Card>
<Card purpose="dashboard">Metrics</Card>
```

**Purpose Mapping** (Healthcare & General Context):
| Purpose | Layout Style | Use Case | Default Behavior | Alternative Names | Healthcare Use |
|---------|-------------|----------|------------------|-------------------|----------------|
| `article` | Elevated, readable spacing | Blog posts, content | Typography-optimized | `content`, `post` | Medical articles, treatment info |
| `navigation` | Interactive, hover states | Menu cards, links | Focus management | `menu`, `nav` | Patient navigation, quick links |
| `form` | Clean, form-optimized | Form sections | Proper spacing | `input`, `field` | Patient forms, medical records |
| `dashboard` | Metric-focused | Analytics, stats | Data visualization | `metric`, `stat` | Health metrics, vital signs |
| `media` | Image-optimized | Photo cards, videos | Media aspect ratios | `image`, `photo` | Medical imagery, patient photos |
| `patient` | Info-dense, accessible | Patient summary | HIPAA-compliant | `profile`, `summary` | Patient overview cards |
| `appointment` | Time-focused | Schedule items | Date/time prominence | `schedule`, `event` | Medical appointments |
| `alert` | Attention-grabbing | Notifications | Proper ARIA roles | `notification`, `message` | Medical alerts, reminders |

**Implementation Plan**:
- [ ] Add purpose prop to CardProps
- [ ] Create purpose-to-style mapping
- [ ] Add purpose-specific sub-components
- [ ] Update layout patterns
- [ ] Create design tokens

**Estimated Timeline**: 2 weeks

---

### Semantic Layout Components 🔄 Medium Priority
**Semantic Pattern**: HTML5 semantic elements with proper styling

```tsx
// New Semantic Components
<Section>Main content section</Section>           // <section>
<Article>Blog post content</Article>              // <article>  
<Aside>Sidebar content</Aside>                    // <aside>
<Navigation>Menu items</Navigation>               // <nav>
<Header>Page header</Header>                      // <header>
<Footer>Page footer</Footer>                      // <footer>
<Main>Main page content</Main>                    // <main>
```

**Semantic Benefits**:
- Automatic proper HTML structure
- Built-in accessibility landmarks
- SEO-optimized markup
- Screen reader navigation

**Implementation Plan**:
- [ ] Create semantic layout UIKit
- [ ] Add proper ARIA landmarks
- [ ] Create responsive layout patterns
- [ ] Integrate with design tokens
- [ ] Add skip links and navigation

**Estimated Timeline**: 3 weeks

---

## Phase 4: Form Components

### Form Component 🔄 Lower Priority
**Semantic Pattern**: Form purpose drives structure and validation

```tsx
// Current
<Form layout="vertical">

// Planned Semantic-First
<Form purpose="registration">      // Registration form patterns
<Form purpose="login">            // Login form patterns  
<Form purpose="search">           // Search form patterns
<Form purpose="settings">         // Settings form patterns
```

**Purpose-Based Features** (Healthcare-Enhanced):
| Purpose | Auto Structure | Validation | Accessibility | Healthcare Context |
|---------|---------------|------------|---------------|-------------------|
| `registration` | Multi-step fieldsets | Strong validation | Progress indicators | Patient registration |
| `login` | Simple 2-field layout | Basic validation | Focus management | Staff/patient login |
| `search` | Inline search pattern | Search validation | Live results | Patient/record search |
| `settings` | Grouped sections | Setting validation | Save states | User preferences |
| `medical` | Clinical data structure | Medical validation | HIPAA compliance | Patient forms |
| `appointment` | Date/time focused | Schedule validation | Calendar integration | Booking forms |
| `intake` | Comprehensive structure | Medical validation | Step-by-step guidance | Patient intake |
| `prescription` | Drug-specific fields | Dosage validation | Safety warnings | Medication forms |

**Implementation Plan**:
- [ ] Add purpose prop to Form
- [ ] Create automatic fieldset/legend structure
- [ ] Add purpose-specific validation
- [ ] Implement accessibility patterns
- [ ] Create form templates

**Estimated Timeline**: 4 weeks

---

## Phase 5: Feedback Components

### Alert/Notification Component 🔄 Lower Priority
**Semantic Pattern**: Context drives styling and behavior

```tsx
// Current
<Alert variant="filled" color="error">

// Planned Semantic-First
<Alert context="validation">Form validation error</Alert>
<Alert context="system">System notification</Alert>
<Alert context="success">Action completed</Alert>
<Alert context="info">Helpful information</Alert>
```

**Context Mapping** (Healthcare-Aware):
| Context | Visual Style | Behavior | Accessibility | Healthcare Use |
|---------|-------------|----------|---------------|----------------|
| `validation` | Inline, form-focused | Field-specific | Error announcements | Form field errors |
| `system` | Prominent, persistent | Auto-dismiss options | System announcements | System status updates |
| `success` | Positive, temporary | Auto-dismiss | Success announcements | Successful operations |
| `info` | Neutral, contextual | User-dismissed | Info announcements | General information |
| `medical` | Clinical, urgent | Persistent | Medical alerts | Drug interactions, allergies |
| `appointment` | Time-sensitive | Action-oriented | Calendar alerts | Appointment reminders |
| `critical` | High-contrast, urgent | Requires action | Emergency alerts | Critical patient alerts |
| `privacy` | HIPAA-focused | Privacy-aware | Compliance alerts | Data privacy notices |

**Implementation Plan**:
- [ ] Add context prop to Alert
- [ ] Create context-based styling
- [ ] Add automatic ARIA announcements
- [ ] Implement dismiss behaviors
- [ ] Create context templates

**Estimated Timeline**: 2 weeks

---

### TextArea Component ✅ **Completed** 
**Semantic Pattern**: Purpose-driven textarea with healthcare-specific enhancements

```tsx
// Before: Raw HTML textarea
<textarea
  value={notes.value}
  onInput$={(e) => notes.value = e.target.value}
  rows={4}
  placeholder="Enter clinical notes..."
  class="w-full px-3 py-2 border border-gray-300 rounded-lg..."
/>

// After: Semantic-First TextArea
<Textarea purpose="notes" label="Clinical Notes" />  // All enhancements automatic!
<Textarea purpose="symptoms" />                       // Symptom documentation setup
<Textarea purpose="medication" />                     // Medication instruction formatting
<Textarea purpose="emergency" />                      // Emergency communication styling
```

**Purpose-Based Enhancements** (Medical industry-focused):
| Purpose | Automatic Behavior | Healthcare Context | Default Rows | Max Length |
|---------|-------------------|-------------------|--------------|------------|
| `notes` | Clinical documentation | "Enter clinical notes and observations..." | 4 | 2000 |
| `symptoms` | Patient symptom docs | "Describe symptoms and presentation..." | 4 | 2000 |
| `history` | Medical history | "Document medical history..." | 5 | 3000 |
| `treatment` | Treatment planning | "Outline treatment plan..." | 5 | 3000 |
| `medication` | Medication instructions | "List medications and dosages..." | 4 | 2000 |
| `consultation` | Consultation notes | "Document consultation notes..." | 6 | 4000 |
| `emergency` | Emergency communications | "Enter emergency details..." | 4 | 2000 |
| `diagnosis` | Clinical assessment | "Enter diagnosis and assessment..." | 4 | 2500 |
| `discharge` | Discharge instructions | "Enter discharge instructions..." | 5 | 3000 |
| `instructions` | General instructions | "Enter detailed instructions..." | 4 | 2500 |
| `comments` | General comments | "Add your comments..." | 3 | 1000 |
| `description` | Detailed descriptions | "Provide a detailed description..." | 3 | 1500 |
| `reason` | Explanations | "Explain the reason..." | 3 | 1000 |

**Implementation Status**:
- [x] Create purpose-based styling system
- [x] Add automatic healthcare-specific enhancements
- [x] Implement auto-resize functionality
- [x] Add character counting and validation
- [x] Create comprehensive demo examples
- [x] Create migration script for raw textarea elements
- [x] Update documentation

**Migration Priority**: 🔥 **Critical** - Multiple healthcare components using raw `<textarea>` elements
- `src/healthcare/billing/billing-card/billing-card.tsx` - Dispute reason
- `src/healthcare/medical/medication-tracker/medication-tracker.tsx` - Medication instructions  
- `src/healthcare/emergency/emergency-alert/emergency-alert.tsx` - Emergency communications
- `src/healthcare/patient/vitals-signs/vitals-signs.tsx` - Clinical notes
- `src/healthcare/provider/consultation-notes/consultation-notes.tsx` - Consultation notes

**Estimated Timeline**: ✅ **Completed in 1 week** + Migration ongoing

---

## Implementation Guidelines

### Development Principles
1. **Backward Compatibility**: Always maintain existing APIs during transition
2. **Deprecation Warnings**: Provide clear migration paths
3. **Documentation First**: Document semantic patterns before implementation
4. **Testing**: Comprehensive testing for accessibility and functionality
5. **Performance**: Ensure semantic enhancements don't impact performance

### Quality Gates
- [ ] Accessibility audit passes
- [ ] Performance benchmarks maintained
- [ ] Documentation complete
- [ ] Migration guide available
- [ ] Test coverage > 90%

### Success Metrics
- **Developer Experience**: Reduced prop complexity, faster development
- **Accessibility**: Improved accessibility scores across components
- **Consistency**: Reduced visual inconsistencies in applications
- **Adoption**: Percentage of semantic-first pattern usage

## Timeline Summary

| Phase | Duration | Priority | Dependencies |
|-------|----------|----------|--------------|
| Phase 1 | Complete | ✅ | - |
| Phase 2 | 8 weeks | High | Phase 1 complete |
| Phase 3 | 5 weeks | Medium | Phase 2 complete |
| Phase 4 | 4 weeks | Lower | Phase 3 complete |
| Phase 5 | 2 weeks | Lower | Phase 4 complete |

**Total Estimated Timeline**: 19 weeks (approximately 5 months)

## Resources

- [Semantic-First Architecture](./semantic-first-architecture.md)
- [Migration Guide: Styling-First to Semantic-First](./migration-semantic-first.md)
- [Component API Standards](../COMPONENT_PROPS_STANDARDS.md)
