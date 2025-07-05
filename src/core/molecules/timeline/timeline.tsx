/**
 * Timeline Component
 * Medical industry-focused timeline for medical history, treatment progress, and clinical events
 * 
 * Features:
 * - Medical timeline variants (treatment, medication, appointments, vitals)
 * - Healthcare-specific event types and priorities
 * - Patient privacy controls and HIPAA compliance
 * - Interactive timeline with zoom and filtering
 * - Clinical workflow integration
 */

import { component$, useSignal, useTask$, $ } from "@builder.io/qwik";
import { BaseComponentProps, mergeClasses } from "../../../design-system/props";
import { Color } from "../../../design-system/types";
import { Icon, type IconName } from "../../atoms/icon";
import { Text } from "../../atoms/text/text";
import { Badge } from "../../atoms/badge/index";
import { hipaaAuditor } from "../../../utils/hipaa";

export interface TimelineEvent {
  /** Unique identifier for the event */
  id: string;
  /** Event title/name */
  title: string;
  /** Event description */
  description?: string;
  /** Event date and time */
  timestamp: Date | string;
  /** Event type for styling and categorization */
  type?: 'appointment' | 'medication' | 'procedure' | 'lab' | 'vital' | 'note' | 'emergency' | 'discharge' | 'admission' | 'surgery';
  /** Event status */
  status?: 'completed' | 'pending' | 'cancelled' | 'rescheduled' | 'critical' | 'normal' | 'abnormal';
  /** Priority level */
  priority?: 'low' | 'medium' | 'high' | 'critical';
  /** Icon to display for the event */
  icon?: IconName;
  /** Additional metadata */
  metadata?: {
    provider?: string;
    department?: string;
    duration?: string;
    location?: string;
    value?: string | number;
    unit?: string;
    normalRange?: string;
  };
  /** Healthcare-specific data */
  healthcare?: {
    patientId?: string;
    providerId?: string;
    encounterType?: string;
    clinicalSignificance?: 'routine' | 'significant' | 'critical';
    containsPHI?: boolean;
  };
}

export interface TimelineProps extends BaseComponentProps<HTMLDivElement> {
  /** Array of timeline events */
  events: TimelineEvent[];
  /** Timeline variant */
  variant?: 'default' | 'medical' | 'compact' | 'detailed';
  /** Timeline orientation */
  orientation?: 'vertical' | 'horizontal';
  /** Whether to show event times */
  showTime?: boolean;
  /** Whether to show event dates */
  showDate?: boolean;
  /** Whether to group events by date */
  groupByDate?: boolean;
  /** Maximum number of events to show initially */
  maxVisible?: number;
  /** Whether the timeline is interactive */
  interactive?: boolean;
  /** Timeline theme */
  theme?: 'light' | 'dark' | 'clinical';
  /** Filter by event types */
  filter?: TimelineEvent['type'][];
  /** Sort direction */
  sortOrder?: 'asc' | 'desc';
  /** Callback when an event is clicked */
  onEventClick?: (event: TimelineEvent) => void;
  /** Callback when timeline is filtered */
  onFilter?: (filter: TimelineEvent['type'][]) => void;
}

export const Timeline = component$<TimelineProps>((props) => {
  const {
    events: _events,
    variant: _variant = 'default',
    orientation = 'vertical',
    showTime: _showTime = true,
    showDate: _showDate = true,
    groupByDate: _groupByDate = false,
    maxVisible: _maxVisible = 10,
    interactive = false,
    theme = 'light',
    filter = [],
    sortOrder: _sortOrder = 'desc',
    onEventClick,
    onFilter,
    class: qwikClass,
    className,
    style: _style,
    ...domProps
  } = props;

  const isExpanded = useSignal(false);
  const activeFilter = useSignal<TimelineEvent['type'][]>(filter);

  // HIPAA audit for healthcare timeline access
  useTask$(({ track }) => {
    track(() => props.events);
    
    const healthcareEvents = props.events.filter(event => event.healthcare?.patientId);
    if (healthcareEvents.length > 0) {
      healthcareEvents.forEach(event => {
        hipaaAuditor.logAccess({
          action: 'view',
          component: 'timeline',
          itemId: event.id,
          category: event.type || 'unknown',
          patientId: event.healthcare?.patientId,
          timestamp: new Date().toISOString()
        });
      });
    }
  });

  // Filter and sort events
  const filteredEvents = props.events
    .filter(event => {
      if (activeFilter.value.length === 0) return true;
      return activeFilter.value.includes(event.type || 'note');
    })
    .sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return props.sortOrder === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
    });

  const visibleEvents = props.maxVisible && !isExpanded.value ? 
    filteredEvents.slice(0, props.maxVisible) : 
    filteredEvents;

  const handleEventClick = $((event: TimelineEvent) => {
    if (props.interactive && props.onEventClick$) {
      // HIPAA audit for healthcare event access
      if (event.healthcare?.patientId) {
        hipaaAuditor.logAccess({
          action: 'click',
          component: 'timeline-event',
          itemId: event.id,
          category: event.type || 'unknown',
          patientId: event.healthcare.patientId,
          timestamp: new Date().toISOString()
        });
      }
      
      onEventClick?.(event);
    }
  });

  // Event type configurations
  const eventTypeConfig = {
    appointment: {
      icon: 'calendar' as IconName,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-200'
    },
    medication: {
      icon: 'pill' as IconName,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-200'
    },
    procedure: {
      icon: 'activity' as IconName,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      borderColor: 'border-purple-200'
    },
    lab: {
      icon: 'flask' as IconName,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      borderColor: 'border-orange-200'
    },
    vital: {
      icon: 'heart' as IconName,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      borderColor: 'border-red-200'
    },
    note: {
      icon: 'file-text' as IconName,
      color: 'text-neutral-600',
      bgColor: 'bg-neutral-100',
      borderColor: 'border-neutral-200'
    },
    emergency: {
      icon: 'alert-triangle' as IconName,
      color: 'text-red-700',
      bgColor: 'bg-red-200',
      borderColor: 'border-red-300'
    },
    discharge: {
      icon: 'log-out' as IconName,
      color: 'text-green-700',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-200'
    },
    admission: {
      icon: 'log-in' as IconName,
      color: 'text-blue-700',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-200'
    },
    surgery: {
      icon: 'activity' as IconName,
      color: 'text-purple-700',
      bgColor: 'bg-purple-100',
      borderColor: 'border-purple-200'
    }
  };

  // Status configurations
  const statusConfig: Record<string, { color: Color; label: string }> = {
    completed: { color: 'success', label: 'Completed' },
    pending: { color: 'warning', label: 'Pending' },
    cancelled: { color: 'error', label: 'Cancelled' },
    rescheduled: { color: 'warning', label: 'Rescheduled' },
    critical: { color: 'error', label: 'Critical' },
    normal: { color: 'success', label: 'Normal' },
    abnormal: { color: 'warning', label: 'Abnormal' }
  };

  const formatDate = (timestamp: Date | string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timestamp: Date | string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getEventConfig = (event: TimelineEvent) => {
    return eventTypeConfig[event.type || 'note'];
  };

  const renderEventIcon = (event: TimelineEvent) => {
    const config = getEventConfig(event);
    const iconName = event.icon || config.icon;
    
    return (
      <div class={mergeClasses(
        "flex items-center justify-center w-8 h-8 rounded-full border-2",
        config.bgColor,
        config.borderColor,
        event.priority === 'critical' ? 'animate-pulse ring-2 ring-red-400' : ''
      )}>
        <Icon 
          icon={iconName} 
          size={16} 
          class={config.color}
        />
      </div>
    );
  };

  const renderEventContent = (event: TimelineEvent) => {
    const config = getEventConfig(event);
    
    return (
      <div 
        class={mergeClasses(
          "timeline-event-content p-4 rounded-lg border ml-4 transition-all duration-200",
          config.bgColor,
          config.borderColor,
          props.interactive ? 'hover:shadow-md cursor-pointer' : '',
          props.variant === 'compact' ? 'p-2' : ''
        )}
        onClick$={props.interactive ? () => handleEventClick(event) : undefined}
      >
        {/* Event Header */}
        <div class="flex items-start justify-between mb-2">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <Text 
                size={props.variant === 'compact' ? 'sm' : 'md'} 
                weight="semibold"
                class={config.color}
              >
                {event.title}
              </Text>
              
              {event.priority && event.priority !== 'low' && (
                <Badge 
                  color={event.priority === 'critical' ? 'error' : 'warning'}
                  size="sm"
                >
                  {event.priority.toUpperCase()}
                </Badge>
              )}
            </div>
            
            {(props.showDate || props.showTime) && (
              <div class="flex items-center gap-2 text-sm text-neutral-600">
                {props.showDate && (
                  <span>{formatDate(event.timestamp)}</span>
                )}
                {props.showTime && (
                  <span>{formatTime(event.timestamp)}</span>
                )}
              </div>
            )}
          </div>
          
          {event.status && (
            <Badge 
              color={statusConfig[event.status]?.color || 'secondary'}
              size="sm"
              variant="flat"
            >
              {statusConfig[event.status]?.label || event.status}
            </Badge>
          )}
        </div>

        {/* Event Description */}
        {event.description && (
          <Text 
            size="sm" 
            class="text-neutral-700 mb-2"
          >
            {event.description}
          </Text>
        )}

        {/* Event Metadata */}
        {event.metadata && (
          <div class="text-xs text-neutral-600 space-y-1">
            {event.metadata.provider && (
              <div>Provider: {event.metadata.provider}</div>
            )}
            {event.metadata.department && (
              <div>Department: {event.metadata.department}</div>
            )}
            {event.metadata.location && (
              <div>Location: {event.metadata.location}</div>
            )}
            {event.metadata.value && (
              <div class="flex items-center gap-1">
                <span>Value: {event.metadata.value}</span>
                {event.metadata.unit && <span>{event.metadata.unit}</span>}
                {event.metadata.normalRange && (
                  <span class="text-neutral-500">(Normal: {event.metadata.normalRange})</span>
                )}
              </div>
            )}
            {event.metadata.duration && (
              <div>Duration: {event.metadata.duration}</div>
            )}
          </div>
        )}

        {/* PHI Protection Indicator */}
        {event.healthcare?.containsPHI && (
          <div class="mt-2 flex items-center gap-1 text-xs text-amber-600">
            <Icon icon="shield" size={12} />
            <span>Protected Health Information</span>
          </div>
        )}
      </div>
    );
  };

  const renderTimelineConnector = (index: number, isLast: boolean) => {
    if (isLast) return null;
    
    return (
      <div class="timeline-connector flex justify-center">
        <div class="w-0.5 h-6 bg-neutral-200" />
      </div>
    );
  };

  // Group events by date if requested
  const groupedEvents = props.groupByDate ? 
    visibleEvents.reduce((groups, event) => {
      const dateKey = formatDate(event.timestamp);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(event);
      return groups;
    }, {} as Record<string, TimelineEvent[]>) :
    { 'all': visibleEvents };

  return (
    <div
      class={mergeClasses(
        'timeline',
        orientation === 'horizontal' ? 'flex overflow-x-auto' : 'space-y-4',
        theme === 'dark' ? 'dark' : '',
        theme === 'clinical' ? 'bg-neutral-50 p-4 rounded-lg border' : '',
        qwikClass || className
      )}
      data-healthcare-element="timeline"
      {...domProps}
    >
      {/* Timeline Filter Controls */}
      {interactive && (
        <div class="timeline-controls mb-4 p-3 bg-neutral-50 rounded-lg border">
          <Text size="sm" weight="medium" class="mb-2">Filter Events:</Text>
          <div class="flex flex-wrap gap-2">
            {Object.keys(eventTypeConfig).map((type) => {
              const config = eventTypeConfig[type as keyof typeof eventTypeConfig];
              const isActive = activeFilter.value.includes(type as TimelineEvent['type']);
              
              return (
                <button
                  key={type}
                  type="button"
                  class={mergeClasses(
                    "flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors",
                    isActive ? config.bgColor + ' ' + config.borderColor + ' border' : 'bg-white border border-neutral-200 hover:bg-neutral-50'
                  )}
                  onClick$={() => {
                    const newFilter = isActive
                      ? activeFilter.value.filter(f => f !== type)
                      : [...activeFilter.value, type as TimelineEvent['type']];
                    
                    activeFilter.value = newFilter;
                    onFilter?.(newFilter);
                  }}
                >
                  <Icon icon={config.icon} size={12} class={isActive ? config.color : 'text-neutral-500'} />
                  <span class={isActive ? config.color : 'text-neutral-600'}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Timeline Events */}
      {Object.entries(groupedEvents).map(([dateGroup, events]) => (
        <div key={dateGroup} class="timeline-group">
          {props.groupByDate && dateGroup !== 'all' && (
            <div class="timeline-date-header mb-3">
              <Text size="lg" weight="semibold" class="text-neutral-800">
                {dateGroup}
              </Text>
              <div class="h-px bg-neutral-200 mt-1" />
            </div>
          )}
          
          <div class={mergeClasses(
            'timeline-events',
            props.orientation === 'horizontal' ? 'flex gap-4' : 'space-y-0'
          )}>
            {events.map((event, index) => (
              <div 
                key={event.id} 
                class={mergeClasses(
                  'timeline-item flex',
                  props.orientation === 'horizontal' ? 'flex-col items-center min-w-64' : 'items-start'
                )}
              >
                {/* Event Icon */}
                <div class="timeline-icon-container flex flex-col items-center">
                  {renderEventIcon(event)}
                  {props.orientation === 'vertical' && renderTimelineConnector(index, index === events.length - 1)}
                </div>

                {/* Event Content */}
                {props.orientation === 'horizontal' ? (
                  <div class="mt-2 w-full">
                    {renderEventContent(event)}
                  </div>
                ) : (
                  renderEventContent(event)
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Load More Button */}
      {props.maxVisible && filteredEvents.length > props.maxVisible && !isExpanded.value && (
        <div class="timeline-load-more text-center mt-4">
          <button
            type="button"
            class="px-4 py-2 text-sm text-primary-600 hover:text-primary-700 border border-primary-200 hover:border-primary-300 rounded-lg transition-colors"
            onClick$={() => isExpanded.value = true}
          >
            Show {filteredEvents.length - props.maxVisible} more events
          </button>
        </div>
      )}

      {/* Empty State */}
      {filteredEvents.length === 0 && (
        <div class="timeline-empty text-center py-8">
          <Icon icon="clock" size={48} class="text-neutral-400 mx-auto mb-3" />
          <Text size="lg" class="text-neutral-600 mb-2">
            No timeline events found
          </Text>
          <Text size="sm" class="text-neutral-500">
            {activeFilter.value.length > 0 
              ? 'Try adjusting your filters to see more events'
              : 'Timeline events will appear here when available'
            }
          </Text>
        </div>
      )}
    </div>
  );
});

/**
 * MedicalTimeline - Specialized timeline for medical history
 */
export interface MedicalTimelineProps extends Omit<TimelineProps, 'variant'> {
  /** Patient information */
  patient?: {
    id: string;
    name: string;
    dateOfBirth?: string;
  };
  /** Whether to show clinical significance indicators */
  showClinicalSignificance?: boolean;
  /** Whether to highlight critical events */
  highlightCritical?: boolean;
}

export const MedicalTimeline = component$<MedicalTimelineProps>((props) => {
  const medicalEvents = props.events.map(event => ({
    ...event,
    healthcare: {
      patientId: props.patient?.id,
      clinicalSignificance: event.priority === 'critical' ? 'critical' as const : 'routine' as const,
      containsPHI: true,
      ...event.healthcare
    }
  }));

  return (
    <div class="medical-timeline bg-white rounded-lg border shadow-sm">
      {/* Patient Header */}
      {props.patient && (
        <div class="medical-timeline-header p-4 border-b bg-neutral-50">
          <div class="flex items-center gap-3">
            <Icon icon="user" size={20} class="text-primary-600" />
            <div>
              <Text size="lg" weight="semibold" class="text-neutral-900">
                Medical Timeline - {props.patient.name}
              </Text>
              {props.patient.dateOfBirth && (
                <Text size="sm" class="text-neutral-600">
                  DOB: {new Date(props.patient.dateOfBirth).toLocaleDateString()}
                </Text>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Timeline Content */}
      <div class="p-4">
        <Timeline
          {...props}
          events={medicalEvents}
          variant="medical"
          theme="clinical"
          showTime={true}
          showDate={true}
          groupByDate={true}
          interactive={true}
          sortOrder="desc"
        />
      </div>
    </div>
  );
});

/**
 * TreatmentTimeline - Specialized timeline for treatment progress
 */
export interface TreatmentTimelineProps extends Omit<TimelineProps, 'variant'> {
  /** Treatment plan information */
  treatmentPlan?: {
    id: string;
    name: string;
    startDate: string;
    endDate?: string;
    status: 'active' | 'completed' | 'paused' | 'cancelled';
  };
  /** Show treatment milestones */
  showMilestones?: boolean;
}

export const TreatmentTimeline = component$<TreatmentTimelineProps>((props) => {
  const treatmentEvents = props.events.filter(event => 
    ['medication', 'procedure', 'appointment', 'lab'].includes(event.type || '')
  );

  return (
    <div class="treatment-timeline bg-white rounded-lg border shadow-sm">
      {/* Treatment Plan Header */}
      {props.treatmentPlan && (
        <div class="treatment-timeline-header p-4 border-b bg-primary-50">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <Icon icon="activity" size={20} class="text-primary-600" />
              <div>
                <Text size="lg" weight="semibold" class="text-primary-900">
                  {props.treatmentPlan.name}
                </Text>
                <Text size="sm" class="text-primary-700">
                  Started: {new Date(props.treatmentPlan.startDate).toLocaleDateString()}
                  {props.treatmentPlan.endDate && (
                    <> • Ends: {new Date(props.treatmentPlan.endDate).toLocaleDateString()}</>
                  )}
                </Text>
              </div>
            </div>
            
            <Badge 
              color={
                props.treatmentPlan.status === 'active' ? 'success' :
                props.treatmentPlan.status === 'completed' ? 'primary' :
                props.treatmentPlan.status === 'paused' ? 'warning' : 'error'
              }
              variant="flat"
            >
              {props.treatmentPlan.status.toUpperCase()}
            </Badge>
          </div>
        </div>
      )}

      {/* Timeline Content */}
      <div class="p-4">
        <Timeline
          {...props}
          events={treatmentEvents}
          variant="detailed"
          theme="clinical"
          showTime={true}
          showDate={true}
          interactive={true}
          sortOrder="asc"
          filter={['medication', 'procedure', 'appointment', 'lab']}
        />
      </div>
    </div>
  );
});

export default Timeline;
