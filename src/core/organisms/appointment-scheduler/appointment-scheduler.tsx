import { component$, useSignal, useTask$, $ } from "@builder.io/qwik";
import { BaseComponentProps, mergeClasses } from "../../../design-system/props";
import type { Color } from "../../../design-system/types";
import { Stack } from "../../../layouts/stack";
import { Row } from "../../../layouts/row";
import { Button } from "../../atoms/button/button";
import { Text } from "../../atoms/text/text";
import { Input } from "../../atoms/input/input";
import { Icon } from "../../atoms/icon";
import { Badge } from "../../atoms/badge";
import { hipaaAuditor } from "../../../utils/hipaa";
import { performanceMonitor } from "../../../utils/performance";
import { TouchOptimizer } from "../../../utils/mobile-healthcare";

// Healthcare appointment types
export type AppointmentType = 
  | 'consultation'
  | 'follow-up'
  | 'urgent-care'
  | 'routine-checkup'
  | 'specialist'
  | 'telehealth'
  | 'procedure'
  | 'lab-work'
  | 'imaging'
  | 'therapy';

// Provider information
export interface Provider {
  id: string;
  name: string;
  title: string;
  department: string;
  specialties: string[];
  avatar?: string;
  availability: ProviderAvailability[];
  location: {
    building: string;
    floor: string;
    room: string;
  };
}

// Provider availability
export interface ProviderAvailability {
  date: string; // ISO date string
  timeSlots: TimeSlot[];
}

// Time slot information
export interface TimeSlot {
  id: string;
  startTime: string; // ISO datetime string
  endTime: string; // ISO datetime string
  duration: number; // minutes
  isAvailable: boolean;
  appointmentType: AppointmentType;
  isUrgent?: boolean;
  notes?: string;
}

// Appointment data
export interface AppointmentData {
  id?: string;
  patientId: string;
  providerId: string;
  appointmentType: AppointmentType;
  timeSlot: TimeSlot;
  reason: string;
  notes?: string;
  isUrgent: boolean;
  location: Provider['location'];
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
  reminders: {
    email: boolean;
    sms: boolean;
    phone: boolean;
  };
}

// Component props
export interface AppointmentSchedulerProps extends BaseComponentProps<HTMLDivElement> {
  // Patient information
  patientId: string;
  patientName: string;
  
  // Available providers
  providers: Provider[];
  
  // Pre-selected filters
  initialAppointmentType?: AppointmentType;
  initialProviderId?: string;
  initialDate?: string;
  
  // Configuration
  allowUrgentBooking?: boolean;
  showProviderDetails?: boolean;
  enableTelehealth?: boolean;
  maxAdvanceBooking?: number; // days
  minAdvanceBooking?: number; // hours
  
  // Callbacks
  onAppointmentBooked$?: () => void;
  onProviderSelected$?: () => void;
  onTimeSlotSelected$?: () => void;
  onCancel$?: () => void;
}

export const AppointmentScheduler = component$<AppointmentSchedulerProps>((props) => {
  // Component state
  const selectedProvider = useSignal<Provider | null>(null);
  const selectedDate = useSignal<string>('');
  const selectedTimeSlot = useSignal<TimeSlot | null>(null);
  const appointmentType = useSignal<AppointmentType>(props.initialAppointmentType || 'consultation');
  const reason = useSignal<string>('');
  const notes = useSignal<string>('');
  const isUrgent = useSignal<boolean>(false);
  const loading = useSignal<boolean>(false);
  const availableSlots = useSignal<TimeSlot[]>([]);
  const searchQuery = useSignal<string>('');
  
  // Performance tracking
  const startTime = performance.now();
  
  // Initialize component
  useTask$(() => {
    performanceMonitor.trackComponent('AppointmentScheduler', startTime);
    
    // Pre-select provider if specified
    if (props.initialProviderId) {
      const provider = props.providers.find(p => p.id === props.initialProviderId);
      if (provider) {
        selectedProvider.value = provider;
      }
    }
    
    // Pre-select date if specified
    if (props.initialDate) {
      selectedDate.value = props.initialDate;
    } else {
      // Default to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      selectedDate.value = tomorrow.toISOString().split('T')[0];
    }
    
    // Optimize for mobile healthcare
    if (typeof window !== 'undefined') {
      const container = document.querySelector('.appointment-scheduler');
      if (container) {
        TouchOptimizer.ensureTouchTarget(container as HTMLElement);
      }
    }
  });
  
  // Load available time slots when provider or date changes
  useTask$(({ track }) => {
    track(() => selectedProvider.value);
    track(() => selectedDate.value);
    
    if (selectedProvider.value && selectedDate.value) {
      loadAvailableTimeSlots();
    }
  });
  
  // Load available time slots
  const loadAvailableTimeSlots = $(() => {
    if (!selectedProvider.value || !selectedDate.value) return;
    
    const provider = selectedProvider.value;
    const availability = provider.availability.find(
      av => av.date === selectedDate.value
    );
    
    if (availability) {
      // Filter slots by appointment type and availability
      const filtered = availability.timeSlots.filter(slot => 
        slot.isAvailable && 
        (slot.appointmentType === appointmentType.value || slot.appointmentType === 'consultation')
      );
      
      availableSlots.value = filtered.sort((a, b) => 
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
    } else {
      availableSlots.value = [];
    }
  });
  
  // Select provider
  const selectProvider = $((provider: Provider) => {
    selectedProvider.value = provider;
    selectedTimeSlot.value = null; // Reset time slot selection
    
    // HIPAA audit log
    hipaaAuditor.logPHIAccess(
      'current-user', // In production, get from auth context
      'patient',
      'view',
      'provider-selection',
      ['name'],
      props.patientId,
      true,
      `Selected provider: ${provider.name}`
    );
    
    props.onProviderSelected$?.();
  });
  
  // Select time slot
  const selectTimeSlot = $((slot: TimeSlot) => {
    selectedTimeSlot.value = slot;
    props.onTimeSlotSelected$?.();
  });
  
  // Book appointment
  const bookAppointment = $(async () => {
    if (!selectedProvider.value || !selectedTimeSlot.value || !reason.value.trim()) {
      return;
    }
    
    loading.value = true;
    
    try {
      const _appointmentData: AppointmentData = {
        id: `appt_${Date.now()}`,
        patientId: props.patientId,
        providerId: selectedProvider.value.id,
        appointmentType: appointmentType.value,
        timeSlot: selectedTimeSlot.value,
        reason: reason.value,
        notes: notes.value,
        isUrgent: isUrgent.value,
        location: selectedProvider.value.location,
        status: 'scheduled',
        reminders: {
          email: true,
          sms: true,
          phone: false,
        },
      };
      
      // HIPAA audit log for appointment creation
      hipaaAuditor.logPHIAccess(
        'current-user',
        'patient',
        'create',
        'appointment',
        ['name', 'mrn', 'phone'],
        props.patientId,
        true,
        `Booked appointment with ${selectedProvider.value.name}`
      );
      
      props.onAppointmentBooked$?.();
      
      // Reset form
      selectedTimeSlot.value = null;
      reason.value = '';
      notes.value = '';
      isUrgent.value = false;
      
    } catch (error) {
      console.error('Failed to book appointment:', error);
    } finally {
      loading.value = false;
    }
  });
  
  // Filter providers based on search
  const filteredProviders = props.providers.filter(provider => {
    if (!searchQuery.value) return true;
    
    const query = searchQuery.value.toLowerCase();
    return (
      provider.name.toLowerCase().includes(query) ||
      provider.department.toLowerCase().includes(query) ||
      provider.specialties.some(spec => spec.toLowerCase().includes(query))
    );
  });
  
  // Format time for display
  const formatTime = (timeString: string): string => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };
  
  // Format date for display
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  // Get appointment type badge color
  const getAppointmentTypeBadge = (type: AppointmentType): { color: Color; label: string } => {
    const types: Record<AppointmentType, { color: Color; label: string }> = {
      'urgent-care': { color: 'error' as Color, label: 'Urgent Care' },
      'consultation': { color: 'primary' as Color, label: 'Consultation' },
      'follow-up': { color: 'info' as Color, label: 'Follow-up' },
      'routine-checkup': { color: 'success' as Color, label: 'Routine' },
      'specialist': { color: 'warning' as Color, label: 'Specialist' },
      'telehealth': { color: 'info' as Color, label: 'Telehealth' },
      'procedure': { color: 'warning' as Color, label: 'Procedure' },
      'lab-work': { color: 'info' as Color, label: 'Lab Work' },
      'imaging': { color: 'info' as Color, label: 'Imaging' },
      'therapy': { color: 'success' as Color, label: 'Therapy' },
    };
    return types[type] || { color: 'primary' as Color, label: type };
  };
  
  return (
    <div class="themed-content">
      <div
      class={mergeClasses(
        "appointment-scheduler bg-white rounded-lg border border-neutral-light p-6",
        props.class
      )}
      {...props}
    >
      <Stack gap="6">
        {/* Header */}
        <Row justifyContent="between" alignItems="center">
          <Stack gap="1">
            <Text style="title" color="primary">
              Schedule Appointment
            </Text>
            <Text style="body" color="secondary">
              for {props.patientName}
            </Text>
          </Stack>
          
          {props.allowUrgentBooking && (
            <Badge
              color={isUrgent.value ? 'error' : 'secondary'}
              variant={isUrgent.value ? 'elevated' : 'flat'}
            >
              {isUrgent.value ? 'Urgent' : 'Standard'}
            </Badge>
          )}
        </Row>
        
        {/* Appointment Type Selection */}
        <Stack gap="3">
          <Text style="subtitle" weight="medium">
            Appointment Type
          </Text>
          
          <Row gap="2" wrap>
            {(['consultation', 'follow-up', 'urgent-care', 'routine-checkup', 'telehealth'] as AppointmentType[]).map((type) => {
              const badge = getAppointmentTypeBadge(type);
              return (
                <Button
                  key={type}
                  variant={appointmentType.value === type ? 'elevated' : 'outlined'}
                  size="sm"
                  color={appointmentType.value === type ? badge.color : 'secondary'}
                  onClick$={() => {
                    appointmentType.value = type;
                    if (type === 'urgent-care') {
                      isUrgent.value = true;
                    }
                  }}
                >
                  {badge.label}
                </Button>
              );
            })}
          </Row>
        </Stack>
        
        {/* Provider Selection */}
        <Stack gap="3">
          <Text style="subtitle" weight="medium">
            Select Provider
          </Text>
          
          {/* Provider Search */}
          <Input
            placeholder="Search providers, departments, or specialties..."
            value={searchQuery.value}
            onInput$={(_, element) => {
              searchQuery.value = element.value;
            }}
            class="healthcare-touch"
          />
          
          {/* Provider List */}
          <Stack gap="2" class="max-h-64 overflow-y-auto">
            {filteredProviders.map((provider) => (
              <div
                key={provider.id}
                class={mergeClasses(
                  "p-4 border rounded-lg cursor-pointer transition-all healthcare-touch",
                  selectedProvider.value?.id === provider.id
                    ? "border-primary-300 bg-primary-50"
                    : "border-neutral-light hover:border-neutral-light hover:bg-neutral-lighter"
                )}
                onClick$={() => selectProvider(provider)}
              >
                <Row gap="3" alignItems="center">
                  {provider.avatar && (
                    <img
                      src={provider.avatar}
                      alt={provider.name}
                      class="w-12 h-12 rounded-full object-cover"
                      width="48"
                      height="48"
                    />
                  )}
                  
                  <div class="flex-1">
                    <Stack gap="1">
                      <Text weight="medium">{provider.name}</Text>
                      <Text size="sm" color="secondary">
                        {provider.title} • {provider.department}
                      </Text>
                      <Row gap="1" wrap>
                        {provider.specialties.slice(0, 3).map((specialty) => (
                          <Badge
                            key={specialty}
                            size="sm"
                            color="info"
                            variant="flat"
                          >
                            {specialty}
                          </Badge>
                        ))}
                      </Row>
                    </Stack>
                  </div>
                  
                  {props.showProviderDetails && (
                    <Stack gap="1" alignItems="end">
                      <Text size="sm" color="secondary">
                        {provider.location.building}
                      </Text>
                      <Text size="sm" color="secondary">
                        {provider.location.floor} • {provider.location.room}
                      </Text>
                    </Stack>
                  )}
                </Row>
              </div>
            ))}
          </Stack>
        </Stack>
        
        {/* Date & Time Selection */}
        {selectedProvider.value && (
          <Stack gap="3">
            <Text style="subtitle" weight="medium">
              Select Date & Time
            </Text>
            
            {/* Date Selection */}
            <Input
              type="date"
              value={selectedDate.value}
              onInput$={(_, element) => {
                selectedDate.value = element.value;
              }}
              min={new Date().toISOString().split('T')[0]}
              class="healthcare-touch"
            />
            
            {/* Time Slots */}
            {selectedDate.value && (
              <Stack gap="2">
                <Text style="body" weight="medium">
                  Available Times for {formatDate(selectedDate.value)}
                </Text>
                
                {availableSlots.value.length === 0 ? (
                  <div class="p-4 text-center border border-neutral-light rounded-lg">
                    <Icon icon="calendar" size={24} />
                    <Text color="secondary" style="body">
                      No available appointments for this date
                    </Text>
                  </div>
                ) : (
                  <Row gap="2" wrap>
                    {availableSlots.value.map((slot) => (
                      <Button
                        key={slot.id}
                        variant={selectedTimeSlot.value?.id === slot.id ? 'elevated' : 'outlined'}
                        color={selectedTimeSlot.value?.id === slot.id ? 'primary' : 'secondary'}
                        size="sm"
                        onClick$={() => selectTimeSlot(slot)}
                        class="healthcare-touch"
                      >
                        <Stack gap="0" alignItems="center">
                          <Text size="sm">
                            {formatTime(slot.startTime)}
                          </Text>
                          <Text size="xs" color="secondary">
                            {slot.duration}min
                          </Text>
                        </Stack>
                      </Button>
                    ))}
                  </Row>
                )}
              </Stack>
            )}
          </Stack>
        )}
        
        {/* Appointment Details */}
        {selectedTimeSlot.value && (
          <Stack gap="3">
            <Text style="subtitle" weight="medium">
              Appointment Details
            </Text>
            
            <Input
              placeholder="Reason for visit (required)"
              value={reason.value}
              onInput$={(_, element) => {
                reason.value = element.value;
              }}
              required
              class="healthcare-touch"
            />
            
            <textarea
              placeholder="Additional notes or symptoms (optional)"
              value={notes.value}
              onInput$={(_, element) => {
                notes.value = element.value;
              }}
              class="w-full p-3 border border-neutral-light rounded-md resize-none healthcare-touch"
              rows={3}
            />
            
            {props.allowUrgentBooking && (
              <label class="flex items-center gap-2 healthcare-touch">
                <input
                  type="checkbox"
                  checked={isUrgent.value}
                  onChange$={(_, element) => {
                    isUrgent.value = element.checked;
                  }}
                  class="w-4 h-4"
                />
                <Text>This is an urgent appointment</Text>
              </label>
            )}
          </Stack>
        )}
        
        {/* Actions */}
        <Row gap="3" justifyContent="end">
          <Button
            variant="outlined"
            color="secondary"
            onClick$={props.onCancel$}
            disabled={loading.value}
          >
            Cancel
          </Button>
          
          <Button
            color={isUrgent.value ? 'error' : 'primary'}
            onClick$={bookAppointment}
            disabled={!selectedTimeSlot.value || !reason.value.trim() || loading.value}
            loading={loading.value}
            class="healthcare-touch"
          >
            <Icon icon={isUrgent.value ? 'alert-triangle' : 'check-circle'} size={16} />
            {isUrgent.value ? 'Book Urgent Appointment' : 'Book Appointment'}
          </Button>
        </Row>
        
        {/* Confirmation Summary */}
        {selectedProvider.value && selectedTimeSlot.value && (
          <div class="p-4 bg-primary-50 border border-primary-200 rounded-lg">
            <Stack gap="2">
              <Text style="subtitle" color="primary" weight="medium">
                Appointment Summary
              </Text>
              
              <Row gap="4" wrap>
                <Stack gap="1">
                  <Text size="sm" color="secondary">Provider</Text>
                  <Text weight="medium">{selectedProvider.value.name}</Text>
                </Stack>
                
                <Stack gap="1">
                  <Text size="sm" color="secondary">Date & Time</Text>
                  <Text weight="medium">
                    {formatDate(selectedDate.value)} at {formatTime(selectedTimeSlot.value.startTime)}
                  </Text>
                </Stack>
                
                <Stack gap="1">
                  <Text size="sm" color="secondary">Type</Text>
                  <Badge color="primary" size="sm">
                    {getAppointmentTypeBadge(appointmentType.value).label}
                  </Badge>
                </Stack>
                
                <Stack gap="1">
                  <Text size="sm" color="secondary">Location</Text>
                  <Text weight="medium">
                    {selectedProvider.value.location.building}, {selectedProvider.value.location.floor}, {selectedProvider.value.location.room}
                  </Text>
                </Stack>
              </Row>
            </Stack>
          </div>
        )}
      </Stack>
    </div>
    </div>
  );
});
