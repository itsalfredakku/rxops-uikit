import { component$, useSignal, useStore, $, type QRL } from '@builder.io/qwik';
import { Text } from '../../../core/atoms/text/text';
import { Tooltip } from '../../../core/atoms/tooltip/tooltip';
import { Card } from '../../../core/organisms/card/card';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '../../../core/organisms/table/table';
import { Row } from '../../../layouts/row';
// import { Stack } from '../../../layouts/stack';
import { Button } from '../../../core/atoms/button/button';
import { Input } from '../../../core/atoms/input/input';
import { Alert } from '../../../core/atoms/alert/alert';
import { Badge } from '../../../core/atoms/badge';
import { Icon } from '../../../core/atoms/icon/index';
import { Textarea } from '../../../core/atoms/textarea/textarea';
import { BaseComponentProps, mergeClasses } from '../../../design-system/props';
import { Column } from '../../../layouts';

export interface VitalReading {
  id: string;
  timestamp: string;
  measuredBy: string;
  bloodPressure: {
    systolic: number;
    diastolic: number;
    unit: 'mmHg';
  };
  heartRate: {
    value: number;
    unit: 'bpm';
    rhythm: 'regular' | 'irregular' | 'unknown';
  };
  temperature: {
    value: number;
    unit: 'F' | 'C';
    site: 'oral' | 'rectal' | 'axillary' | 'tympanic' | 'temporal';
  };
  respiratoryRate: {
    value: number;
    unit: 'breaths/min';
  };
  oxygenSaturation: {
    value: number;
    unit: '%';
    onRoomAir: boolean;
  };
  weight: {
    value: number;
    unit: 'kg' | 'lbs';
  };
  height: {
    value: number;
    unit: 'cm' | 'in';
  };
  painScale?: {
    value: number; // 0-10
    description?: string;
  };
  notes?: string;
}

export interface VitalSignsProps extends Omit<BaseComponentProps<HTMLDivElement>, `on${string}$`> {
  /** Patient ID */
  patientId: string;
  /** Current vital readings */
  currentVitals?: VitalReading;
  /** Historical vital readings */
  historicalVitals?: VitalReading[];
  /** View mode - semantic purpose drives layout and functionality */
  purpose?: 'monitoring' | 'input' | 'trending' | 'comparison' | 'emergency';
  /** Enable editing/input */
  editable?: boolean;
  /** Show alerts for abnormal values */
  showAlerts?: boolean;
  /** Urgency level affects visual presentation */
  urgency?: 'routine' | 'priority' | 'urgent' | 'critical';
  /** Context determines validation rules and display */
  context?: 'outpatient' | 'inpatient' | 'emergency' | 'surgery' | 'icu';
  /** Reference ranges for alerts */
  referenceRanges?: {
    bloodPressure: { systolic: [number, number]; diastolic: [number, number] };
    heartRate: [number, number];
    temperature: [number, number];
    respiratoryRate: [number, number];
    oxygenSaturation: [number, number];
  };
  /** Event handlers */
  onVitalSave$?: QRL<(vital: VitalReading) => void>;
  onVitalUpdate$?: QRL<(vital: VitalReading) => void>;
  onAlertAcknowledge$?: QRL<(alertType: string) => void>;
}

/**
 * VitalSigns Component (Semantic-First Enhanced)
 * 
 * Comprehensive vital signs display and input component following semantic-first design principles.
 * The component's behavior and appearance are driven by semantic purpose and medical context.
 * 
 * Semantic Features:
 * - Purpose-driven layout: 'monitoring', 'input', 'trending', 'comparison', 'emergency'
 * - Context-aware validation: 'outpatient', 'inpatient', 'emergency', 'surgery', 'icu'
 * - Urgency-based styling: 'routine', 'priority', 'urgent', 'critical'
 * - Healthcare-optimized user experience with HIPAA considerations
 * - Accessibility-first design with proper ARIA labels and screen reader support
 * 
 * @example
 * ```tsx
 * // Emergency monitoring with critical urgency
 * <VitalSigns 
 *   patientId="patient_123"
 *   purpose="emergency"
 *   urgency="critical"
 *   context="emergency"
 *   currentVitals={currentVitals}
 *   showAlerts={true}
 *   onVitalSave$={$((vital) => handleEmergencySave(vital))}
 * />
 * 
 * // Routine outpatient monitoring
 * <VitalSigns 
 *   patientId="patient_456"
 *   purpose="monitoring"
 *   urgency="routine"
 *   context="outpatient"
 *   currentVitals={currentVitals}
 *   editable={true}
 * />
 * 
 * // ICU trending view
 * <VitalSigns 
 *   patientId="patient_789"
 *   purpose="trending"
 *   urgency="priority"
 *   context="icu"
 *   currentVitals={currentVitals}
 *   historicalVitals={historicalVitals}
 * />
 * ```
 */
export const VitalSignsSemantic = component$<VitalSignsProps>((props) => {
  const {
    currentVitals,
    historicalVitals = [],
    purpose = 'monitoring',
    editable = false,
    showAlerts = true,
    urgency = 'routine',
    context = 'outpatient',
    referenceRanges,
    onVitalSave$,
    class: qwikClass,
    className,
    style,
    ..._rest
  } = props;
  const showInputForm = useSignal(purpose === 'input');
  const newVital = useStore<Partial<VitalReading>>({
    timestamp: new Date().toISOString(),
    measuredBy: '',
    bloodPressure: { systolic: 0, diastolic: 0, unit: 'mmHg' },
    heartRate: { value: 0, unit: 'bpm', rhythm: 'regular' },
    temperature: { value: 0, unit: 'F', site: 'oral' },
    respiratoryRate: { value: 0, unit: 'breaths/min' },
    oxygenSaturation: { value: 0, unit: '%', onRoomAir: true },
    weight: { value: 0, unit: 'kg' },
    height: { value: 0, unit: 'cm' }
  });

  // Context-aware reference ranges
  const getContextualRanges = () => {
    const baseRanges = {
      bloodPressure: { systolic: [90, 140], diastolic: [60, 90] },
      heartRate: [60, 100],
      temperature: [97, 99.5], // Fahrenheit
      respiratoryRate: [12, 20],
      oxygenSaturation: [95, 100]
    };

    // Adjust ranges based on medical context
    switch (context) {
      case 'emergency':
      case 'icu':
        return {
          ...baseRanges,
          bloodPressure: { systolic: [100, 160], diastolic: [65, 100] },
          heartRate: [50, 120],
          oxygenSaturation: [92, 100]
        };
      case 'surgery':
        return {
          ...baseRanges,
          bloodPressure: { systolic: [100, 180], diastolic: [60, 110] },
          heartRate: [45, 130]
        };
      default:
        return baseRanges;
    }
  };

  const ranges = referenceRanges || getContextualRanges();

  // Urgency-based styling
  const getUrgencyStyles = () => {
    switch (urgency) {
      case 'critical':
        return {
          cardPurpose: 'alert' as const,
          headerColor: 'error' as const,
          borderStyle: 'border-2 border-error-normal shadow-error-normal/20 bg-gradient-to-br from-error-lighter to-error-lighter/50',
          container: 'bg-gradient-to-br from-error-lighter to-error-lighter/50 border-error-light shadow-xl ring-2 ring-error-light/50',
          header: 'bg-gradient-to-r from-error-dark to-error-dark text-white',
          accent: 'text-error-dark',
          vitalsCard: 'bg-white/90 backdrop-blur-sm border-error-light shadow-lg hover:shadow-xl transition-all duration-300'
        };
      case 'urgent':
        return {
          cardPurpose: 'alert' as const,
          headerColor: 'warning' as const,
          borderStyle: 'border-2 border-warning-normal shadow-warning-normal/20 bg-gradient-to-br from-warning-lighter to-warning-lighter/50',
          container: 'bg-gradient-to-br from-warning-lighter to-warning-lighter/50 border-warning-light shadow-lg ring-1 ring-warning-light/50',
          header: 'bg-gradient-to-r from-warning-dark to-warning-dark text-white',
          accent: 'text-warning-dark',
          vitalsCard: 'bg-white/90 backdrop-blur-sm border-warning-light shadow-md hover:shadow-lg transition-all duration-300'
        };
      case 'priority':
        return {
          cardPurpose: 'dashboard' as const,
          headerColor: 'info' as const,
          borderStyle: 'border border-primary-300 bg-gradient-to-br from-info-lighter to-info-lighter/50',
          container: 'bg-gradient-to-br from-info-lighter to-info-lighter/50 border-info-light shadow-md ring-1 ring-info-light/30',
          header: 'bg-gradient-to-r from-info-dark to-primary-dark text-white',
          accent: 'text-primary-dark',
          vitalsCard: 'bg-white/90 backdrop-blur-sm border-info-light shadow-sm hover:shadow-md transition-all duration-300'
        };
      default:
        return {
          cardPurpose: 'dashboard' as const,
          headerColor: 'primary' as const,
          borderStyle: 'border border-neutral-light bg-gradient-to-br from-neutral-lighter to-neutral-lighter/50',
          container: 'bg-gradient-to-br from-neutral-lighter to-neutral-lighter/50 border-neutral-light shadow-sm',
          header: 'bg-gradient-to-r from-neutral-dark to-neutral-darker text-white',
          accent: 'text-neutral-dark',
          vitalsCard: 'bg-white/90 backdrop-blur-sm border-neutral-light shadow-sm hover:shadow-md transition-all duration-300'
        };
    }
  };

  const urgencyStyles = getUrgencyStyles();

  // Purpose-driven layout configuration
  const getPurposeConfig = () => {
    switch (purpose) {
      case 'emergency':
        return {
          showTrending: false,
          showDetailed: true,
          autoRefresh: true,
          highlightAbnormal: true,
          compactView: false,
          showBMI: false,
          gridCols: { sm: 2, md: 4 }
        };
      case 'trending':
        return {
          showTrending: true,
          showDetailed: false,
          autoRefresh: false,
          highlightAbnormal: false,
          compactView: true,
          showBMI: true,
          gridCols: { sm: 1, md: 2, lg: 4 }
        };
      case 'input':
        return {
          showTrending: false,
          showDetailed: false,
          autoRefresh: false,
          highlightAbnormal: false,
          compactView: false,
          showBMI: false,
          gridCols: { sm: 1 }
        };
      case 'comparison':
        return {
          showTrending: true,
          showDetailed: true,
          autoRefresh: false,
          highlightAbnormal: true,
          compactView: false,
          showBMI: true,
          gridCols: { sm: 1, md: 2, lg: 3 }
        };
      default: // monitoring
        return {
          showTrending: false,
          showDetailed: true,
          autoRefresh: false,
          highlightAbnormal: true,
          compactView: false,
          showBMI: true,
          gridCols: { sm: 1, md: 2, lg: 3, xl: 4 }
        };
    }
  };

  const purposeConfig = getPurposeConfig();

  // Context-aware validation
  const isVitalNormal = (vital: VitalReading) => {
    const alerts = [];
    
    // Blood pressure
    if (vital.bloodPressure.systolic < ranges.bloodPressure.systolic[0] || 
        vital.bloodPressure.systolic > ranges.bloodPressure.systolic[1]) {
      alerts.push('Blood Pressure (Systolic)');
    }
    if (vital.bloodPressure.diastolic < ranges.bloodPressure.diastolic[0] || 
        vital.bloodPressure.diastolic > ranges.bloodPressure.diastolic[1]) {
      alerts.push('Blood Pressure (Diastolic)');
    }
    
    // Heart rate
    if (vital.heartRate.value < ranges.heartRate[0] || vital.heartRate.value > ranges.heartRate[1]) {
      alerts.push('Heart Rate');
    }
    
    // Temperature
    const tempF = vital.temperature.unit === 'F' ? vital.temperature.value : (vital.temperature.value * 9/5) + 32;
    if (tempF < ranges.temperature[0] || tempF > ranges.temperature[1]) {
      alerts.push('Temperature');
    }
    
    // Respiratory rate
    if (vital.respiratoryRate.value < ranges.respiratoryRate[0] || vital.respiratoryRate.value > ranges.respiratoryRate[1]) {
      alerts.push('Respiratory Rate');
    }
    
    // Oxygen saturation
    if (vital.oxygenSaturation.value < ranges.oxygenSaturation[0] || vital.oxygenSaturation.value > ranges.oxygenSaturation[1]) {
      alerts.push('Oxygen Saturation');
    }
    
    return alerts;
  };

  // Calculate BMI with semantic categorization
  const calculateBMI = (weight: number, height: number, weightUnit: 'kg' | 'lbs', heightUnit: 'cm' | 'in') => {
    const weightKg = weightUnit === 'kg' ? weight : weight * 0.453592;
    const heightM = heightUnit === 'cm' ? height / 100 : height * 0.0254;
    
    if (weightKg <= 0 || heightM <= 0) return null;
    
    return (weightKg / (heightM * heightM)).toFixed(1);
  };

  // BMI categorization with semantic color mapping for Badge
  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { text: 'Underweight', color: 'warning' as const };
    if (bmi < 25) return { text: 'Normal', color: 'success' as const };
    if (bmi < 30) return { text: 'Overweight', color: 'warning' as const };
    return { text: 'Obese', color: 'error' as const };
  };

  // Advanced semantic validation with predictive alerts
  const getSemanticValidation = (vital: VitalReading, contextType: VitalSignsProps['context']) => {
    const validations: Array<{
      type: 'error' | 'warning' | 'info';
      message: string;
      recommendation?: string;
    }> = [];

    // Blood pressure semantic validation
    if (vital.bloodPressure) {
      const systolic = vital.bloodPressure.systolic;
      const diastolic = vital.bloodPressure.diastolic;

      if (systolic >= 180 || diastolic >= 120) {
        validations.push({
          type: 'error',
          message: 'Hypertensive Crisis detected',
          recommendation: contextType === 'emergency' 
            ? 'Immediate IV antihypertensive therapy required'
            : 'Urgent cardiology consultation needed'
        });
      } else if (systolic >= 140 || diastolic >= 90) {
        validations.push({
          type: 'warning',
          message: 'Hypertension Stage 2',
          recommendation: contextType === 'outpatient' 
            ? 'Lifestyle modifications + dual therapy'
            : 'Consider medication adjustment'
        });
      } else if (systolic < 90 || diastolic < 60) {
        validations.push({
          type: 'warning',
          message: 'Hypotension detected',
          recommendation: contextType === 'icu' 
            ? 'Consider vasopressor support'
            : 'Monitor for symptoms and hydration status'
        });
      }
    }

    // Heart rate contextual validation
    if (vital.heartRate) {
      const hr = vital.heartRate.value;
      
      if (hr > 100) {
        const severity = hr > 150 ? 'error' : 'warning';
        validations.push({
          type: severity,
          message: hr > 150 ? 'Severe Tachycardia' : 'Tachycardia',
          recommendation: contextType === 'emergency' && hr > 150
            ? 'Consider cardiac monitoring and antiarrhythmic therapy'
            : 'Evaluate for underlying causes (fever, dehydration, anxiety)'
        });
      } else if (hr < 60) {
        validations.push({
          type: 'warning',
          message: 'Bradycardia',
          recommendation: contextType === 'icu'
            ? 'Monitor for hemodynamic compromise'
            : 'Assess for medications affecting heart rate'
        });
      }
    }

    // Pain scale contextual interpretation
    if (vital.painScale && vital.painScale.value >= 7) {
      validations.push({
        type: 'error',
        message: 'Severe pain reported',
        recommendation: contextType === 'emergency'
          ? 'Immediate pain management protocol'
          : 'Reassess pain management strategy'
      });
    }

    return validations;
  };

  // Context-aware tooltip content generator
  const getSemanticTooltip = (metric: 'bloodPressure' | 'heartRate' | 'painScale' | 'temperature', contextType: VitalSignsProps['context']) => {
    const tooltips = {
      bloodPressure: {
        emergency: "Critical for hemodynamic status. Target <140/90 unless contraindicated.",
        icu: "Continuous monitoring essential. MAP >65 mmHg typically required.",
        outpatient: "Home readings preferred. Multiple readings needed for diagnosis.",
        monitoring: "Automated readings every 15-30 minutes during active monitoring."
      },
      heartRate: {
        emergency: "Immediate arrhythmia assessment if >100 or <60 bpm.",
        icu: "Continuous telemetry. Rate and rhythm equally important.",
        outpatient: "Normal range 60-100 bpm. Consider patient's baseline.",
        monitoring: "Trending more important than single values."
      },
      painScale: {
        emergency: "Rapid assessment crucial. Severe pain (7-10) needs immediate attention.",
        icu: "Critical for sedation management and comfort care.",
        outpatient: "Functional impact assessment important for chronic pain.",
        monitoring: "Regular reassessment after interventions."
      },
      temperature: {
        emergency: "Fever workup if >100.4°F. Hypothermia concerning if <95°F.",
        icu: "Strict monitoring for infection control and neurologic protection.",
        outpatient: "Consider time of day variation and recent activities.",
        monitoring: "Core temperature more accurate than peripheral."
      }
    };

    const contextKey = contextType || 'monitoring';
    return tooltips[metric]?.[contextKey as keyof typeof tooltips.bloodPressure] || tooltips[metric]?.monitoring || "No specific guidance available.";
  };

  // Format timestamp with context awareness
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const options: Intl.DateTimeFormatOptions = context === 'emergency' || context === 'icu' 
      ? { hour: 'numeric', minute: '2-digit', second: '2-digit' }
      : { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' };
    
    return date.toLocaleString('en-US', options);
  };

  // Trend analysis for context
  const getTrend = (current: number, previous: number) => {
    const change = current - previous;
    const percentChange = Math.abs((change / previous) * 100);
    
    if (percentChange < 5) return null; // No significant change
    
    if (current > previous) return { 
      icon: 'trending-up' as const, 
      intent: 'warning' as const, 
      direction: 'up',
      change: `+${percentChange.toFixed(1)}%`
    };
    
    return { 
      icon: 'trending-down' as const, 
      intent: 'info' as const, 
      direction: 'down',
      change: `-${percentChange.toFixed(1)}%`
    };
  };

  // Save vital with validation
  const saveVital = $(() => {
    if (newVital.bloodPressure?.systolic && newVital.bloodPressure?.diastolic && newVital.measuredBy) {
      const vital: VitalReading = {
        id: `vital_${Date.now()}`,
        timestamp: newVital.timestamp || new Date().toISOString(),
        measuredBy: newVital.measuredBy || '',
        bloodPressure: newVital.bloodPressure as VitalReading['bloodPressure'],
        heartRate: newVital.heartRate as VitalReading['heartRate'],
        temperature: newVital.temperature as VitalReading['temperature'],
        respiratoryRate: newVital.respiratoryRate as VitalReading['respiratoryRate'],
        oxygenSaturation: newVital.oxygenSaturation as VitalReading['oxygenSaturation'],
        weight: newVital.weight as VitalReading['weight'],
        height: newVital.height as VitalReading['height'],
        painScale: newVital.painScale,
        notes: newVital.notes
      };
      
      onVitalSave$?.(vital);
      showInputForm.value = false;
    }
  });

  const rootClasses = mergeClasses(
    `${urgencyStyles.borderStyle} p-4 rounded-lg`,
    qwikClass,
    className
  );

  return (
    <div class="themed-content">
      <div 
        class={rootClasses}
        style={style}
        id={props.id}
        aria-label={props['aria-label']}
      >
        <Card>
          {/* Semantic Header with Context Awareness */}
          <Card.Header>
            <div class="space-y-2">
              <Row alignItems="center" justifyContent="between">
                <Text as="h2" color={urgencyStyles.headerColor}>
                  Vital Signs {context !== 'outpatient' && `(${context.toUpperCase()})`}
                </Text>
                {urgency === 'critical' && (
                  <Badge color="error" class="animate-pulse">
                    CRITICAL
                  </Badge>
                )}
                {urgency === 'urgent' && (
                  <Badge color="warning">
                    URGENT
                  </Badge>
                )}
              </Row>
              
              {editable && (
                <Button
                  intent={showInputForm.value ? "neutral" : "primary"}
                  size="sm"
                  onClick$={() => showInputForm.value = !showInputForm.value}
                >
                  {showInputForm.value ? 'Cancel Input' : 'Record Vitals'}
                </Button>
              )}
            </div>
          </Card.Header>

          {/* Context-Aware Alerts */}
          {currentVitals && showAlerts && (
            (() => {
              const alerts = isVitalNormal(currentVitals);
              return alerts.length > 0 && (
                <Alert color="error" class="mb-4">
                  <Row alignItems="center">
                    <Icon icon="alert-triangle" class="w-5 h-5 text-error-500 mr-3" />
                    <div>
                      <Text as="h3" size="sm" weight="medium">
                        Abnormal Vital Signs Detected
                      </Text>
                      <Text as="p" size="sm" class="mt-1">
                        {context === 'emergency' ? 'IMMEDIATE ATTENTION REQUIRED: ' : ''}
                        {alerts.join(', ')} outside normal ranges for {context} setting
                      </Text>
                    </div>
                  </Row>
                </Alert>
              );
            })()
          )}

          {/* Input Form with Purpose-Driven Layout */}
          {showInputForm.value && (
            <Card.Body>
              <Card>
                <Card.Header>
                  <Text as="h3">Record New Vitals - {context.charAt(0).toUpperCase() + context.slice(1)} Setting</Text>
                </Card.Header>
                <Card.Body>
                  <Row gap="4">
                    {/* Required fields based on context */}
                    <Column size={{ sm: 1, md: 2, lg: 3 }} class="col-span-full">
                      <Text as="label" size="sm" weight="medium">
                        Measured By <Text as="span" color="error">*</Text>
                      </Text>
                      <Input
                        type="text"
                        value={newVital.measuredBy || ''}
                        onInput$={(e) => newVital.measuredBy = (e.target as HTMLInputElement).value}
                        placeholder="Enter your name"
                        required
                        class="mt-1"
                      />
                    </Column>

                    {/* Blood Pressure - Always Critical */}
                    <Column size={{ sm: 1, md: 2, lg: 3 }} class="col-span-full">
                      <Text as="label" size="sm" weight="medium">
                        Blood Pressure <Text as="span" color="error">*</Text>
                      </Text>
                      <Row gap="2" class="mt-1">
                        <Input
                          value={String(newVital.bloodPressure?.systolic || '')}
                          onInput$={(e) => {
                            if (newVital.bloodPressure) {
                              newVital.bloodPressure.systolic = parseInt((e.target as HTMLInputElement).value) || 0;
                            }
                          }}
                          placeholder="Systolic"
                        />
                        <Text as="span" class="self-center">/</Text>
                        <Input
                          value={String(newVital.bloodPressure?.diastolic || '')}
                          onInput$={(e) => {
                            if (newVital.bloodPressure) {
                              newVital.bloodPressure.diastolic = parseInt((e.target as HTMLInputElement).value) || 0;
                            }
                          }}
                          placeholder="Diastolic"
                        />
                      </Row>
                      <Text as="span" size="xs" color="secondary">mmHg</Text>
                    </Column>

                    {/* Heart Rate */}
                    <Column size={{ sm: 1, md: 2, lg: 3 }} class="col-span-full">
                      <Text as="label" size="sm" weight="medium">Heart Rate</Text>
                      <div class="space-y-2 mt-1">
                        <Input
                          value={String(newVital.heartRate?.value || '')}
                          onInput$={(e) => {
                            if (newVital.heartRate) {
                              newVital.heartRate.value = parseInt((e.target as HTMLInputElement).value) || 0;
                            }
                          }}
                          placeholder="Heart rate"
                        />
                        <select
                          value={newVital.heartRate?.rhythm || 'regular'}
                          onChange$={(e) => {
                            if (newVital.heartRate) {
                              newVital.heartRate.rhythm = (e.target as HTMLSelectElement).value as 'regular' | 'irregular' | 'unknown';
                            }
                          }}
                          class="p-2 border border-neutral-light rounded-md focus:ring-2 focus:ring-primary-normal focus:border-primary-500 w-full"
                        >
                          <option value="regular">Regular</option>
                          <option value="irregular">Irregular</option>
                          <option value="unknown">Unknown</option>
                        </select>
                      </div>
                      <Text as="span" size="xs" color="secondary">bpm</Text>
                    </Column>

                    {/* Pain Scale - Context Dependent */}
                    {(context === 'emergency' || context === 'surgery') && (
                      <div>
                        <Text as="label" size="sm" weight="medium">Pain Scale (0-10)</Text>
                        <Input
                          value={String(newVital.painScale?.value || '')}
                          onInput$={(e) => {
                            const value = parseInt((e.target as HTMLInputElement).value);
                            if (value >= 0 && value <= 10) {
                              newVital.painScale = { value, description: newVital.painScale?.description };
                            }
                          }}
                          placeholder="0-10"
                          class="mt-1"
                        />
                      </div>
                    )}

                    {/* Notes */}
                    <Column size={{ sm: 1, md: 2, lg: 3 }} class="col-span-full">
                      <Textarea
                        purpose="notes"
                        label="Clinical Notes"
                        value={newVital.notes || ''}
                        onChange$={(value) => newVital.notes = value}
                        placeholder={`Clinical observations for ${context} setting...`}
                        rows={3}
                        helperText={`Record clinical observations and findings for ${context} care`}
                        fullWidth={true}
                      />
                    </Column>
                  </Row>
                </Card.Body>
                
                <Card.Footer>
                  <div class="flex justify-end space-x-2">
                    <Button
                      intent="neutral"
                      onClick$={() => showInputForm.value = false}
                    >
                      Cancel
                    </Button>
                    <Button
                      intent="primary"
                      onClick$={saveVital}
                    >
                      Save Vitals
                    </Button>
                  </div>
                </Card.Footer>
              </Card>
            </Card.Body>
          )}

          {/* Current Vitals Display with Purpose-Driven Layout */}
          {currentVitals && purpose !== 'input' && (
            <Card.Body>
              {/* Semantic Validation Alerts */}
              {(() => {
                const validations = getSemanticValidation(currentVitals, context);
                return validations.length > 0 && (
                  <div class="mb-6 space-y-2">
                    {validations.map((validation, index) => (
                      <Alert
                        key={index}
                        color={validation.type === 'error' ? 'error' : validation.type === 'warning' ? 'warning' : 'info'}
                        variant="soft"
                        class="flex items-start space-x-2"
                      >
                        <Icon 
                          icon={validation.type === 'error' ? 'alert-triangle' : validation.type === 'warning' ? 'alert-triangle' : 'bell'} 
                          class="w-4 h-4 mt-0.5 flex-shrink-0" 
                        />
                        <div class="flex-1">
                          <div class="font-medium">{validation.message}</div>
                          {validation.recommendation && (
                            <div class="text-sm mt-1 opacity-90">
                              <Text weight="bold">Recommendation:</Text> {validation.recommendation}
                            </div>
                          )}
                        </div>
                      </Alert>
                    ))}
                  </div>
                );
              })()}

              <Row gap="4">
                {/* Blood Pressure with Semantic Tooltip */}
                <Column size={purposeConfig.gridCols}>
                <Tooltip content={getSemanticTooltip('bloodPressure', context)}>
                  <Card class={`relative group transition-all duration-300 hover:scale-105 ${urgencyStyles.vitalsCard}`}>
                    <Card.Body class="p-6">
                      <div class="flex items-center justify-between mb-4">
                        <Text as="h4" weight="semibold" size="lg" class={urgencyStyles.accent}>Blood Pressure</Text>
                        <div class="p-2 rounded-full bg-error-lighter">
                          <Icon icon="heart" class="w-6 h-6 text-error-normal" />
                        </div>
                      </div>
                      <div class="space-y-2">
                        <Text as="div" size="xl" weight="bold" class="font-mono tracking-tight text-3xl">
                          {currentVitals.bloodPressure.systolic}/{currentVitals.bloodPressure.diastolic}
                        </Text>
                        <div class="flex items-center gap-2">
                          <Text as="div" size="sm" color="secondary" class="font-medium">mmHg</Text>
                          {(() => {
                            const { systolic, diastolic } = currentVitals.bloodPressure;
                            const isHigh = systolic > ranges.bloodPressure.systolic[1] || diastolic > ranges.bloodPressure.diastolic[1];
                            const isLow = systolic < ranges.bloodPressure.systolic[0] || diastolic < ranges.bloodPressure.diastolic[0];
                            if (isHigh) return <Badge color="error" size="sm" class="animate-pulse">HIGH</Badge>;
                            if (isLow) return <Badge color="warning" size="sm">LOW</Badge>;
                            return <Badge color="success" size="sm">NORMAL</Badge>;
                          })()}
                        </div>
                      </div>
                    
                    {/* Trending for comparison/monitoring */}
                    {purposeConfig.showTrending && historicalVitals.length > 0 && (() => {
                      const prevVital = historicalVitals[historicalVitals.length - 1];
                      const trend = getTrend(currentVitals.bloodPressure.systolic, prevVital.bloodPressure.systolic);
                      return trend && (
                        <div class="flex items-center mt-3 p-2 bg-info-lighter rounded-lg">
                          <Icon icon={trend.icon} class="w-4 h-4 mr-2 text-primary-normal" />
                          <Text as="span" size="sm" color="blue-700" weight="medium">
                            {trend.change} vs previous
                          </Text>
                        </div>
                      );
                    })()}
                  </Card.Body>
                </Card>
                </Tooltip>
                </Column>

                {/* Heart Rate with Semantic Tooltip */}
                <Column size={purposeConfig.gridCols}>
                <Tooltip content={getSemanticTooltip('heartRate', context)}>
                  <Card class={`relative group transition-all duration-300 hover:scale-105 ${urgencyStyles.vitalsCard}`}>
                    <Card.Body class="p-6">
                      <div class="flex items-center justify-between mb-4">
                        <Text as="h4" weight="semibold" size="lg" class={urgencyStyles.accent}>Heart Rate</Text>
                        <div class="p-2 rounded-full bg-info-lighter">
                          <Icon icon="activity" class="w-6 h-6 text-primary-normal" />
                        </div>
                      </div>
                      <div class="space-y-2">
                        <Text as="div" size="xl" weight="bold" class="font-mono tracking-tight text-3xl">{currentVitals.heartRate.value}</Text>
                        <div class="flex items-center gap-2">
                          <Text as="div" size="sm" color="secondary" class="font-medium">
                            bpm ({currentVitals.heartRate.rhythm})
                          </Text>
                          {(() => {
                            const hr = currentVitals.heartRate.value;
                            const isHigh = hr > ranges.heartRate[1];
                            const isLow = hr < ranges.heartRate[0];
                            if (isHigh) return <Badge color="error" size="sm" class="animate-pulse">HIGH</Badge>;
                            if (isLow) return <Badge color="warning" size="sm">LOW</Badge>;
                            return <Badge color="success" size="sm">NORMAL</Badge>;
                          })()}
                        </div>
                      </div>
                  </Card.Body>
                </Card>
                </Tooltip>
                </Column>

                {/* Temperature with Semantic Tooltip */}
                <Column size={purposeConfig.gridCols}>
                <Tooltip content={getSemanticTooltip('temperature', context)}>
                  <Card class={`relative group transition-all duration-300 hover:scale-105 ${urgencyStyles.vitalsCard}`}>
                    <Card.Body class="p-6">
                      <div class="flex items-center justify-between mb-4">
                      <Text as="h4" weight="semibold" size="lg" class={urgencyStyles.accent}>Temperature</Text>
                      <div class="p-2 rounded-full bg-warning-lighter">
                        <Icon icon="thermometer" class="w-6 h-6 text-warning-normal" />
                      </div>
                    </div>
                    <div class="space-y-2">
                      <Text as="div" size="xl" weight="bold" class="font-mono tracking-tight text-3xl">
                        {currentVitals.temperature.value}°{currentVitals.temperature.unit}
                      </Text>
                      <div class="flex items-center gap-2">
                        <Text as="div" size="sm" color="secondary" transform="capitalize" class="font-medium">
                          {currentVitals.temperature.site}
                        </Text>
                        {(() => {
                          const temp = currentVitals.temperature.value;
                          const isHigh = temp > ranges.temperature[1];
                          const isLow = temp < ranges.temperature[0];
                          if (isHigh) return <Badge color="error" size="sm" class="animate-pulse">FEVER</Badge>;
                          if (isLow) return <Badge color="warning" size="sm">LOW</Badge>;
                          return <Badge color="success" size="sm">NORMAL</Badge>;
                        })()}
                      </div>
                    </div>
                  </Card.Body>
                </Card>
                </Tooltip>
                </Column>

                {/* BMI - Show based on purpose */}
                {purposeConfig.showBMI && (() => {
                  const bmi = calculateBMI(
                    currentVitals.weight.value,
                    currentVitals.height.value,
                    currentVitals.weight.unit,
                    currentVitals.height.unit
                  );
                  return bmi && (
                    <Column size={purposeConfig.gridCols}>
                      <Card>
                      <Card.Body>
                        <div class="flex items-center justify-between mb-2">
                          <Text as="h4" weight="medium">BMI</Text>
                          <Icon icon="weight" class="w-5 h-5 text-info-normal" />
                        </div>
                        <Text as="div" size="xl" weight="bold">{bmi}</Text>
                        <Badge color={getBMICategory(Number(bmi)).color} size="sm">
                          {getBMICategory(Number(bmi)).text}
                        </Badge>
                      </Card.Body>
                    </Card>
                    </Column>
                  );
                })()}

                {/* Pain Scale - Context Dependent */}
                {currentVitals.painScale && (context === 'emergency' || context === 'surgery') && (
                  <Column size={purposeConfig.gridCols}>
                    <Card>
                    <Card.Body>
                      <div class="flex items-center justify-between mb-2">
                        <Text as="h4" weight="medium">Pain Scale</Text>
                        <Icon icon="alert-triangle" class="w-5 h-5 text-error-500" />
                      </div>
                      <Text as="div" size="xl" weight="bold">{currentVitals.painScale.value}/10</Text>
                      {currentVitals.painScale.description && (
                        <Text as="div" size="sm" color="secondary">{currentVitals.painScale.description}</Text>
                      )}
                    </Card.Body>
                  </Card>
                  </Column>
                )}
              </Row>

              {/* Measurement Info */}
              <Column size={purposeConfig.gridCols} class="mt-6 pt-4 border-t border-neutral-light">
                <div class="flex justify-between items-center">
                  <Text as="span" size="sm" color="secondary">
                    Measured by: {currentVitals.measuredBy}
                  </Text>
                  <Text as="span" size="sm" color="secondary">
                    {formatTimestamp(currentVitals.timestamp)}
                  </Text>
                </div>
                {currentVitals.notes && (
                  <div class="mt-2">
                    <Text as="p" size="sm">
                      <Text as="strong">Notes:</Text> {currentVitals.notes}
                    </Text>
                  </div>
                )}
              </Column>
            </Card.Body>
          )}

          {/* Historical Trending - Purpose Dependent */}
          {purposeConfig.showTrending && historicalVitals.length > 0 && (
            <Card.Body class="border-t border-neutral-light">
              <Text as="h3" class="mb-4">Vital Signs Trend</Text>
              <div class="overflow-x-auto">
                <Table variant="striped" size="sm" hoverable responsive>
                  <TableHeader>
                    <TableRow>
                      <TableCell header class="px-4 py-3 text-left text-xs font-medium text-neutral-normal uppercase tracking-wider">
                        Date/Time
                      </TableCell>
                      <TableCell header class="px-4 py-3 text-left text-xs font-medium text-neutral-normal uppercase tracking-wider">
                        Blood Pressure
                      </TableCell>
                      <TableCell header class="px-4 py-3 text-left text-xs font-medium text-neutral-normal uppercase tracking-wider">
                        Heart Rate
                      </TableCell>
                      <TableCell header class="px-4 py-3 text-left text-xs font-medium text-neutral-normal uppercase tracking-wider">
                        Temperature
                      </TableCell>
                      <TableCell header class="px-4 py-3 text-left text-xs font-medium text-neutral-normal uppercase tracking-wider">
                        SpO2
                      </TableCell>
                      <TableCell header class="px-4 py-3 text-left text-xs font-medium text-neutral-normal uppercase tracking-wider">
                        Measured By
                      </TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historicalVitals.slice(-5).reverse().map((vital) => (
                      <TableRow key={vital.id}>
                        <TableCell class="px-4 py-3 whitespace-nowrap">
                          <div class="text-sm">
                            <div class="font-medium text-neutral-darker">
                              {formatTimestamp(vital.timestamp)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell class="px-4 py-3 whitespace-nowrap text-sm text-neutral-darker">
                          <div class="font-medium">
                            {vital.bloodPressure.systolic}/{vital.bloodPressure.diastolic}
                          </div>
                          <div class="text-xs text-neutral-normal">{vital.bloodPressure.unit}</div>
                        </TableCell>
                        <TableCell class="px-4 py-3 whitespace-nowrap text-sm text-neutral-darker">
                          <div class="font-medium">{vital.heartRate.value}</div>
                          <div class="text-xs text-neutral-normal">{vital.heartRate.unit} • {vital.heartRate.rhythm}</div>
                        </TableCell>
                        <TableCell class="px-4 py-3 whitespace-nowrap text-sm text-neutral-darker">
                          <div class="font-medium">
                            {vital.temperature.value}°{vital.temperature.unit}
                          </div>
                          <div class="text-xs text-neutral-normal">{vital.temperature.site}</div>
                        </TableCell>
                        <TableCell class="px-4 py-3 whitespace-nowrap text-sm text-neutral-darker">
                          <div class="font-medium">{vital.oxygenSaturation.value}%</div>
                          <div class="text-xs text-neutral-normal">
                            {vital.oxygenSaturation.onRoomAir ? 'Room Air' : 'Supplemental O2'}
                          </div>
                        </TableCell>
                        <TableCell class="px-4 py-3 whitespace-nowrap text-sm text-neutral-normal">
                          {vital.measuredBy}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card.Body>
          )}
        </Card>
      </div>
    </div>
  );
});
