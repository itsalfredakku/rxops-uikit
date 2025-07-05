import { component$, $ } from "@builder.io/qwik";
import { Badge } from "../../../core/atoms/badge/index";
import { Button } from "../../../core/atoms/button/button";
import { Avatar } from "../../../core/atoms/avatar/avatar";
import { Text } from "../../../core/atoms/text/text";
import { Row, Column } from "../../../layouts";
// import { Stack } from "../../../layouts";
import { BaseComponentProps, mergeClasses } from "../../../design-system/props";

export type AppointmentStatus = "scheduled" | "completed" | "cancelled" | "in-progress";

export interface Appointment {
  id: string;
  doctorName: string;
  doctorImage?: string;
  specialization: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  type: "video" | "audio" | "chat" | "in-person";
  notes?: string;
}

export interface AppointmentCardProps extends Omit<BaseComponentProps<HTMLDivElement>, `on${string}$`> {
  /** Appointment details */
  appointment: Appointment;
  /** Called when user joins the appointment */
  onJoin$?: (appointmentId: string) => void;
  /** Called when user reschedules the appointment */
  onReschedule$?: (appointmentId: string) => void;
  /** Called when user cancels the appointment */
  onCancel$?: (appointmentId: string) => void;
}

const statusConfig = {
  scheduled: { 
    variant: "default" as const, 
    label: "Scheduled",
    color: "text-primary-600"
  },
  completed: { 
    variant: "success" as const, 
    label: "Completed",
    color: "text-success-600"
  },
  cancelled: { 
    variant: "error" as const, 
    label: "Cancelled",
    color: "text-error-600"
  },
  "in-progress": { 
    variant: "warning" as const, 
    label: "In Progress",
    color: "text-orange-600"
  },
};

export const AppointmentCard = component$<AppointmentCardProps>((props) => {
  const { 
    appointment, 
    onJoin$,
    onReschedule$,
    onCancel$,
    class: qwikClass,
    className,
    style,
    ...rest
  } = props;

  const status = statusConfig[appointment.status];
  
  const rootClasses = mergeClasses(
    "ui-appointment-card bg-white rounded-lg border border-neutral-200 p-4 hover:shadow-md transition-shadow",
    qwikClass,
    className
  );
  
  return (
    <div 
      class={rootClasses}
      style={style}
      {...rest}
    >
      <Row alignItems="start" justifyContent="between" class="mb-4">
        <Row alignItems="center" gap="3">
          <Avatar
            src={appointment.doctorImage}
            alt={appointment.doctorName}
            size="md"
            name={appointment.doctorName}
          />
          <div>
            <Text as="h3" weight="semibold" size="lg" color="gray-900">
              {appointment.doctorName}
            </Text>
            <Text as="p" size="sm" color="gray-600">
              {appointment.specialization}
            </Text>
          </div>
        </Row>
        
        <Badge style={status.variant === "error" ? "danger" : status.variant === "success" ? "success" : status.variant === "warning" ? "warning" : "secondary"} size="sm">
          {status.label}
        </Badge>
      </Row>
      
      <Row gap="4" class="mb-4">
        <Column size={{ sm: 12, md: 6 }}>
          <span class="text-sm text-neutral-500">Date</span>
          <Text as="p" weight="medium">{appointment.date}</Text>
        </Column>
        <Column size={{ sm: 12, md: 6 }}>
          <span class="text-sm text-neutral-500">Time</span>
          <Text as="p" weight="medium">{appointment.time}</Text>
        </Column>
      </Row>
      
      <Row alignItems="center" justifyContent="between" class="mb-4">
        <Row alignItems="center" gap="2">
          <span class="text-sm text-neutral-500">Type:</span>
          <Badge style="secondary" size="sm">
            {appointment.type}
          </Badge>
        </Row>
      </Row>
      
      {appointment.notes && (
        <div class="mb-4">
          <span class="text-sm text-neutral-500">Notes:</span>
          <Text as="p" size="sm" color="gray-700" class="mt-1">{appointment.notes}</Text>
        </div>
      )}
      
      <Row gap="2">
        {appointment.status === "scheduled" && (
          <>
            <Button
              variant="elevated" color="primary"
              size="sm"
              class="flex-1"
              onClick$={onJoin$ && $(() => onJoin$(appointment.id))}
            >
              Join Now
            </Button>
            <Button
              variant="outlined"
              size="sm"
              onClick$={onReschedule$ && $(() => onReschedule$(appointment.id))}
            >
              Reschedule
            </Button>
            <Button
              variant="outlined"
              size="sm"
              onClick$={onCancel$ && $(() => onCancel$(appointment.id))}
            >
              Cancel
            </Button>
          </>
        )}
        
        {appointment.status === "in-progress" && (
          <Button
            variant="elevated" color="primary"
            size="sm"
            class="w-full"
            onClick$={onJoin$ && $(() => onJoin$(appointment.id))}
          >
            Join Call
          </Button>
        )}
      </Row>
    </div>
  );
});
