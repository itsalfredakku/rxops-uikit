import { component$, useSignal, $, type QRL } from "@builder.io/qwik";
import { mergeClasses } from "../../../design-system/props";
import type { Color } from "../../../design-system/types";
import { Stack } from "../../../layouts/stack";
import { Row } from "../../../layouts/row";
import { Button } from "../../atoms/button/button";
import { Text } from "../../atoms/text/text";
import { Icon, type IconName } from "../../atoms/icon";
import { Badge } from "../../atoms/badge";
import { hipaaAuditor } from "../../../utils/hipaa";
import { HEALTHCARE_TIMING, getAnimationClasses } from "../../../utils/motion-accessibility";

// Emergency severity levels
export type EmergencySeverity = 'low' | 'medium' | 'high' | 'critical' | 'life-threatening';

// Emergency alert types
export type EmergencyType = 
  | 'cardiac-arrest'
  | 'respiratory-distress'
  | 'allergic-reaction'
  | 'fall'
  | 'medication-error'
  | 'equipment-failure'
  | 'security-breach'
  | 'fire'
  | 'severe-bleeding'
  | 'stroke-symptoms'
  | 'seizure'
  | 'code-blue'
  | 'code-red'
  | 'other';

// Alert status
export type AlertStatus = 'active' | 'acknowledged' | 'responding' | 'resolved' | 'cancelled';

// Response action types
export type ResponseAction = 
  | 'call-emergency'
  | 'notify-doctor'
  | 'send-team'
  | 'prepare-equipment'
  | 'secure-area'
  | 'document-incident'
  | 'none';

// Emergency alert data structure
export interface EmergencyAlert {
  id: string;
  type: EmergencyType;
  severity: EmergencySeverity;
  status: AlertStatus;
  title: string;
  message: string;
  location: {
    room?: string;
    floor?: string;
    building?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  patient?: {
    id: string;
    name: string;
    mrn?: string;
    age?: number;
    allergies?: string[];
  };
  reporter: {
    name: string;
    role: string;
    id: string;
    department?: string;
  };
  timestamp: string;
  estimatedResponseTime?: number; // minutes
  requiredActions: ResponseAction[];
  responders?: {
    id: string;
    name: string;
    role: string;
    status: 'notified' | 'responding' | 'on-scene';
    eta?: number; // minutes
  }[];
  escalation?: {
    level: number;
    nextEscalation?: string; // timestamp
    escalatedTo?: string[];
  };
  resolution?: {
    timestamp: string;
    resolvedBy: string;
    notes: string;
    outcome: 'resolved' | 'false-alarm' | 'transferred' | 'ongoing';
  };
  notes?: string;
  attachments?: {
    type: 'image' | 'video' | 'document';
    url: string;
    description?: string;
  }[];
}

// Component props
export interface EmergencyAlertProps {
  /** Emergency alert data */
  alert: EmergencyAlert;
  /** Whether the alert is in compact view */
  compact?: boolean;
  /** Whether to show response actions */
  showActions?: boolean;
  /** Whether to show responder status */
  showResponders?: boolean;
  /** Whether the user can respond to the alert */
  canRespond?: boolean;
  /** Current user information for response actions */
  currentUser?: {
    id: string;
    name: string;
    role: string;
  };
  /** CSS class names */
  class?: string;
  /** Callback when alert is acknowledged */
  onAcknowledge$?: QRL<(alertId: string, userId: string) => void>;
  /** Callback when response action is taken */
  onRespond$?: QRL<(alertId: string, action: ResponseAction, userId: string) => void>;
  /** Callback when alert is escalated */
  onEscalate$?: QRL<(alertId: string, level: number, userId: string) => void>;
  /** Callback when alert is resolved */
  onResolve$?: QRL<(alertId: string, resolution: EmergencyAlert['resolution'], userId: string) => void>;
  /** HIPAA audit settings */
  hipaaAudit?: {
    enabled: boolean;
    patientId?: string;
    providerId?: string;
  };
}

export const EmergencyAlert = component$<EmergencyAlertProps>((props) => {
  const showDetails = useSignal(false);
  const responseNotes = useSignal('');

  const logEmergencyAccess = $((action: string) => {
    if (props.hipaaAudit?.enabled) {
      hipaaAuditor.logAccess({
        action,
        component: 'emergency-alert',
        itemId: props.alert.id,
        category: 'emergency',
        patientId: props.hipaaAudit.patientId,
        timestamp: new Date().toISOString()
      });
    }
  });

  const getSeverityColor = (severity: EmergencySeverity): Color => {
    const colors: Record<EmergencySeverity, Color> = {
      low: 'info',
      medium: 'warning',
      high: 'error',
      critical: 'error',
      'life-threatening': 'error'
    };
    return colors[severity];
  };

  const getTypeIcon = (type: EmergencyType): IconName => {
    const icons: Record<EmergencyType, IconName> = {
      'cardiac-arrest': 'heart',
      'respiratory-distress': 'activity',
      'allergic-reaction': 'alert-triangle',
      'fall': 'alert-triangle',
      'medication-error': 'pill',
      'equipment-failure': 'settings',
      'security-breach': 'lock',
      'fire': 'alert-triangle',
      'severe-bleeding': 'alert-triangle',
      'stroke-symptoms': 'brain',
      'seizure': 'activity',
      'code-blue': 'heart',
      'code-red': 'alert-triangle',
      'other': 'alert-triangle'
    };
    return icons[type] || 'alert-triangle';
  };

  const getStatusColor = (status: AlertStatus): Color => {
    const colors: Record<AlertStatus, Color> = {
      active: 'error',
      acknowledged: 'warning',
      responding: 'info',
      resolved: 'success',
      cancelled: 'secondary'
    };
    return colors[status];
  };

  const formatDuration = (timestamp: string): string => {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diffMinutes = Math.floor((now.getTime() - alertTime.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const getActionText = (action: ResponseAction): string => {
    const actions = {
      'call-emergency': 'Call Emergency Services',
      'notify-doctor': 'Notify Doctor',
      'send-team': 'Send Response Team',
      'prepare-equipment': 'Prepare Equipment',
      'secure-area': 'Secure Area',
      'document-incident': 'Document Incident',
      'none': 'No Action Required'
    };
    return actions[action];
  };

  const handleAcknowledge = $(() => {
    if (props.currentUser && props.onAcknowledge$) {
      logEmergencyAccess('alert-acknowledge');
      props.onAcknowledge$(props.alert.id, props.currentUser.id);
    }
  });

  const handleRespond = $((action: ResponseAction) => {
    if (props.currentUser && props.onRespond$) {
      logEmergencyAccess('alert-respond');
      props.onRespond$(props.alert.id, action, props.currentUser.id);
    }
  });

  const handleEscalate = $(() => {
    if (props.currentUser && props.onEscalate$) {
      const nextLevel = (props.alert.escalation?.level || 0) + 1;
      logEmergencyAccess('alert-escalate');
      props.onEscalate$(props.alert.id, nextLevel, props.currentUser.id);
    }
  });

  // Get motion-aware animation classes for emergency alerts
  const getEmergencyAnimationClasses = (severity: EmergencySeverity) => {
    const isCritical = severity === 'life-threatening' || severity === 'critical';
    
    return getAnimationClasses(
      // Default animation: Enhanced visual attention for emergencies
      `transform transition-all ${HEALTHCARE_TIMING.emergency.duration} ${HEALTHCARE_TIMING.emergency.ease}
       hover:shadow-2xl hover:scale-[1.02] 
       ${isCritical ? 'animate-pulse ring-4 ring-error-500/30' : ''}`,
      
      // Reduced motion: Still emphasize critical alerts but with minimal animation
      `transition-colors ${HEALTHCARE_TIMING.emergency.reduced}
       hover:brightness-105
       ${isCritical ? 'ring-4 ring-error-500/50' : ''}`,
      
      // Force animation for life-threatening alerts (patient safety override)
      severity === 'life-threatening'
    );
  };

  return (
    <div
      class={mergeClasses(
        "emergency-alert border-l-8 bg-white shadow-xl rounded-lg overflow-hidden",
        // Motion-aware emergency animations with healthcare timing
        getEmergencyAnimationClasses(props.alert.severity).responsive,
        // Enhanced visual hierarchy for patient safety
        props.alert.severity === 'life-threatening' 
          ? "border-error-600 bg-error-100 shadow-error-500/20"
          : props.alert.severity === 'critical'
          ? "border-error-500 bg-error-75 shadow-error-400/15 ring-2 ring-error-400/20"
          : props.alert.severity === 'high'
          ? "border-warning-500 bg-warning-75 shadow-warning-400/15 ring-1 ring-warning-400/20"
          : props.alert.severity === 'medium'
          ? "border-warning-400 bg-warning-50 shadow-warning-300/10"
          : "border-info-400 bg-info-50 shadow-info-300/10",
        props.compact ? "p-4" : "p-6",
        "cursor-pointer",
        props.class
      )}
      data-healthcare-element="emergency-alert"
      data-severity={props.alert.severity}
      data-status={props.alert.status}
    >
      {/* Alert Header */}
      <Row gap="4" alignItems="start" justifyContent="between">
        <Row gap="4" alignItems="start" class="flex-1 min-w-0">
          {/* Enhanced Severity and Type Icon */}
          <div class="flex-shrink-0">
            <div class={mergeClasses(
              "rounded-full",
              // Motion-aware icon animations
              `transition-all ${HEALTHCARE_TIMING.short.duration} ${HEALTHCARE_TIMING.short.ease}`,
              // Larger, more prominent icons for medical emergencies with motion sensitivity
              props.alert.severity === 'life-threatening' ? "p-4 bg-error-600 shadow-lg ring-4 ring-error-500/50 motion-reduce:ring-2" :
              props.alert.severity === 'critical' ? "p-3 bg-error-500 shadow-md ring-2 ring-error-400/40" :
              props.alert.severity === 'high' ? "p-3 bg-warning-500 shadow-md ring-2 ring-warning-400/40" :
              props.alert.severity === 'medium' ? "p-2.5 bg-warning-400 shadow-sm" :
              "p-2.5 bg-info-400 shadow-sm"
            )}>
              <Icon 
                icon={getTypeIcon(props.alert.type)} 
                size={props.alert.severity === 'life-threatening' ? 32 : 
                      props.alert.severity === 'critical' ? 28 : 24} 
                class="text-white drop-shadow-sm" 
              />
            </div>
          </div>

          {/* Alert Details */}
          <Stack gap="2" class="flex-1 min-w-0">
            <Row gap="3" alignItems="center" wrap>
              <Text 
                weight="bold" 
                class={mergeClasses(
                  "truncate",
                  // Motion-aware typography transitions
                  `transition-colors ${HEALTHCARE_TIMING.micro.duration}`,
                  // Enhanced typography hierarchy for medical alerts
                  props.alert.severity === 'life-threatening' ? "text-2xl text-error-800" :
                  props.alert.severity === 'critical' ? "text-xl text-error-700" :
                  props.alert.severity === 'high' ? "text-lg text-warning-800" :
                  "text-lg text-neutral-800"
                )}
              >
                {props.alert.title}
              </Text>
              
              {/* Enhanced severity badges */}
              <Badge 
                color={getSeverityColor(props.alert.severity)}
                size={props.alert.severity === 'life-threatening' || props.alert.severity === 'critical' ? "lg" : "md"}
                class={mergeClasses(
                  "font-bold uppercase tracking-wide",
                  // Motion-aware badge animations
                  props.alert.severity === 'life-threatening' ? "animate-pulse motion-reduce:animate-pulse shadow-lg" :
                  props.alert.severity === 'critical' ? "shadow-md" : ""
                )}
              >
                {props.alert.severity === 'life-threatening' ? '🚨 LIFE THREATENING' :
                 props.alert.severity === 'critical' ? '⚠️ CRITICAL' :
                 props.alert.severity.toUpperCase()}
              </Badge>
              
              <Badge 
                color={getStatusColor(props.alert.status)}
                size="md"
                variant="outlined"
                class="font-semibold"
              >
                {props.alert.status.toUpperCase()}
              </Badge>
            </Row>

            <Text class={mergeClasses(
              "leading-relaxed",
              props.alert.severity === 'life-threatening' ? "text-lg text-error-800 font-medium" :
              props.alert.severity === 'critical' ? "text-base text-error-700 font-medium" :
              "text-base text-neutral-700"
            )}>
              {props.alert.message}
            </Text>

            {/* Enhanced Location and Time with better visibility */}
            <Row gap="6" wrap class={mergeClasses(
              "text-sm font-medium",
              props.alert.severity === 'life-threatening' || props.alert.severity === 'critical' 
                ? "text-neutral-800" : "text-neutral-600"
            )}>
              {props.alert.location && (
                <Row gap="2" alignItems="center" class="bg-white/50 px-3 py-1 rounded-full shadow-sm">
                  <Icon icon="map-pin" size={16} class="text-error-600" />
                  <Text size="sm" weight="medium">
                    {[
                      props.alert.location.room,
                      props.alert.location.floor,
                      props.alert.location.building
                    ].filter(Boolean).join(', ')}
                  </Text>
                </Row>
              )}
              
              <Row gap="2" alignItems="center" class="bg-white/50 px-3 py-1 rounded-full shadow-sm">
                <Icon icon="clock" size={16} class="text-neutral-600" />
                <Text size="sm" weight="medium">
                  {formatDuration(props.alert.timestamp)}
                </Text>
              </Row>

              {props.alert.estimatedResponseTime && (
                <Row gap="2" alignItems="center" class={mergeClasses(
                  "px-3 py-1 rounded-full shadow-sm",
                  props.alert.estimatedResponseTime <= 3 ? "bg-success-100 text-success-800" : "bg-warning-100 text-warning-800"
                )}>
                  <Icon icon="activity" size={16} />
                  <Text size="sm" weight="bold">
                    ETA: {props.alert.estimatedResponseTime}m
                  </Text>
                </Row>
              )}
            </Row>

            {/* Enhanced Patient Information */}
            {props.alert.patient && !props.compact && (
              <div class={mergeClasses(
                "mt-3 p-4 rounded-lg border-2 shadow-sm",
                // Motion-aware patient info transitions
                `transition-all ${HEALTHCARE_TIMING.short.duration}`,
                props.alert.severity === 'life-threatening' || props.alert.severity === 'critical'
                  ? "bg-white border-error-200 shadow-error-100" 
                  : "bg-white border-neutral-200"
              )}>
                <Text size="md" weight="bold" class="text-neutral-800 mb-2">
                  Patient: {props.alert.patient.name}
                </Text>
                {props.alert.patient.allergies?.length && (
                  <Row gap="2" wrap>
                    <Text size="sm" weight="medium" class="text-error-700">⚠️ Allergies:</Text>
                    {props.alert.patient.allergies.slice(0, 3).map((allergy) => (
                      <Badge key={allergy} color="error" size="md" variant="flat" class="font-medium shadow-sm">
                        {allergy}
                      </Badge>
                    ))}
                  </Row>
                )}
              </div>
            )}
          </Stack>
        </Row>

        {/* Enhanced Status and Actions */}
        <Stack gap="3" class="flex-shrink-0" alignItems="end">
          {/* Enhanced Quick Actions */}
          {props.canRespond && props.alert.status === 'active' && (
            <Row gap="2">
              <Button
                size={props.alert.severity === 'life-threatening' || props.alert.severity === 'critical' ? "lg" : "md"}
                color="error"
                onClick$={handleAcknowledge}
                class={mergeClasses(
                  "font-bold shadow-lg",
                  // Motion-aware button animations with emergency override
                  `transition-all ${HEALTHCARE_TIMING.micro.duration} hover:scale-105 motion-reduce:hover:scale-100 motion-reduce:hover:brightness-110`,
                  props.alert.severity === 'life-threatening' ? "animate-pulse motion-reduce:animate-pulse" : ""
                )}
              >
                <Icon icon="check" size={18} />
                Acknowledge
              </Button>
              
              <Button
                size={props.alert.severity === 'life-threatening' || props.alert.severity === 'critical' ? "lg" : "md"}
                variant="outlined"
                onClick$={() => {
                  showDetails.value = !showDetails.value;
                  logEmergencyAccess('alert-view-details');
                }}
                class={mergeClasses(
                  "font-medium shadow-md",
                  // Motion-aware detail button
                  `transition-all ${HEALTHCARE_TIMING.micro.duration} hover:shadow-lg hover:scale-105`,
                  "motion-reduce:hover:scale-100 motion-reduce:hover:brightness-110"
                )}
              >
                <Icon icon="eye" size={18} />
              </Button>
            </Row>
          )}

          {/* Enhanced Reporter info */}
          <Text size="sm" weight="medium" class="text-neutral-600 text-right bg-white/50 px-2 py-1 rounded">
            Reported by: {props.alert.reporter.name}
          </Text>
        </Stack>
      </Row>

      {/* Expanded Details */}
      {showDetails.value && (
        <div class="mt-4 pt-4 border-t border-neutral-200">
          <Stack gap="3">
            {/* Required Actions */}
            {props.showActions && props.alert.requiredActions.length > 0 && (
              <div>
                <Text weight="medium" class="mb-2">Required Actions:</Text>
                <Stack gap="2">
                  {props.alert.requiredActions.map((action) => (
                    <Row key={action} gap="2" alignItems="center" justifyContent="between">
                      <Text size="sm">{getActionText(action)}</Text>
                      {props.canRespond && (
                        <Button
                          size="xs"
                          variant="outlined"
                          onClick$={() => handleRespond(action)}
                        >
                          Take Action
                        </Button>
                      )}
                    </Row>
                  ))}
                </Stack>
              </div>
            )}

            {/* Responders */}
            {props.showResponders && props.alert.responders?.length && (
              <div>
                <Text weight="medium" class="mb-2">Responders:</Text>
                <Stack gap="2">
                  {props.alert.responders.map((responder) => (
                    <Row key={responder.id} gap="2" alignItems="center" justifyContent="between">
                      <div>
                        <Text size="sm" weight="medium">{responder.name}</Text>
                        <Text size="xs" color="secondary">{responder.role}</Text>
                      </div>
                      <Row gap="2" alignItems="center">
                        <Badge 
                          color={responder.status === 'on-scene' ? 'success' : 
                                responder.status === 'responding' ? 'warning' : 'info'}
                          size="sm"
                        >
                          {responder.status}
                        </Badge>
                        {responder.eta && (
                          <Text size="xs" color="secondary">
                            ETA: {responder.eta}m
                          </Text>
                        )}
                      </Row>
                    </Row>
                  ))}
                </Stack>
              </div>
            )}

            {/* Escalation Options */}
            {props.canRespond && props.alert.status !== 'resolved' && (
              <Row gap="2">
                <Button
                  size="sm"
                  color="warning"
                  variant="outlined"
                  onClick$={handleEscalate}
                >
                  <Icon icon="alert-triangle" size={14} />
                  Escalate
                </Button>
                
                <Button
                  size="sm"
                  color="success"
                  variant="outlined"
                  onClick$={() => {
                    if (props.currentUser && props.onResolve$) {
                      const resolution = {
                        timestamp: new Date().toISOString(),
                        resolvedBy: props.currentUser.name,
                        notes: responseNotes.value,
                        outcome: 'resolved' as const
                      };
                      logEmergencyAccess('alert-resolve');
                      props.onResolve$(props.alert.id, resolution, props.currentUser.id);
                    }
                  }}
                >
                  <Icon icon="check-circle" size={14} />
                  Mark Resolved
                </Button>
              </Row>
            )}
          </Stack>
        </div>
      )}
    </div>
  );
});

export default EmergencyAlert;
