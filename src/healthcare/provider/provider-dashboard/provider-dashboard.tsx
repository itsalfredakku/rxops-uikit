import { component$, useSignal, $ } from '@builder.io/qwik';
import { Text } from '../../../core/atoms/text/text';
import { Card } from '../../../core/organisms/card/card';
import { Button } from '../../../core/atoms/button/button';
import { Badge } from '../../../core/atoms/badge';
import { Stack } from '../../../layouts/stack';
import { Icon } from '../../../core/atoms/icon';
import { Tooltip } from '../../../core/atoms/tooltip/tooltip';
import { BaseComponentProps, mergeClasses } from '../../../design-system/props';
export interface PatientQueueItem {
  id: string;
  patientId: string;
  patientName: string;
  appointmentId: string;
  appointmentTime: string;
  appointmentType: 'consultation' | 'follow-up' | 'emergency' | 'routine';
  priority: 'urgent' | 'high' | 'normal' | 'low';
  status: 'waiting' | 'in-progress' | 'completed' | 'missed' | 'cancelled';
  reasonForVisit: string;
  estimatedDuration: number; // in minutes
  waitTime: number; // in minutes
  roomNumber?: string;
  patientAvatar?: string;
  medicalAlerts?: string[];
  lastVitals?: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    oxygenSaturation?: number;
  };
}

export interface ProviderSchedule {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  appointments: number;
  availableSlots: number;
  status: 'active' | 'completed' | 'cancelled';
}

export interface ProviderNotification {
  id: string;
  type: 'alert' | 'message' | 'reminder' | 'emergency';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionRequired?: boolean;
  patientId?: string;
  patientName?: string;
}

export interface ProviderMetrics {
  totalPatients: number;
  todayAppointments: number;
  completedConsultations: number;
  pendingActions: number;
  averageConsultationTime: number; // in minutes
  patientSatisfactionScore: number; // 1-5 scale
  revenue: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action: string;
  shortcut?: string;
  badge?: number;
}

export interface ProviderDashboardProps extends Omit<BaseComponentProps<HTMLDivElement>, `on${string}$`> {
  providerId: string;
  providerName: string;
  specialty: string;
  /** Provider role determines dashboard layout and features */
  providerType?: 'doctor' | 'nurse' | 'ambulance' | 'specialist' | 'therapist' | 'technician';
  patientQueue: PatientQueueItem[];
  schedule: ProviderSchedule[];
  notifications: ProviderNotification[];
  metrics: ProviderMetrics;
  quickActions?: QuickAction[];
  showMetrics?: boolean;
  showNotifications?: boolean;
  showPatientQueue?: boolean;
  showSchedule?: boolean;
  onPatientSelect?: (patientId: string) => void;
  onStartConsultation?: (appointmentId: string) => void;
  onCompleteConsultation?: (appointmentId: string) => void;
  onNotificationAction?: (notificationId: string, action: string) => void;
  onQuickAction?: (actionId: string) => void;
}

export const ProviderDashboard = component$<ProviderDashboardProps>((props) => {
  const {
    providerId: _providerId,
    providerName,
    specialty,
    providerType = 'doctor',
    patientQueue,
    schedule,
    notifications,
    metrics,
    quickActions = [],
    showMetrics = true,
    showNotifications = true,
    showPatientQueue = true,
    showSchedule = true,
    onPatientSelect,
    onStartConsultation,
    onCompleteConsultation,
    onNotificationAction,
    onQuickAction,
    class: qwikClass,
    className,
    style,
    ...rest
  } = props;
  
  const activeTab = useSignal('queue');
  const selectedPatient = useSignal<string | null>(null);

  // Provider-specific responsive grid configuration
  const getMetricsGridCols = () => {
    switch (providerType) {
      case 'ambulance':
        // Ambulance providers need quick access to fewer, critical metrics
        return { sm: 1, md: 2, lg: 3 };
      case 'nurse':
        // Nurses need balanced view of patient care metrics
        return { sm: 1, md: 2, lg: 4 };
      case 'doctor':
      case 'specialist':
        // Doctors need comprehensive metrics view
        return { sm: 1, md: 2, lg: 4, xl: 5 };
      case 'technician':
        // Technicians focus on equipment and procedural metrics
        return { sm: 1, md: 2, lg: 3 };
      case 'therapist':
        // Therapists need patient progress and session metrics
        return { sm: 1, md: 2, lg: 4 };
      default:
        return { sm: 1, md: 2, lg: 4 };
    }
  };

  const _metricsGridCols = getMetricsGridCols();

  const handlePatientSelect = $((patientId: string) => {
    selectedPatient.value = patientId;
    onPatientSelect?.(patientId);
  });

  const handleStartConsultation = $((appointmentId: string) => {
    onStartConsultation?.(appointmentId);
  });

  const handleCompleteConsultation = $((appointmentId: string) => {
    onCompleteConsultation?.(appointmentId);
  });

  const handleNotificationAction = $((notificationId: string, action: string) => {
    onNotificationAction?.(notificationId, action);
  });

  const handleQuickAction = $((actionId: string) => {
    onQuickAction?.(actionId);
  });

  const _getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-error-lighter text-error-darker border-error-light';
      case 'high': return 'bg-warning-lighter text-warning-darker border-warning-light';
      case 'normal': return 'bg-primary-lighter text-primary-darker border-primary-light';
      case 'low': return 'bg-neutral-lighter text-neutral-darker border-neutral-light';
      default: return 'bg-neutral-lighter text-neutral-darker border-neutral-light';
    }
  };

  const _getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'bg-warning-lighter text-warning-darker';
      case 'in-progress': return 'bg-primary-lighter text-primary-darker';
      case 'completed': return 'bg-success-lighter text-success-darker';
      case 'missed': return 'bg-error-lighter text-error-darker';
      case 'cancelled': return 'bg-neutral-lighter text-neutral-darker';
      default: return 'bg-neutral-lighter text-neutral-darker';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return 'fas fa-exclamation-triangle text-error-normal';
      case 'high': return 'fas fa-exclamation-circle text-warning-normal';
      case 'medium': return 'fas fa-info-circle text-primary-normal';
      case 'low': return 'fas fa-info text-neutral-normal';
      default: return 'fas fa-info text-neutral-normal';
    }
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;
  const urgentPatients = patientQueue.filter(p => p.priority === 'urgent').length;
  const waitingPatients = patientQueue.filter(p => p.status === 'waiting').length;

  const dashboardClasses = mergeClasses(
    "provider-dashboard bg-neutral-lighter min-h-screen",
    qwikClass,
    className
  );

  return (
    <div 
      class={dashboardClasses}
      style={style}
      {...rest}
    >
      {/* Header */}
      <div class="bg-white border-b border-neutral-light px-6 py-4">
        <Stack direction="row" alignItems="center" justifyContent="between">
          <Stack direction="row" alignItems="center" gap="4">
            <div class="w-12 h-12 bg-primary-lighter rounded-full flex items-center justify-center">
              <Icon icon="user" class="w-6 h-6 text-primary-dark" />
            </div>
            <div>
              <Text as="h1" weight="semibold" size="xl" color="primary-darker">{providerName}</Text>
              <Text as="p" size="sm" color="neutral-dark">{specialty}</Text>
            </div>
          </Stack>
          
          <Stack direction="row" alignItems="center" gap="4">
            {/* Quick Actions */}
            {quickActions.length > 0 && (
              <Stack direction="row" alignItems="center" gap="2">
                {quickActions.map((action) => (
                  <Tooltip key={action.id} content={action.label}>
                    <Button
                      onClick$={() => handleQuickAction(action.id)}
                      variant="text"
                      size="sm"
                      class="relative"
                    >
                      <Icon icon="star" class="w-5 h-5" />
                      {action.badge && action.badge > 0 && (
                        <Badge
                          color="error"
                          variant="elevated"
                          class="absolute -top-1 -right-1 w-5 h-5 text-xs flex items-center justify-center"
                        >
                          {action.badge > 99 ? '99+' : action.badge}
                        </Badge>
                      )}
                    </Button>
                  </Tooltip>
                ))}
              </Stack>
            )}
            
            {/* Notifications */}
            {showNotifications && (
              <Button variant="text" size="sm" class="relative">
                <Icon icon="bell" class="w-5 h-5" />
                {unreadNotifications > 0 && (
                  <Badge
                    color="error"
                    variant="elevated"
                    class="absolute -top-1 -right-1 w-5 h-5 text-xs flex items-center justify-center"
                  >
                    {unreadNotifications > 99 ? '99+' : unreadNotifications}
                  </Badge>
                )}
              </Button>
            )}
          </Stack>
        </Stack>
      </div>

      <Stack direction="row" class="h-full">
        {/* Main Content */}
        <Stack class="p-6 flex-1" gap="6">
          {/* Metrics Overview */}
          {showMetrics && (
            <Stack direction="row" gap="6" wrap="wrap">
              <Card variant="elevated" padding="6">
                <Stack direction="row" alignItems="center" justifyContent="between">
                  <div>
                    <Text as="p" size="sm" weight="medium" color="neutral-dark">Today's Patients</Text>
                    <Text as="p" size="xl" weight="bold" color="neutral-darker" class="text-2xl">{metrics.todayAppointments}</Text>
                  </div>
                  <div class="w-12 h-12 bg-primary-lighter rounded-full flex items-center justify-center">
                    <Icon icon="calendar" class="w-6 h-6 text-primary-dark" />
                  </div>
                </Stack>
                <Text as="p" size="sm" color="neutral-normal" class="mt-2">
                  {metrics.completedConsultations} completed
                </Text>
              </Card>

              <Card variant="elevated" padding="6">
                <Stack direction="row" alignItems="center" justifyContent="between">
                  <div>
                    <Text as="p" size="sm" weight="medium" color="neutral-dark">Waiting Patients</Text>
                    <Text as="p" size="xl" weight="bold" color="neutral-darker" class="text-2xl">{waitingPatients}</Text>
                  </div>
                  <div class="w-12 h-12 bg-warning-lighter rounded-full flex items-center justify-center">
                    <Icon icon="clock" class="w-6 h-6 text-warning-dark" />
                  </div>
                </Stack>
                <Text as="p" size="sm" color="neutral-normal" class="mt-2">
                  {urgentPatients} urgent cases
                </Text>
              </Card>

              <Card variant="elevated" padding="6">
                <Stack direction="row" alignItems="center" justifyContent="between">
                  <div>
                    <Text as="p" size="sm" weight="medium" color="neutral-dark">Avg. Consultation</Text>
                    <Text as="p" size="xl" weight="bold" color="neutral-darker" class="text-2xl">{metrics.averageConsultationTime}m</Text>
                  </div>
                  <div class="w-12 h-12 bg-success-lighter rounded-full flex items-center justify-center">
                    <Icon icon="clock" class="w-6 h-6 text-success-dark" />
                  </div>
                </Stack>
                <Text as="p" size="sm" color="neutral-normal" class="mt-2">
                  {metrics.patientSatisfactionScore}/5 satisfaction
                </Text>
              </Card>

              <Card variant="elevated" padding="6">
                <Stack direction="row" alignItems="center" justifyContent="between">
                  <div>
                    <Text as="p" size="sm" weight="medium" color="neutral-dark">Pending Actions</Text>
                    <Text as="p" size="xl" weight="bold" color="neutral-darker" class="text-2xl">{metrics.pendingActions}</Text>
                  </div>
                  <div class="w-12 h-12 bg-warning-lighter rounded-full flex items-center justify-center">
                    <Icon icon="check" class="w-6 h-6 text-warning-dark" />
                  </div>
                </Stack>
              </Card>
            </Stack>
          )}

          {/* Navigation Tabs */}
          <div class="mb-6">
            <nav>
              <Stack direction="row" gap="1" class="bg-neutral-lighter rounded-lg p-1" wrap="wrap">
              {showPatientQueue && (
                <Button
                  onClick$={() => activeTab.value = 'queue'}
                  variant={activeTab.value === 'queue' ? 'elevated' : 'text'}
                  size="sm"
                  color={activeTab.value === 'queue' ? 'primary' : 'secondary'}
                  class="flex-1"
                >
                  Patient Queue ({waitingPatients})
                </Button>
              )}
              {showSchedule && (
                <Button
                  onClick$={() => activeTab.value = 'schedule'}
                  variant={activeTab.value === 'schedule' ? 'elevated' : 'text'}
                  size="sm"
                  color={activeTab.value === 'schedule' ? 'primary' : 'secondary'}
                  class="flex-1"
                >
                  Schedule
                </Button>
              )}
              {showNotifications && (
                <Button
                  onClick$={() => activeTab.value = 'notifications'}
                  variant={activeTab.value === 'notifications' ? 'elevated' : 'text'}
                  size="sm"
                  color={activeTab.value === 'notifications' ? 'primary' : 'secondary'}
                  class="flex-1"
                >
                  Notifications ({unreadNotifications})
                </Button>
              )}
              </Stack>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab.value === 'queue' && showPatientQueue && (
            <Card variant="elevated">
              <div class="px-6 py-4 border-b border-neutral-light">
                <Text as="h3" weight="semibold" size="lg" color="primary-darker">Patient Queue</Text>
                <Text as="p" size="sm" color="neutral-dark">{patientQueue.length} patients in queue</Text>
              </div>
              
              <div class="divide-y divide-neutral-light">
                {patientQueue.map((patient) => (
                  <div
                    key={patient.id}
                    class={`p-6 hover:bg-neutral-lighter cursor-pointer transition-colors ${
                      selectedPatient.value === patient.patientId ? 'bg-primary-lighter border-l-4 border-primary-normal' : ''
                    }`}
                    onClick$={() => handlePatientSelect(patient.patientId)}
                  >
                    <Stack direction="row" alignItems="center" justifyContent="between">
                      <Stack direction="row" alignItems="center" gap="4">
                        <div class="w-12 h-12 bg-neutral-light rounded-full flex items-center justify-center">
                          {patient.patientAvatar ? (
                            <img 
                              src={patient.patientAvatar} 
                              alt={patient.patientName} 
                              width={48}
                              height={48}
                              class="w-full h-full rounded-full object-cover" 
                            />
                          ) : (
                            <Icon icon="user" class="w-6 h-6 text-neutral-normal" />
                          )}
                        </div>
                        
                        <div class="flex-1">
                          <Stack direction="row" alignItems="center" gap="2" wrap="wrap">
                            <Text as="h4" weight="semibold" color="neutral-darker">{patient.patientName}</Text>
                            <Badge
                              variant="outlined"
                              color={patient.priority === 'urgent' ? 'error' : patient.priority === 'high' ? 'warning' : 'secondary'}
                              size="sm"
                            >
                              {patient.priority.toUpperCase()}
                            </Badge>
                            <Badge
                              variant="flat"
                              color={patient.status === 'waiting' ? 'warning' : patient.status === 'in-progress' ? 'info' : 'success'}
                              size="sm"
                            >
                              {patient.status.replace('-', ' ').toUpperCase()}
                            </Badge>
                          </Stack>
                          
                          <Stack direction="row" alignItems="center" gap="4" wrap="wrap" class="mt-1 text-sm text-neutral-dark">
                            <span><i class="fas fa-clock mr-1"></i>{patient.appointmentTime}</span>
                            <span><i class="fas fa-map-marker-alt mr-1"></i>{patient.roomNumber || 'Telehealth'}</span>
                            <span><i class="fas fa-hourglass-half mr-1"></i>Wait: {patient.waitTime}m</span>
                          </Stack>
                          
                          <Text as="p" size="sm" color="neutral-darker" class="mt-1">{patient.reasonForVisit}</Text>
                          
                          {patient.medicalAlerts && patient.medicalAlerts.length > 0 && (
                            <Stack direction="row" wrap="wrap" gap="1" class="mt-2">
                              {patient.medicalAlerts.map((alert, index) => (
                                <Badge key={index} variant="flat" color="error" size="sm">
                                  <Icon icon="alert-triangle" class="w-3 h-3 mr-1" />{alert}
                                </Badge>
                              ))}
                            </Stack>
                          )}
                          
                          {patient.lastVitals && (
                            <Stack direction="row" gap="4" wrap="wrap" class="mt-2 text-xs text-neutral-dark">
                              {patient.lastVitals.bloodPressure && (
                                <span><i class="fas fa-heartbeat mr-1"></i>BP: {patient.lastVitals.bloodPressure}</span>
                              )}
                              {patient.lastVitals.heartRate && (
                                <span><i class="fas fa-heart mr-1"></i>HR: {patient.lastVitals.heartRate}</span>
                              )}
                              {patient.lastVitals.temperature && (
                                <span><i class="fas fa-thermometer-half mr-1"></i>Temp: {patient.lastVitals.temperature}°F</span>
                              )}
                            </Stack>
                          )}
                        </div>
                      </Stack>
                      
                      <Stack direction="row" alignItems="center" gap="2">
                        {patient.status === 'waiting' && (
                          <Button
                            intent="primary"
                            size="sm"
                            onClick$={() => handleStartConsultation(patient.appointmentId)}
                          >
                            Start
                          </Button>
                        )}
                        {patient.status === 'in-progress' && (
                          <Button
                            intent="success"
                            size="sm"
                            onClick$={() => handleCompleteConsultation(patient.appointmentId)}
                          >
                            Complete
                          </Button>
                        )}
                      </Stack>
                    </Stack>
                  </div>
                ))}
                
                {patientQueue.length === 0 && (
                  <div class="p-12 text-center">
                    <i class="fas fa-users text-neutral-light text-4xl mb-4"></i>
                    <Text as="h3" weight="medium" size="lg" color="neutral-darker" class="mb-2">No patients in queue</Text>
                    <Text as="p" color="neutral-dark">Your patient queue is empty. Great job!</Text>
                  </div>
                )}
              </div>
            </Card>
          )}

          {activeTab.value === 'schedule' && showSchedule && (
            <div class="bg-white rounded-lg shadow-sm border border-neutral-light">
              <div class="px-6 py-4 border-b border-neutral-light">
                <Text as="h3" weight="semibold" size="lg" color="primary-darker">Today's Schedule</Text>
              </div>
              
              <div class="p-6">
                <Stack gap="4">
                  {schedule.map((slot) => (
                    <Stack direction="row" alignItems="center" justifyContent="between" class="p-4 border border-neutral-light rounded-lg" key={slot.id}>
                      <div>
                        <Stack direction="row" alignItems="center" gap="2" wrap="wrap">
                          <span class="font-medium text-neutral-darker">{slot.startTime} - {slot.endTime}</span>
                          <span class={`px-2 py-1 text-xs font-medium rounded-full ${
                            slot.status === 'active' ? 'bg-success-lighter text-success-darker' :
                            slot.status === 'completed' ? 'bg-primary-lighter text-primary-darker' :
                            'bg-neutral-lighter text-neutral-darker'
                          }`}>
                            {slot.status.toUpperCase()}
                          </span>
                        </Stack>
                        <Text as="p" size="sm" color="neutral-dark" class="mt-1">
                          {slot.appointments} appointments • {slot.availableSlots} slots available
                        </Text>
                      </div>
                    </Stack>
                  ))}
                </Stack>
              </div>
            </div>
          )}

          {activeTab.value === 'notifications' && showNotifications && (
            <Card variant="elevated">
              <div class="px-6 py-4 border-b border-neutral-light">
                <Text as="h3" weight="semibold" size="lg" color="warning-darker">Notifications</Text>
                <Text as="p" size="sm" color="neutral-dark">{unreadNotifications} unread notifications</Text>
              </div>
              
              <div class="divide-y divide-neutral-light">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    class={`p-6 ${!notification.read ? 'bg-primary-lighter' : 'hover:bg-neutral-lighter'} transition-colors`}
                  >
                    <Stack direction="row" alignItems="start" gap="3">
                      <div class="flex-shrink-0">
                        <i class={getSeverityIcon(notification.severity)}></i>
                      </div>
                      
                      <div class="flex-1">
                        <Stack direction="row" alignItems="start" justifyContent="between">
                          <div>
                            <Text as="h4" weight="medium" color="neutral-darker">{notification.title}</Text>
                            {notification.patientName && (
                              <Text as="p" size="sm" color="neutral-dark">Patient: {notification.patientName}</Text>
                            )}
                            <Text as="p" size="sm" color="neutral-darker" class="mt-1">{notification.message}</Text>
                            <Text as="p" size="sm" color="neutral-normal" class="mt-2">
                              {new Date(notification.timestamp).toLocaleDateString()} at {new Date(notification.timestamp).toLocaleTimeString()}
                            </Text>
                          </div>
                          
                          {!notification.read && (
                            <div class="w-2 h-2 bg-primary-normal rounded-full"></div>
                          )}
                        </Stack>
                        
                        {notification.actionRequired && (
                          <Stack direction="row" gap="2" class="mt-3">
                            <Button
                              onClick$={() => handleNotificationAction(notification.id, 'acknowledge')}
                              variant="elevated"
                              color="primary"
                              size="sm"
                            >
                              Acknowledge
                            </Button>
                            <Button
                              onClick$={() => handleNotificationAction(notification.id, 'dismiss')}
                              variant="outlined"
                              color="secondary"
                              size="sm"
                            >
                              Dismiss
                            </Button>
                          </Stack>
                        )}
                      </div>
                    </Stack>
                  </div>
                ))}
                
                {notifications.length === 0 && (
                  <div class="p-12 text-center">
                    <i class="fas fa-bell text-neutral-light text-4xl mb-4"></i>
                    <Text as="h3" weight="medium" size="lg" color="neutral-darker" class="mb-2">No notifications</Text>
                    <Text as="p" color="neutral-dark">You're all caught up!</Text>
                  </div>
                )}
              </div>
            </Card>
          )}
        </Stack>
      </Stack>
    </div>
  );
});

export default ProviderDashboard;
