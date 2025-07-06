import { component$, useSignal } from '@builder.io/qwik';
import { Icon } from '../../../core/atoms/icon/index';
import { Text } from '../../../core/atoms/text/text';
import { Card } from '../../../core/organisms/card/card';
import { Button } from '../../../core/atoms/button/button';
import { Badge } from '../../../core/atoms/badge';
import { List, ListItem } from '../../../core/organisms/list/list';
import { Column } from '../../../layouts';
import { Stack } from '../../../layouts';
import { BaseComponentProps, mergeClasses } from '../../../design-system/props';
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

export interface HealthDashboardProps extends Omit<BaseComponentProps<HTMLDivElement>, `on${string}$`> {
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

// Helper functions outside component to avoid serialization issues
const getTrendIcon = (trend: string): 'trending-up' | 'trending-down' | 'activity' => {
  switch (trend) {
    case 'up': return 'trending-up';
    case 'down': return 'trending-down';
    default: return 'activity';
  }
};

const getTrendColor = (trend: string, status: string) => {
  if (status === 'critical') return 'text-error-500';
  if (status === 'warning') return 'text-warning-500';
  
  switch (trend) {
    case 'up': return 'text-success-500';
    case 'down': return 'text-error-500';
    default: return 'text-neutral-normal';
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
};

const formatTime = (timeString: string) => {
  return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

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
    normal: 'text-success-dark bg-success-lighter border-success-light',
    warning: 'text-warning-dark bg-warning-lighter border-warning-light',
    critical: 'text-error-dark bg-error-lighter border-error-light'
  };

  const severityColors = {
    low: 'bg-primary-lighter text-primary-darker',
    medium: 'bg-warning-lighter text-warning-darker',
    high: 'bg-warning-light text-warning-darker',
    critical: 'bg-error-lighter text-error-darker'
  };

  const appointmentTypeColors = {
    consultation: 'bg-primary-lighter text-primary-darker',
    'follow-up': 'bg-success-lighter text-success-darker',
    test: 'bg-info-lighter text-info-darker',
    procedure: 'bg-warning-lighter text-warning-darker'
  };

  const priorityAlerts = alerts.filter(alert => alert.severity === 'high' || alert.severity === 'critical');
  const unreadAlerts = alerts.filter(alert => !alert.read);
  const todayReminders = medicationReminders.filter(reminder => !reminder.taken && !reminder.skipped);

  const MetricCard = component$<{ metric: HealthMetric }>((props) => {
    const { metric } = props;
    const iconName = metricIcons[metric.name as keyof typeof metricIcons] || 'activity';
    const trendIcon = getTrendIcon(metric.trend);

    return (
      <Card
        variant="outlined"
        padding="4"
        class={`hover:shadow-md transition-shadow cursor-pointer ${statusColors[metric.status]}`}
        onClick$={() => onMetricClick && onMetricClick(metric)}
      >
        <Stack direction="row" alignItems="center" justifyContent="between" class="mb-3">
          <Stack direction="row" alignItems="center" gap="2">
            <Icon icon={iconName} class="w-5 h-5" />
            <Text as="h4" weight="medium" size="sm">{metric.name}</Text>
          </Stack>
          <Icon icon={trendIcon} class={`w-4 h-4 ${getTrendColor(metric.trend, metric.status)}`} />
        </Stack>
        
        <div class="mb-2">
          <Text as="span" size="xl" weight="bold" color="gray-900">
            {metric.value}
          </Text>
          <Text as="span" size="sm" color="gray-600" class="ml-1">{metric.unit}</Text>
        </div>

        {metric.targetRange && (
          <Text size="xs" color="gray-500" class="mb-2">
            Target: {metric.targetRange.min || '0'} - {metric.targetRange.max || '∞'}
          </Text>
        )}

        <Text size="xs" color="gray-500">
          Updated {formatDate(metric.lastUpdated)}
        </Text>
      </Card>
    );
  });

  const AppointmentCard = component$<{ appointment: Appointment }>((props) => {
    const { appointment } = props;

    return (
      <Card
        variant="outlined"
        padding="3"
        class="hover:shadow-md transition-shadow cursor-pointer"
        onClick$={() => onAppointmentClick && onAppointmentClick(appointment)}
      >
        <Stack direction="row" alignItems="start" justifyContent="between" class="mb-2">
          <div class="flex-1">
            <Text as="h4" weight="medium" size="xs">{appointment.title}</Text>
            <Text as="p" size="sm" color="gray-600">Dr. {appointment.provider}</Text>
          </div>
          <Badge variant="outlined" size="sm" class={appointmentTypeColors[appointment.type]}>
            {appointment.type}
          </Badge>
        </Stack>
        
        <Stack direction="row" alignItems="center" justifyContent="between" wrap="wrap" class="text-sm">
          <Stack direction="row" alignItems="center" gap="4" wrap="wrap">
            <Stack direction="row" alignItems="center" class="text-neutral-normal">
              <Icon icon="calendar" class="w-4 h-4 mr-1" />
              <Text size="sm" color="gray-600">{formatDate(appointment.date)}</Text>
            </Stack>
            <Stack direction="row" alignItems="center" class="text-neutral-normal">
              <Icon icon="clock" class="w-4 h-4 mr-1" />
              <Text size="sm" color="gray-600">{appointment.time}</Text>
            </Stack>
          </Stack>
          {appointment.isVirtual && (
            <Badge variant="flat" size="sm" color="primary">
              Virtual
            </Badge>
          )}
        </Stack>
      </Card>
    );
  });

  const AlertCard = component$<{ alert: HealthAlert }>((props) => {
    const { alert } = props;

    return (
      <Card
        variant="outlined"
        padding="3"
        class={!alert.read ? 'border-l-4 border-l-primary-normal' : ''}
      >
        <Stack direction="row" alignItems="start" justifyContent="between" wrap="wrap" class="mb-2">
          <Stack direction="row" alignItems="start" gap="2" class="flex-1 min-w-0">
            <Icon icon="alert-triangle" class="w-4 h-4 text-warning-500 mt-0.5 flex-shrink-0" />
            <div class="flex-1 min-w-0">
              <Text as="h4" weight="medium" size="xs">{alert.title}</Text>
              <Text as="p" size="sm" color="gray-600" class="mt-1">{alert.message}</Text>
            </div>
          </Stack>
          <Badge variant="flat" size="sm" class={severityColors[alert.severity]}>
            {alert.severity}
          </Badge>
        </Stack>
        
        <Stack direction="row" alignItems="center" justifyContent="between" wrap="wrap">
          <Text size="xs" color="gray-500">{formatDate(alert.date)}</Text>
          {alert.actions && (
            <Stack direction="row" alignItems="center" gap="2" wrap="wrap">
              {alert.actions.map((action, index) => (
                <Button
                  key={index}
                  onClick$={() => onAlertAction && onAlertAction(alert.id, action.action)}
                  variant="text"
                  size="xs"
                  color="primary"
                >
                  {action.label}
                </Button>
              ))}
            </Stack>
          )}
        </Stack>
      </Card>
    );
  });

  const MedicationCard = component$<{ reminder: MedicationReminder }>((props) => {
    const { reminder } = props;

    return (
      <Card variant="outlined" padding="3">
        <Stack direction="row" alignItems="center" justifyContent="between" wrap="wrap" class="mb-2">
          <div class="flex-1 min-w-0">
            <Text as="h4" weight="medium" size="xs">{reminder.medicationName}</Text>
            <Text as="p" size="sm" color="gray-600">{reminder.dosage}</Text>
          </div>
          <Stack direction="row" alignItems="center" gap="2" wrap="wrap">
            {reminder.late && (
              <Badge variant="flat" size="sm" color="error">
                Late
              </Badge>
            )}
            <Text size="sm" color="gray-600">{formatTime(reminder.time)}</Text>
          </Stack>
        </Stack>
        
        <Stack direction="row" alignItems="center" gap="2" wrap="wrap">
          <Button
            onClick$={() => onMedicationAction && onMedicationAction(reminder.id, 'taken')}
            variant="flat"
            size="sm"
            color="success"
          >
            <Icon icon="check-circle" class="w-4 h-4 mr-1" />
            Taken
          </Button>
          <Button
            onClick$={() => onMedicationAction && onMedicationAction(reminder.id, 'skip')}
            variant="flat"
            size="sm"
            color="secondary"
          >
            <Icon icon="bell" class="w-4 h-4 mr-1" />
            Skip
          </Button>
        </Stack>
      </Card>
    );
  });

  const rootClasses = mergeClasses(
    'health-dashboard space-y-6',
    qwikClass,
    className
  );

  return (
    <div class="themed-content">
      <div 
        class={rootClasses}
        style={style}
        {...rest}
      >
        {/* Header */}
        <Card variant="elevated" padding="6">
          <Stack direction="row" alignItems="center" justifyContent="between" wrap="wrap" class="mb-4">
            <Column>
              <Text as="h1" weight="bold" size="xl">Health Dashboard</Text>
              <Text as="p" color="gray-600">Welcome back, {patientName}</Text>
            </Column>
            {showQuickActions && (
              <Stack direction="row" alignItems="center" gap="3" wrap="wrap">
                <Button
                  onClick$={onAddMetric}
                  variant="flat"
                  size="sm"
                  color="primary"
                >
                  <Icon icon="plus" class="w-4 h-4 mr-1" />
                  Add Metric
                </Button>
                <Button
                  onClick$={onScheduleAppointment}
                  variant="elevated"
                  size="sm"
                  color="primary"
                >
                  <Icon icon="calendar" class="w-4 h-4 mr-1" />
                  Schedule
                </Button>
                <Button variant="text" size="sm" color="secondary">
                  <Icon icon="settings" class="w-5 h-5" />
                </Button>
              </Stack>
            )}
          </Stack>

          {/* Summary Stats */}
          <Stack direction="row" gap="4" wrap="wrap">
            <Column alignItems="center">
              <Text size="xl" weight="bold" color="primary">{metrics.length}</Text>
              <Text size="sm" color="gray-600">Health Metrics</Text>
            </Column>
            <Column alignItems="center">
              <Text size="xl" weight="bold" color="success">{upcomingAppointments.length}</Text>
              <Text size="sm" color="gray-600">Appointments</Text>
            </Column>
            <Column alignItems="center">
              <Text size="xl" weight="bold" color="warning">{unreadAlerts.length}</Text>
              <Text size="sm" color="gray-600">New Alerts</Text>
            </Column>
            <Column alignItems="center">
              <Text size="xl" weight="bold" color="info">{todayReminders.length}</Text>
              <Text size="sm" color="gray-600">Medications Due</Text>
            </Column>
          </Stack>
        </Card>

        {/* Priority Alerts */}
        {priorityAlerts.length > 0 && (
          <Card variant="elevated" padding="6">
            <Stack direction="row" alignItems="center" justifyContent="between" wrap="wrap" class="mb-4">
              <Stack direction="row" alignItems="center" gap="2">
                <Icon icon="bell" class="w-5 h-5 text-error-500" />
                <Text as="h2" weight="semibold" size="lg">Priority Alerts</Text>
              </Stack>
              <Text size="sm" color="gray-500">({priorityAlerts.length})</Text>
            </Stack>
            <List variant="none" size="sm" class="space-y-3">
              {priorityAlerts.slice(0, 3).map((alert) => (
                <ListItem key={alert.id}>
                  <AlertCard alert={alert} />
                </ListItem>
              ))}
            </List>
          </Card>
        )}

        {/* Main Content Grid */}
        <Stack direction="row" gap="6" wrap="wrap">
          {/* Health Metrics */}
          <div class="lg:col-span-2">
            <Card variant="elevated" padding="6">
              <Stack direction="row" alignItems="center" justifyContent="between" wrap="wrap" class="mb-4">
                <Text as="h2" weight="semibold" size="lg">Health Metrics</Text>
                <Stack direction="row" alignItems="center" gap="2" wrap="wrap">
                  <select
                    value={selectedTimeRange.value}
                    onChange$={(e) => selectedTimeRange.value = (e.target as HTMLSelectElement).value as '24h' | '7d' | '30d' | '90d'}
                    class="text-sm border border-neutral-light rounded-md px-2 py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-normal focus-visible:ring-offset-2 focus:ring-2 focus:ring-primary-normal"
                  >
                    <option value="24h">24 Hours</option>
                    <option value="7d">7 Days</option>
                    <option value="30d">30 Days</option>
                    <option value="90d">90 Days</option>
                  </select>
                </Stack>
              </Stack>
              
              {metrics.length === 0 ? (
                <Column alignItems="center" class="py-8">
                  <Icon icon="activity" class="w-12 h-12 text-neutral-light mb-4" />
                  <Text as="p" color="gray-500">No health metrics recorded</Text>
                  {onAddMetric && (
                    <Button
                      onClick$={onAddMetric}
                      variant="text"
                      size="sm"
                      color="primary"
                      class="mt-4"
                    >
                      Add your first metric
                    </Button>
                  )}
                </Column>
              ) : (
                <Stack direction="row" gap="4" wrap="wrap">
                  {metrics.map((metric) => (
                    <MetricCard key={metric.id} metric={metric} />
                  ))}
                </Stack>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div class="space-y-6">
            {/* Upcoming Appointments */}
            <Card variant="elevated" padding="6">
              <Stack direction="row" alignItems="center" justifyContent="between" wrap="wrap" class="mb-4">
                <Text as="h3" weight="semibold" size="md">Upcoming Appointments</Text>
                <Text size="sm" color="gray-500">({upcomingAppointments.length})</Text>
              </Stack>
              
              {upcomingAppointments.length === 0 ? (
                <Column alignItems="center" class="py-4">
                  <Icon icon="calendar" class="w-8 h-8 text-neutral-light mb-2" />
                  <Text as="p" size="sm" color="gray-500">No upcoming appointments</Text>
                </Column>
              ) : (
                <List variant="none" size="sm" class="space-y-3">
                  {upcomingAppointments.slice(0, 3).map((appointment) => (
                    <ListItem key={appointment.id}>
                      <AppointmentCard appointment={appointment} />
                    </ListItem>
                  ))}
                  {upcomingAppointments.length > 3 && (
                    <ListItem>
                      <Button variant="text" size="sm" color="primary" class="w-full py-2">
                        View all appointments
                      </Button>
                    </ListItem>
                  )}
                </List>
              )}
            </Card>

            {/* Medication Reminders */}
            {todayReminders.length > 0 && (
              <Card variant="elevated" padding="6">
                <Stack direction="row" alignItems="center" justifyContent="between" class="mb-4">
                  <Text as="h3" weight="semibold" size="md">Medications Due</Text>
                  <Text size="sm" color="gray-500">({todayReminders.length})</Text>
                </Stack>
                
                <List variant="none" size="sm" class="space-y-3">
                  {todayReminders.map((reminder) => (
                    <ListItem key={reminder.id}>
                      <MedicationCard reminder={reminder} />
                    </ListItem>
                  ))}
                </List>
              </Card>
            )}

            {/* Recent Alerts */}
            {alerts.length > 0 && (
              <Card variant="elevated" padding="6">
                <Stack direction="row" alignItems="center" justifyContent="between" wrap="wrap" class="mb-4">
                  <Text as="h3" weight="semibold" size="md">Recent Alerts</Text>
                  <Button
                    onClick$={() => showAllAlerts.value = !showAllAlerts.value}
                    variant="text"
                    size="sm"
                    color="primary"
                  >
                    {showAllAlerts.value ? 'Show Less' : 'View All'}
                  </Button>
                </Stack>
                
                <List variant="none" size="sm" class="space-y-3">
                  {(showAllAlerts.value ? alerts : alerts.slice(0, 3)).map((alert) => (
                    <ListItem key={alert.id}>
                      <AlertCard alert={alert} />
                    </ListItem>
                  ))}
                </List>
              </Card>
            )}
          </div>
        </Stack>
      </div>
    </div>
  );
});
