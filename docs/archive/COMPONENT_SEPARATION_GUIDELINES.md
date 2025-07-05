# Project Structure and Separation Guidelines

## UI Library vs Demo Project Separation

### Issue Tracker Entry: Clear Separation of Concerns

**Issue**: Need clear guidelines on what belongs in the UI library vs the demo project to maintain clean architecture and prevent scope creep.

**Status**: ✅ Resolved

**Solution**: Established clear separation guidelines between UI library and demo project.

---

## UI Library (`/ui/`) - Contains Only:

### ✅ Core Components
- Component implementations (`.tsx` files)
- Component interfaces and types (`.d.ts` files)
- Component documentation (API references)
- Design tokens and styling systems

### ✅ Documentation
- Component usage guidelines
- Design system documentation
- API references and prop documentation
- Architecture and pattern guides

### ✅ Build Artifacts
- Compiled library files (`/lib/`)
- Type definitions (`/lib-types/`)
- Package configuration (`package.json`)

### ❌ What Does NOT Belong in UI Library:
- Interactive demos and examples
- Sample data and mock APIs
- Demo-specific helper components
- Showcase applications
- Complete example implementations

---

## Demo Project (`/demo/`) - Contains Only:

### ✅ Interactive Demonstrations
- Component showcase pages
- Interactive examples and demos
- Usage examples in real scenarios
- Component testing and experimentation

### ✅ Sample Data and Mocks
- Mock medical data for healthcare components
- Sample patient records, appointments, etc.
- API mocking and data simulation
- Test scenarios and edge cases

### ✅ Demo-Specific Code
- Demo application routing and layout
- Showcase-specific helper components
- Demo utilities and helpers
- Example implementations

### ✅ Complete Example Applications
- Full healthcare workflow examples
- Patient portal demos
- Provider dashboard examples
- Real-world usage scenarios

---

## Implementation Guidelines

### For UI Library Development:
1. **Focus on reusability**: Components should be generic and configurable
2. **Minimal dependencies**: Keep the library lightweight
3. **Clear documentation**: Each component needs comprehensive docs
4. **Type safety**: Full TypeScript support with exported types
5. **No demo code**: Keep demos separate to avoid bloating the library

### For Demo Project Development:
1. **Show real usage**: Demonstrate components in realistic scenarios
2. **Include sample data**: Use realistic medical data (anonymized)
3. **Interactive examples**: Allow users to test different configurations
4. **Complete workflows**: Show end-to-end healthcare workflows
5. **Performance testing**: Test components under realistic loads

---

## Healthcare Components Specific Guidelines

### VitalSigns Component Example:

**UI Library** (`/ui/src/healthcare/patient/vitals-signs/`):
```
vitals-signs.tsx                 // Core component implementation
vitals-signs.types.ts            // TypeScript interfaces
vitals-signs.stories.ts          // Storybook stories (if using Storybook)
index.ts                         // Export definitions
```

**Demo Project** (`/demo/src/routes/components/healthcare/vitals-signs/`):
```
index.tsx                        // Demo page with interactive examples
vitals-signs-emergency-demo.tsx  // Emergency context demo
vitals-signs-outpatient-demo.tsx // Outpatient context demo
vitals-signs-icu-demo.tsx        // ICU monitoring demo
sample-vitals-data.ts            // Mock vital signs data
```

---

## Icon System Integration

### UI Library Icon Component:
- Centralized `Icon` component in `/ui/src/core/atoms/icon/`
- All healthcare components use this unified system
- No scattered SVG components in healthcare modules

### Demo Project Icon Usage:
- Demonstrate different icon configurations
- Show healthcare-specific icon patterns
- Test icon accessibility and responsiveness

---

## Benefits of This Separation:

### For UI Library Consumers:
- **Lightweight**: No demo code bloating the library
- **Clear API**: Focused documentation without demo noise  
- **Better performance**: Optimized build without demo dependencies
- **Easy integration**: Clear component interfaces without demo confusion

### For Development:
- **Faster builds**: UI library builds quickly without demo complexity
- **Better testing**: Isolated component testing vs integration testing
- **Clear responsibilities**: Developers know exactly where to put new code
- **Easier maintenance**: Changes don't affect both library and demos

### For Healthcare Context:
- **Medical data safety**: Sample data isolated in demo project
- **HIPAA considerations**: Real implementation separated from examples
- **Clinical workflow clarity**: Real usage patterns shown in dedicated demos
- **Professional presentation**: Library stays professional, demos can be experimental

---

## Action Items:

1. ✅ Remove any demo files from UI library `/src/` directories
2. ✅ Move documentation to proper `/docs/` folder in UI library
3. ✅ Update healthcare components to use unified Icon system
4. ✅ Create clear documentation guidelines
5. 🔄 **Next**: Build comprehensive demos in demo project
6. 🔄 **Next**: Create sample medical data for realistic demos
7. 🔄 **Next**: Implement healthcare workflow examples in demo project

---

This separation ensures the UI library remains focused, lightweight, and professional while the demo project can showcase rich, interactive examples with realistic healthcare scenarios.
