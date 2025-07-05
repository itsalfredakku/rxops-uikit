// Simple script to create a fixed Grid implementation for health-dashboard
import { promises as fs } from 'fs';

async function createFixedHealthDashboard() {
  const fixedContent = `import { component$, useSignal } from '@builder.io/qwik';
import { Icon } from '../../../core/atoms/icon/index';
import { Text } from '../../../core/atoms/text/text';
import { Card } from '../../../core/organisms/card/card';
import { Button } from '../../../core/atoms/button/button';
import { Badge } from '../../../core/atoms/badge';
import { Row, Column, Stack } from '../../../layouts';
import { BaseComponentProps, mergeClasses } from '../../../design-system/props';
import { Grid } from "../../../layouts/grid/grid";

export interface HealthMetric {
  id: string;
  name: string;
  value: number | string;
  unit: string;
  lastUpdated: string;
  trend: 'up' | 'down' | 'stable';
  status: 'normal' | 'warning' | 'critical';
  targetRange?: {
    min?: number;
    max?: number;
  };
  history?: Array<{
    date: string;
    value: number;
  }>;
}

export interface Appointment {
  id: string;
  title: string;
  provider: string;
  date: string;
  time: string;
  type: 'consultation' | 'follow-up' | 'test' | 'procedure';
  status: 'scheduled' | 'confirmed' | 'pending' | 'completed' | 'cancelled';
  location?: string;
  isVirtual?: boolean;
}

export interface HealthAlert {
  id: string;
  type: 'medication' | 'appointment' | 'vital' | 'test' | 'general';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  date: string;
  read: boolean;
  actions?: Array<{
    label: string;
    action: string;
  }>;
}

export interface MedicationReminder {
  id: string;
  medicationName: string;
  dosage: string;
  time: string;
  taken: boolean;
  skipped: boolean;
  late: boolean;
}

export interface HealthDashboardProps extends Omit<BaseComponentProps<HTMLDivElement>, \`on\${string}$\`> {
  /** Patient ID */
  patientId: string;
  /** Patient name to display in welcome message */
  patientName: string;
  /** Health metrics to display */
  metrics: HealthMetric[];
  /** Upcoming appointments */
  upcomingAppointments: Appointment[];
  /** Health alerts */
  alerts: HealthAlert[];
  /** Medication reminders */
  medicationReminders: MedicationReminder[];
  /** Called when a metric is clicked */
  onMetricClick?: (metric: HealthMetric) => void;
  /** Called when an appointment is clicked */
  onAppointmentClick?: (appointment: Appointment) => void;
  /** Called when an alert action is clicked */
  onAlertAction?: (alertId: string, action: string) => void;
  /** Called when a medication action is taken */
  onMedicationAction?: (medicationId: string, action: 'taken' | 'skip') => void;
  /** Called when the add metric button is clicked */
  onAddMetric?: () => void;
  /** Called when the schedule appointment button is clicked */
  onScheduleAppointment?: () => void;
  /** Whether to show quick action buttons */
  showQuickActions?: boolean;
}

export const HealthDashboard = component$<HealthDashboardProps>((props) => {
  const {
    patientName,
    metrics = [],
    upcomingAppointments = [],
    alerts = [],
    medicationReminders = [],
    onMetricClick,
    onAppointmentClick,
    onAlertAction,
    onMedicationAction,
    onAddMetric,
    onScheduleAppointment,
    showQuickActions = true,
    class: qwikClass,
    className,
    style,
    ...rest
  } = props;

  const selectedTimeRange = useSignal<'24h' | '7d' | '30d' | '90d'>('7d');
  const showAllAlerts = useSignal(false);

  const metricIcons = {
    'Blood Pressure': 'heart' as const,
    'Heart Rate': 'activity' as const,
    'Temperature': 'thermometer' as const,
    'Blood Sugar': 'activity' as const, // We don't have droplets icon, use activity
    'Weight': 'weight' as const,
    'Steps': 'activity' as const,
    'Sleep': 'clock' as const
  };

  const statusColors = {
    normal: 'text-green-600 bg-green-50 border-green-200',
    warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    critical: 'text-red-600 bg-red-50 border-red-200'
  };

  const severityColors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800'
  };

  const appointmentTypeColors = {
    consultation: 'bg-blue-100 text-blue-800',
    'follow-up': 'bg-green-100 text-green-800',
    test: 'bg-purple-100 text-purple-800',
    procedure: 'bg-orange-100 text-orange-800'
  };

  const getTrendIcon = (trend: string): 'trending-up' | 'trending-down' | 'activity' => {
    switch (trend) {
      case 'up': return 'trending-up';
      case 'down': return 'trending-down';
      default: return 'activity';
    }
  };

  const getTrendColor = (trend: string, status: string) => {
    if (status === 'critical') return 'text-red-500';
    if (status === 'warning') return 'text-yellow-500';
    
    switch (trend) {
      case 'up': return 'text-green-500';
      case 'down': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(\`2000-01-01T\${timeString}\`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const priorityAlerts = alerts.filter(alert => alert.severity === 'high' || alert.severity === 'critical');
  const unreadAlerts = alerts.filter(alert => !alert.read);
  const todayReminders = medicationReminders.filter(reminder => !reminder.taken && !reminder.skipped);

  const MetricCard = component$<{ metric: HealthMetric }>((props) => {
    const { metric } = props;
    const iconName = metricIcons[metric.name as keyof typeof metricIcons] || 'activity';
    const trendIcon = getTrendIcon(metric.trend);

    return (
      <div 
        class={\`bg-white rounded-lg border p-4 hover:shadow-md transition-shadow cursor-pointer \${statusColors[metric.status]}\`}
        onClick$={() => onMetricClick && onMetricClick(metric)}
      >
        <Row alignItems="center" justifyContent="between" class="mb-3">
          <Row alignItems="center" gap="2">
            <Icon icon={iconName} class="w-5 h-5" />
            <h4 class="font-medium text-gray-900">{metric.name}</h4>
          </Row>
          <Icon icon={trendIcon} class={\`w-4 h-4 \${getTrendColor(metric.trend, metric.status)}\`} />
        </Row>
        
        <div class="mb-2">
          <span class="text-2xl font-bold text-gray-900">
            {metric.value}
          </span>
          <span class="text-sm text-gray-600 ml-1">{metric.unit}</span>
        </div>

        {metric.targetRange && (
          <div class="text-xs text-gray-500 mb-2">
            Target: {metric.targetRange.min || '0'} - {metric.targetRange.max || '∞'}
          </div>
        )}

        <div class="text-xs text-gray-500">
          Updated {formatDate(metric.lastUpdated)}
        </div>
      </div>
    );
  });

  const AppointmentCard = component$<{ appointment: Appointment }>((props) => {
    const { appointment } = props;

    return (
      <div 
        class="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-shadow cursor-pointer"
        onClick$={() => onAppointmentClick && onAppointmentClick(appointment)}
      >
        <Row alignItems="start" justifyContent="between" class="mb-2">
          <div class="flex-1">
            <h4 class="font-medium text-gray-900 text-sm">{appointment.title}</h4>
            <p class="text-sm text-gray-600">Dr. {appointment.provider}</p>
          </div>
          <span class={\`px-2 py-1 text-xs font-medium rounded-full \${appointmentTypeColors[appointment.type]}\`}>
            {appointment.type}
          </span>
        </Row>
        
        <Row alignItems="center" justifyContent="between" class="text-sm">
          <Row alignItems="center" gap="4">
            <Row alignItems="center" class="text-gray-600">
              <Icon icon="calendar" class="w-4 h-4 mr-1" />
              {formatDate(appointment.date)}
            </Row>
            <Row alignItems="center" class="text-gray-600">
              <Icon icon="clock" class="w-4 h-4 mr-1" />
              {appointment.time}
            </Row>
          </Row>
          {appointment.isVirtual && (
            <span class="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
              Virtual
            </span>
          )}
        </Row>
      </div>
    );
  });

  const AlertCard = component$<{ alert: HealthAlert }>((props) => {
    const { alert } = props;

    return (
      <div class={\`bg-white rounded-md border p-3 \${!alert.read ? 'border-l-4 border-l-blue-500' : 'border-gray-200'}\`}>
        <Row alignItems="start" justifyContent="between" class="mb-2">
          <Row alignItems="start" gap="2" class="flex-1">
            <Icon icon="alert-triangle" class="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
            <div class="flex-1">
              <h4 class="font-medium text-gray-900 text-sm">{alert.title}</h4>
              <p class="text-sm text-gray-600 mt-1">{alert.message}</p>
            </div>
          </Row>
          <span class={\`px-2 py-1 text-xs font-medium rounded-full \${severityColors[alert.severity]}\`}>
            {alert.severity}
          </span>
        </Row>
        
        <Row alignItems="center" justifyContent="between">
          <span class="text-xs text-gray-500">{formatDate(alert.date)}</span>
          {alert.actions && (
            <Row alignItems="center" gap="2">
              {alert.actions.map((action, index) => (
                <button
                  key={index}
                  onClick$={() => onAlertAction && onAlertAction(alert.id, action.action)}
                  class="text-xs px-2 py-1 text-blue-600 hover:bg-blue-50 rounded"
                >
                  {action.label}
                </button>
              ))}
            </Row>
          )}
        </Row>
      </div>
    );
  });

  const MedicationCard = component$<{ reminder: MedicationReminder }>((props) => {
    const { reminder } = props;

    return (
      <div class="bg-white rounded-lg border border-gray-200 p-3">
        <Row alignItems="center" justifyContent="between" class="mb-2">
          <div class="flex-1">
            <h4 class="font-medium text-gray-900 text-sm">{reminder.medicationName}</h4>
            <p class="text-sm text-gray-600">{reminder.dosage}</p>
          </div>
          <Row alignItems="center" gap="2">
            {reminder.late && (
              <span class="text-xs bg-red-50 text-red-700 px-2 py-1 rounded">
                Late
              </span>
            )}
            <span class="text-sm text-gray-600">{formatTime(reminder.time)}</span>
          </Row>
        </Row>
        
        <Row alignItems="center" gap="2">
          <button
            onClick$={() => onMedicationAction && onMedicationAction(reminder.id, 'taken')}
            class="flex items-center px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <Icon icon="check-circle" class="w-4 h-4 mr-1" />
            Taken
          </button>
          <button
            onClick$={() => onMedicationAction && onMedicationAction(reminder.id, 'skip')}
            class="flex items-center px-3 py-1 text-sm bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            <Icon icon="bell" class="w-4 h-4 mr-1" />
            Skip
          </button>
        </Row>
      </div>
    );
  });

  const rootClasses = mergeClasses(
    'health-dashboard space-y-6',
    qwikClass,
    className
  );

  return (
    <div 
      class={rootClasses}
      style={style}
      {...rest}
    >
      {/* Header */}
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <Row alignItems="center" justifyContent="between" class="mb-4">
          <Column>
            <h1 class="text-2xl font-bold text-gray-900">Health Dashboard</h1>
            <p class="text-gray-600">Welcome back, {patientName}</p>
          </Column>
          {showQuickActions && (
            <Row alignItems="center" gap="3">
              <button
                onClick$={onAddMetric}
                class="flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Icon icon="plus" class="w-4 h-4 mr-1" />
                Add Metric
              </button>
              <button
                onClick$={onScheduleAppointment}
                class="flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Icon icon="calendar" class="w-4 h-4 mr-1" />
                Schedule
              </button>
              <button class="p-2 text-gray-400 hover:text-gray-600">
                <Icon icon="settings" class="w-5 h-5" />
              </button>
            </Row>
          )}
        </Row>

        {/* Summary Stats */}
        <Grid cols={{ md: 4 }} gap="4">
          <Column alignItems="center">
            <div class="text-2xl font-bold text-blue-600">{metrics.length}</div>
            <div class="text-sm text-gray-600">Health Metrics</div>
          </Column>
          <Column alignItems="center">
            <div class="text-2xl font-bold text-green-600">{upcomingAppointments.length}</div>
            <div class="text-sm text-gray-600">Appointments</div>
          </Column>
          <Column alignItems="center">
            <div class="text-2xl font-bold text-orange-600">{unreadAlerts.length}</div>
            <div class="text-sm text-gray-600">New Alerts</div>
          </Column>
          <Column alignItems="center">
            <div class="text-2xl font-bold text-purple-600">{todayReminders.length}</div>
            <div class="text-sm text-gray-600">Medications Due</div>
          </Column>
        </Grid>
      </div>

      {/* Priority Alerts */}
      {priorityAlerts.length > 0 && (
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <Row alignItems="center" justifyContent="between" class="mb-4">
            <Row alignItems="center">
              <Icon icon="bell" class="w-5 h-5 mr-2 text-red-500" />
              <h2 class="text-lg font-semibold text-gray-900">Priority Alerts</h2>
            </Row>
            <span class="text-sm text-gray-500">({priorityAlerts.length})</span>
          </Row>
          <Stack gap="3">
            {priorityAlerts.slice(0, 3).map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </Stack>
        </div>
      )}

      {/* Main Content Grid */}
      <Grid cols={{ lg: 3 }} gap="6">
        {/* Health Metrics */}
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <Row alignItems="center" justifyContent="between" class="mb-4">
              <h2 class="text-lg font-semibold text-gray-900">Health Metrics</h2>
              <Row alignItems="center" gap="2">
                <select
                  value={selectedTimeRange.value}
                  onChange$={(e) => selectedTimeRange.value = (e.target as HTMLSelectElement).value as '24h' | '7d' | '30d' | '90d'}
                  class="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="24h">24 Hours</option>
                  <option value="7d">7 Days</option>
                  <option value="30d">30 Days</option>
                  <option value="90d">90 Days</option>
                </select>
              </Row>
            </Row>
            
            {metrics.length === 0 ? (
              <Column alignItems="center" class="py-8">
                <Icon icon="activity" class="w-12 h-12 text-gray-400 mb-4" />
                <p class="text-gray-500">No health metrics recorded</p>
                {onAddMetric && (
                  <button
                    onClick$={onAddMetric}
                    class="mt-4 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md"
                  >
                    Add your first metric
                  </button>
                )}
              </Column>
            ) : (
              <Grid cols={{ md: 2 }} gap="4">
                {metrics.map((metric) => (
                  <MetricCard key={metric.id} metric={metric} />
                ))}
              </Grid>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div class="space-y-6">
          {/* Upcoming Appointments */}
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <Row alignItems="center" justifyContent="between" class="mb-4">
              <h3 class="text-lg font-semibold text-gray-900">Upcoming Appointments</h3>
              <span class="text-sm text-gray-500">({upcomingAppointments.length})</span>
            </Row>
            
            {upcomingAppointments.length === 0 ? (
              <Column alignItems="center" class="py-4">
                <Icon icon="calendar" class="w-8 h-8 text-gray-400 mb-2" />
                <p class="text-sm text-gray-500">No upcoming appointments</p>
              </Column>
            ) : (
              <Stack gap="3">
                {upcomingAppointments.slice(0, 3).map((appointment) => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
                ))}
                {upcomingAppointments.length > 3 && (
                  <button class="w-full text-sm text-blue-600 hover:text-blue-800 py-2">
                    View all appointments
                  </button>
                )}
              </Stack>
            )}
          </div>

          {/* Medication Reminders */}
          {todayReminders.length > 0 && (
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <Row alignItems="center" justifyContent="between" class="mb-4">
                <h3 class="text-lg font-semibold text-gray-900">Medications Due</h3>
                <span class="text-sm text-gray-500">({todayReminders.length})</span>
              </Row>
              
              <Stack gap="3">
                {todayReminders.map((reminder) => (
                  <MedicationCard key={reminder.id} reminder={reminder} />
                ))}
              </Stack>
            </div>
          )}

          {/* Recent Alerts */}
          {alerts.length > 0 && (
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <Row alignItems="center" justifyContent="between" class="mb-4">
                <h3 class="text-lg font-semibold text-gray-900">Recent Alerts</h3>
                <button
                  onClick$={() => showAllAlerts.value = !showAllAlerts.value}
                  class="text-sm text-blue-600 hover:text-blue-800"
                >
                  {showAllAlerts.value ? 'Show Less' : 'View All'}
                </button>
              </Row>
              
              <Stack gap="3">
                {(showAllAlerts.value ? alerts : alerts.slice(0, 3)).map((alert) => (
                  <AlertCard key={alert.id} alert={alert} />
                ))}
              </Stack>
            </div>
          )}
        </div>
      </Grid>
    </div>
  );
});
`;
  
  try {
    // Write the fixed content to the output file
    const outputPath = '/Volumes/EXT/RxOps/ui/src/healthcare/patient/health-dashboard/health-dashboard.fixed.tsx';
    await fs.writeFile(outputPath, fixedContent);
    console.log(`Fixed Grid implementation written to ${outputPath}`);
  } catch (error) {
    console.error('Error writing fixed file:', error);
  }
}

createFixedHealthDashboard();
