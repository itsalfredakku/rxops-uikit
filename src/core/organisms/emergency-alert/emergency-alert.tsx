import { component$, useSignal, useTask$, $ } from '@builder.io/qwik';
import { Text } from '../../../core/atoms/text/text';
import { Button } from '../../../core/atoms/button/button';
import { Badge } from '../../../core/atoms/badge';
import { Textarea } from '../../../core/atoms/textarea/textarea';
import { Modal } from '../../../core/organisms/modal/modal';
import { Row } from '../../../layouts/row/index';
import { Stack } from '../../../layouts/stack/index';
import { BaseComponentProps, mergeClasses } from '../../../design-system/props';
import { Icon } from '../../../core/atoms/icon';

export interface EmergencyAlert {
  id: string;
  type: 'medical-emergency' | 'fire' | 'security' | 'system' | 'weather' | 'evacuation' | 'code-blue' | 'code-red';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  message: string;
  location?: {
    building?: string;
    floor?: string;
    room?: string;
    department?: string;
    coordinates?: { lat: number; lng: number };
  };
  patientId?: string;
  patientName?: string;
  reportedBy: {
    id: string;
    name: string;
    role: string;
    department?: string;
  };
  timestamp: string;
  estimatedResponseTime?: number; // in minutes
  requiredActions: EmergencyAction[];
  escalationRules: EscalationRule[];
  status: 'active' | 'acknowledged' | 'responding' | 'resolved' | 'cancelled';
  acknowledgedBy?: {
    id: string;
    name: string;
    role: string;
    timestamp: string;
  }[];
  respondingTeams?: RespondingTeam[];
  priority: number; // 1 = highest, 5 = lowest
  autoEscalateAfter?: number; // minutes
  requiresEvacuation?: boolean;
  affectedAreas?: string[];
  resources?: EmergencyResource[];
  communications?: EmergencyCommunication[];
}

export interface EmergencyAction {
  id: string;
  action: string;
  required: boolean;
  assignedTo?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  completedBy?: string;
  completedAt?: string;
  estimatedTime?: number; // minutes
}

export interface EscalationRule {
  id: string;
  condition: string;
  escalateAfter: number; // minutes
  escalateTo: string[];
  notificationMethod: 'push' | 'sms' | 'call' | 'email' | 'all';
  triggered?: boolean;
  triggeredAt?: string;
}

export interface RespondingTeam {
  id: string;
  name: string;
  type: 'medical' | 'security' | 'fire' | 'maintenance' | 'administration';
  members: TeamMember[];
  eta?: number; // minutes
  status: 'dispatched' | 'en-route' | 'on-scene' | 'completed';
  dispatchedAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  status: 'available' | 'responding' | 'busy' | 'off-duty';
  location?: string;
}

export interface EmergencyResource {
  id: string;
  type: 'equipment' | 'medication' | 'personnel' | 'transport';
  name: string;
  quantity?: number;
  status: 'requested' | 'allocated' | 'deployed' | 'unavailable';
  location?: string;
}

export interface EmergencyCommunication {
  id: string;
  timestamp: string;
  from: string;
  to: string[];
  message: string;
  type: 'update' | 'instruction' | 'status' | 'request';
  urgent: boolean;
}

export interface EmergencyAlertProps extends Omit<BaseComponentProps<HTMLDivElement>, `on${string}$`> {
  alert: EmergencyAlert;
  currentUserId: string;
  currentUserRole: string;
  allowAcknowledge?: boolean;
  allowDispatch?: boolean;
  allowEscalate?: boolean;
  allowResolve?: boolean;
  showLocation?: boolean;
  showActions?: boolean;
  showCommunications?: boolean;
  showResponders?: boolean;
  isMinimized?: boolean;
  autoAudio?: boolean;
  onAcknowledge?: (alertId: string) => void;
  onDispatch?: (alertId: string, teamIds: string[]) => void;
  onEscalate?: (alertId: string) => void;
  onResolve?: (alertId: string, resolution: string) => void;
  onActionComplete?: (alertId: string, actionId: string) => void;
  onCommunicate?: (alertId: string, message: string, recipients: string[]) => void;
  onMinimize?: (alertId: string) => void;
  onMaximize?: (alertId: string) => void;
}

export const EmergencyAlert = component$<EmergencyAlertProps>((props) => {
  const {
    alert,
    currentUserId,
    allowAcknowledge = true,
    allowDispatch = false,
    allowEscalate = false,
    allowResolve = false,
    showLocation = true,
    showActions = true,
    showCommunications = true,
    showResponders = true,
    isMinimized = false,
    onAcknowledge,
    onDispatch,
    onEscalate,
    onResolve,
    onActionComplete,
    onCommunicate,
    onMinimize,
    onMaximize,
    // BaseComponentProps
    class: qwikClass,
    className,
    style,
    ...rest
  } = props;

  const activeTab = useSignal('overview');
  const communicationMessage = useSignal('');
  const showResolutionDialog = useSignal(false);
  const resolutionText = useSignal('');
  const elapsedTime = useSignal(0);

  // Auto-update elapsed time
  useTask$(({ track, cleanup }) => {
    track(() => alert.timestamp);
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const alertTime = new Date(alert.timestamp).getTime();
      elapsedTime.value = Math.floor((now - alertTime) / (1000 * 60)); // minutes
    }, 60000); // Update every minute

    cleanup(() => clearInterval(interval));
  });

  const handleAcknowledge = $(() => {
    onAcknowledge?.(alert.id);
  });

  const handleDispatch = $((teamIds: string[]) => {
    onDispatch?.(alert.id, teamIds);
  });

  const handleEscalate = $(() => {
    onEscalate?.(alert.id);
  });

  const handleResolve = $(() => {
    if (resolutionText.value.trim()) {
      onResolve?.(alert.id, resolutionText.value);
      showResolutionDialog.value = false;
      resolutionText.value = '';
    }
  });

  const handleActionComplete = $((actionId: string) => {
    onActionComplete?.(alert.id, actionId);
  });

  const handleCommunicate = $(() => {
    if (communicationMessage.value.trim()) {
      const recipients = alert.respondingTeams?.flatMap(team => team.members.map(m => m.id)) || [];
      onCommunicate?.(alert.id, communicationMessage.value, recipients);
      communicationMessage.value = '';
    }
  });

  const _getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-error-100 text-error-900 border-red-300 shadow-lg shadow-error-200/50';
      case 'high': return 'bg-orange-100 text-orange-900 border-orange-300 shadow-md shadow-orange-200/40';
      case 'medium': return 'bg-warning-100 text-warning-900 border-yellow-300 shadow-sm shadow-warning-200/30';
      case 'low': return 'bg-primary-100 text-primary-900 border-primary-300';
      default: return 'bg-neutral-100 text-neutral-800 border-neutral-200';
    }
  };

  // Convert severity to Badge component props
  const getSeverityBadgeProps = (severity: string) => {
    switch (severity) {
      case 'critical': 
        return { color: 'error' as const, shade: 'light' as const };
      case 'high': 
        return { color: 'warning' as const, shade: 'normal' as const };
      case 'medium': 
        return { color: 'warning' as const, shade: 'light' as const };
      case 'low': 
        return { color: 'info' as const, shade: 'light' as const };
      default: 
        return { color: 'secondary' as const, shade: 'light' as const };
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'medical-emergency': return 'fas fa-ambulance';
      case 'fire': return 'fas fa-fire';
      case 'security': return 'fas fa-shield-alt';
      case 'system': return 'fas fa-server';
      case 'weather': return 'fas fa-cloud-rain';
      case 'evacuation': return 'fas fa-running';
      case 'code-blue': return 'fas fa-heartbeat';
      case 'code-red': return 'fas fa-exclamation-triangle';
      default: return 'fas fa-exclamation-circle';
    }
  };

  const _getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-error-500 text-white';
      case 'acknowledged': return 'bg-warning-500 text-white';
      case 'responding': return 'bg-primary-500 text-white';
      case 'resolved': return 'bg-success-500 text-white';
      case 'cancelled': return 'bg-neutral-500 text-white';
      default: return 'bg-neutral-500 text-white';
    }
  };

  // Convert status to Badge component props
  const getStatusBadgeProps = (status: string) => {
    switch (status) {
      case 'active': 
        return { color: 'error' as const, shade: 'normal' as const };
      case 'acknowledged': 
        return { color: 'warning' as const, shade: 'normal' as const };
      case 'responding': 
        return { color: 'info' as const, shade: 'normal' as const };
      case 'resolved': 
        return { color: 'success' as const, shade: 'normal' as const };
      case 'cancelled': 
        return { color: 'secondary' as const, shade: 'normal' as const };
      default: 
        return { color: 'secondary' as const, shade: 'normal' as const };
    }
  };

  const isAcknowledged = alert.acknowledgedBy?.some(ack => ack.id === currentUserId);
  const pendingActions = alert.requiredActions.filter(action => action.status === 'pending').length;
  const completedActions = alert.requiredActions.filter(action => action.status === 'completed').length;

  if (isMinimized) {
    return (
      <div class="emergency-alert-minimized fixed bottom-4 right-4 z-50">
        <div class={`p-4 rounded-lg shadow-2xl border-l-8 cursor-pointer transition-all duration-300 hover:scale-105 ${
          alert.severity === 'critical' ? 'bg-gradient-to-r from-error-50 to-error-100 border-red-600 ring-4 ring-red-300/50 animate-pulse' :
          alert.severity === 'high' ? 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-600 ring-2 ring-orange-300/40' :
          alert.severity === 'medium' ? 'bg-gradient-to-r from-warning-50 to-warning-100 border-yellow-600 ring-1 ring-yellow-300/30' :
          'bg-gradient-to-r from-primary-50 to-primary-100 border-primary-600'
        }`} onClick$={() => onMaximize?.(alert.id)}>
          <Row alignItems="center" gap="3">
            <div class={`p-1 rounded-full ${
              alert.severity === 'critical' ? 'bg-error-100 text-error-700' :
              alert.severity === 'high' ? 'bg-orange-100 text-orange-700' :
              alert.severity === 'medium' ? 'bg-warning-100 text-warning-700' :
              'bg-primary-100 text-primary-700'
            }`}>
              <i class={`${getTypeIcon(alert.type)} text-lg`}></i>
            </div>
            <div class="flex-1">
              <div class={`font-bold text-sm ${
                alert.severity === 'critical' ? 'text-error-900' :
                alert.severity === 'high' ? 'text-orange-900' : 
                'text-warning-900'
              }`}>{alert.title}</div>
              <div class="text-xs text-neutral-600 mt-1">
                {alert.severity === 'critical' ? 'CRITICAL ALERT' : 
                 alert.severity === 'high' ? 'HIGH PRIORITY' : 
                 alert.severity.toUpperCase()}
              </div>
            </div>
            <Badge 
              variant="flat" 
              size="sm" 
              pill 
              {...getSeverityBadgeProps(alert.severity)}
            >
              {alert.severity.toUpperCase()}
            </Badge>
          </Row>
        </div>
      </div>
    );
  }

  // Compute severity classes for emergency alert
  const _severityClasses = {
    critical: 'bg-error-600 border-red-500',
    high: 'bg-orange-600 border-orange-500', 
    medium: 'bg-warning-600 border-yellow-500',
    low: 'bg-primary-600 border-primary-500'
  };

  const alertClasses = mergeClasses(
    'emergency-alert fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4',
    qwikClass,
    className
  );

  return (
    <div 
      class={alertClasses}
      style={style}
      {...rest}
    >
      <div class="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div class={`px-6 py-6 border-b-4 ${
          alert.severity === 'critical' ? 'bg-gradient-to-r from-error-600 to-error-700 border-red-800' :
          alert.severity === 'high' ? 'bg-gradient-to-r from-orange-600 to-orange-700 border-orange-800' :
          alert.severity === 'medium' ? 'bg-gradient-to-r from-warning-600 to-warning-700 border-yellow-800' :
          'bg-gradient-to-r from-primary-600 to-primary-700 border-primary-800'
        } text-white ${alert.severity === 'critical' ? 'animate-pulse' : ''}`}>
          <Row alignItems="center" justifyContent="between">
            <Row alignItems="center" gap="4">
              <div class={`p-3 rounded-full ${
                alert.severity === 'critical' ? 'bg-error-500/30 ring-2 ring-white/50' :
                alert.severity === 'high' ? 'bg-orange-500/30 ring-1 ring-white/30' :
                'bg-white/20'
              }`}>
                <i class={`${getTypeIcon(alert.type)} ${
                  alert.severity === 'critical' ? 'text-3xl animate-bounce' : 'text-2xl'
                }`}></i>
              </div>
              <div>
                <Text as="h2" weight="bold" size={alert.severity === 'critical' ? 'xl' : 'lg'} color="white">
                  {alert.title}
                </Text>
                <Row alignItems="center" gap="4" class="text-sm opacity-90 mt-1">
                  <span class="font-semibold">Alert #{alert.id.slice(-6).toUpperCase()}</span>
                  <span class={`px-2 py-1 rounded-full text-xs font-bold ${
                    alert.severity === 'critical' ? 'bg-error-500 text-white' :
                    alert.severity === 'high' ? 'bg-orange-500 text-white' :
                    'bg-white/20 text-white'
                  }`}>
                    Priority {alert.priority}
                  </span>
                  <span class="font-medium">{elapsedTime.value}m elapsed</span>
                  {alert.location && (
                    <span>
                      <Icon icon="map-pin" class="mr-1" />
                      {alert.location.room || alert.location.department}
                    </span>
                  )}
                </Row>
              </div>
            </Row>
            
            <Row alignItems="center" gap="2">
              <Badge 
                variant="flat" 
                size="sm" 
                pill 
                {...getStatusBadgeProps(alert.status)}
              >
                {alert.status.toUpperCase()}
              </Badge>
              <button
                onClick$={() => onMinimize?.(alert.id)}
                class="p-2 hover:bg-white transition-colors duration-200 hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <Icon icon="x" />
              </button>
            </Row>
          </Row>
        </div>

        {/* Action Bar */}
        <div class="px-6 py-3 bg-neutral-50 border-b">
          <Row alignItems="center" justifyContent="between">
            <Row alignItems="center" gap="3">
              {allowAcknowledge && !isAcknowledged && alert.status === 'active' && (
                <button
                  onClick$={handleAcknowledge}
                  class="px-4 py-2 bg-warning-600 text-white rounded-lg transition-colors duration-200 hover:bg-warning-700 transition-colors font-medium"
                >
                  <Icon icon="check" class="mr-2" />Acknowledge
                </button>
              )}
              
              {allowDispatch && alert.status === 'acknowledged' && (
                <button
                  onClick$={() => handleDispatch([])}
                  class="px-4 py-2 bg-primary-600 text-white rounded-lg transition-colors duration-200 hover:bg-primary-700 transition-colors font-medium"
                >
                  <Icon icon="user" class="mr-2" />Dispatch Teams
                </button>
              )}
              
              {allowEscalate && (
                <button
                  onClick$={handleEscalate}
                  class="px-4 py-2 bg-orange-600 text-white rounded-lg transition-colors duration-200 hover:bg-orange-700 transition-colors font-medium"
                >
                  <Icon icon="trending-up" class="mr-2" />Escalate
                </button>
              )}
              
              {allowResolve && ['acknowledged', 'responding'].includes(alert.status) && (
                <button
                  onClick$={() => showResolutionDialog.value = true}
                  class="px-4 py-2 bg-success-600 text-white rounded-lg transition-colors duration-200 hover:bg-success-700 transition-colors font-medium"
                >
                  <Icon icon="check-circle" class="mr-2" />Resolve
                </button>
              )}
            </Row>
            
            <Row alignItems="center" gap="4" class="text-sm text-neutral-600">
              <span>Reported by: {alert.reportedBy.name}</span>
              <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
            </Row>
          </Row>
        </div>

        {/* Navigation Tabs */}
        <div class="px-6 py-0 bg-white border-b">
          <nav>
            <Row gap="1">
              <button
                onClick$={() => activeTab.value = 'overview'}
                class={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab.value === 'overview'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700'
                }`}
              >
                Overview
              </button>
              {showActions && (
                <button
                  onClick$={() => activeTab.value = 'actions'}
                  class={`px-4 py-3 text-sm font-medium border-b-2 transition-colors relative ${
                    activeTab.value === 'actions'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-neutral-500 hover:text-neutral-700'
                  }`}
                >
                  Actions
                  {pendingActions > 0 && (
                    <span class="absolute -top-1 -right-1 bg-error-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {pendingActions}
                    </span>
                  )}
                </button>
              )}
              {showResponders && (
                <button
                  onClick$={() => activeTab.value = 'responders'}
                  class={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab.value === 'responders'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-neutral-500 hover:text-neutral-700'
                  }`}
                >
                  Responders
                </button>
              )}
              {showCommunications && (
                <button
                  onClick$={() => activeTab.value = 'communications'}
                  class={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab.value === 'communications'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-neutral-500 hover:text-neutral-700'
                  }`}
                >
                  Communications
                </button>
              )}
            </Row>
          </nav>
        </div>

        {/* Content */}
        <div class="flex-1 overflow-y-auto max-h-[60vh]">
          {activeTab.value === 'overview' && (
            <div class="p-6 space-y-6">
              {/* Alert Details */}
              <div class="bg-neutral-50 rounded-lg p-4">
                <Text as="h3" weight="semibold" size="lg" color="red-900" class="mb-3">Emergency Details</Text>
                <Text as="p" color="gray-700" class="mb-4">{alert.message}</Text>
                
                <Row gap="4">
                  {alert.patientId && (
                    <div>
                      <span class="text-sm font-medium text-neutral-600">Patient:</span>
                      <Text as="p" color="gray-900">{alert.patientName}</Text>
                    </div>
                  )}
                  
                  {showLocation && alert.location && (
                    <div>
                      <span class="text-sm font-medium text-neutral-600">Location:</span>
                      <Text as="p" color="gray-900">
                        {alert.location.building && `${alert.location.building}, `}
                        {alert.location.floor && `Floor ${alert.location.floor}, `}
                        {alert.location.room || alert.location.department}
                      </Text>
                    </div>
                  )}
                  
                  {alert.estimatedResponseTime && (
                    <div>
                      <span class="text-sm font-medium text-neutral-600">Est. Response Time:</span>
                      <Text as="p" color="gray-900">{alert.estimatedResponseTime} minutes</Text>
                    </div>
                  )}
                  
                  <div>
                    <span class="text-sm font-medium text-neutral-600">Reported By:</span>
                    <Text as="p" color="gray-900">{alert.reportedBy.name} ({alert.reportedBy.role})</Text>
                  </div>
                </Row>
              </div>

              {/* Acknowledgments */}
              {alert.acknowledgedBy && alert.acknowledgedBy.length > 0 && (
                <div>
                  <Text as="h3" weight="semibold" size="lg" color="gray-900" class="mb-3">Acknowledged By</Text>
                  <div class="space-y-2">
                    {alert.acknowledgedBy.map((ack) => (
                      <Row key={ack.id} alignItems="center" justifyContent="between" class="p-3 bg-warning-50 rounded-lg">
                        <div>
                          <span class="font-medium text-neutral-900">{ack.name}</span>
                          <span class="text-sm text-neutral-600 ml-2">({ack.role})</span>
                        </div>
                        <span class="text-sm text-neutral-500">
                          {new Date(ack.timestamp).toLocaleTimeString()}
                        </span>
                      </Row>
                    ))}
                  </div>
                </div>
              )}

              {/* Affected Areas */}
              {alert.affectedAreas && alert.affectedAreas.length > 0 && (
                <div>
                  <Text as="h3" weight="semibold" size="lg" color="orange-900" class="mb-3">Affected Areas</Text>
                  <Row wrap gap="2">
                    {alert.affectedAreas.map((area, index) => (
                      <Badge key={index} variant="flat" color="warning" shade="light" size="sm" pill>
                        {area}
                      </Badge>
                    ))}
                  </Row>
                </div>
              )}
            </div>
          )}

          {activeTab.value === 'actions' && showActions && (
            <div class="p-6">
              <Text as="h3" weight="semibold" size="lg" color="red-900" class="mb-4">Required Actions</Text>
              <Stack gap="3">
                {alert.requiredActions.map((action) => (
                  <div key={action.id} class={`p-4 rounded-lg border ${
                    action.status === 'completed' ? 'bg-success-50 border-green-200' :
                    action.status === 'in-progress' ? 'bg-primary-50 border-primary-200' :
                    action.status === 'failed' ? 'bg-error-50 border-red-200' :
                    'bg-neutral-50 border-neutral-200'
                  }`}>
                    <Row alignItems="center" justifyContent="between">
                      <div class="flex-1">
                        <Row alignItems="center" gap="2">
                          <span class="font-medium text-neutral-900">{action.action}</span>
                          {action.required && (
                            <Badge variant="flat" color="error" shade="light" size="sm" pill>
                              Required
                            </Badge>
                          )}
                        </Row>
                        {action.assignedTo && (
                          <Text as="p" size="sm" color="gray-600" class="mt-1">Assigned to: {action.assignedTo}</Text>
                        )}
                        {action.estimatedTime && (
                          <Text as="p" size="sm" color="gray-600">Est. time: {action.estimatedTime} minutes</Text>
                        )}
                      </div>
                      
                      <Row alignItems="center" gap="2">
                        <span class={`px-3 py-1 rounded-full text-sm font-medium ${
                          action.status === 'completed' ? 'bg-success-100 text-success-800' :
                          action.status === 'in-progress' ? 'bg-primary-100 text-primary-800' :
                          action.status === 'failed' ? 'bg-error-100 text-error-800' :
                          'bg-neutral-100 text-neutral-800'
                        }`}>
                          {action.status.replace('-', ' ').toUpperCase()}
                        </span>
                        
                        {action.status === 'pending' && (
                          <button
                            onClick$={() => handleActionComplete(action.id)}
                            class="px-3 py-1 bg-success-600 text-white text-sm rounded-lg transition-colors duration-200 hover:bg-success-700 transition-colors"
                          >
                            Complete
                          </button>
                        )}
                      </Row>
                    </Row>
                  </div>
                ))}
              </Stack>
              
              <div class="mt-6 p-4 bg-primary-50 rounded-lg">
                <Row alignItems="center" justifyContent="between">
                  <div>
                    <span class="font-medium text-neutral-900">Progress: </span>
                    <span class="text-primary-600">{completedActions}/{alert.requiredActions.length} completed</span>
                  </div>
                  <div class="w-32 bg-neutral-200 rounded-full h-2">
                    <div 
                      class="bg-primary-600 h-2 rounded-full transition-all duration-300" 
                      style={`width: ${(completedActions / alert.requiredActions.length) * 100}%`}
                    ></div>
                  </div>
                </Row>
              </div>
            </div>
          )}

          {activeTab.value === 'responders' && showResponders && (
            <div class="p-6">
              <Text as="h3" weight="semibold" size="lg" color="blue-900" class="mb-4">Responding Teams</Text>
              <Stack gap="4">
                {alert.respondingTeams?.map((team) => (
                  <div key={team.id} class="border border-neutral-200 rounded-lg p-4">
                    <Row alignItems="center" justifyContent="between" class="mb-3">
                      <div>
                        <Text as="h4" weight="medium" color="gray-900">{team.name}</Text>
                        <span class="text-sm text-neutral-600 capitalize">{team.type} Team</span>
                      </div>
                      <div class="text-right">
                        <span class={`px-3 py-1 rounded-full text-sm font-medium ${
                          team.status === 'on-scene' ? 'bg-success-100 text-success-800' :
                          team.status === 'en-route' ? 'bg-primary-100 text-primary-800' :
                          team.status === 'dispatched' ? 'bg-warning-100 text-warning-800' :
                          'bg-neutral-100 text-neutral-800'
                        }`}>
                          {team.status.replace('-', ' ').toUpperCase()}
                        </span>
                        {team.eta && (
                          <Text as="p" size="sm" color="gray-600" class="mt-1">ETA: {team.eta} min</Text>
                        )}
                      </div>
                    </Row>
                    
                    <Row gap="2">
                      {team.members.map((member) => (
                        <Row key={member.id} alignItems="center" justifyContent="between" class="p-2 bg-neutral-50 rounded">
                          <div>
                            <span class="text-sm font-medium text-neutral-900">{member.name}</span>
                            <span class="text-xs text-neutral-600 ml-2">({member.role})</span>
                          </div>
                          <span class={`px-2 py-1 text-xs rounded-full ${
                            member.status === 'responding' ? 'bg-success-100 text-success-800' :
                            member.status === 'available' ? 'bg-primary-100 text-primary-800' :
                            'bg-neutral-100 text-neutral-800'
                          }`}>
                            {member.status}
                          </span>
                        </Row>
                      ))}
                    </Row>
                  </div>
                )) || (
                  <div class="text-center py-8">
                    <Icon icon="user" class="text-neutral-300 text-4xl mb-3" />
                    <Text as="p" color="gray-600">No teams dispatched yet</Text>
                  </div>
                )}
              </Stack>
            </div>
          )}

          {activeTab.value === 'communications' && showCommunications && (
            <div class="p-6">
              <Text as="h3" weight="semibold" size="lg" color="blue-900" class="mb-4">Communications</Text>
              
              {/* Send Message */}
              <div class="mb-6 p-4 bg-primary-50 rounded-lg">
                <Row gap="3">
                  <Textarea
                    purpose="emergency"
                    value={communicationMessage.value}
                    onChange$={(value) => communicationMessage.value = value}
                    placeholder="Send update to responding teams..."
                    rows={2}
                    class="flex-1"
                  />
                  <button
                    onClick$={handleCommunicate}
                    disabled={!communicationMessage.value.trim()}
                    class="px-4 py-2 bg-primary-600 text-white rounded-lg transition-colors duration-200 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Icon icon="send" />
                  </button>
                </Row>
              </div>
              
              {/* Message History */}
              <Stack gap="3">
                {alert.communications?.map((comm) => (
                  <div key={comm.id} class={`p-3 rounded-lg ${
                    comm.urgent ? 'bg-error-50 border border-red-200' : 'bg-neutral-50'
                  }`}>
                    <Row alignItems="start" justifyContent="between">
                      <div class="flex-1">
                        <Row alignItems="center" gap="2" class="mb-1">
                          <span class="font-medium text-neutral-900">{comm.from}</span>
                          <span class={`px-2 py-1 text-xs rounded-full ${
                            comm.type === 'instruction' ? 'bg-primary-100 text-primary-800' :
                            comm.type === 'update' ? 'bg-success-100 text-success-800' :
                            comm.type === 'request' ? 'bg-orange-100 text-orange-800' :
                            'bg-neutral-100 text-neutral-800'
                          }`}>
                            {comm.type}
                          </span>
                          {comm.urgent && (
                            <Badge variant="flat" color="error" shade="light" size="sm" pill>
                              URGENT
                            </Badge>
                          )}
                        </Row>
                        <Text as="p" color="gray-700">{comm.message}</Text>
                        <div class="text-xs text-neutral-500 mt-1">
                          To: {comm.to.join(', ')}
                        </div>
                      </div>
                      <span class="text-xs text-neutral-500">
                        {new Date(comm.timestamp).toLocaleTimeString()}
                      </span>
                    </Row>
                  </div>
                )) || (
                  <div class="text-center py-8">
                    <Icon icon="message-square" class="text-neutral-300 text-4xl mb-3" />
                    <Text as="p" color="gray-600">No communications yet</Text>
                  </div>
                )}
              </Stack>
            </div>
          )}
        </div>
      </div>

      {/* Resolution Dialog */}
      <Modal
        open={showResolutionDialog.value}
        title="Resolve Emergency Alert"
        size="sm"
        closable={true}
        closeOnBackdrop={false}
        showFooter={true}
        onClose$={() => showResolutionDialog.value = false}
      >
        <Textarea
          purpose="emergency"
          label="Resolution Details"
          value={resolutionText.value}
          onChange$={(value) => resolutionText.value = value}
          placeholder="Describe how the emergency was resolved..."
          rows={4}
        />
        
        <div slot="footer">
          <Row alignItems="end" gap="3" class="justify-end">
            <Button
              onClick$={() => showResolutionDialog.value = false}
              intent="neutral"
              size="md"
            >
              Cancel
            </Button>
            <Button
              onClick$={handleResolve}
              disabled={!resolutionText.value.trim()}
              intent="success"
              size="md"
            >
              Resolve Alert
            </Button>
          </Row>
        </div>
      </Modal>
    </div>
  );
});

export default EmergencyAlert;
