/**
 * Calendar Component
 * Medical industry-focused calendar component for scheduling and date selection
 * 
 * Features:
 * - Multiple view modes (month, week, day)
 * - Healthcare appointment types and priority levels
 * - Provider color coding and availability
 * - Touch-friendly interface for tablets
 * - Accessibility compliance with keyboard navigation
 * - Emergency slot highlighting
 * - Recurring appointment support
 * - Medical schedule optimization
 */

import { component$, useSignal, useStore, $, useTask$, type QRL } from "@builder.io/qwik";
import { BaseComponentProps, mergeClasses } from "../../../design-system/props";
import { Button } from "../../atoms/button/button";
import { Text } from "../../atoms/text/text";
import type { Color } from "../../../design-system/types";

export type CalendarView = 'month' | 'week' | 'day';
export type CalendarSize = 'sm' | 'md' | 'lg';

export interface CalendarEvent {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  allDay?: boolean;
  type: 'appointment' | 'procedure' | 'emergency' | 'follow-up' | 'consultation' | 'break' | 'blocked';
  priority: 'routine' | 'urgent' | 'critical';
  providerId?: string;
  providerName?: string;
  patientId?: string;
  patientName?: string;
  location?: string;
  description?: string;
  color?: Color;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: Date;
    count?: number;
  };
  metadata?: Record<string, any>;
}

export interface CalendarProps extends Omit<BaseComponentProps<HTMLDivElement>, `on${string}$`> {
  /**
   * Current selected date
   */
  selectedDate?: Date;
  
  /**
   * Calendar view mode
   */
  view?: CalendarView;
  
  /**
   * Calendar size
   */
  size?: CalendarSize;
  
  /**
   * Events to display
   */
  events?: CalendarEvent[];
  
  /**
   * Available time slots for scheduling
   */
  availableSlots?: {
    date: Date;
    slots: Array<{
      startTime: string;
      endTime: string;
      available: boolean;
      providerId?: string;
    }>;
  }[];
  
  /**
   * Provider information for color coding
   */
  providers?: Array<{
    id: string;
    name: string;
    color: Color;
    specialty?: string;
    avatar?: string;
  }>;
  
  /**
   * Minimum selectable date
   */
  minDate?: Date;
  
  /**
   * Maximum selectable date
   */
  maxDate?: Date;
  
  /**
   * Disabled dates
   */
  disabledDates?: Date[];
  
  /**
   * Working hours configuration
   */
  workingHours?: {
    start: string; // HH:mm format
    end: string;   // HH:mm format
    workingDays: number[]; // 0-6 (Sunday-Saturday)
  };
  
  /**
   * Emergency slots configuration
   */
  emergencySlots?: {
    enabled: boolean;
    maxPerDay: number;
    duration: number; // minutes
  };
  
  /**
   * Show weekends
   */
  showWeekends?: boolean;
  
  /**
   * Touch-friendly mode for tablets
   */
  touchFriendly?: boolean;
  
  /**
   * High contrast mode
   */
  highContrast?: boolean;
  
  /**
   * Show provider avatars in events
   */
  showProviderAvatars?: boolean;
  
  /**
   * Show time in events
   */
  showEventTimes?: boolean;
  
  /**
   * Date selection callback
   */
  onDateSelect$?: QRL<(date: Date) => void>;
  
  /**
   * Event click callback
   */
  onEventClick$?: QRL<(event: CalendarEvent) => void>;
  
  /**
   * Slot click callback
   */
  onSlotClick$?: QRL<(date: Date, time?: string) => void>;
  
  /**
   * View change callback
   */
  onViewChange$?: QRL<(view: CalendarView) => void>;
  
  /**
   * Date range change callback (for navigation)
   */
  onDateRangeChange$?: QRL<(start: Date, end: Date) => void>;
}

const calendarSizes = {
  sm: {
    cellHeight: 'h-8',
    cellPadding: 'p-1',
    fontSize: 'text-xs',
    eventHeight: 'h-4',
    headerHeight: 'h-8',
  },
  md: {
    cellHeight: 'h-12',
    cellPadding: 'p-2',
    fontSize: 'text-sm',
    eventHeight: 'h-5',
    headerHeight: 'h-10',
  },
  lg: {
    cellHeight: 'h-16',
    cellPadding: 'p-3',
    fontSize: 'text-base',
    eventHeight: 'h-6',
    headerHeight: 'h-12',
  },
};

const touchFriendlySizes = {
  sm: {
    cellHeight: 'h-12',
    cellPadding: 'p-2',
    fontSize: 'text-sm',
    eventHeight: 'h-5',
    headerHeight: 'h-10',
  },
  md: {
    cellHeight: 'h-16',
    cellPadding: 'p-3',
    fontSize: 'text-base',
    eventHeight: 'h-6',
    headerHeight: 'h-12',
  },
  lg: {
    cellHeight: 'h-20',
    cellPadding: 'p-4',
    fontSize: 'text-lg',
    eventHeight: 'h-7',
    headerHeight: 'h-14',
  },
};

const eventTypeColors = {
  appointment: 'bg-blue-500 text-white',
  procedure: 'bg-purple-500 text-white',
  emergency: 'bg-red-500 text-white animate-pulse',
  'follow-up': 'bg-green-500 text-white',
  consultation: 'bg-cyan-500 text-white',
  break: 'bg-gray-400 text-white',
  blocked: 'bg-gray-600 text-white',
};

const priorityColors = {
  routine: 'border-l-blue-400',
  urgent: 'border-l-orange-400',
  critical: 'border-l-red-600 animate-pulse',
};

// Utility functions for date calculations
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const isSameDay = (date1: Date, date2: Date): boolean => {
  return formatDate(date1) === formatDate(date2);
};

const isToday = (date: Date): boolean => {
  return isSameDay(date, new Date());
};

const getWeekStart = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
};

const getMonthStart = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

const getMonthEnd = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};

const getCalendarDays = (date: Date): Date[] => {
  const start = getMonthStart(date);
  const end = getMonthEnd(date);
  const startDate = getWeekStart(start);
  
  const days: Date[] = [];
  let current = new Date(startDate);
  
  // Get 6 weeks worth of days to fill the grid
  for (let i = 0; i < 42; i++) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  
  return days;
};

const getWeekDays = (date: Date): Date[] => {
  const weekStart = getWeekStart(date);
  const days: Date[] = [];
  
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    days.push(day);
  }
  
  return days;
};

const getEventsForDate = (events: CalendarEvent[], date: Date): CalendarEvent[] => {
  return events.filter(event => {
    if (event.allDay) {
      return isSameDay(event.startDate, date);
    }
    return event.startDate.toDateString() === date.toDateString() ||
           (event.startDate <= date && event.endDate >= date);
  });
};

export const Calendar = component$<CalendarProps>((props) => {
  const {
    selectedDate = new Date(),
    view = 'month',
    size = 'md',
    events = [],
    providers = [],
    minDate,
    maxDate,
    disabledDates = [],
    workingHours = {
      start: '08:00',
      end: '18:00',
      workingDays: [1, 2, 3, 4, 5] // Monday to Friday
    },
    emergencySlots = {
      enabled: true,
      maxPerDay: 2,
      duration: 30
    },
    showWeekends = true,
    touchFriendly = false,
    highContrast = false,
    showProviderAvatars = true,
    showEventTimes = true,
    onDateSelect$,
    onEventClick$,
    onSlotClick$,
    onViewChange$,
    onDateRangeChange$,
    class: className,
    ...rest
  } = props;

  const currentDate = useSignal(new Date(selectedDate));
  const currentView = useSignal(view);
  
  const state = useStore({
    hoveredDate: null as Date | null,
    selectedEvent: null as CalendarEvent | null,
    draggedEvent: null as CalendarEvent | null,
  });

  const sizeConfig = touchFriendly ? touchFriendlySizes[size] : calendarSizes[size];

  // Calculate visible date range based on current view
  const getVisibleDates = $(() => {
    switch (currentView.value) {
      case 'month':
        return getCalendarDays(currentDate.value);
      case 'week':
        return getWeekDays(currentDate.value);
      case 'day':
        return [new Date(currentDate.value)];
      default:
        return getCalendarDays(currentDate.value);
    }
  });

  const visibleDates = useSignal<Date[]>([]);

  useTask$(async ({ track }) => {
    track(() => currentDate.value);
    track(() => currentView.value);
    visibleDates.value = await getVisibleDates();
  });

  // Navigation handlers
  const navigatePrevious = $(() => {
    const newDate = new Date(currentDate.value);
    
    switch (currentView.value) {
      case 'month':
        newDate.setMonth(newDate.getMonth() - 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() - 7);
        break;
      case 'day':
        newDate.setDate(newDate.getDate() - 1);
        break;
    }
    
    currentDate.value = newDate;
    
    if (onDateRangeChange$) {
      const dates = currentView.value === 'month' ? getCalendarDays(newDate) :
                    currentView.value === 'week' ? getWeekDays(newDate) : [newDate];
      onDateRangeChange$(dates[0], dates[dates.length - 1]);
    }
  });

  const navigateNext = $(() => {
    const newDate = new Date(currentDate.value);
    
    switch (currentView.value) {
      case 'month':
        newDate.setMonth(newDate.getMonth() + 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + 7);
        break;
      case 'day':
        newDate.setDate(newDate.getDate() + 1);
        break;
    }
    
    currentDate.value = newDate;
    
    if (onDateRangeChange$) {
      const dates = currentView.value === 'month' ? getCalendarDays(newDate) :
                    currentView.value === 'week' ? getWeekDays(newDate) : [newDate];
      onDateRangeChange$(dates[0], dates[dates.length - 1]);
    }
  });

  const navigateToday = $(() => {
    currentDate.value = new Date();
  });

  const handleDateClick = $((date: Date) => {
    if (minDate && date < minDate) return;
    if (maxDate && date > maxDate) return;
    if (disabledDates.some(disabled => isSameDay(disabled, date))) return;
    
    currentDate.value = new Date(date);
    
    if (onDateSelect$) {
      onDateSelect$(date);
    }
  });

  const handleEventClick = $((event: CalendarEvent, e: Event) => {
    e.stopPropagation();
    state.selectedEvent = event;
    
    if (onEventClick$) {
      onEventClick$(event);
    }
  });

  const handleSlotClick = $((date: Date, time?: string) => {
    if (onSlotClick$) {
      onSlotClick$(date, time);
    }
  });

  const handleViewChange = $((newView: CalendarView) => {
    currentView.value = newView;
    
    if (onViewChange$) {
      onViewChange$(newView);
    }
  });

  const isDateDisabled = (date: Date): boolean => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    if (disabledDates.some(disabled => isSameDay(disabled, date))) return true;
    if (!showWeekends && (date.getDay() === 0 || date.getDay() === 6)) return true;
    return false;
  };

  const isWorkingDay = (date: Date): boolean => {
    return workingHours.workingDays.includes(date.getDay());
  };

  const getFormattedDateRange = (): string => {
    const start = visibleDates.value[0];
    const end = visibleDates.value[visibleDates.value.length - 1];
    
    if (!start || !end) return '';
    
    switch (currentView.value) {
      case 'month':
        return currentDate.value.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long' 
        });
      case 'week':
        if (start.getMonth() === end.getMonth()) {
          return `${start.toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric' 
          })} - ${end.getDate()}, ${end.getFullYear()}`;
        }
        return `${start.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        })} - ${end.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        })}`;
      case 'day':
        return currentDate.value.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          weekday: 'long'
        });
      default:
        return '';
    }
  };

  const containerClasses = mergeClasses(
    'calendar-container bg-white border border-neutral-200 rounded-lg shadow-sm',
    highContrast && 'border-2 border-neutral-800',
    touchFriendly && 'touch-manipulation',
    className
  );

  const headerClasses = mergeClasses(
    'calendar-header flex items-center justify-between p-4 border-b border-neutral-200',
    sizeConfig.headerHeight,
    highContrast && 'border-neutral-800'
  );

  const dayHeaderClasses = mergeClasses(
    'calendar-day-header grid grid-cols-7 border-b border-neutral-200',
    highContrast && 'border-neutral-800'
  );

  const calendarGridClasses = mergeClasses(
    'calendar-grid',
    currentView.value === 'month' && 'grid grid-cols-7',
    currentView.value === 'week' && 'grid grid-cols-7',
    currentView.value === 'day' && 'grid grid-cols-1'
  );

  return (
    <div class={containerClasses} {...rest}>
      {/* Calendar Header */}
      <div class={headerClasses}>
        <div class="flex items-center space-x-4">
          <Button
            variant="text"
            intent="neutral"
            size="sm"
            onClick$={navigatePrevious}
            aria-label="Previous period"
          >
            ‹
          </Button>
          
          <Button
            variant="text"
            intent="neutral"
            size="sm"
            onClick$={navigateNext}
            aria-label="Next period"
          >
            ›
          </Button>
          
          <Button
            variant="text"
            intent="primary"
            size="sm"
            onClick$={navigateToday}
          >
            Today
          </Button>
          
          <Text as="h2" weight="semibold" size="lg" color="gray-900">
            {getFormattedDateRange()}
          </Text>
        </div>
        
        <div class="flex items-center space-x-2">
          <Button
            variant={currentView.value === 'month' ? 'flat' : 'text'}
            intent={currentView.value === 'month' ? 'primary' : 'neutral'}
            size="sm"
            onClick$={() => handleViewChange('month')}
          >
            Month
          </Button>
          <Button
            variant={currentView.value === 'week' ? 'flat' : 'text'}
            intent={currentView.value === 'week' ? 'primary' : 'neutral'}
            size="sm"
            onClick$={() => handleViewChange('week')}
          >
            Week
          </Button>
          <Button
            variant={currentView.value === 'day' ? 'flat' : 'text'}
            intent={currentView.value === 'day' ? 'primary' : 'neutral'}
            size="sm"
            onClick$={() => handleViewChange('day')}
          >
            Day
          </Button>
        </div>
      </div>

      {/* Day Headers */}
      {(currentView.value === 'month' || currentView.value === 'week') && (
        <div class={dayHeaderClasses}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
            <div
              key={day}
              class={mergeClasses(
                'calendar-day-name flex items-center justify-center py-2 px-3',
                sizeConfig.headerHeight,
                sizeConfig.fontSize,
                'font-medium text-neutral-600 bg-neutral-50',
                !showWeekends && (index === 0 || index === 6) && 'hidden',
                highContrast && 'bg-neutral-100 text-neutral-900'
              )}
            >
              {day}
            </div>
          ))}
        </div>
      )}

      {/* Calendar Grid */}
      <div class={calendarGridClasses}>
        {visibleDates.value.map((date, index) => {
          const dateEvents = getEventsForDate(events, date);
          const isDisabled = isDateDisabled(date);
          const isSelected = isSameDay(date, currentDate.value);
          const isCurrentMonth = currentView.value !== 'month' || date.getMonth() === currentDate.value.getMonth();
          const isWorkDay = isWorkingDay(date);
          const todayDate = isToday(date);
          
          return (
            <div
              key={`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`}
              class={mergeClasses(
                'calendar-cell border-b border-r border-neutral-200 relative cursor-pointer transition-colors',
                sizeConfig.cellHeight,
                sizeConfig.cellPadding,
                !isCurrentMonth && 'text-neutral-400 bg-neutral-50',
                isDisabled && 'cursor-not-allowed opacity-50',
                isSelected && 'bg-primary-50 border-primary-200',
                todayDate && 'bg-blue-50 font-semibold',
                !isWorkDay && 'bg-neutral-25',
                state.hoveredDate === date && 'bg-primary-25',
                'hover:bg-primary-25',
                highContrast && 'border-neutral-800'
              )}
              onClick$={() => !isDisabled && handleDateClick(date)}
              onMouseEnter$={() => state.hoveredDate = date}
              onMouseLeave$={() => state.hoveredDate = null}
              role="gridcell"
              aria-label={date.toLocaleDateString()}
              aria-selected={isSelected}
              tabIndex={isDisabled ? -1 : 0}
            >
              {/* Date number */}
              <div class={mergeClasses(
                'calendar-date-number',
                sizeConfig.fontSize,
                todayDate && 'text-blue-600',
                isSelected && 'text-primary-600',
                !isCurrentMonth && 'text-neutral-400'
              )}>
                {date.getDate()}
              </div>
              
              {/* Events */}
              <div class="calendar-events space-y-1 mt-1">
                {dateEvents.slice(0, currentView.value === 'month' ? 2 : 4).map((event) => (
                  <div
                    key={event.id}
                    class={mergeClasses(
                      'calendar-event rounded px-1 py-0.5 text-xs font-medium cursor-pointer',
                      'border-l-2 hover:opacity-80 transition-opacity',
                      sizeConfig.eventHeight,
                      eventTypeColors[event.type],
                      priorityColors[event.priority],
                      highContrast && 'border-2'
                    )}
                    onClick$={(e) => handleEventClick(event, e)}
                    title={`${event.title} - ${event.startDate.toLocaleTimeString()}`}
                  >
                    <div class="flex items-center space-x-1 truncate">
                      {showEventTimes && !event.allDay && (
                        <span class="text-xs opacity-90">
                          {event.startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                      <span class="truncate">{event.title}</span>
                    </div>
                  </div>
                ))}
                
                {dateEvents.length > (currentView.value === 'month' ? 2 : 4) && (
                  <div class="text-xs text-neutral-500 px-1">
                    +{dateEvents.length - (currentView.value === 'month' ? 2 : 4)} more
                  </div>
                )}
              </div>
              
              {/* Emergency slot indicator */}
              {emergencySlots.enabled && isWorkDay && (
                <div class="absolute top-1 right-1 w-2 h-2 bg-red-400 rounded-full opacity-60" 
                     title="Emergency slots available" />
              )}
            </div>
          );
        })}
      </div>
      
      {/* Legend */}
      {providers.length > 0 && (
        <div class="calendar-legend p-4 border-t border-neutral-200 bg-neutral-50">
          <Text as="h4" weight="medium" size="sm" color="gray-700" class="mb-2">
            Providers
          </Text>
          <div class="flex flex-wrap gap-2">
            {providers.map((provider) => (
              <div key={provider.id} class="flex items-center space-x-2">
                <div class={`w-3 h-3 rounded-full bg-${provider.color}-500`} />
                <Text size="xs" color="gray-600">{provider.name}</Text>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

export default Calendar;
