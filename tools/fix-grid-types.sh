#!/bin/bash

# Script to fix the Grid component type definitions in lib-types

echo "Updating Grid component type definitions in lib-types..."

# Update the Grid component type definition to use Spacing type
sed -i '' 's|export type GridGap = "none" \| "xs" \| "sm" \| "md" \| "lg" \| "xl";|import { Spacing } from "../../../design-system/types";\nexport type GridGap = Spacing;|g' /Volumes/EXT/RxOps/ui/lib-types/layouts/grid/grid.d.ts

echo "Type definition update complete!"
