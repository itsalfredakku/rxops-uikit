# Stack Component Migration Plan

## Overview

We're standardizing the `Stack` component to use numeric gap values instead of semantic values (xs, sm, md, lg, xl).

This migration ensures consistency with CSS naming conventions and makes the component usage more intuitive.

## Current State

- The `src/layouts/stack/index.tsx` component already uses numeric gap values ("0", "1", "2", "3", "4", etc.)
- The `src/core/organisms/stack/stack.tsx` component was updated to use numeric values but has since been removed
- The compiled type definitions in `lib-types` still reference semantic values
- Demo files still use semantic values

## Migration Steps

### 1. Update Type Definitions

Update the following files to ensure type consistency:

- Remove `Spacing as StackGap` re-export from `src/design-system/types.ts`
- Update Stack component to use `Spacing` type directly

### 2. Rebuild Library

After updating the types, rebuild the library:

```bash
npm run build.lib
```

### 3. Update Component Usage

Replace all semantic gap values with their numeric equivalents:

| Semantic | Numeric |
|----------|---------|
| none     | "0"     |
| xs       | "2"     |
| sm       | "3"     |
| md       | "4"     |
| lg       | "8"     |
| xl       | "16"    |

### 4. Update Demo Files

Once the library is rebuilt with proper type definitions, update all demo files to use numeric gap values.

### 5. Testing

Test components in various viewports to ensure proper spacing.

## Automation

Two scripts are provided to assist with the migration:

- `update-stack-types.js`: Updates type definitions in the library
- `update-stack-gaps.js`: Updates gap values in component usage

## Note

Until the library is properly rebuilt, demo files should continue using semantic values to avoid type errors.
