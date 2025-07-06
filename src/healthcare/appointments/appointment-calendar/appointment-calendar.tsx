import { component$, useSignal, useStore, $, type QRL } from '@builder.io/qwik';
import { Text } from '../../../core/atoms/text/text';
import { Spinner } from '../../../core/atoms/spinner/spinner';
import { Tooltip } from '../../../core/atoms/tooltip/tooltip';
import { Button } from '../../../core/atoms/button/button';
import { Input } from '../../../core/atoms/input/input';
import { Textarea } from '../../../core/atoms/textarea/textarea';
import { FormField } from '../../../core/molecules/form-field/form-field';
import { Modal } from '../../../core/organisms/modal/modal';
import { BaseComponentProps, mergeClasses } from '../../../design-system/props';
import { Alert } from '../../../core/atoms/alert/alert';
import { Row } from '../../../layouts';
interface TimeSlot {
  time: string;
  available: boolean;
  providerId?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  providerId: string;
  providerName: string;
  appointmentDate: Date;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  type: 'consultation' | 'follow-up' | 'emergency' | 'procedure' | 'virtual';
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  location?: {
    type: 'in-person' | 'virtual';
    room?: string;
    building?: string;
    address?: string;
    virtualLink?: string;
  };
  description?: string;
  notes?: string;
  priority: 'routine' | 'urgent' | 'critical';
  specialty?: string;
  reasonForVisit: string;
  insuranceInfo?: {
    provider: string;
    policyNumber: string;
    groupNumber: string;
    verified: boolean;
  };
  requiredDocuments?: string[];
  preparationInstructions?: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  reminders?: Array<{
    type: 'email' | 'sms' | 'call';
    scheduledFor: Date;
    sent: boolean;
    sentAt?: Date;
  }>;
}

export interface Provider {
  id: string;
  name: string;
  title: string;
  specialty: string;
  license: string;
  department: string;
  availability: Array<{
    dayOfWeek: number; // 0-6 (Sunday-Saturday)
    startTime: string;
    endTime: string;
    location: string;
  }>;
  bookedSlots: Array<{
    date: Date;
    startTime: string;
    endTime: string;
  }>;
}

export interface AppointmentCalendarProps extends Omit<BaseComponentProps<HTMLDivElement>, `on${string}$`> {
  // Data props
  /** List of appointments to display on the calendar */
  appointments?: Appointment[];
  /** List of healthcare providers */
  providers?: Provider[];
  /** ID of the current user */
  currentUserId: string;
  /** Role of the current user */
  currentUserRole: 'patient' | 'provider' | 'admin' | 'staff';
  
  // View control
  /** Initial calendar view mode */
  initialView?: 'month' | 'week' | 'day' | 'list';
  /** Initial date to display */
  initialDate?: Date;
  /** Whether to show time slots on the calendar */
  showTimeSlots?: boolean;
  /** Whether to allow booking new appointments */
  allowBooking?: boolean;
  /** Whether to allow rescheduling existing appointments */
  allowRescheduling?: boolean;
  /** Whether to allow cancellation of appointments */
  allowCancellation?: boolean;
  
  // Filtering and search
  /** Filter appointments by provider IDs */
  filterByProvider?: string[];
  /** Filter appointments by type */
  filterByType?: Appointment['type'][];
  /** Filter appointments by status */
  filterByStatus?: Appointment['status'][];
  /** Search query for appointments */
  searchQuery?: string;
  
  // Event handlers
  /** Called when an appointment is selected */
  onAppointmentSelect?: QRL<(appointment: Appointment) => Promise<void>>;
  /** Called when a new appointment is created */
  onAppointmentCreate?: QRL<(appointmentData: Partial<Appointment>) => Promise<void>>;
  /** Called when an appointment is updated */
  onAppointmentUpdate?: QRL<(appointmentId: string, updates: Partial<Appointment>) => Promise<void>>;
  /** Called when an appointment is cancelled */
  onAppointmentCancel?: QRL<(appointmentId: string, reason: string) => Promise<void>>;
  /** Called when a time slot is selected */
  onTimeSlotSelect?: QRL<(date: Date, time: string, providerId?: string) => Promise<void>>;
  /** Called when a new appointment is booked */
  onAppointmentBook?: QRL<(bookingData: {
    date: Date;
    time: string;
    providerId?: string;
    patientName: string;
    patientEmail: string;
    patientPhone: string;
    appointmentType: string;
    notes: string;
    duration: number;
  }) => Promise<void>>;
  /** Called when a provider is selected */
  onProviderSelect?: QRL<(providerId: string) => Promise<void>>;
  /** Called when the displayed date range changes */
  onDateRangeChange?: QRL<(startDate: Date, endDate: Date) => Promise<void>>;
  
  // UI props
  /** Whether the calendar is in loading state */
  isLoading?: boolean;
  /** Error message to display */
  error?: string;
}

export const AppointmentCalendar = component$<AppointmentCalendarProps>((props) => {
  const {
    // Extract standard BaseComponentProps
    class: qwikClass,
    className,
    style,
    
    // Extract component-specific props
    appointments = [],
    providers = [],
    initialView = 'month',
    initialDate = new Date(),
    isLoading = false,
    error,
    searchQuery = '',
    filterByProvider = [],
    filterByType = [],
    filterByStatus = [],
    
    // Spread the rest
    ...rest
  } = props;

  // State management
  const currentView = useSignal(initialView);
  const currentDate = useSignal(initialDate);
  const selectedAppointment = useSignal<Appointment | null>(null);
  const showAppointmentModal = useSignal(false);
  const showBookingModal = useSignal(false);
  const selectedTimeSlot = useSignal<{ date: Date; time: string; providerId?: string } | null>(null);
  
  // Booking form state
  const bookingForm = useStore({
    patientName: '',
    patientEmail: '',
    patientPhone: '',
    appointmentType: '',
    notes: '',
    duration: 30
  });
  
  const searchState = useStore({
    query: searchQuery,
    filterProvider: filterByProvider,
    filterType: filterByType,
    filterStatus: filterByStatus
  });

  const calendarState = useStore({
    viewStartDate: new Date(),
    viewEndDate: new Date(),
    visibleAppointments: [] as Appointment[],
    selectedProvider: null as string | null,
    draggedAppointment: null as Appointment | null
  });

  // Generate calendar grid based on current view
  const generateCalendarGrid = (): Date[][] => {
    const grid: Date[][] = [];
    
    if (currentView.value === 'month') {
      // Generate month view grid (6 weeks x 7 days)
      const monthStart = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), 1);
      const calendarStart = new Date(monthStart);
      calendarStart.setDate(monthStart.getDate() - monthStart.getDay());
      
      for (let week = 0; week < 6; week++) {
        const weekRow: Date[] = [];
        for (let day = 0; day < 7; day++) {
          const date = new Date(calendarStart);
          date.setDate(calendarStart.getDate() + (week * 7) + day);
          weekRow.push(date);
        }
        grid.push(weekRow);
      }
    } else if (currentView.value === 'week') {
      // Generate week view grid (7 days with time slots)
      const weekStart = new Date(currentDate.value);
      weekStart.setDate(currentDate.value.getDate() - currentDate.value.getDay());
      
      const weekRow: Date[] = [];
      for (let day = 0; day < 7; day++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + day);
        weekRow.push(date);
      }
      grid.push(weekRow);
    } else if (currentView.value === 'day') {
      // Single day with time slots
      grid.push([new Date(currentDate.value)]);
    }
    
    return grid;
  };

  // Filter appointments based on current criteria
  const getFilteredAppointments = (): Appointment[] => {
    let filtered = appointments;
    
    // Filter by search query
    if (searchState.query) {
      const query = searchState.query.toLowerCase();
      filtered = filtered.filter(apt => 
        apt.patientName.toLowerCase().includes(query) ||
        apt.providerName.toLowerCase().includes(query) ||
        apt.reasonForVisit.toLowerCase().includes(query) ||
        apt.specialty?.toLowerCase().includes(query)
      );
    }
    
    // Filter by provider
    if (searchState.filterProvider.length > 0) {
      filtered = filtered.filter(apt => 
        searchState.filterProvider.includes(apt.providerId)
      );
    }
    
    // Filter by appointment type
    if (searchState.filterType.length > 0) {
      filtered = filtered.filter(apt => 
        searchState.filterType.includes(apt.type)
      );
    }
    
    // Filter by status
    if (searchState.filterStatus.length > 0) {
      filtered = filtered.filter(apt => 
        searchState.filterStatus.includes(apt.status)
      );
    }
    
    // Filter by date range
    filtered = filtered.filter(apt => {
      const aptDate = new Date(apt.appointmentDate);
      return aptDate >= calendarState.viewStartDate && aptDate <= calendarState.viewEndDate;
    });
    
    return filtered;
  };

  // Get appointments for a specific date
  const getAppointmentsForDate = (date: Date): Appointment[] => {
    const appointments = calendarState.visibleAppointments || [];
    return appointments.filter((apt: Appointment) => {
      const aptDate = new Date(apt.appointmentDate);
      return aptDate.toDateString() === date.toDateString();
    });
  };

  // Generate time slots for providers
  const generateTimeSlots = (date: Date, providerId?: string): TimeSlot[] => {
    const timeSlots: TimeSlot[] = [];
    const startHour = 8; // 8 AM
    const endHour = 17; // 5 PM
    const slotDuration = 30; // 30 minutes
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        // Check if slot is available
        const isBooked = calendarState.visibleAppointments.some((apt: Appointment) => {
          const aptDate = new Date(apt.appointmentDate);
          return aptDate.toDateString() === date.toDateString() &&
                 apt.startTime === time &&
                 (!providerId || apt.providerId === providerId);
        });
        
        timeSlots.push({
          time,
          available: !isBooked,
          providerId
        });
      }
    }
    
    return timeSlots;
  };

  // Handle appointment selection
  const handleAppointmentClick = $((appointment: Appointment) => {
    selectedAppointment.value = appointment;
    showAppointmentModal.value = true;
    
    if (rest.onAppointmentSelect) {
      rest.onAppointmentSelect(appointment);
    }
  });

  // Handle time slot selection
  const handleTimeSlotClick = $((date: Date, time: string, providerId?: string) => {
    if (!rest.allowBooking) return;
    
    selectedTimeSlot.value = { date, time, providerId };
    showBookingModal.value = true;
    
    if (rest.onTimeSlotSelect) {
      rest.onTimeSlotSelect(date, time, providerId);
    }
  });

  // Handle booking submission
  const handleBookingSubmit = $(() => {
    if (!selectedTimeSlot.value) return;
    
    const { date, time, providerId } = selectedTimeSlot.value;
    
    // Call the onAppointmentBook callback if provided
    if (rest.onAppointmentBook) {
      rest.onAppointmentBook({
        date,
        time,
        providerId,
        patientName: bookingForm.patientName,
        patientEmail: bookingForm.patientEmail,
        patientPhone: bookingForm.patientPhone,
        appointmentType: bookingForm.appointmentType,
        notes: bookingForm.notes,
        duration: bookingForm.duration
      });
    }
    
    // Reset form and close modal
    bookingForm.patientName = '';
    bookingForm.patientEmail = '';
    bookingForm.patientPhone = '';
    bookingForm.appointmentType = '';
    bookingForm.notes = '';
    bookingForm.duration = 30;
    showBookingModal.value = false;
    selectedTimeSlot.value = null;
  });

  // Handle modal close
  const handleModalClose = $(() => {
    showAppointmentModal.value = false;
    showBookingModal.value = false;
    selectedAppointment.value = null;
    selectedTimeSlot.value = null;
  });

  // Handle view change
  const handleViewChange = $((view: 'month' | 'week' | 'day' | 'list') => {
    currentView.value = view;
    
    // Update date range based on view
    const start = new Date(currentDate.value);
    const end = new Date(currentDate.value);
    
    if (view === 'month') {
      start.setDate(1);
      end.setMonth(end.getMonth() + 1, 0);
    } else if (view === 'week') {
      start.setDate(start.getDate() - start.getDay());
      end.setDate(start.getDate() + 6);
    } else if (view === 'day') {
      end.setDate(start.getDate());
    }
    
    calendarState.viewStartDate = start;
    calendarState.viewEndDate = end;
    
    if (rest.onDateRangeChange) {
      rest.onDateRangeChange(start, end);
    }
  });

  // Handle date navigation
  const handleDateNavigation = $((direction: 'prev' | 'next' | 'today') => {
    const newDate = new Date(currentDate.value);
    
    if (direction === 'today') {
      currentDate.value = new Date();
    } else {
      const increment = direction === 'next' ? 1 : -1;
      
      if (currentView.value === 'month') {
        newDate.setMonth(newDate.getMonth() + increment);
      } else if (currentView.value === 'week') {
        newDate.setDate(newDate.getDate() + (7 * increment));
      } else if (currentView.value === 'day') {
        newDate.setDate(newDate.getDate() + increment);
      }
      
      currentDate.value = newDate;
    }
    
    // Trigger view update
    handleViewChange(currentView.value);
  });

  // Get appointment priority styling
  const getAppointmentPriority = $((priority: Appointment['priority']) => {
    switch (priority) {
      case 'critical':
        return 'border-l-4 border-error-normal bg-gradient-to-r from-error-lighter to-error-lighter/80 text-error-darker shadow-lg ring-1 ring-error-light';
      case 'urgent':
        return 'border-l-4 border-warning-normal bg-gradient-to-r from-warning-lighter to-warning-lighter/80 text-warning-darker shadow-md ring-1 ring-orange-200';
      case 'routine':
      default:
        return 'border-l-4 border-primary-normal bg-gradient-to-r from-info-lighter to-info-lighter/80 text-primary-darker shadow-sm ring-1 ring-blue-200';
    }
  });

  // Get appointment status styling
  const getAppointmentStatus = $((status: Appointment['status']) => {
    switch (status) {
      case 'confirmed':
        return 'bg-gradient-to-r from-success-lighter to-success-light text-success-darker shadow-sm ring-1 ring-success-light';
      case 'in-progress':
        return 'bg-gradient-to-r from-primary-lighter to-primary-light text-primary-darker shadow-sm ring-1 ring-info-light animate-pulse';
      case 'completed':
        return 'bg-gradient-to-r from-surface-light to-surface-light text-text-secondary shadow-sm ring-1 ring-surface-normal';
      case 'cancelled':
        return 'bg-gradient-to-r from-error-lighter to-error-light text-error-darker shadow-sm ring-1 ring-error-light';
      case 'no-show':
        return 'bg-gradient-to-r from-warning-lighter to-warning-light text-warning-darker shadow-sm ring-1 ring-warning-light';
      case 'scheduled':
      default:
        return 'bg-gradient-to-r from-primary-lighter to-primary-light text-primary-darker shadow-sm ring-1 ring-primary-light';
    }
  });

  // Get provider color scheme
  const getProviderColors = $((providerId: string) => {
    const colorSchemes = [
      'from-accent-lighter to-accent-lighter border-primary-light text-primary-darker',
      'from-success-lighter to-success-lighter border-success-light text-success-darker', 
      'from-error-lighter to-error-lighter border-error-light text-error-darker',
      'from-warning-lighter to-warning-lighter border-warning-light text-warning-darker',
      'from-info-lighter to-info-lighter border-info-light text-info-darker',
      'from-primary-lighter to-primary-lighter border-primary-light text-primary-darker',
      'from-error-lighter to-error-lighter border-error-light text-error-darker',
      'from-info-lighter to-info-lighter border-info-light text-info-darker'
    ];
    
    // Use hash of provider ID to consistently assign colors
    const hash = providerId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return colorSchemes[Math.abs(hash) % colorSchemes.length];
  });

  const rootClasses = mergeClasses(
    'appointment-calendar w-full h-full bg-gradient-to-br from-white to-info-lighter/30 rounded-xl shadow-lg border border-info-lighter/50 backdrop-blur-sm',
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
      {/* Loading State */}
      {isLoading && (
        <div class="flex flex-col items-center justify-center h-64 space-y-3">
          <Spinner size="lg" variant="circular" color="blue-600" />
          <Text as="p" size="sm" color="gray-600">Loading calendar...</Text>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Alert 
          color="error" 
          variant="soft" 
          title="Calendar Error"
          class="m-4"
        >
          {error}
        </Alert>
      )}

      {/* Calendar Header */}
      {!isLoading && !error && (
        <div class="calendar-header border-b border-info-light/50 bg-gradient-to-r from-info-lighter/50 to-info-lighter/30 backdrop-blur-sm p-6">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* Navigation Controls */}
            <div class="flex items-center gap-3">
              <button
                type="button"
                onClick$={() => handleDateNavigation('prev')}
                class="p-3 rounded-xl border border-info-light bg-white/80 backdrop-blur-sm text-primary-dark transition-all duration-300 hover:bg-info-lighter hover:shadow-md hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-normal focus-visible:ring-offset-2 active:scale-95"
                aria-label="Previous period"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button
                type="button"
                onClick$={() => handleDateNavigation('today')}
                class="px-4 py-3 rounded-xl border border-info-light bg-white/80 backdrop-blur-sm text-sm font-semibold text-primary-dark transition-all duration-300 hover:bg-info-lighter hover:shadow-md hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-normal focus-visible:ring-offset-2 active:scale-95"
              >
                Today
              </button>
              
              <button
                type="button"
                onClick$={() => handleDateNavigation('next')}
                class="p-3 rounded-xl border border-info-light bg-white/80 backdrop-blur-sm text-primary-dark transition-all duration-300 hover:bg-info-lighter hover:shadow-md hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-normal focus-visible:ring-offset-2 active:scale-95"
                aria-label="Next period"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              <Text as="h2" weight="semibold" size="xl" color="blue-900" class="ml-6 bg-gradient-to-r from-primary-darker to-primary-darker bg-clip-text text-transparent">
                {currentDate.value.toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long',
                  ...(currentView.value === 'day' && { day: 'numeric' })
                })}
              </Text>
            </div>

            {/* View Toggle */}
            <div class="flex items-center gap-1 bg-white/60 backdrop-blur-sm rounded-xl p-1.5 shadow-sm border border-info-lighter">
              {(['month', 'week', 'day', 'list'] as const).map((view) => (
                <button
                  key={view}
                  type="button"
                  onClick$={() => handleViewChange(view)}
                  class={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    currentView.value === view
                      ? 'bg-gradient-to-r from-info-dark to-info-dark text-white shadow-lg scale-105'
                      : 'text-primary-dark hover:text-primary-darker hover:bg-info-lighter/50 hover:scale-102'
                  }`}
                >
                  {view.charAt(0).toUpperCase() + view.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Search and Filters */}
          <div class="mt-6 flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div class="flex-1">
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-info-normal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search appointments..."
                  value={searchState.query}
                  onInput$={(e) => {
                    searchState.query = (e.target as HTMLInputElement).value;
                  }}
                  class="w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-info-light rounded-xl shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-normal focus-visible:ring-offset-2 focus:border-primary-normal transition-all duration-300 hover:bg-white/90"
                  aria-label="Search appointments"
                />
              </div>
            </div>

            {/* Filter Controls */}
            <div class="flex gap-3">
              {/* Provider Filter */}
              <select
                multiple
                value={searchState.filterProvider}
                onChange$={(e) => {
                  const select = e.target as HTMLSelectElement;
                  searchState.filterProvider = Array.from(select.selectedOptions).map(opt => opt.value);
                }}
                class="px-4 py-3 bg-white/80 backdrop-blur-sm border border-info-light rounded-xl shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-normal focus-visible:ring-offset-2 transition-all duration-300 hover:bg-white/90 min-w-48"
                aria-label="Filter by provider"
              >
                <option value="">All Providers</option>
                {providers.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {`${provider.name} - ${provider.specialty}`}
                  </option>
                ))}
              </select>

              {/* Type Filter */}
              <select
                value={searchState.filterType[0] || ''}
                onChange$={(e) => {
                  const value = (e.target as HTMLSelectElement).value;
                  searchState.filterType = value ? [value as Appointment['type']] : [];
                }}
                class="px-4 py-3 bg-white/80 backdrop-blur-sm border border-info-light rounded-xl shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-normal focus-visible:ring-offset-2 transition-all duration-300 hover:bg-white/90 min-w-40"
                aria-label="Filter by appointment type"
              >
                <option value="">All Types</option>
                <option value="consultation">Consultation</option>
                <option value="follow-up">Follow-up</option>
                <option value="emergency">Emergency</option>
                <option value="procedure">Procedure</option>
                <option value="virtual">Virtual</option>
              </select>

              {/* Status Filter */}
              <select
                value={searchState.filterStatus[0] || ''}
                onChange$={(e) => {
                  const value = (e.target as HTMLSelectElement).value;
                  searchState.filterStatus = value ? [value as Appointment['status']] : [];
                }}
                class="px-4 py-3 bg-white/80 backdrop-blur-sm border border-info-light rounded-xl shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-normal focus-visible:ring-offset-2 transition-all duration-300 hover:bg-white/90 min-w-36"
                aria-label="Filter by appointment status"
              >
                <option value="">All Statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="confirmed">Confirmed</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no-show">No Show</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Content */}
      {!isLoading && !error && (
        <div class="calendar-content flex-1 p-6">
          {/* Month View */}
          {currentView.value === 'month' && (
            <div class="month-view">
              {/* Weekday Headers */}
              <Row gap="2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} class="bg-gradient-to-r from-info-lighter to-info-lighter py-3 text-center text-sm font-semibold text-primary-darker rounded-lg shadow-sm border border-info-light/50">
                    {day}
                  </div>
                ))}
              </Row>

              {/* Calendar Grid */}
              <div class="mt-2">
                {generateCalendarGrid().map((week: Date[], weekIndex: number) => (
                  <Row key={weekIndex} gap="2" class="mb-2">
                    {week.map((date: Date, dayIndex: number) => {
                      const dayAppointments = getAppointmentsForDate(date);
                      const isCurrentMonth = date.getMonth() === currentDate.value.getMonth();
                      const isToday = date.toDateString() === new Date().toDateString();
                      
                      return (
                        <div
                          key={dayIndex}
                          class={`min-h-32 p-3 rounded-xl shadow-sm border transition-all duration-300 cursor-pointer hover:shadow-md hover:scale-102 ${
                            !isCurrentMonth ? 'bg-neutral-lighter/50 text-neutral-light border-neutral-light' : 'bg-white/80 backdrop-blur-sm border-info-light/50'
                          } ${isToday ? 'bg-gradient-to-br from-primary-lighter to-primary-lighter border-primary-normal ring-2 ring-info-light/50' : ''}`}
                          onClick$={() => {
                            if (rest.allowBooking && isCurrentMonth) {
                              currentDate.value = date;
                              handleViewChange('day');
                            }
                          }}
                        >
                          <div class={`text-sm font-semibold ${isToday ? 'text-primary-dark' : isCurrentMonth ? 'text-neutral-darker' : 'text-neutral-light'}`}>
                            {date.getDate()}
                          </div>
                          
                          {/* Appointments for this day */}
                          <div class="mt-2 space-y-1.5">
                            {dayAppointments.slice(0, 3).map((appointment: Appointment) => (
                              <div
                                key={appointment.id}
                                class={`text-xs p-2 rounded-lg cursor-pointer truncate transition-all duration-200 hover:scale-105 ${getAppointmentPriority(appointment.priority)} bg-gradient-to-r ${getProviderColors(appointment.providerId)}`}
                                onClick$={(e) => {
                                  e.stopPropagation();
                                  handleAppointmentClick(appointment);
                                }}
                              >
                                <Tooltip content={`${appointment.startTime} - ${appointment.patientName} (${appointment.type})`}>
                                  <div class="font-medium">{appointment.startTime}</div>
                                  <div class="truncate">{appointment.patientName}</div>
                                </Tooltip>
                              </div>
                            ))}
                            {dayAppointments.length > 3 && (
                              <div class="text-xs text-primary-normal font-medium bg-info-lighter rounded px-2 py-1">
                                +{dayAppointments.length - 3} more
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </Row>
                ))}
              </div>
            </div>
          )}

          {/* Week View */}
          {currentView.value === 'week' && (
            <div class="week-view">
              <Row gap="3">
                {/* Time column */}
                <div class="space-y-12 pt-12">
                  {Array.from({ length: 9 }, (_, i) => i + 8).map((hour) => (
                    <div key={hour} class="text-sm font-medium text-primary-normal text-right pr-3 py-1">
                      {hour}:00
                    </div>
                  ))}
                </div>

                {/* Day columns */}
                {generateCalendarGrid()[0]?.map((date: Date, index: number) => {
                  const dayAppointments = getAppointmentsForDate(date);
                  const isToday = date.toDateString() === new Date().toDateString();
                  
                  return (
                    <div key={index} class="flex flex-col flex-1">
                      {/* Day header */}
                      <div class={`text-center py-4 mb-3 rounded-xl shadow-sm border transition-all duration-300 ${
                        isToday 
                          ? 'bg-gradient-to-r from-primary-lighter to-primary-lighter border-info-light ring-1 ring-info-light/50' 
                          : 'bg-white/80 backdrop-blur-sm border-info-light/50'
                      }`}>
                        <div class="text-sm font-semibold text-primary-dark">
                          {date.toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                        <div class={`text-xl font-bold ${isToday ? 'text-primary-dark' : 'text-neutral-darker'}`}>
                          {date.getDate()}
                        </div>
                      </div>

                      {/* Time slots */}
                      <div class="flex-1 relative space-y-12">
                        {generateTimeSlots(date).map((slot) => (
                          <div
                            key={slot.time}
                            class={`h-12 border-t border-info-lighter/50 cursor-pointer transition-all duration-300 hover:bg-info-lighter/50 rounded-md ${
                              !slot.available ? 'bg-neutral-lighter/50' : ''
                            }`}
                            onClick$={() => {
                              if (slot.available && rest.allowBooking) {
                                handleTimeSlotClick(date, slot.time);
                              }
                            }}
                          >
                            {/* Appointments in this slot */}
                            {dayAppointments
                              .filter(apt => apt.startTime === slot.time)
                              .map((appointment) => (
                                <div
                                  key={appointment.id}
                                  class={`absolute left-0 right-0 p-2 m-1 rounded-lg text-xs cursor-pointer transition-all duration-200 hover:scale-105 shadow-sm ${getAppointmentPriority(appointment.priority)} bg-gradient-to-r ${getProviderColors(appointment.providerId)}`}
                                  onClick$={(e) => {
                                    e.stopPropagation();
                                    handleAppointmentClick(appointment);
                                  }}
                                >
                                  <div class="font-semibold truncate">{appointment.patientName}</div>
                                  <div class="truncate opacity-90">{appointment.reasonForVisit}</div>
                                </div>
                              ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </Row>
            </div>
          )}

          {/* Day View */}
          {currentView.value === 'day' && (
            <div class="day-view">
              <Row gap="6">
                {/* Time slots */}
                <div class="flex-1 space-y-3">
                  <Text as="h3" weight="semibold" size="xl" color="blue-900" class="mb-6 bg-gradient-to-r from-primary-darker to-primary-darker bg-clip-text text-transparent">
                    {currentDate.value.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </Text>
                  
                  {generateTimeSlots(currentDate.value).map((slot) => {
                    const appointments = getAppointmentsForDate(currentDate.value).filter(
                      apt => apt.startTime === slot.time
                    );
                    
                    return (
                      <div
                        key={slot.time}
                        class={`p-4 border rounded-xl cursor-pointer transition-all duration-300 shadow-sm ${
                          slot.available 
                            ? 'border-info-light bg-white/80 backdrop-blur-sm hover:border-info-light hover:bg-info-lighter/50 hover:scale-102' 
                            : 'border-neutral-light bg-neutral-lighter/80'
                        }`}
                        onClick$={() => {
                          if (slot.available && rest.allowBooking) {
                            handleTimeSlotClick(currentDate.value, slot.time);
                          } else if (appointments.length > 0) {
                            handleAppointmentClick(appointments[0]);
                          }
                        }}
                      >
                        <div class="font-semibold text-primary-dark text-lg">{slot.time}</div>
                        {appointments.length > 0 ? (
                          appointments.map((appointment) => (
                            <div key={appointment.id} class="mt-3 space-y-2">
                              <div class="text-lg font-semibold text-neutral-darker">{appointment.patientName}</div>
                              <div class="text-sm text-neutral-normal">{appointment.reasonForVisit}</div>
                              <div class="flex items-center gap-3">
                                <span class={`inline-block px-3 py-1.5 text-xs font-medium rounded-full ${getAppointmentStatus(appointment.status)}`}>
                                  {appointment.status}
                                </span>
                                <span class={`inline-block px-3 py-1.5 text-xs font-medium rounded-full bg-gradient-to-r ${getProviderColors(appointment.providerId)}`}>
                                  {appointment.type}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div class="text-sm text-primary-normal mt-1 font-medium">Available for booking</div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Appointment details sidebar */}
                <div class="w-80 bg-gradient-to-br from-info-lighter/50 to-info-lighter/30 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-info-light/50">
                  <Text as="h3" weight="semibold" size="lg" color="blue-900" class="mb-6">Appointment Details</Text>
                  {selectedAppointment.value ? (
                    <div class="space-y-4">
                      <div class="p-4 bg-white/80 rounded-lg shadow-sm border border-info-light/30">
                        <label class="block text-sm font-semibold text-primary-dark mb-2">Patient</label>
                        <Text as="p" size="md" color="gray-900" class="font-medium">{selectedAppointment.value.patientName}</Text>
                      </div>
                      <div class="p-4 bg-white/80 rounded-lg shadow-sm border border-info-light/30">
                        <label class="block text-sm font-semibold text-primary-dark mb-2">Provider</label>
                        <Text as="p" size="md" color="gray-900" class="font-medium">{selectedAppointment.value.providerName}</Text>
                      </div>
                      <div class="p-4 bg-white/80 rounded-lg shadow-sm border border-info-light/30">
                        <label class="block text-sm font-semibold text-primary-dark mb-2">Time</label>
                        <Text as="p" size="md" color="gray-900" class="font-medium">
                          {selectedAppointment.value.startTime} - {selectedAppointment.value.endTime}
                        </Text>
                      </div>
                      <div class="p-4 bg-white/80 rounded-lg shadow-sm border border-info-light/30">
                        <label class="block text-sm font-semibold text-primary-dark mb-2">Reason</label>
                        <Text as="p" size="md" color="gray-900" class="font-medium">{selectedAppointment.value.reasonForVisit}</Text>
                      </div>
                      <div class="p-4 bg-white/80 rounded-lg shadow-sm border border-info-light/30">
                        <label class="block text-sm font-semibold text-primary-dark mb-2">Status</label>
                        <span class={`inline-block px-3 py-2 text-sm font-medium rounded-full ${getAppointmentStatus(selectedAppointment.value.status)}`}>
                          {selectedAppointment.value.status}
                        </span>
                      </div>
                      {selectedAppointment.value.notes && (
                        <div class="p-4 bg-white/80 rounded-lg shadow-sm border border-info-light/30">
                          <label class="block text-sm font-semibold text-primary-dark mb-2">Notes</label>
                          <Text as="p" size="sm" color="gray-900" class="font-medium">{selectedAppointment.value.notes}</Text>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div class="text-center py-8">
                      <svg class="mx-auto h-16 w-16 text-info-light mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <Text as="p" size="sm" color="blue-600" class="font-medium">Select an appointment to view details</Text>
                    </div>
                  )}
                </div>
              </Row>
            </div>
          )}

          {/* List View */}
          {currentView.value === 'list' && (
            <div class="list-view">
              <div class="space-y-4">
                {getFilteredAppointments().map((appointment) => (
                  <div
                    key={appointment.id}
                    class={`p-6 border rounded-xl cursor-pointer transition-all duration-300 shadow-sm hover:shadow-lg hover:scale-102 bg-white/80 backdrop-blur-sm border-info-light/50 ${getAppointmentPriority(appointment.priority)}`}
                    onClick$={() => handleAppointmentClick(appointment)}
                  >
                    <div class="flex justify-between items-start">
                      <div class="flex-1">
                        <div class="flex items-center gap-4 mb-3">
                          <Text as="h3" weight="semibold" size="xl" color="gray-900">{appointment.patientName}</Text>
                          <span class={`px-3 py-1.5 text-sm font-medium rounded-full ${getAppointmentStatus(appointment.status)}`}>
                            {appointment.status}
                          </span>
                          <span class={`px-3 py-1.5 text-sm font-medium rounded-full bg-gradient-to-r ${getProviderColors(appointment.providerId)}`}>
                            {appointment.type}
                          </span>
                        </div>
                        <div class="flex items-center gap-2 text-primary-dark mb-2">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <Text as="p" size="sm" color="blue-700" weight="semibold">
                            {appointment.appointmentDate.toLocaleDateString()} at {appointment.startTime}
                          </Text>
                        </div>
                        <Text as="p" size="md" color="gray-900" class="mb-3 font-medium">{appointment.reasonForVisit}</Text>
                        <div class="flex items-center gap-6 text-sm text-neutral-normal">
                          <div class="flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span class="font-medium">Provider: {appointment.providerName}</span>
                          </div>
                          <div class="flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span class="font-medium">Duration: {appointment.duration}min</span>
                          </div>
                        </div>
                      </div>
                      <div class="flex items-center gap-3">
                        {rest.allowRescheduling && appointment.status === 'scheduled' && (
                          <button
                            type="button"
                            class="px-4 py-2 text-sm font-semibold text-primary-dark border-2 border-primary-normal rounded-lg transition-all duration-300 hover:bg-info-lighter hover:scale-105 active:scale-95"
                            onClick$={(e) => {
                              e.stopPropagation();
                              // Handle reschedule
                            }}
                          >
                            Reschedule
                          </button>
                        )}
                        {rest.allowCancellation && ['scheduled', 'confirmed'].includes(appointment.status) && (
                          <button
                            type="button"
                            class="px-4 py-2 text-sm font-semibold text-error-dark border-2 border-error-normal rounded-lg transition-all duration-300 hover:bg-error-lighter hover:scale-105 active:scale-95"
                            onClick$={(e) => {
                              e.stopPropagation();
                              if (rest.onAppointmentCancel) {
                                rest.onAppointmentCancel(appointment.id, 'User requested cancellation');
                              }
                            }}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {getFilteredAppointments().length === 0 && (
                  <div class="text-center py-16">
                    <svg class="mx-auto h-20 w-20 text-info-light mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <Text as="h3" weight="semibold" size="lg" color="blue-700" class="mb-2">No appointments found</Text>
                    <Text as="p" size="md" color="gray-500">
                      No appointments match your current filters. Try adjusting your search criteria.
                    </Text>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Appointment Details Modal */}
      <Modal
        open={showAppointmentModal.value}
        title="Appointment Details"
        size="md"
        closable={true}
        closeOnBackdrop={true}
        onClose$={handleModalClose}
      >
        {selectedAppointment.value && (
          <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Text as="p" size="sm" weight="medium" color="gray-700">Patient</Text>
                <Text as="p" size="md" class="mt-1">{selectedAppointment.value.patientName}</Text>
              </div>
              <div>
                <Text as="p" size="sm" weight="medium" color="gray-700">Type</Text>
                <Text as="p" size="md" class="mt-1 capitalize">{selectedAppointment.value.type}</Text>
              </div>
              <div>
                <Text as="p" size="sm" weight="medium" color="gray-700">Date & Time</Text>
                <Text as="p" size="md" class="mt-1">
                  {new Date(selectedAppointment.value.appointmentDate).toLocaleDateString()} at {selectedAppointment.value.startTime}
                </Text>
              </div>
              <div>
                <Text as="p" size="sm" weight="medium" color="gray-700">Duration</Text>
                <Text as="p" size="md" class="mt-1">{selectedAppointment.value.duration} minutes</Text>
              </div>
              <div>
                <Text as="p" size="sm" weight="medium" color="gray-700">Status</Text>
                <Text as="p" size="md" class="mt-1 capitalize">{selectedAppointment.value.status}</Text>
              </div>
              <div>
                <Text as="p" size="sm" weight="medium" color="gray-700">Provider</Text>
                <Text as="p" size="md" class="mt-1">{selectedAppointment.value.providerId}</Text>
              </div>
            </div>
            {selectedAppointment.value.notes && (
              <div>
                <Text as="p" size="sm" weight="medium" color="gray-700">Notes</Text>
                <Text as="p" size="md" class="mt-1">{selectedAppointment.value.notes}</Text>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Appointment Booking Modal */}
      <Modal
        open={showBookingModal.value}
        title="Book New Appointment"
        size="md"
        closable={true}
        closeOnBackdrop={true}
        showFooter={true}
        onClose$={handleModalClose}
      >
        <div class="space-y-4">
          {selectedTimeSlot.value && (
            <div class="bg-primary-50 border border-primary-200 rounded-lg p-3 mb-4">
              <Text as="p" size="sm" weight="medium" color="blue-800">
                Selected Time: {new Date(selectedTimeSlot.value.date).toLocaleDateString()} at {selectedTimeSlot.value.time}
              </Text>
              {selectedTimeSlot.value.providerId && (
                <Text as="p" size="sm" color="blue-600">
                  Provider: {selectedTimeSlot.value.providerId}
                </Text>
              )}
            </div>
          )}

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Patient Name" required>
              <Input
                type="text"
                value={bookingForm.patientName}
                placeholder="Enter patient name"
                size="md"
                onInput$={(e) => bookingForm.patientName = (e.target as HTMLInputElement).value}
              />
            </FormField>

            <FormField label="Email" required>
              <Input
                type="email"
                value={bookingForm.patientEmail}
                placeholder="patient@example.com"
                size="md"
                onInput$={(e) => bookingForm.patientEmail = (e.target as HTMLInputElement).value}
              />
            </FormField>

            <FormField label="Phone Number" required>
              <Input
                type="tel"
                value={bookingForm.patientPhone}
                placeholder="+1 (555) 123-4567"
                size="md"
                onInput$={(e) => bookingForm.patientPhone = (e.target as HTMLInputElement).value}
              />
            </FormField>

            <FormField label="Appointment Type" required>
              <Input
                type="text"
                value={bookingForm.appointmentType}
                placeholder="General Consultation"
                size="md"
                onInput$={(e) => bookingForm.appointmentType = (e.target as HTMLInputElement).value}
              />
            </FormField>
          </div>

          <FormField label="Additional Notes">
            <Textarea
              value={bookingForm.notes}
              placeholder="Any specific requirements or symptoms to discuss..."
              rows={3}
              onChange$={(value) => bookingForm.notes = value}
            />
          </FormField>
        </div>

        <div slot="footer" class="flex justify-end space-x-3">
          <Button
            onClick$={handleModalClose}
            intent="neutral"
            size="md"
          >
            Cancel
          </Button>
          <Button
            onClick$={handleBookingSubmit}
            intent="primary"
            size="md"
            disabled={!bookingForm.patientName || !bookingForm.patientEmail || !bookingForm.patientPhone || !bookingForm.appointmentType}
          >
            Book Appointment
          </Button>
        </div>
      </Modal>
    </div>
    </div>
  );
});

export default AppointmentCalendar;
