import { component$, useSignal, useTask$, $, type QRL } from "@builder.io/qwik";
import { mergeClasses } from "../../../design-system/props";
import type { Color } from "../../../design-system/types";
import { Stack } from "../../../layouts/stack";
import { Row } from "../../../layouts/row";
import { Text } from "../../atoms/text/text";
import { Icon, type IconName } from "../../atoms/icon";
import { Badge } from "../../atoms/badge";
import { hipaaAuditor } from "../../../utils/hipaa";

// Vital sign types
export type VitalSignType = 
  | 'blood-pressure'
  | 'heart-rate'
  | 'temperature'
  | 'respiratory-rate'
  | 'oxygen-saturation'
  | 'blood-glucose'
  | 'weight'
  | 'height'
  | 'bmi'
  | 'pain-scale';

// Vital sign unit types
export type VitalSignUnit = 
  | 'mmHg'
  | 'bpm'
  | 'F'
  | 'C'
  | 'breaths/min'
  | '%'
  | 'mg/dL'
  | 'mmol/L'
  | 'lbs'
  | 'kg'
  | 'ft'
  | 'cm'
  | 'kg/m²'
  | '/10';

// Status based on normal ranges
export type VitalSignStatus = 'normal' | 'elevated' | 'high' | 'low' | 'critical';

// Individual vital sign reading
export interface VitalSignReading {
  id: string;
  type: VitalSignType;
  value: number | string;
  unit: VitalSignUnit;
  timestamp: string;
  status: VitalSignStatus;
  systolic?: number; // For blood pressure
  diastolic?: number; // For blood pressure
  notes?: string;
  takenBy?: {
    name: string;
    role: string;
    id: string;
  };
  location?: string; // Where reading was taken
  device?: string; // Device used for reading
  verified?: boolean;
}

// Time range for viewing
export type TimeRange = '24h' | '7d' | '30d' | '90d' | '1y' | 'all';

// Chart view mode
export type ChartMode = 'line' | 'bar' | 'table' | 'trend';

// Component props
export interface VitalSignsChartProps {
  /** List of vital sign readings */
  vitals: VitalSignReading[];
  /** Patient information */
  patient?: {
    id: string;
    name: string;
    age?: number;
    gender?: 'male' | 'female' | 'other';
  };
  /** Time range to display */
  timeRange?: TimeRange;
  /** Chart display mode */
  mode?: ChartMode;
  /** Whether to show normal ranges */
  showNormalRanges?: boolean;
  /** Whether to show trends */
  showTrends?: boolean;
  /** Whether to show alerts for abnormal values */
  showAlerts?: boolean;
  /** Compact view for smaller spaces */
  compact?: boolean;
  /** Read-only mode */
  readOnly?: boolean;
  /** CSS class names to apply */
  class?: string;
  /** Callback when reading is selected */
  onReadingSelect$?: QRL<(reading: VitalSignReading) => void>;
  /** Callback when time range changes */
  onTimeRangeChange$?: QRL<(range: TimeRange) => void>;
  /** HIPAA audit settings */
  hipaaAudit?: {
    enabled: boolean;
    patientId: string;
    providerId?: string;
  };
}

export const VitalSignsChart = component$<VitalSignsChartProps>((props) => {
  const selectedTimeRange = useSignal<TimeRange>(props.timeRange || '24h');
  const chartMode = useSignal<ChartMode>(props.mode || 'line');
  const selectedReading = useSignal<VitalSignReading | null>(null);
  const filteredVitals = useSignal<VitalSignReading[]>([]);

  // Filter vitals based on time range
  useTask$(({ track }) => {
    track(() => props.vitals);
    track(() => selectedTimeRange.value);

    const now = new Date();
    const timeRanges = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000,
      '1y': 365 * 24 * 60 * 60 * 1000,
      'all': Infinity
    };

    const cutoff = now.getTime() - timeRanges[selectedTimeRange.value];
    
    filteredVitals.value = props.vitals.filter(vital => 
      new Date(vital.timestamp).getTime() >= cutoff
    ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  });

  const logVitalAccess = $((action: string, vitalId: string) => {
    if (props.hipaaAudit?.enabled) {
      hipaaAuditor.logAccess({
        action,
        component: 'vital-signs-chart',
        itemId: vitalId,
        category: 'vital-signs',
        patientId: props.hipaaAudit.patientId,
        timestamp: new Date().toISOString()
      });
    }
  });

  const getVitalIcon = (type: VitalSignType): IconName => {
    const icons: Record<VitalSignType, IconName> = {
      'blood-pressure': 'heart',
      'heart-rate': 'activity',
      'temperature': 'thermometer',
      'respiratory-rate': 'activity',
      'oxygen-saturation': 'activity',
      'blood-glucose': 'activity',
      'weight': 'weight',
      'height': 'ruler',
      'bmi': 'activity',
      'pain-scale': 'alert-triangle'
    };
    return icons[type] || 'activity';
  };

  const getStatusColor = (status: VitalSignStatus): Color => {
    const colors: Record<VitalSignStatus, Color> = {
      normal: 'success',
      elevated: 'warning',
      high: 'error',
      low: 'warning',
      critical: 'error'
    };
    return colors[status];
  };

  const formatVitalValue = (vital: VitalSignReading): string => {
    if (vital.type === 'blood-pressure' && vital.systolic && vital.diastolic) {
      return `${vital.systolic}/${vital.diastolic}`;
    }
    return `${vital.value}`;
  };

  const getVitalDisplayName = (type: VitalSignType): string => {
    const names = {
      'blood-pressure': 'Blood Pressure',
      'heart-rate': 'Heart Rate',
      'temperature': 'Temperature',
      'respiratory-rate': 'Respiratory Rate',
      'oxygen-saturation': 'Oxygen Saturation',
      'blood-glucose': 'Blood Glucose',
      'weight': 'Weight',
      'height': 'Height',
      'bmi': 'BMI',
      'pain-scale': 'Pain Scale'
    };
    return names[type] || type;
  };

  const getNormalRange = (type: VitalSignType): string => {
    const ranges = {
      'blood-pressure': '90-120/60-80 mmHg',
      'heart-rate': '60-100 bpm',
      'temperature': '97.0-99.5°F',
      'respiratory-rate': '12-20 breaths/min',
      'oxygen-saturation': '95-100%',
      'blood-glucose': '70-100 mg/dL',
      'weight': 'Varies',
      'height': 'Varies',
      'bmi': '18.5-24.9 kg/m²',
      'pain-scale': '0-3/10'
    };
    return ranges[type] || 'See guidelines';
  };

  const groupedVitals = filteredVitals.value.reduce((acc, vital) => {
    if (!acc[vital.type]) {
      acc[vital.type] = [];
    }
    acc[vital.type].push(vital);
    return acc;
  }, {} as Record<VitalSignType, VitalSignReading[]>);

  return (
    <div
      class={mergeClasses(
        "vital-signs-chart",
        props.compact ? "space-y-3" : "space-y-4",
        props.class
      )}
      data-healthcare-element="vital-signs-chart"
    >
      {/* Header */}
      <Row gap="3" justifyContent="between" alignItems="center">
        <div>
          <Text size="lg" weight="bold">Vital Signs</Text>
          {props.patient && (
            <Text size="sm" color="secondary">
              Patient: {props.patient.name}
            </Text>
          )}
        </div>

        {/* Controls */}
        <Row gap="2" alignItems="center">
          {/* Time Range Selector */}
          <select
            class="px-3 py-1 border border-neutral-300 rounded text-sm bg-white"
            value={selectedTimeRange.value}
            onChange$={(e) => {
              const target = e.target as HTMLSelectElement;
              selectedTimeRange.value = target.value as TimeRange;
              if (props.onTimeRangeChange$) {
                props.onTimeRangeChange$(target.value as TimeRange);
              }
            }}
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
            <option value="all">All Time</option>
          </select>

          {/* Chart Mode Selector */}
          <Row gap="1">
            {(['table', 'line'] as ChartMode[]).map((mode) => (
              <button
                key={mode}
                class={mergeClasses(
                  "px-2 py-1 text-xs border rounded transition-colors",
                  chartMode.value === mode
                    ? "bg-primary-100 border-primary-300 text-primary-700"
                    : "bg-white border-neutral-300 text-neutral-600 hover:bg-neutral-50"
                )}
                onClick$={() => {
                  chartMode.value = mode;
                }}
              >
                <Icon icon={mode === 'table' ? 'clipboard' : 'activity'} size={12} />
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </Row>
        </Row>
      </Row>

      {/* Alerts for Abnormal Values */}
      {props.showAlerts && (
        <>
          {filteredVitals.value.filter(v => v.status === 'critical').length > 0 && (
            <div class="p-3 bg-error-50 border border-red-200 rounded-lg">
              <Row gap="2" alignItems="start">
                <Icon icon="alert-triangle" size={20} class="text-error-600 mt-0.5" />
                <Stack gap="1">
                  <Text weight="medium" class="text-error-800">
                    Critical Values Detected
                  </Text>
                  <Text size="sm" class="text-error-700">
                    {filteredVitals.value.filter(v => v.status === 'critical').length} critical vital sign(s) require immediate attention
                  </Text>
                </Stack>
              </Row>
            </div>
          )}
        </>
      )}

      {/* Vital Signs Content */}
      {chartMode.value === 'table' ? (
        /* Table View */
        <div class="space-y-4">
          {Object.entries(groupedVitals).map(([type, readings]) => (
            <div key={type} class="border border-neutral-200 rounded-lg overflow-hidden">
              {/* Vital Type Header */}
              <div class="bg-neutral-50 px-4 py-3 border-b border-neutral-200">
                <Row gap="3" alignItems="center" justifyContent="between">
                  <Row gap="2" alignItems="center">
                    <Icon icon={getVitalIcon(type as VitalSignType)} size={20} />
                    <Text weight="medium">{getVitalDisplayName(type as VitalSignType)}</Text>
                  </Row>
                  {props.showNormalRanges && (
                    <Text size="sm" color="secondary">
                      Normal: {getNormalRange(type as VitalSignType)}
                    </Text>
                  )}
                </Row>
              </div>

              {/* Readings Table */}
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead class="bg-neutral-25">
                    <tr class="text-left">
                      <th class="px-4 py-2 text-xs font-medium text-neutral-600">Value</th>
                      <th class="px-4 py-2 text-xs font-medium text-neutral-600">Status</th>
                      <th class="px-4 py-2 text-xs font-medium text-neutral-600">Time</th>
                      <th class="px-4 py-2 text-xs font-medium text-neutral-600">Taken By</th>
                      {!props.compact && (
                        <th class="px-4 py-2 text-xs font-medium text-neutral-600">Notes</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {readings.slice(0, 10).map((reading) => (
                      <tr
                        key={reading.id}
                        class="border-t border-neutral-100 hover:bg-neutral-25 cursor-pointer"
                        onClick$={() => {
                          selectedReading.value = reading;
                          logVitalAccess('reading-select', reading.id);
                          if (props.onReadingSelect$) {
                            props.onReadingSelect$(reading);
                          }
                        }}
                      >
                        <td class="px-4 py-3">
                          <Text weight="medium">
                            {formatVitalValue(reading)} {reading.unit}
                          </Text>
                        </td>
                        <td class="px-4 py-3">
                          <Badge 
                            color={getStatusColor(reading.status)}
                            size="sm"
                          >
                            {reading.status}
                          </Badge>
                        </td>
                        <td class="px-4 py-3">
                          <Text size="sm" color="secondary">
                            {new Date(reading.timestamp).toLocaleString()}
                          </Text>
                        </td>
                        <td class="px-4 py-3">
                          <Text size="sm">
                            {reading.takenBy?.name || 'Unknown'}
                          </Text>
                          {reading.takenBy?.role && (
                            <Text size="xs" color="secondary">
                              {reading.takenBy.role}
                            </Text>
                          )}
                        </td>
                        {!props.compact && (
                          <td class="px-4 py-3">
                            <Text size="sm" class="truncate max-w-32">
                              {reading.notes || '-'}
                            </Text>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Chart/Visual View */
        <div class="space-y-4">
          {Object.entries(groupedVitals).map(([type, readings]) => (
            <div key={type} class="border border-neutral-200 rounded-lg p-4">
              <Row gap="3" alignItems="center" justifyContent="between" class="mb-4">
                <Row gap="2" alignItems="center">
                  <Icon icon={getVitalIcon(type as VitalSignType)} size={20} />
                  <Text weight="medium">{getVitalDisplayName(type as VitalSignType)}</Text>
                </Row>
                <Row gap="2">
                  <Text size="sm" color="secondary">
                    Latest: {formatVitalValue(readings[0])} {readings[0].unit}
                  </Text>
                  <Badge color={getStatusColor(readings[0].status)} size="sm">
                    {readings[0].status}
                  </Badge>
                </Row>
              </Row>

              {/* Simple visual representation */}
              <div class="grid grid-cols-6 gap-2">
                {readings.slice(0, 6).map((reading, _index) => (
                  <div
                    key={reading.id}
                    class={mergeClasses(
                      "p-2 rounded text-center cursor-pointer transition-colors",
                      reading.status === 'normal' ? 'bg-success-50 border border-green-200' :
                      reading.status === 'elevated' ? 'bg-warning-50 border border-yellow-200' :
                      reading.status === 'high' ? 'bg-error-50 border border-red-200' :
                      reading.status === 'low' ? 'bg-orange-50 border border-orange-200' :
                      'bg-error-100 border border-red-300'
                    )}
                    onClick$={() => {
                      selectedReading.value = reading;
                      logVitalAccess('reading-select', reading.id);
                      if (props.onReadingSelect$) {
                        props.onReadingSelect$(reading);
                      }
                    }}
                  >
                    <Text size="xs" weight="medium">
                      {formatVitalValue(reading)}
                    </Text>
                    <Text size="xs" color="secondary">
                      {new Date(reading.timestamp).toLocaleDateString()}
                    </Text>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredVitals.value.length === 0 && (
        <div class="text-center py-8">
          <Icon icon="activity" size={48} class="text-neutral-400 mb-4" />
          <Text color="secondary">No vital signs found</Text>
          <Text size="sm" color="secondary">
            Vital signs will appear here when recorded
          </Text>
        </div>
      )}
    </div>
  );
});

export default VitalSignsChart;
