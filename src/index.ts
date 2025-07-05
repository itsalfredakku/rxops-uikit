// Design System
export { designTokens, componentTokens, colors, typography, spacing, borderRadius, boxShadow, animation, breakpoints, zIndex, fontWeight, fontSize, fontFamily, lineHeight } from "./design-system/tokens";
export * from "./design-system/token-utils";
export { createVariantClass, createCompoundComponent, mergeProps } from "./design-system/component-base";
export type { ComponentContext } from "./design-system/component-base";

// Design System Types (Tokenized) - New centralized types for component consistency
export type { 
  // Core visual tokens
  Variant, 
  Color, 
  Shade, 
  
  // Base tokens
  Size,
  Spacing,
  Gap,
  Padding,
  Alignment,
  Justify,
  State,
  Position,
  
  // Component sizes
  ComponentSize,
  
  // Form tokens
  FormVariant,
  FormState,
  FormSize,
  ValidationState,
  
  // Interaction tokens
  LoadingState,
  InteractiveState,
  FocusState,
  
  // Component-specific tokens
  BadgeSize,
  
  // Healthcare domain tokens
  MedicalPriority,
  MedicalRecordStatus,
  MedicationFrequency,
  
  // Legacy compatibility
  LegacyColor,
  ColorWithLegacy
} from "./design-system/types";

// Design System Props - Standardized prop interfaces (new)
export type {
  // Base component props (new - enhanced version)
  BaseComponentProps as EnhancedBaseComponentProps,
  AccessibilityProps,
  
  // Layout props (new - enhanced version)
  LayoutProps as EnhancedLayoutProps,
  ResponsiveLayoutProps,
  
  // Form props (new - enhanced version)
  FormFieldProps as EnhancedFormFieldProps,
  
  // Interactive props (new)
  InteractiveProps,
  
  // Healthcare domain props (new)
  PatientProps,
  AppointmentProps,
  MedicalRecordProps,
  MedicationProps,
  
  // Compound interfaces (new)
  StandardComponentProps,
  StandardFormProps,
  HealthcareComponentProps,
  
  // Utility types (new)
  ExtractProps,
  RequireProps,
  PartialExcept,
  WithEventHandlers
} from "./design-system/props";

// Design System Utilities (new)
export { 
  validateRequiredProps,
  mergeWithDefaults,
  extractHtmlProps
} from "./design-system/props";

// =====================================
// CORE COMPONENTS - Atomic Design System
// =====================================

// Core Atoms - Basic building blocks
export { Button } from "./core/atoms/button/button";
export { Input } from "./core/atoms/input/index";
export { Alert } from "./core/atoms/alert/alert";
export { Avatar } from "./core/atoms/avatar/avatar";
export { Badge } from "./core/atoms/badge/index";
export { Spinner } from "./core/atoms/spinner/spinner";
export { Checkbox } from "./core/atoms/checkbox/checkbox";
export { Radio } from "./core/atoms/radio/radio";
export { Switch } from "./core/atoms/switch/switch";
export { Toggle, MedicationToggle, AlarmToggle, MonitoringToggle, EmergencyToggle, PrivacyToggle, SafetyToggle } from "./core/atoms/toggle/index";
export { Textarea } from "./core/atoms/textarea/textarea";
export { Tooltip } from "./core/atoms/tooltip/tooltip";
export { Divider } from "./core/atoms/divider/divider";
export { Logo } from "./core/atoms/logo/logo";
export { Icon, type IconName } from "./core/atoms/icon/index";
export { Text } from "./core/atoms/text/index";
export { Link } from "./core/atoms/link/link";
export { LinkNew as TypographyLink } from "./core/atoms/link/link-text-based";
export { Kbd, KbdSequence, healthcareShortcuts } from "./core/atoms/kbd/index";
export { StatusIndicator, PatientStatusIndicator, MedicationStatusIndicator, EmergencyStatusIndicator, VitalsStatusIndicator } from "./core/atoms/status-indicator/index";
export { Rating, PainScaleRating, SatisfactionRating, SeverityRating, NumericScaleRating } from "./core/atoms/rating/index";
export { Slider, PainScaleSlider, BloodPressureSlider, TemperatureSlider, DosageSlider, WeightSlider, HeightSlider, RangeSlider, MedicalRangeSlider } from "./core/atoms/slider/index";
export { ProgressBar } from "./core/atoms/progress-bar/index";
export { Tag, TagGroup } from "./core/atoms/tag/index";
export { Image, ImageGallery, MedicalImageViewer } from "./core/atoms/image/index";
export { CodeBlock, CodeExecutor, MedicalProtocolViewer } from "./core/atoms/code-block/index";

// Core Molecules - Simple component combinations
export { Accordion, AccordionItem } from "./core/molecules/accordion/index";
export { FormField } from "./core/molecules/form-field/form-field";
export { SearchAndFilter, DoctorSearch, AppointmentSearch } from "./core/molecules/search-filter/index";
export { DateTimePicker, AppointmentDatePicker } from "./core/molecules/date-time-picker/index";
export { FileUpload, MedicalDocumentUpload } from "./core/molecules/file-upload/index";
export { DataList as EnhancedDataList } from "./core/molecules/data-list/data-list";
export { Breadcrumb } from "./core/molecules/breadcrumb/breadcrumb";
export { Calendar } from "./core/molecules/calendar/index";
export { CommandPalette } from "./core/molecules/command-palette/index";
export { Pagination } from "./core/molecules/pagination/pagination";
export { Select } from "./core/molecules/select/index";
export { SplitButton } from "./core/molecules/split-button/split-button";
export { Tabs, TabPanel } from "./core/molecules/tabs/tabs";
export { Stepper, Step, TreatmentStepper, PatientOnboardingStepper, AssessmentStepper } from "./core/molecules/stepper/index";
export { Timeline } from "./core/molecules/timeline";
export { Popover, MedicalPopover } from "./core/molecules/popover";
export { Dropdown } from "./core/molecules/dropdown/dropdown";
export { EmergencyAlert as MolecularEmergencyAlert } from "./core/molecules/emergency-alert/emergency-alert";
export { ServiceCard } from "./core/organisms/service-card/service-card";
export { MetricCard } from "./core/atoms/metric-card/metric-card";
export { Drawer, Sidebar } from "./core/molecules/drawer/index";

// =====================================
// UTILITIES
// =====================================
export { useValidation, healthcareValidationRules } from "./utils/validation/form-validation";

// Motion Accessibility Utilities (Healthcare-focused)
export { 
  useMotionPreference,
  getAnimationClasses,
  HEALTHCARE_TIMING,
  MotionTransition,
  MotionButton,
  EmergencyMotionAlert,
  MotionSpinner
} from "./utils/motion-accessibility";

// Accessibility Compliance & WCAG 2.1 AA Utilities
export * from "./utils/accessibility";

// Mobile Healthcare Optimization Utilities
export * from "./utils/mobile-healthcare";

// Performance Monitoring & Healthcare Optimization
export * from "./utils/performance";

// HIPAA Compliance & Security Utilities
export * from "./utils/hipaa";

// Utility Types
export type { ValidationRule, UseValidationProps } from "./utils/validation/form-validation";

// Core Organisms - Complex UI sections
export { Header } from "./core/organisms/header/header";
export { Footer } from "./core/organisms/footer/index";
export { DataGrid } from "./core/organisms/data-grid/data-grid";
export { Form } from "./core/organisms/form/form";
export { Table, TableHeader, TableBody, TableRow, TableCell } from "./core/organisms/table/table";
export { Modal } from "./core/organisms/modal/modal";
export { Card, CardHeader, CardBody, CardFooter } from "./core/organisms/card/index";
export { Container } from "./core/organisms/container/container";
export { List, ListItem } from "./core/organisms/list/list";
export { Skeleton, DoctorCardSkeleton, HealthMetricSkeleton } from "./core/organisms/skeleton/skeleton";
export { EmergencyAlert } from "./core/organisms/emergency-alert/emergency-alert";
export { VitalSignsChart } from "./core/organisms/vital-signs-chart/index";
export { MedicationManagement } from "./core/organisms/medication-management/index";
export { AppointmentScheduler } from "./core/organisms/appointment-scheduler/index";
export { ProductCard } from "./core/organisms/product-card/index";
// ComponentStack removed as part of Stack component consolidation
export { Toast } from "./core/organisms/toast/toast";

// Core Uncategorized - Components needing review
// FormValidation moved to utils/validation

// =====================================
// HEALTHCARE COMPONENTS - Domain Specific
// =====================================

// Patient Domain
export { PatientProfile } from "./healthcare/patient/patient-profile/patient-profile";
export { VitalSigns } from "./healthcare/patient/vitals-signs";
export { MedicalHistory } from "./healthcare/patient/medical-history/medical-history";
export { HealthDashboard } from "./healthcare/patient/health-dashboard/health-dashboard";

// Provider Domain
export { ProviderDashboard } from "./healthcare/provider/provider-dashboard/provider-dashboard";
export { ConsultationNotes } from "./healthcare/provider/consultation-notes/consultation-notes";
export { PrescriptionManagement } from "./healthcare/provider/prescription-management/prescription-management";
export { DoctorCard } from "./healthcare/provider/doctor-card/doctor-card";

// Appointments Domain
export { AppointmentCalendar } from "./healthcare/appointments/appointment-calendar/appointment-calendar";
export { AppointmentCard } from "./healthcare/appointments/appointment-card/appointment-card";
export { VideoCall } from "./healthcare/appointments/video-call/video-call";

// Medical Domain
export { MedicationTracker } from "./healthcare/medical/medication-tracker/medication-tracker";
export { ImagingViewer } from "./healthcare/medical/imaging-viewer/imaging-viewer";
export { MedicalRecordCard, AppointmentStatusIndicator } from "./healthcare/medical/medical-record/medical-record";
export { LabResults } from "./healthcare/medical/lab-results/lab-results";
export { HealthPackageCard } from "./healthcare/medical/health-package-card/index";

// Emergency Domain
export { MetricCard as HealthMetric } from "./core/atoms/metric-card/metric-card"; // Backward compatibility - prefer MetricCard
export { HealthcareEmergencyAlert } from "./healthcare/emergency/index";

// Billing Domain
export { BillingCard } from "./healthcare/billing/billing-card/index";

// =====================================
// LAYOUT SYSTEM
// =====================================
export { 
  Row,
  Column,
  Stack,
  type LayoutType,
  type LayoutProps
} from "./layouts";

// Direct export of Layout and Layout Variants
export { Layout } from "./layouts/layout";
export { 
  EmptyLayout,
  PublicLayout,
  AuthLayout,
  UserLayout,
  AdminLayout,
  ProviderLayout
} from "./layouts/variants";

// =====================================
// TYPE EXPORTS
// =====================================

// Core Atoms Types
export type { ButtonProps } from "./core/atoms/button/button";
export type { LinkProps as TypographyLinkProps } from "./core/atoms/link/link-text-based";
export type { InputProps, InputType } from "./core/atoms/input/index";
export type { AlertProps, AlertColor, AlertVariant } from "./core/atoms/alert/alert";
export type { TooltipProps } from "./core/atoms/tooltip/tooltip";
export type { TextProps, TextVariant, TextWeight, TextAlign, TextTransform, TextDecoration } from "./core/atoms/text/index";
export type { RatingProps } from "./core/atoms/rating/index";
export type { ToggleProps } from "./core/atoms/toggle/index";
export type { StatusIndicatorProps, StatusType, StatusState, StatusVariant } from "./core/atoms/status-indicator/index";
export type { SliderProps, RangeSliderProps, SliderVariant, SliderSize, MedicalScale } from "./core/atoms/slider/index";
export type { ProgressBarProps } from "./core/atoms/progress-bar/index";
export type { TagProps, TagGroupProps } from "./core/atoms/tag/index";
export type { ImageProps, ImageGalleryProps, MedicalImageViewerProps } from "./core/atoms/image/index";

// Core Molecules Types
export type { AccordionProps, AccordionItemProps, AccordionItemComponentProps } from "./core/molecules/accordion/index";
export type { FormFieldProps } from "./core/molecules/form-field/form-field";
export type { DateTimePickerProps } from "./core/molecules/date-time-picker/index";
export type { FileUploadProps } from "./core/molecules/file-upload/index";
export type { DropdownProps, DropdownItem, DropdownPlacement, DropdownSize } from "./core/molecules/dropdown/dropdown";
export type { EmergencyAlertProps as MolecularEmergencyAlertProps, EmergencyAlert as MolecularEmergencyAlertData, EmergencySeverity, EmergencyType, AlertStatus, ResponseAction } from "./core/molecules/emergency-alert/index";
export type { SearchAndFilterProps, SearchFilter } from "./core/molecules/search-filter/index";
export type { SelectProps, SelectOption, SelectSize, SelectVariant, SelectColor } from "./core/molecules/select/index";
export type { StepperProps, StepProps } from "./core/molecules/stepper/index";
export type { ServiceCardProps, Service } from "./core/organisms/service-card/service-card";
export type { MetricCardProps } from "./core/atoms/metric-card/metric-card";
export type { KbdProps, KbdSequenceProps } from "./core/atoms/kbd/index";
export type { CalendarProps, CalendarEvent } from "./core/molecules/calendar/index";
export type { CommandPaletteProps, Command, CommandCategory, CommandPriority } from "./core/molecules/command-palette/index";

// Core Organisms Types
export type { CardProps } from "./core/organisms/card/index";
export type { ListProps, ListVariant, ListSize } from "./core/organisms/list/list";
export type { SkeletonProps } from "./core/organisms/skeleton/skeleton";
export type { 
  VitalSignsChartProps,
  VitalSignReading,
  VitalSignType,
  VitalSignUnit,
  VitalSignStatus,
  TimeRange,
  ChartMode
} from "./core/organisms/vital-signs-chart/index";
export type { 
  MedicationManagementProps,
  Medication as MedicationData,
  MedicationFrequency as MedicationFrequencyType,
  MedicationForm,
  MedicationStatus
} from "./core/organisms/medication-management/index";
export type {
  AppointmentSchedulerProps,
  AppointmentType,
  Provider,
  ProviderAvailability,
  TimeSlot,
  AppointmentData
} from "./core/organisms/appointment-scheduler/index";
export type {
  ProductCardProps,
  ProductData
} from "./core/organisms/product-card/index";
export type { 
  EmergencyAlertProps, 
  EmergencyAlert as EmergencyAlertData, 
  EmergencyAction, 
  EscalationRule, 
  RespondingTeam, 
  TeamMember, 
  EmergencyResource, 
  EmergencyCommunication 
} from "./core/organisms/emergency-alert/emergency-alert";

// Core Uncategorized Types
// FormValidation moved to utils/validation

// Healthcare Types
export type { DoctorCardProps, Doctor } from "./healthcare/provider/doctor-card/doctor-card";
export type { AppointmentCardProps, Appointment, AppointmentStatus } from "./healthcare/appointments/appointment-card/appointment-card";
export type { MetricCardProps as HealthMetricProps } from "./core/atoms/metric-card/metric-card"; // Backward compatibility - prefer MetricCardProps
export type { MedicationTrackerProps, Medication, MedicationDose, MedicationReminder, DrugInteraction } from "./healthcare/medical/medication-tracker/medication-tracker";
export type { MedicalRecord, MedicalRecordCardProps, AppointmentStatus as MedicalAppointmentStatus } from "./healthcare/medical/medical-record/medical-record";
export type { HealthPackageData, HealthPackageCardProps } from "./healthcare/medical/health-package-card/index";
export type { 
  HealthcareEmergencyAlertProps, 
  EmergencyAlertSeverity, 
  EmergencyAlertType 
} from "./healthcare/emergency/index";
export type { PatientData, PatientProfileProps } from "./healthcare/patient/patient-profile/patient-profile";
export type { TimelineProps, TimelineEvent } from "./core/molecules/timeline";
export type { CodeBlockProps, CodeExecutorProps, MedicalProtocolViewerProps, CodeLanguage, MedicalCodeType, CodeTheme } from "./core/atoms/code-block/index";
export type { PopoverProps, PopoverPosition, PopoverTrigger, MedicalPopoverType, MedicalPopoverProps } from "./core/molecules/popover/index";
