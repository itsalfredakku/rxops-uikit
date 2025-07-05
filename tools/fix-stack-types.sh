#!/bin/bash

# Script to fix compiled type definitions for Stack component

echo "Fixing compiled type definitions for Stack component..."

# Remove the StackGap export from lib-types/design-system/types.d.ts
# This is a bit risky with sed, so let's create a backup first
cp /Volumes/EXT/RxOps/ui/lib-types/design-system/types.d.ts /Volumes/EXT/RxOps/ui/lib-types/design-system/types.d.ts.bak

# Replace the line that exports StackGap
sed -i '' 's/Spacing as StackGap, //' /Volumes/EXT/RxOps/ui/lib-types/design-system/types.d.ts

# Update the Stack component definition in lib-types/core/organisms/stack/stack.d.ts
# First, let's check if the file exists
if [ -f "/Volumes/EXT/RxOps/ui/lib-types/core/organisms/stack/stack.d.ts" ]; then
    echo "Fixing Stack component definition..."
    cp /Volumes/EXT/RxOps/ui/lib-types/core/organisms/stack/stack.d.ts /Volumes/EXT/RxOps/ui/lib-types/core/organisms/stack/stack.d.ts.bak
    
    # Change the StackGap type to use Spacing instead
    sed -i '' 's/export type StackGap = "none" | "xs" | "sm" | "md" | "lg" | "xl";/import { Spacing } from "..\/..\/design-system\/types";/' /Volumes/EXT/RxOps/ui/lib-types/core/organisms/stack/stack.d.ts
    
    # Update the gap prop type
    sed -i '' 's/gap?: StackGap;/gap?: Spacing;/' /Volumes/EXT/RxOps/ui/lib-types/core/organisms/stack/stack.d.ts
fi

# Also check for the component Stack file
if [ -f "/Volumes/EXT/RxOps/ui/lib-types/components/stack/stack.d.ts" ]; then
    echo "Fixing component Stack definition..."
    cp /Volumes/EXT/RxOps/ui/lib-types/components/stack/stack.d.ts /Volumes/EXT/RxOps/ui/lib-types/components/stack/stack.d.ts.bak
    
    # Change the StackGap type to use Spacing instead
    sed -i '' 's/export type StackGap = "none" | "xs" | "sm" | "md" | "lg" | "xl";/import { Spacing } from "..\/..\/design-system\/types";/' /Volumes/EXT/RxOps/ui/lib-types/components/stack/stack.d.ts
    
    # Update the gap prop type
    sed -i '' 's/gap?: StackGap;/gap?: Spacing;/' /Volumes/EXT/RxOps/ui/lib-types/components/stack/stack.d.ts
fi

echo "Type definitions updated!"
echo "You should now rebuild the library to ensure all changes are properly applied."
