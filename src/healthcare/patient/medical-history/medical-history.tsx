import { component$, useSignal, useStore, $ } from '@builder.io/qwik';
import { Icon } from '../../../core/atoms/icon/index';
import { Badge } from '../../../core/atoms/badge/index';
// Removed hardcoded icon imports: CalendarIcon, ClockIcon, FileTextIcon, AlertTriangleIcon, ChevronDownIcon, ChevronUpIcon, FilterIcon, SearchIcon
import { BaseComponentProps, mergeClasses } from '../../../design-system/props';
import { Text } from '../../../core/atoms/text/text';
import { DateTimePicker } from '../../../core/molecules/date-time-picker/date-time-picker';
import { Stack } from '../../../layouts';

export interface MedicalEvent {
  id: string;
  date: string;
  type: 'diagnosis' | 'procedure' | 'medication' | 'appointment' | 'test' | 'surgery' | 'emergency';
  title: string;
  description: string;
  provider: string;
  facility?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved' | 'ongoing' | 'cancelled';
  medications?: string[];
  attachments?: string[];
  notes?: string;
  icd10?: string;
  cpt?: string;
}

export interface MedicalHistoryProps extends Omit<BaseComponentProps<HTMLDivElement>, `on${string}$`> {
  /** Patient ID */
  patientId: string;
  /** Array of medical events in the patient's history */
  events: MedicalEvent[];
  /** Called when an event is clicked */
  onEventClick?: (event: MedicalEvent) => void;
  /** Called when the add event button is clicked */
  onAddEvent?: () => void;
  /** Called when filters are changed */
  onFilterChange?: (filters: HistoryFilters) => void;
  /** Whether the history is editable */
  isEditable?: boolean;
  /** Whether to show filter controls */
  showFilters?: boolean;
  /** Max height of the event container (with scrolling) */
  maxHeight?: string;
}

export interface HistoryFilters {
  dateRange?: {
    start?: string;
    end?: string;
  };
  types?: string[];
  providers?: string[];
  severity?: string[];
  status?: string[];
  searchTerm?: string;
}

export const MedicalHistory = component$<MedicalHistoryProps>((props) => {
  const {
    events = [],
    onEventClick,
    onAddEvent,
    onFilterChange,
    isEditable = false,
    showFilters = true,
    maxHeight = '600px',
    class: qwikClass,
    className,
    style,
    ...rest
  } = props;

  const expandedEvents = useSignal<string[]>([]);
  const showFiltersPanel = useSignal(false);
  const searchTerm = useSignal('');
  
  const filters = useStore<HistoryFilters>({
    dateRange: undefined,
    types: [],
    providers: [],
    severity: [],
    status: [],
    searchTerm: ''
  });

  const typeColors = {
    diagnosis: 'bg-error-lighter text-error-darker border-error-light',
    procedure: 'bg-primary-lighter text-primary-darker border-primary-light',
    medication: 'bg-success-lighter text-success-darker border-success-light',
    appointment: 'bg-warning-lighter text-warning-darker border-warning-light',
    test: 'bg-secondary-lighter text-secondary-darker border-secondary-light',
    surgery: 'bg-warning-lighter text-warning-darker border-warning-light',
    emergency: 'bg-error-light text-error-darker border-error-normal'
  };

  const severityColors = {
    low: 'text-success-dark',
    medium: 'text-warning-dark',
    high: 'text-warning-darker',
    critical: 'text-error-dark'
  };

  const statusColors = {
    active: 'bg-success-lighter text-success-darker',
    resolved: 'bg-neutral-lighter text-neutral-darker',
    ongoing: 'bg-primary-lighter text-primary-darker',
    cancelled: 'bg-error-lighter text-error-darker'
  };

  const typeIcons = {
    diagnosis: () => <Icon icon="file-text" class="w-5 h-5" />,
    procedure: () => <Icon icon="clock" class="w-5 h-5" />,
    medication: () => <Icon icon="calendar" class="w-5 h-5" />,
    appointment: () => <Icon icon="calendar" class="w-5 h-5" />,
    test: () => <Icon icon="file-text" class="w-5 h-5" />,
    surgery: () => <Icon icon="alert-triangle" class="w-5 h-5" />,
    emergency: () => <Icon icon="alert-triangle" class="w-5 h-5" />
  };

  // Filter events based on current filters
  const filteredEvents = events.filter(event => {
    // Search term filter
    if (filters.searchTerm && !event.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
        !event.description.toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
        !event.provider.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
      return false;
    }

    // Type filter
    if (filters.types && filters.types.length > 0 && !filters.types.includes(event.type)) {
      return false;
    }

    // Provider filter
    if (filters.providers && filters.providers.length > 0 && !filters.providers.includes(event.provider)) {
      return false;
    }

    // Severity filter
    if (filters.severity && filters.severity.length > 0 && event.severity && !filters.severity.includes(event.severity)) {
      return false;
    }

    // Status filter
    if (filters.status && filters.status.length > 0 && !filters.status.includes(event.status)) {
      return false;
    }

    // Date range filter
    if (filters.dateRange && (filters.dateRange.start || filters.dateRange.end)) {
      const eventDate = new Date(event.date);
      if (filters.dateRange.start) {
        const startDate = new Date(filters.dateRange.start);
        if (eventDate < startDate) return false;
      }
      if (filters.dateRange.end) {
        const endDate = new Date(filters.dateRange.end);
        if (eventDate > endDate) return false;
      }
    }

    return true;
  });

  // Sort events by date (newest first)
  const sortedEvents = [...filteredEvents].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const toggleEventExpansion = $((eventId: string) => {
    const expanded = expandedEvents.value;
    if (expanded.includes(eventId)) {
      expandedEvents.value = expanded.filter(id => id !== eventId);
    } else {
      expandedEvents.value = [...expanded, eventId];
    }
  });

  const handleSearchChange = $((term: string) => {
    searchTerm.value = term;
    filters.searchTerm = term;
    onFilterChange && onFilterChange(filters);
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const rootClasses = mergeClasses(
    'medical-history bg-white rounded-lg shadow-sm border border-neutral-light',
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
        <div class="border-b border-neutral-light p-4">
          <Stack direction="row" alignItems="center" justifyContent="between" wrap="wrap" gap="4">
            <Stack direction="row" alignItems="center" gap="3">
              <Icon icon="file-text" class="w-5 h-5 text-primary-dark" />
              <Text as="h3" weight="semibold" size="md">Medical History</Text>
              <span class="text-sm text-neutral-normal">({sortedEvents.length} events)</span>
            </Stack>
            <Stack direction="row" alignItems="center" gap="2" wrap="wrap">
              {showFilters && (
                <button
                  onClick$={() => showFiltersPanel.value = !showFiltersPanel.value}
                >
                  <Stack direction="row" alignItems="center" class="px-3 py-1.5 text-sm font-medium text-neutral-dark bg-neutral-lighter rounded-md transition-colors duration-200 hover:bg-neutral-light focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-normal focus-visible:ring-offset-2 focus:ring-2 focus:ring-primary-normal" gap="1">
                    <Icon icon="filter" class="w-4 h-4" />
                    Filters
                  </Stack>
                </button>
              )}
              {isEditable && onAddEvent && (
                <button
                  onClick$={onAddEvent}
                >
                  <Stack direction="row" alignItems="center" class="px-3 py-1.5 text-sm font-medium text-white bg-primary-dark rounded-md transition-colors duration-200 hover:bg-primary-darker focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-normal focus-visible:ring-offset-2 focus:ring-2 focus:ring-primary-normal">
                    Add Event
                  </Stack>
                </button>
              )}
            </Stack>
          </Stack>

          {/* Search Bar */}
          <div class="mt-4 relative">
            <Icon icon="search" class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-normal" />
            <input
              type="text"
              placeholder="Search medical history..."
              value={searchTerm.value}
              onInput$={(e) => handleSearchChange((e.target as HTMLInputElement).value)}
              class="w-full pl-10 pr-4 py-2 border border-neutral-light rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-normal focus-visible:ring-offset-2 focus:ring-2 focus:ring-primary-normal focus:border-transparent"
            />
          </div>

          {/* Filters Panel */}
          {showFiltersPanel.value && (
            <div class="mt-4 p-4 bg-neutral-lighter rounded-md">
              <Stack direction="row" gap="4" wrap="wrap">
                {/* Date Range */}
                <div>
                  <label class="block text-sm font-medium text-neutral-dark mb-1">Date Range</label>
                  <Stack direction="row" gap="2" wrap="wrap">
                    <DateTimePicker
                      value={filters.dateRange?.start || ''}
                      size="sm"
                      variant="outlined"
                      placeholder="Start date"
                      class="flex-1"
                      onChange$={(date) => {
                        filters.dateRange = { ...filters.dateRange, start: date };
                        onFilterChange && onFilterChange(filters);
                      }}
                    />
                    <DateTimePicker
                      value={filters.dateRange?.end || ''}
                      size="sm"
                      variant="outlined"
                      placeholder="End date"
                      class="flex-1"
                      onChange$={(date) => {
                        filters.dateRange = { ...filters.dateRange, end: date };
                        onFilterChange && onFilterChange(filters);
                      }}
                    />
                  </Stack>
                </div>

                {/* Event Types */}
                <div>
                  <label class="block text-sm font-medium text-neutral-dark mb-1">Event Types</label>
                  <select
                    multiple
                    value={filters.types}
                    onChange$={(e) => {
                      const select = e.target as HTMLSelectElement;
                      filters.types = Array.from(select.selectedOptions).map(option => option.value);
                      onFilterChange && onFilterChange(filters);
                    }}
                    class="w-full px-3 py-1.5 text-sm border border-neutral-light rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-normal focus-visible:ring-offset-2 focus:ring-1 focus:ring-primary-normal"
                  >
                    <option value="diagnosis">Diagnosis</option>
                    <option value="procedure">Procedure</option>
                    <option value="medication">Medication</option>
                    <option value="appointment">Appointment</option>
                    <option value="test">Test</option>
                    <option value="surgery">Surgery</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label class="block text-sm font-medium text-neutral-dark mb-1">Status</label>
                  <select
                    multiple
                    value={filters.status}
                    onChange$={(e) => {
                      const select = e.target as HTMLSelectElement;
                      filters.status = Array.from(select.selectedOptions).map(option => option.value);
                      onFilterChange && onFilterChange(filters);
                    }}
                    class="w-full px-3 py-1.5 text-sm border border-neutral-light rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-normal focus-visible:ring-offset-2 focus:ring-1 focus:ring-primary-normal"
                  >
                    <option value="active">Active</option>
                    <option value="resolved">Resolved</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </Stack>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div class="p-4" style={{ maxHeight, overflowY: 'auto' }}>
          {sortedEvents.length === 0 ? (
            <div class="text-center py-8">
              <Icon icon="file-text" class="w-12 h-12 text-neutral-normal mx-auto mb-4" />
              <Text as="p" color="muted">No medical history events found</Text>
              {isEditable && onAddEvent && (
                <button
                  onClick$={onAddEvent}
                  class="mt-4 px-4 py-2 text-sm font-medium text-primary-dark transition-colors duration-200 hover:bg-primary-lighter rounded-md"
                >
                  Add the first event
                </button>
              )}
            </div>
          ) : (
            <div class="space-y-4">
              {sortedEvents.map((event) => {
                const IconComponent = typeIcons[event.type];
                const isExpanded = expandedEvents.value.includes(event.id);

                return (
                  <div
                    key={event.id}
                    class="border border-neutral-light rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div
                      class="p-4 cursor-pointer transition-colors duration-200 hover:bg-neutral-lighter"
                      onClick$={() => {
                        toggleEventExpansion(event.id);
                        onEventClick && onEventClick(event);
                      }}
                    >
                      <Stack direction="row" alignItems="start" justifyContent="between">
                        <Stack direction="row" alignItems="start" gap="3" class="flex-1">
                          <div class="flex-shrink-0">
                            <IconComponent />
                          </div>
                          <Stack class="flex-1" gap="2">
                            <Stack direction="row" alignItems="center" gap="2" wrap="wrap">
                              <Text as="h4" weight="medium" size="sm">{event.title}</Text>
                              <span class={`px-2 py-1 text-xs font-medium rounded-full border ${typeColors[event.type]}`}>
                                {event.type}
                              </span>
                              <span class={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[event.status]}`}>
                                {event.status}
                              </span>
                              {event.severity && (
                                <span class={`text-xs font-medium ${severityColors[event.severity]}`}>
                                  {event.severity}
                                </span>
                              )}
                            </Stack>
                            <Stack direction="row" alignItems="center" gap="4" wrap="wrap" class="text-sm text-neutral-dark">
                              <Stack direction="row" alignItems="center" gap="1">
                                <Icon icon="calendar" class="w-4 h-4" />
                                {formatDate(event.date)}
                              </Stack>
                              <Stack direction="row" alignItems="center" gap="1">
                                <Icon icon="clock" class="w-4 h-4" />
                                {formatTime(event.date)}
                              </Stack>
                              <span>Dr. {event.provider}</span>
                              {event.facility && <span>{event.facility}</span>}
                            </Stack>
                            <Text as="p" size="sm" color="body" class="line-clamp-2">{event.description}</Text>
                          </Stack>
                        </Stack>
                        <div class="flex-shrink-0 ml-4">
                          {isExpanded ? (
                            <Icon icon="chevron-up" class="w-5 h-5 text-neutral-normal" />
                          ) : (
                            <Icon icon="chevron-down" class="w-5 h-5 text-neutral-normal" />
                          )}
                        </div>
                      </Stack>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div class="border-t border-neutral-light p-4 bg-neutral-lighter">
                        <div class="space-y-4">
                          {event.notes && (
                            <div>
                              <Text as="h5" weight="medium" size="xs" class="mb-2">Notes</Text>
                              <Text as="p" size="sm" color="body">{event.notes}</Text>
                            </div>
                          )}

                          {event.medications && event.medications.length > 0 && (
                            <div>
                              <Text as="h5" weight="medium" size="xs" class="mb-2">Medications</Text>
                              <Stack direction="row" wrap="wrap" gap="2">
                                {event.medications.map((medication, index) => (
                                  <Badge
                                    key={index}
                                    color="success"
                                    variant="flat"
                                    size="sm"
                                    pill
                                  >
                                    {medication}
                                  </Badge>
                                ))}
                              </Stack>
                            </div>
                          )}

                          {(event.icd10 || event.cpt) && (
                            <Stack direction="row" gap="6" wrap="wrap">
                              {event.icd10 && (
                                <div>
                                  <Text as="h5" weight="medium" size="xs" class="mb-1">ICD-10</Text>
                                  <Text as="p" size="sm" color="body">{event.icd10}</Text>
                                </div>
                              )}
                              {event.cpt && (
                                <div>
                                  <Text as="h5" weight="medium" size="xs" class="mb-1">CPT</Text>
                                  <Text as="p" size="sm" color="body">{event.cpt}</Text>
                                </div>
                              )}
                            </Stack>
                          )}

                          {event.attachments && event.attachments.length > 0 && (
                            <div>
                              <Text as="h5" weight="medium" size="xs" class="mb-2">Attachments</Text>
                              <div class="space-y-1">
                                {event.attachments.map((attachment, index) => (
                                  <a
                                    key={index}
                                    href={attachment}
                                    class="text-sm text-primary-dark hover:text-primary-darker underline block"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    {attachment}
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
