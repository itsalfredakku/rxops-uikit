# 🏥 Healthcare Components

Healthcare-specific components designed for medical workflows and optimized for healthcare professionals.

## 🧠 Semantic-First Design Philosophy

Our healthcare components follow a **semantic-first approach** where every prop and behavior has clinical meaning. Components intelligently adapt their validation, presentation, and recommendations based on healthcare context.

### Key Semantic Principles:
1. **Clinical Context Awareness** - Components understand care settings (emergency, ICU, outpatient)
2. **Purpose-Driven Behavior** - Interface adapts to clinical purpose (monitoring, input, comparison)
3. **Evidence-Based Validation** - All thresholds follow current clinical guidelines
4. **Predictive Intelligence** - Components provide contextual recommendations and alerts

## 🎯 Domain Organization

Components are organized by healthcare domains to match real-world workflows:

- **Patient Domain** - Patient-focused components and workflows
- **Provider Domain** - Doctor and healthcare provider interfaces  
- **Appointments Domain** - Scheduling and consultation management
- **Medical Domain** - Medical data, records, and clinical tools
- **Emergency Domain** - Critical care and emergency interfaces
- **Billing Domain** - Healthcare billing and insurance

## 🩺 VitalSigns Component - Semantic Intelligence Showcase

The VitalSigns component exemplifies our semantic-first approach through advanced clinical intelligence:

### 🔬 Advanced Semantic Features

#### 1. Predictive Validation & Clinical Alerts
```tsx
// Real-time clinical validation with context-aware thresholds
<VitalSigns 
  context="emergency"     // Triggers hypertensive crisis protocols  
  urgency="critical"      // Immediate intervention recommendations
  vitals={patientVitals}
/>
```

**Smart Validation Examples:**
- **Hypertensive Crisis** (BP ≥180/120): Context-specific intervention protocols
- **Severe Tachycardia** (HR >150): Cardiac monitoring recommendations  
- **Critical Pain** (Scale ≥7): Immediate pain management protocols

#### 2. Context-Aware Clinical Tooltips
```tsx
// Tooltips provide evidence-based guidance specific to care setting
<VitalSigns context="icu" />
// BP tooltip: "Continuous monitoring essential. MAP >65 mmHg typically required."

<VitalSigns context="outpatient" />  
// BP tooltip: "Home readings preferred. Multiple readings needed for diagnosis."
```

#### 3. Purpose-Driven Interface Adaptation
```tsx
// Interface layout optimizes for clinical workflow
<VitalSigns 
  purpose="monitoring"    // Real-time display with trending
  purpose="input"         // Streamlined data entry forms
  purpose="comparison"    // Historical analysis emphasis
  purpose="summary"       // Condensed overview format
/>
```

#### 4. Evidence-Based Recommendations
All recommendations follow current clinical guidelines:
- **Hypertension Management**: 2017 ACC/AHA Guidelines
- **Arrhythmia Assessment**: AHA/ACC Clinical Guidelines
- **Pain Management**: WHO Pain Assessment Standards
- **BMI Classification**: CDC/WHO Standards

### 🏥 Clinical Context Intelligence

#### Emergency Department Context
```tsx
<VitalSigns context="emergency" urgency="critical">
// ✅ Immediate intervention protocols
// ✅ High-acuity validation thresholds  
// ✅ Real-time alert animations
// ✅ Evidence-based emergency recommendations
```

#### ICU Monitoring Context  
```tsx
<VitalSigns context="icu" purpose="monitoring">
// ✅ Continuous hemodynamic monitoring
// ✅ Critical care-specific thresholds
// ✅ Trend analysis with clinical significance
// ✅ Multi-parameter correlation alerts
```

#### Outpatient Clinic Context
```tsx
<VitalSigns context="outpatient" purpose="comparison">
// ✅ Lifestyle modification recommendations
// ✅ Long-term trending analysis
// ✅ Home monitoring guidance
// ✅ Patient education tooltips
```

## 🔗 Unified Icon System for Healthcare

All healthcare components use our centralized Icon component for consistency and maintainability:

```tsx
import { Icon } from '../../core/atoms/icon/index';

// Healthcare-specific semantic icons
<Icon icon="heart" class="w-5 h-5 text-red-500" />          // Cardiovascular
<Icon icon="thermometer" class="w-5 h-5 text-orange-500" /> // Temperature
<Icon icon="activity" class="w-5 h-5 text-blue-500" />      // Monitoring/Activity
<Icon icon="stethoscope" class="w-5 h-5 text-blue-600" />   // Clinical examination
<Icon icon="weight" class="w-5 h-5 text-teal-500" />        // BMI/weight measurements
<Icon icon="droplet" class="w-5 h-5 text-blue-400" />       // Blood/fluid related
<Icon icon="alert-triangle" class="w-5 h-5 text-red-500" /> // Warnings/alerts
<Icon icon="trending-up" class="w-4 h-4 text-green-500" />  // Improving trends
<Icon icon="trending-down" class="w-4 h-4 text-red-500" />  // Declining trends
<Icon icon="user" class="w-4 h-4 text-gray-500" />          // Patient/user info
<Icon icon="clock" class="w-4 h-4 text-gray-500" />         // Timestamps
<Icon icon="file-text" class="w-4 h-4 text-gray-500" />     // Medical notes
<Icon icon="plus" class="w-4 h-4" />                        // Add/create actions
```

### Benefits of Unified Icon System:
- **Consistency**: All icons follow the same design language
- **Maintainability**: Single component to update icon behavior
- **Flexibility**: Easy to swap icons or add new ones
- **Performance**: Optimized rendering and bundling
- **Accessibility**: Consistent ARIA labeling across all icons

## 🚫 Demo Project Separation

**Important**: This UI library contains only the core components and their documentation. All interactive demos, examples, and sample implementations should be created in the separate **demo project**.

### What belongs in UI Library:
- ✅ Core component implementations
- ✅ Component documentation and API references
- ✅ Design guidelines and usage patterns
- ✅ TypeScript interfaces and types

### What belongs in Demo Project:
- ❌ Interactive component demos
- ❌ Sample medical data and mock APIs
- ❌ Demo-specific helper components
- ❌ Example implementations and workflows
- ❌ Demo applications and showcase sites

Demo implementations will be built in:
- `/demo/src/routes/components/healthcare/` - Healthcare component demos
- `/demo/src/data/medical/` - Sample medical data
- `/demo/src/components/showcase/` - Demo-specific showcase components

## 👥 Patient Domain

### PatientProfile
Comprehensive patient information display.

```typescript
import { PatientProfile } from '@rxops/uikit';

<PatientProfile
  patient={{
    id: "P001",
    name: "Sarah Johnson", 
    age: 34,
    gender: "Female",
    dateOfBirth: "1989-03-15",
    bloodType: "A+",
    allergies: ["Penicillin", "Shellfish"],
    emergencyContact: {
      name: "John Johnson",
      relationship: "Spouse", 
      phone: "+1 (555) 123-4567"
    },
    insurance: {
      provider: "Blue Cross Blue Shield",
      policyNumber: "BC123456789",
      groupNumber: "GRP001"
    },
    primaryCarePhysician: "Dr. Michael Chen"
  }}
  editable={true}
  onEdit={handlePatientEdit}
  onViewHistory={handleViewHistory}
/>
```

### VitalSigns
Display and monitor patient vital signs with semantic-first design.

```typescript
import { VitalSigns } from '@rxops/uikit';

<VitalSigns
  patientId="patient_123"
  // Semantic props drive behavior automatically
  context="emergency"    // Determines validation rules: outpatient | inpatient | emergency | surgery | icu
  purpose="monitoring"   // Drives layout: monitoring | input | trending | comparison | emergency  
  urgency="critical"     // Affects visual styling: routine | priority | urgent | critical
  currentVitals={{
    bloodPressure: {
      systolic: 180,
      diastolic: 110,
      unit: "mmHg",
      timestamp: "2025-07-01T09:00:00Z",
      status: "critical"
    },
    heartRate: {
      value: 95,
      unit: "bpm", 
      rhythm: "regular",
      timestamp: "2025-07-01T09:00:00Z",
      status: "elevated"
    },
    temperature: {
      value: 101.2,
      unit: "°F",
      site: "oral",
      timestamp: "2025-07-01T09:00:00Z", 
      status: "high"
    },
    oxygenSaturation: {
      value: 97,
      unit: "%",
      onRoomAir: true,
      timestamp: "2025-07-01T09:00:00Z",
      status: "normal"
    },
    respiratoryRate: {
      value: 22,
      unit: "breaths/min",
      timestamp: "2025-07-01T09:00:00Z",
      status: "elevated"
    }
  }}
  historicalVitals={previousReadings}
  showAlerts={true}
  editable={true}
  // Context-aware reference ranges are automatic
  onVitalSave={handleVitalSave}
  onVitalUpdate={handleVitalUpdate}
  onAlertAcknowledge={handleAlertAcknowledge}
/>
```

#### Semantic-First Features:

**Context-Aware Validation**: Reference ranges automatically adjust based on medical setting
```typescript
// Emergency context allows wider tolerance for unstable patients
context="emergency" → bloodPressure: [100, 160], heartRate: [50, 120]

// Outpatient context uses standard ranges
context="outpatient" → bloodPressure: [90, 140], heartRate: [60, 100]

// Surgery context accommodates perioperative variations  
context="surgery" → bloodPressure: [100, 180], heartRate: [45, 130]
```

**Purpose-Driven Layout**: Component behavior changes based on clinical intent
```typescript
purpose="emergency"   → Compact display, critical alerts, minimal fields
purpose="monitoring"  → Standard display with trends and history
purpose="trending"    → Focus on historical data and pattern analysis
purpose="input"       → Optimized form layout for data entry
```

**Urgency-Based Styling**: Visual presentation reflects clinical priority
```typescript
urgency="critical"  → Red borders, pulse animation, immediate attention indicators
urgency="urgent"    → Orange styling, priority markers
urgency="priority"  → Blue accents, important but stable
urgency="routine"   → Standard calm styling
```

**Healthcare-Optimized UX**: Context-dependent field visibility and behavior
```typescript
// Pain scale only appears in emergency/surgery contexts
{(context === 'emergency' || context === 'surgery') && (
  <PainScaleInput />
)}

// Timestamp precision based on clinical context
context === 'emergency' → Shows seconds for critical timing
context === 'outpatient' → Shows standard date/time format
```
```

### MedicalHistory
Patient's medical history and chronic conditions.

```typescript
import { MedicalHistory } from '@rxops/uikit';

<MedicalHistory
  history={{
    chronicConditions: [
      {
        condition: "Hypertension",
        diagnosedDate: "2020-01-15",
        status: "Active",
        severity: "Moderate",
        medications: ["Lisinopril 10mg"]
      },
      {
        condition: "Type 2 Diabetes", 
        diagnosedDate: "2018-06-22",
        status: "Controlled",
        severity: "Mild",
        medications: ["Metformin 500mg"]
      }
    ],
    surgeries: [
      {
        procedure: "Appendectomy",
        date: "2015-03-10",
        surgeon: "Dr. Robert Lee",
        complications: "None"
      }
    ],
    familyHistory: [
      {
        relation: "Father",
        condition: "Heart Disease",
        ageOfOnset: 55
      },
      {
        relation: "Mother", 
        condition: "Diabetes",
        ageOfOnset: 62
      }
    ]
  }}
  expandable={true}
  onConditionClick={handleConditionDetail}
/>
```

### HealthDashboard
Patient's personal health dashboard.

```typescript
import { HealthDashboard } from '@rxops/uikit';

<HealthDashboard
  patient={currentPatient}
  upcomingAppointments={upcomingAppointments}
  recentResults={recentLabResults}
  medications={currentMedications}
  healthGoals={healthGoals}
  onAppointmentClick={handleAppointmentClick}
  onMedicationReminder={handleMedicationReminder}
  onHealthGoalUpdate={handleHealthGoalUpdate}
/>
```

## 👨‍⚕️ Provider Domain

### DoctorCard
Healthcare provider information card.

```typescript
import { DoctorCard } from '@rxops/uikit';

<DoctorCard
  doctor={{
    id: "D001",
    name: "Dr. Michael Chen",
    specialty: "Cardiology",
    subSpecialty: "Interventional Cardiology",
    credentials: ["MD", "FACC"],
    avatar: "/doctors/dr-chen.jpg",
    rating: 4.8,
    reviewCount: 127,
    experience: 15,
    education: [
      "Harvard Medical School - MD",
      "Johns Hopkins - Cardiology Fellowship"
    ],
    languages: ["English", "Mandarin"],
    acceptingNewPatients: true,
    nextAvailableAppointment: "2025-07-15T10:00:00Z",
    officeLocations: [
      {
        name: "Downtown Medical Center",
        address: "123 Medical Ave, City, ST 12345",
        phone: "+1 (555) 123-4567"
      }
    ]
  }}
  showDetails={true}
  onBookAppointment={handleBookAppointment}
  onViewProfile={handleViewProfile}
  onContact={handleContact}
/>
```

### ProviderDashboard
Doctor's main dashboard interface.

```typescript
import { ProviderDashboard } from '@rxops/uikit';

<ProviderDashboard
  provider={currentProvider}
  todaysAppointments={todaysAppointments}
  pendingResults={pendingResults}
  messages={unreadMessages}
  alerts={criticalAlerts}
  schedule={weeklySchedule}
  onAppointmentSelect={handleAppointmentSelect}
  onResultReview={handleResultReview}
  onMessageReply={handleMessageReply}
  onAlertAcknowledge={handleAlertAcknowledge}
/>
```

### ConsultationNotes
Clinical note-taking interface.

```typescript
import { ConsultationNotes } from '@rxops/uikit';

<ConsultationNotes
  appointment={currentAppointment}
  patient={patient}
  templates={noteTemplates}
  previousNotes={previousConsultationNotes}
  onSave={handleNoteSave}
  onTemplateSelect={handleTemplateSelect}
  autoSave={true}
  voiceRecognition={true}
/>
```

### PrescriptionManagement
Electronic prescription management.

```typescript
import { PrescriptionManagement } from '@rxops/uikit';

<PrescriptionManagement
  patient={patient}
  currentMedications={currentMedications}
  drugDatabase={drugDatabase}
  allergies={patientAllergies}
  onPrescribe={handlePrescribe}
  onDiscontinue={handleDiscontinue}
  onDrugInteractionCheck={handleDrugInteractionCheck}
  onInsuranceCheck={handleInsuranceCheck}
/>
```

## 📅 Appointments Domain

### AppointmentCard
Individual appointment display.

```typescript
import { AppointmentCard } from '@rxops/uikit';

<AppointmentCard
  appointment={{
    id: "APT001",
    type: "General Checkup",
    patient: {
      name: "Sarah Johnson",
      age: 34,
      avatar: "/patients/sarah-johnson.jpg"
    },
    provider: {
      name: "Dr. Michael Chen",
      specialty: "Cardiology"
    },
    scheduledTime: "2025-07-15T10:00:00Z",
    duration: 30,
    status: "confirmed",
    appointmentType: "in-person",
    location: {
      name: "Room 201",
      address: "Downtown Medical Center"
    },
    chiefComplaint: "Annual physical examination",
    insuranceVerified: true
  }}
  onReschedule={handleReschedule}
  onCancel={handleCancel}
  onStartVisit={handleStartVisit}
  onSendReminder={handleSendReminder}
/>
```

### AppointmentCalendar
Calendar view for scheduling and managing appointments.

```typescript
import { AppointmentCalendar } from '@rxops/uikit';

<AppointmentCalendar
  appointments={allAppointments}
  availableSlots={availableSlots}
  providers={providers}
  view="week" // 'day', 'week', 'month'
  selectedDate={selectedDate}
  onDateChange={handleDateChange}
  onAppointmentClick={handleAppointmentClick}
  onSlotClick={handleSlotClick}
  onAppointmentDrop={handleAppointmentReschedule}
  conflictResolution={true}
  showWaitlist={true}
/>
```

### VideoCall
Telemedicine video consultation interface.

```typescript
import { VideoCall } from '@rxops/uikit';

<VideoCall
  appointment={currentAppointment}
  localStream={localVideoStream}
  remoteStream={remoteVideoStream}
  isConnected={isCallConnected}
  isMuted={isMuted}
  isVideoEnabled={isVideoEnabled}
  onToggleMute={handleToggleMute}
  onToggleVideo={handleToggleVideo}
  onEndCall={handleEndCall}
  onScreenShare={handleScreenShare}
  onRecordStart={handleRecordStart}
  onChat={handleChatMessage}
  qualityIndicator={connectionQuality}
/>
```

## 🔬 Medical Domain

### MedicationTracker
Patient medication management and tracking.

```typescript
import { MedicationTracker } from '@rxops/uikit';

<MedicationTracker
  medications={[
    {
      id: "MED001",
      name: "Lisinopril",
      dosage: "10mg",
      frequency: "Once daily",
      route: "Oral",
      prescribedBy: "Dr. Michael Chen",
      prescribedDate: "2025-06-01",
      nextDose: "2025-07-02T08:00:00Z",
      remainingRefills: 2,
      totalRefills: 5,
      instructions: "Take with food",
      sideEffects: ["Dizziness", "Dry cough"],
      interactions: [],
      adherence: {
        percentage: 85,
        missedDoses: 3,
        lastTaken: "2025-07-01T08:15:00Z"
      }
    }
  ]}
  onDoseTaken={handleDoseTaken}
  onSkipDose={handleSkipDose}
  onRefillRequest={handleRefillRequest}
  onSideEffectReport={handleSideEffectReport}
  remindersEnabled={true}
  onReminderSettings={handleReminderSettings}
/>
```

### MedicalRecordCard
Clinical record display and management.

```typescript
import { MedicalRecordCard } from '@rxops/uikit';

<MedicalRecordCard
  record={{
    id: "REC001",
    type: "Lab Result",
    date: "2025-06-28",
    provider: "Dr. Sarah Wilson",
    title: "Complete Blood Count",
    status: "Final",
    priority: "Normal",
    results: [
      {
        test: "Hemoglobin",
        value: "14.2",
        unit: "g/dL",
        referenceRange: "12.0-15.5",
        status: "Normal"
      },
      {
        test: "White Blood Cell Count",
        value: "7.8",
        unit: "K/uL", 
        referenceRange: "4.0-11.0",
        status: "Normal"
      }
    ],
    notes: "All values within normal limits",
    attachments: [
      {
        name: "Lab_Report_20250628.pdf",
        size: "2.3 MB",
        type: "PDF"
      }
    ]
  }}
  onView={handleRecordView}
  onDownload={handleRecordDownload}
  onShare={handleRecordShare}
  onAddNote={handleAddNote}
/>
```

### LabResults
Laboratory test results display.

```typescript
import { LabResults } from '@rxops/uikit';

<LabResults
  results={{
    orderId: "LAB001",
    orderDate: "2025-06-25",
    collectionDate: "2025-06-28",
    resultDate: "2025-06-29",
    status: "Final",
    provider: "Dr. Michael Chen",
    tests: [
      {
        category: "Lipid Panel",
        tests: [
          {
            name: "Total Cholesterol",
            value: 185,
            unit: "mg/dL",
            referenceRange: "<200",
            status: "Normal",
            trend: "Stable"
          },
          {
            name: "HDL Cholesterol", 
            value: 45,
            unit: "mg/dL",
            referenceRange: ">40",
            status: "Normal",
            trend: "Improving"
          },
          {
            name: "LDL Cholesterol",
            value: 120,
            unit: "mg/dL", 
            referenceRange: "<100",
            status: "High",
            trend: "Worsening"
          }
        ]
      }
    ]
  }}
  showTrends={true}
  onTestClick={handleTestDetail}
  onTrendView={handleTrendView}
  onPrintResults={handlePrintResults}
/>
```

## 🚨 Emergency Domain

### EmergencyAlert
Critical alert system for emergency situations.

```typescript
import { EmergencyAlert } from '@rxops/uikit';

<EmergencyAlert
  alert={{
    id: "ALERT001",
    severity: "critical",
    type: "vital-signs",
    patient: {
      name: "Sarah Johnson",
      room: "ICU-201",
      mrn: "MRN123456"
    },
    message: "Blood pressure critically high: 180/110 mmHg",
    timestamp: "2025-07-01T14:30:00Z",
    triggeredBy: "Automated Monitoring System",
    recommendations: [
      "Administer antihypertensive medication",
      "Notify attending physician immediately",
      "Continuous monitoring required"
    ],
    relatedVitals: {
      bloodPressure: "180/110",
      heartRate: "95 bpm",
      oxygenSaturation: "97%"
    }
  }}
  onAcknowledge={handleAlertAcknowledge}
  onEscalate={handleAlertEscalate}
  onTreatmentNote={handleTreatmentNote}
  autoEscalationTimer={300} // 5 minutes
/>
```

### HealthMetric
Real-time health metric monitoring.

```typescript
import { HealthMetric } from '@rxops/uikit';

<HealthMetric
  label="Blood Pressure"
  value="120/80"
  unit="mmHg"
  status="normal" // 'normal', 'warning', 'critical'
  trend="stable" // 'up', 'down', 'stable'
  lastUpdated="2025-07-01T09:00:00Z"
  thresholds={{
    normal: { min: 90, max: 140 },
    warning: { min: 140, max: 160 },
    critical: { min: 160, max: 200 }
  }}
  history={bloodPressureHistory}
  onAlert={handleMetricAlert}
  showChart={true}
  realTimeUpdates={true}
/>
```

## 💰 Billing Domain

### BillingCard
Healthcare billing and insurance information.

```typescript
import { BillingCard } from '@rxops/uikit';

<BillingCard
  billing={{
    invoiceId: "INV001",
    patientName: "Sarah Johnson", 
    serviceDate: "2025-06-28",
    provider: "Dr. Michael Chen",
    services: [
      {
        code: "99213",
        description: "Office visit, established patient",
        quantity: 1,
        unitPrice: 150.00,
        total: 150.00
      },
      {
        code: "80053",
        description: "Comprehensive metabolic panel",
        quantity: 1, 
        unitPrice: 75.00,
        total: 75.00
      }
    ],
    subtotal: 225.00,
    tax: 0.00,
    total: 225.00,
    insurance: {
      provider: "Blue Cross Blue Shield",
      policyNumber: "BC123456789",
      copay: 25.00,
      deductible: 500.00,
      deductibleMet: 250.00,
      coinsurance: 20,
      coverage: 80,
      estimatedCoverage: 160.00
    },
    patientResponsibility: 65.00,
    paymentStatus: "Pending",
    dueDate: "2025-07-28"
  }}
  onPayment={handlePayment}
  onInsuranceVerification={handleInsuranceVerification}
  onPaymentPlan={handlePaymentPlan}
  onDisputeCharge={handleDisputeCharge}
/>
```

## 🎨 Healthcare-Specific Styling

Components include healthcare-specific visual cues:

```typescript
// Status color system
const healthcareColors = {
  normal: 'text-green-600 bg-green-50',
  warning: 'text-yellow-600 bg-yellow-50', 
  critical: 'text-red-600 bg-red-50',
  info: 'text-blue-600 bg-blue-50'
};

// Medical priority indicators
<Badge variant="critical" pulse>
  Critical Result
</Badge>

<Badge variant="warning" icon="clock">
  Pending Review
</Badge>
```

## ♿ Healthcare Accessibility

Components meet healthcare-specific accessibility requirements:

- **HIPAA compliance** considerations
- **Clinical workflow** optimizations
- **Mobile responsiveness** for bedside use
- **High contrast** support for medical displays
- **Voice navigation** for hands-free operation

## 📱 Mobile Healthcare UI

Optimized for healthcare professionals on mobile devices:

```typescript
// Touch-friendly interfaces
<AppointmentCard
  size="large" // Easier touch targets
  swipeActions={[
    { label: 'Confirm', action: 'confirm', color: 'green' },
    { label: 'Reschedule', action: 'reschedule', color: 'blue' },
    { label: 'Cancel', action: 'cancel', color: 'red' }
  ]}
/>
```

## 🔒 Security & Compliance

Healthcare components include security features:

- **Data encryption** for sensitive information
- **Audit logging** for clinical actions
- **Session timeout** for unattended devices
- **Role-based access** controls
- **HIPAA-compliant** data handling

## 📚 Related Documentation

- [Core Components](./core-components.md) - Foundational building blocks
- [Patient Workflows](../examples/patient-workflows.md) - Common patient scenarios  
- [Provider Workflows](../examples/provider-workflows.md) - Clinical workflow examples
- [Design System](../design-system/design-tokens.md) - Healthcare design principles
