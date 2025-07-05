# Text Component: Semantic-First Typography

## Overview

We've updated the Text component to follow a semantic-first approach. This means the HTML element chosen with the `as` prop automatically determines the styling, making your code more semantic and easier to maintain.

## Key Benefits

- **More Semantic**: The component now encourages HTML semantics by inferring styling from the element type
- **Less Verbose**: Fewer props needed in most cases
- **Better Accessibility**: Promotes proper heading structure and document outline
- **Type Safety**: Clear interface with deprecated notice for legacy approach

## Migration Guide

### Before (Legacy Approach)

```tsx
<Text as="h1" textStyle="title">Page Title</Text>
<Text as="h2" textStyle="subtitle">Section Subtitle</Text>
<Text textStyle="body">Body text</Text>
<Text textStyle="caption">Small text</Text>
```

### After (Semantic-First Approach)

```tsx
<Text as="h1">Page Title</Text>                 // Automatically gets title styling
<Text as="h2">Section Subtitle</Text>           // Automatically gets subtitle styling
<Text as="p">Body text</Text>                   // Default styling for paragraphs
<Text as="span" size="sm">Small text</Text>     // Size override for span
```

## Automatic Element Mapping

The component now maps HTML elements to appropriate text styles:

| HTML Element | Default Text Style |
|--------------|-------------------|
| h1           | title             |
| h2, h3, h4, h5, h6 | subtitle    |
| p            | body              |
| span         | body              |
| small        | caption           |
| label        | caption           |
| div          | body              |

## Size Overrides

You can override the default size while keeping semantic HTML:

```tsx
<Text as="h1" size="lg">Smaller H1 Heading</Text>
<Text as="p" size="xl">Larger paragraph text</Text>
```

## Full Example

```tsx
// Basic usage with automatic styling
<Text as="h1">Main Page Title</Text>
<Text as="h2">Section Heading</Text>
<Text as="p">Regular paragraph text that will automatically get body styling.</Text>

// With overrides
<Text as="h2" size="xl" color="primary">Larger Subtitle</Text>
<Text as="p" weight="medium" color="#FF6B6B">Medium weight paragraph with hex color</Text>

// Special styling
<Text as="span" truncate lineClamp={2}>This text will be truncated after two lines...</Text>
```

## Best Practices

1. Always use the most semantically appropriate HTML element via the `as` prop
2. Only override the automatically inferred styling when necessary
3. Use the `size` prop for minor adjustments rather than changing the semantic element
4. For completely custom styling needs, consider using the `className` or `style` props
