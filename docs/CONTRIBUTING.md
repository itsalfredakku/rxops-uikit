# 🤝 Contributing to RxOps UI

Welcome to the RxOps UI component library! We're excited to have you contribute to our healthcare-focused UI components.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git
- Basic understanding of Qwik, TypeScript, and healthcare UX

### Development Setup

1. **Clone and Install**
   ```bash
   git clone https://github.com/your-org/rxops-ui.git
   cd rxops-ui
   npm install
   ```

2. **Install Playwright (for testing)**
   ```bash
   npx playwright install
   ```

3. **Start Development**
   ```bash
   npm run dev          # Start component development
   npm run dev:demo # Start demo/demo server
   ```

4. **Run Tests**
   ```bash
   npm run test         # Unit tests
   npm run test:e2e     # End-to-end tests
   npm run test:coverage # Coverage report
   ```

## 📁 Project Structure

```
├── src/
│   ├── components/          # UI components
│   │   ├── core/           # Basic components (Button, Input, Card)
│   │   ├── healthcare/     # Healthcare-specific components
│   │   ├── layouts/        # Layout components
│   │   └── templates/      # Page templates
│   ├── design-system/      # Design tokens and utilities
│   └── index.ts           # Main export file
├── demo/              # Interactive demo and documentation
├── tests/                 # Test files
├── docs/                  # Documentation
│   └── TESTING_GUIDE.md   # Testing guidelines
└── archive/               # Historical documentation
```

## 🔧 Development Workflow

### 1. **Choose Your Contribution**
- 🐛 **Bug Fix**: Fix existing component issues
- ✨ **New Component**: Add healthcare-specific components
- 📚 **Documentation**: Improve guides and examples
- 🧪 **Testing**: Expand test coverage
- 🎨 **Design**: Enhance visual design and UX

### 2. **Branch Strategy**
```bash
# Create feature branch
git checkout -b feature/component-name

# Create bugfix branch  
git checkout -b fix/issue-description

# Create documentation branch
git checkout -b docs/guide-name
```

### 3. **Component Development**

#### **Creating a New Component**
```bash
# 1. Create component files
mkdir src/components/healthcare/patient-chart
touch src/components/healthcare/patient-chart/patient-chart.tsx
touch src/components/healthcare/patient-chart/patient-chart.test.tsx
touch src/components/healthcare/patient-chart/index.ts

# 2. Add to main export
# Update src/index.ts
```

#### **Component Template**
```tsx
// src/components/healthcare/patient-chart/patient-chart.tsx
import { component$, type QRL } from '@builder.io/qwik';

export interface PatientChartProps {
  patientId: string;
  onRecordSelect$?: QRL<(recordId: string) => void>;
  // Healthcare-specific props
  hipaaCompliant?: boolean;
  readOnly?: boolean;
}

export const PatientChart = component$<PatientChartProps>((props) => {
  return (
    <div class="patient-chart">
      {/* Component implementation */}
    </div>
  );
});
```

#### **Test Template**
```tsx
// src/components/healthcare/patient-chart/patient-chart.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PatientChart } from './patient-chart';

describe('PatientChart', () => {
  it('renders with required props', () => {
    render(<PatientChart patientId="123" />);
    expect(screen.getByRole('region')).toBeInTheDocument();
  });

  it('handles HIPAA compliance', () => {
    // Healthcare-specific test
  });
});
```

### 4. **Quality Standards**

#### **Code Quality**
- ✅ TypeScript with strict types
- ✅ ESLint and Prettier configured
- ✅ HIPAA-compliant data handling
- ✅ Accessibility (WCAG 2.1 AA)
- ✅ Mobile-responsive design

#### **Testing Requirements**
- ✅ Unit tests for component logic
- ✅ Accessibility tests with axe-core
- ✅ Visual regression tests (Playwright)
- ✅ Healthcare compliance validation
- ✅ Minimum 80% code coverage

#### **Healthcare Standards**
- ✅ HIPAA compliance for PHI data
- ✅ Medical terminology accuracy
- ✅ Emergency scenarios handling
- ✅ Role-based access patterns
- ✅ Clinical workflow optimization

### 5. **Testing Your Changes**

```bash
# Run all tests
npm run test

# Test specific component
npm run test patient-chart

# Visual regression tests
npm run test:visual

# Accessibility tests
npm run test:a11y

# End-to-end tests
npm run test:e2e
```

### 6. **Documentation**

#### **Component Documentation**
Update `COMPONENT_GUIDE.md` with:
- Component purpose and use cases
- Props interface with examples
- Healthcare-specific features
- Accessibility features
- Code examples

#### **Demo Demo**
Add your component to the demo:
```tsx
// demo/src/routes/components/index.tsx
import { PatientChart } from '@rxops/uikit';

// Add to component list with demo
```

## 🎨 Design Guidelines

### **Healthcare Design Principles**
1. **Clarity First**: Information must be immediately comprehensible
2. **Error Prevention**: Design to prevent medical errors
3. **Accessibility**: Support for assistive technologies
4. **Mobile-First**: Many healthcare workers use mobile devices
5. **Emergency-Ready**: Components must work under stress

### **Design Tokens**
```typescript
// Use design system tokens
import { colors, spacing, typography } from '@rxops/uikit/design-system';

// Healthcare color palette
colors.primary.blue    // Primary actions
colors.success.green   // Positive indicators  
colors.warning.orange  // Caution/alerts
colors.error.red       // Critical/emergency
colors.neutral.gray    // Text and borders
```

### **Component Architecture**
1. **Atomic Design**: Build from atoms → molecules → organisms
2. **Composability**: Components should work together seamlessly  
3. **Prop Consistency**: Similar props across similar components
4. **Healthcare Context**: Each component considers medical workflows

## 🧪 Testing Guidelines

### **Healthcare-Specific Testing**
- **PHI Protection**: Test data masking and access controls
- **Medical Accuracy**: Validate medical terminology and calculations
- **Emergency Scenarios**: Test behavior under critical conditions
- **Role-Based Access**: Verify different user role permissions
- **Offline Capability**: Test functionality without network

### **Test Categories**
1. **Unit Tests**: Component logic and rendering
2. **Integration Tests**: Component interactions
3. **Accessibility Tests**: Screen reader and keyboard navigation
4. **Visual Tests**: UI consistency across browsers
5. **Performance Tests**: Load time and responsiveness

## 🚢 Submission Process

### **Pull Request Checklist**
- [ ] **Functionality**: Component works as intended
- [ ] **Tests**: All tests pass with 80%+ coverage
- [ ] **Accessibility**: Passes axe-core validation
- [ ] **Healthcare**: HIPAA compliant and medically appropriate
- [ ] **Documentation**: Updated guides and examples
- [ ] **Responsive**: Works on mobile and desktop
- [ ] **Performance**: No regression in bundle size

### **PR Template**
```markdown
## 🏥 Healthcare Component: [Component Name]

### Purpose
Brief description of the component and its healthcare use case.

### Changes
- [ ] New component: ComponentName
- [ ] Tests with 80%+ coverage
- [ ] Documentation updated
- [ ] Demo demo added

### Healthcare Compliance
- [ ] HIPAA compliant
- [ ] Medical terminology validated
- [ ] Emergency scenarios considered
- [ ] Role-based access implemented

### Testing
- [ ] Unit tests pass
- [ ] Accessibility tests pass
- [ ] Visual regression tests pass
- [ ] Manual testing on mobile/desktop

### Screenshots
[Include component screenshots]
```

## 🎯 Component Priorities

### **Current Focus Areas**
Refer to `COMPONENT_ROADMAP.md` for detailed priority lists:

1. **Priority 1**: Core healthcare components (VideoCall, PatientProfile, VitalsMonitor)
2. **Priority 2**: Enhanced UX components (MedicalHistory, PrescriptionManagement)
3. **Priority 3**: Advanced features (DocumentViewer, AmbulanceTracker)
4. **Priority 4**: Templates and layouts (DashboardLayout, PatientPortal)

## 🆘 Getting Help

### **Resources**
- 📚 **Documentation**: Check `docs/` folder
- 🔧 **Testing Guide**: See `docs/TESTING_GUIDE.md`
- 🏗️ **Component Guide**: See `COMPONENT_GUIDE.md`
- 🗺️ **Roadmap**: See `COMPONENT_ROADMAP.md`

### **Community**
- 💬 **Discord**: [Join our community](https://discord.gg/rxops)
- 🐛 **Issues**: Create GitHub issues for bugs
- 💡 **Discussions**: GitHub discussions for ideas
- 📧 **Email**: dev@rxops.com for complex questions

## 📄 Code of Conduct

We're committed to providing a welcoming and inclusive environment for all contributors. Please:

- ✅ Be respectful and constructive in all interactions
- ✅ Focus on healthcare accessibility and patient safety
- ✅ Maintain patient privacy and HIPAA compliance
- ✅ Provide helpful feedback and support to other contributors
- ✅ Report any inappropriate behavior to maintainers

## 🏥 Healthcare Context

Remember that these components may be used in:
- **Emergency situations** where every second counts
- **High-stress environments** with tired medical professionals  
- **Critical decision-making** affecting patient outcomes
- **Regulatory compliance** with healthcare standards
- **Accessibility needs** for users with disabilities

Your contributions directly impact healthcare delivery and patient safety. Thank you for helping us build better healthcare technology! 🙏

---

**Questions?** Open an issue or reach out to the maintainer team. We're here to help! 🚀
