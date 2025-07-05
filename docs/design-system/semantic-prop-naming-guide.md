# Semantic Prop Naming Guide

## Overview

This guide ensures that all semantic props in the RxOps UI library are relatable, intuitive, and consistent. Good prop names should immediately convey their purpose and be easy for developers to remember and understand.

## Core Prop Naming Principles

### 1. **Semantic Over Visual**
Choose names that describe the purpose or intent, not the visual appearance.

```tsx
// ❌ Visual naming
<Button variant="big-blue-button">Submit</Button>

// ✅ Semantic naming  
<Button intent="primary">Submit</Button>
```

### 2. **Intuitive & Relatable**
Use words that developers naturally think of when describing the component's purpose.

```tsx
// ❌ Abstract naming
<Card manifestation="elevated">Content</Card>

// ✅ Intuitive naming
<Card purpose="article">Content</Card>
```

### 3. **Consistent Across Components**
Use similar naming patterns across different components for predictability.

```tsx
// Consistent "intent" pattern
<Button intent="primary">Save</Button>
<Link intent="primary">Learn More</Link>
<Badge intent="success">Complete</Badge>
```

### 4. **Natural Language**
Props should read like natural English when possible.

```tsx
// ✅ Natural reading
<Alert context="validation">Error message</Alert>
<Form purpose="registration">...</Form>
<Text as="h1">Title</Text>
```

## Component-Specific Prop Naming

### Text Component ✅ Implemented

| Prop | Purpose | Values | Why This Name |
|------|---------|--------|---------------|
| `as` | HTML element | `h1`, `p`, `span`, etc. | Standard React/HTML convention |
| `size` | Size override | `xs`, `sm`, `md`, `lg`, `xl` | Universal size concept |
| `weight` | Font weight | `normal`, `medium`, `bold` | Typography standard |
| `align` | Text alignment | `left`, `center`, `right` | CSS property name |
| `color` | Text color | Design tokens, hex, etc. | Universal color concept |

**Alternative names considered**:
- `element` vs `as` → `as` chosen for React convention
- `fontSize` vs `size` → `size` chosen for brevity
- `fontWeight` vs `weight` → `weight` chosen for brevity

### Button Component 🚧 Planned

| Prop | Purpose | Values | Why This Name | Alternatives |
|------|---------|--------|---------------|--------------|
| `intent` | Button purpose | `primary`, `secondary`, `destructive` | Describes user intention | `purpose`, `type`, `action` |
| `size` | Button size | `sm`, `md`, `lg` | Consistent with Text | `scale`, `dimension` |
| `loading` | Loading state | `boolean` | Clear state description | `isLoading`, `pending` |
| `disabled` | Disabled state | `boolean` | Standard HTML attribute | `isDisabled` |

**Intent values rationale**:
- `primary` → Most important action (relatable)
- `secondary` → Supporting action (clear hierarchy)
- `destructive` → Dangerous action (clear warning)
- `success` → Positive action (emotional connection)
- `neutral` → Safe, non-committal action (clear intent)

### Card Component 🚧 Planned

| Prop | Purpose | Values | Why This Name | Alternatives |
|------|---------|--------|---------------|--------------|
| `purpose` | Card content type | `article`, `navigation`, `form` | Describes content purpose | `type`, `role`, `intent` |
| `padding` | Internal spacing | `sm`, `md`, `lg` | Direct spacing control | `space`, `gap` |
| `interactive` | Clickable state | `boolean` | Clear interaction state | `clickable`, `hoverable` |

**Purpose values rationale**:
- `article` → Content-focused (relatable to blog posts, news)
- `navigation` → Menu/link focused (clear purpose)
- `form` → Form field container (obvious use case)
- `dashboard` → Metric/data display (business context)
- `media` → Image/video content (clear media purpose)

### Form Component 🚧 Planned

| Prop | Purpose | Values | Why This Name | Alternatives |
|------|---------|--------|---------------|--------------|
| `purpose` | Form type | `login`, `registration`, `search` | Describes form purpose | `type`, `intent`, `flow` |
| `layout` | Form arrangement | `vertical`, `horizontal`, `grid` | Describes visual layout | `direction`, `orientation` |
| `validation` | Validation timing | `onChange`, `onBlur`, `onSubmit` | When validation occurs | `validateOn`, `timing` |

**Purpose values rationale**:
- `login` → Authentication form (universal concept)
- `registration` → Sign-up form (clear purpose)
- `search` → Search interface (obvious function)
- `contact` → Contact form (common use case)
- `settings` → Configuration form (clear context)

### Input Component 🚧 Planned

| Prop | Purpose | Values | Why This Name | Alternatives |
|------|---------|--------|---------------|--------------|
| `type` | Input type | `email`, `password`, `search` | HTML standard | `inputType`, `kind` |
| `state` | Validation state | `valid`, `invalid`, `pending` | Current validation state | `status`, `validation` |
| `helper` | Helper text | `string` | Assistive text | `helperText`, `hint` |
| `required` | Required field | `boolean` | HTML standard | `isRequired`, `mandatory` |

### Alert Component 🚧 Planned

| Prop | Purpose | Values | Why This Name | Alternatives |
|------|---------|--------|---------------|--------------|
| `context` | Alert situation | `validation`, `system`, `success` | Situational context | `type`, `category`, `kind` |
| `dismissible` | Can be closed | `boolean` | Clear action possibility | `closeable`, `canDismiss` |
| `autoHide` | Auto dismiss | `boolean` | Clear behavior | `temporary`, `autoDismiss` |

**Context values rationale**:
- `validation` → Form/input errors (clear context)
- `system` → App-level notifications (system context)
- `success` → Positive feedback (emotional state)
- `info` → Informational messages (neutral info)

## Prop Naming Anti-Patterns

### ❌ Avoid These Patterns

```tsx
// Too technical/abstract
<Button manifestation="primary">Save</Button>
<Card configuration="elevated">Content</Card>

// Too verbose
<Button buttonActionIntent="primary">Save</Button>
<Text textElementSize="large">Heading</Text>

// Unclear abbreviations
<Form val="onChange">...</Form>
<Card cfg="article">...</Card>

// Visual-first naming
<Button appearance="big-blue">Save</Button>
<Card styling="shadowed">Content</Card>
```

### ✅ Use These Instead

```tsx
// Clear semantic purpose
<Button intent="primary">Save</Button>
<Card purpose="article">Content</Card>

// Concise but clear
<Button intent="primary">Save</Button>
<Text size="lg">Heading</Text>

// No abbreviations for core props
<Form validation="onChange">...</Form>
<Card purpose="article">...</Card>

// Semantic-first naming
<Button intent="primary">Save</Button>
<Card purpose="article">Content</Card>
```

## Prop Value Naming Standards

### Size Values
Standard across all components:
- `xs` → Extra small
- `sm` → Small  
- `md` → Medium (usually default)
- `lg` → Large
- `xl` → Extra large

### Color Values
Semantic color names:
- `primary` → Main brand color
- `secondary` → Supporting color
- `success` → Positive/success states
- `warning` → Caution/warning states  
- `error` → Error/danger states
- `info` → Informational states

### State Values
Boolean or clear state names:
- `loading` → In progress
- `disabled` → Cannot interact
- `required` → Must be filled
- `invalid` → Has errors
- `valid` → Passes validation

## Testing Prop Names

### Questions to Ask:
1. **Is it immediately clear what this prop does?**
2. **Would a new developer guess this prop name?**
3. **Does it read naturally in context?**
4. **Is it consistent with similar props in other components?**
5. **Does it describe purpose, not appearance?**

### Example Evaluation:

```tsx
// Test case
<Button intent="destructive" size="lg" loading>Delete Account</Button>
```

**Evaluation**:
- ✅ `intent="destructive"` → Clear this is a dangerous action
- ✅ `size="lg"` → Obvious size control
- ✅ `loading` → Clear loading state
- ✅ Reads naturally: "Button with destructive intent, large size, currently loading"

## Migration Strategy for Prop Names

### Phase 1: Introduce New Props
```tsx
// Support both old and new props temporarily
<Button 
  variant="filled"        // Old prop (deprecated)
  color="error"          // Old prop (deprecated)
  intent="destructive"   // New semantic prop
>
  Delete
</Button>
```

### Phase 2: Add Deprecation Warnings
```tsx
// Component implementation
if (variant || color) {
  console.warn('Button: variant and color props are deprecated. Use intent prop instead.');
}
```

### Phase 3: Migration Scripts
```bash
# Automated migration assistance
npm run migrate:button-props
```

### Phase 4: Remove Old Props
```tsx
// Only semantic props remain
<Button intent="destructive">Delete</Button>
```

This prop naming guide ensures that our semantic-first approach uses intuitive, relatable names that developers can easily understand and remember.
