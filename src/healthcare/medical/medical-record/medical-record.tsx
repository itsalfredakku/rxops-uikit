import { component$, useSignal, $ } from "@builder.io/qwik";
import { Button } from "../../../core/atoms/button/button";
import { Badge } from "../../../core/atoms/badge/index";
import { Text } from "../../../core/atoms/text/text";
import { List, ListItem } from "../../../core/organisms/list/list";
import { Row } from "../../../layouts";
// import { Column, Stack } from "../../../layouts";
import { BaseComponentProps, mergeClasses } from "../../../design-system/props";
import { Icon } from "../../../core/atoms/icon";

export interface MedicalRecord {
  id: string;
  date: string;
  type: "consultation" | "lab" | "prescription" | "imaging" | "surgery";
  title: string;
  description: string;
  doctor: string;
  attachments?: string[];
  status: "completed" | "pending" | "cancelled";
  priority?: "low" | "medium" | "high" | "urgent";
}

export interface MedicalRecordCardProps extends Omit<BaseComponentProps<HTMLDivElement>, `on${string}$`> {
  record: MedicalRecord;
  onView$?: (recordId: string) => void;
  onDownload$?: (recordId: string) => void;
}

const typeIcons = {
  consultation: "fas fa-user-md",
  lab: "fas fa-flask",
  prescription: "fas fa-prescription-bottle-alt",
  imaging: "fas fa-x-ray",
  surgery: "fas fa-scalpel"
};

const typeColors = {
  consultation: "blue",
  lab: "green", 
  prescription: "orange",
  imaging: "purple",
  surgery: "red"
} as const;

const priorityVariants = {
  low: "secondary",
  medium: "primary",
  high: "warning", 
  urgent: "error"
} as const;

export const MedicalRecordCard = component$<MedicalRecordCardProps>((props) => {
  const {
    record,
    onView$,
    onDownload$,
    class: qwikClass,
    className,
    style,
    ...rest
  } = props;
  
  const expanded = useSignal(false);

  const toggleExpanded = $(() => {
    expanded.value = !expanded.value;
  });

  const cardClasses = mergeClasses(
    "bg-white rounded-lg border border-neutral-light shadow-sm hover:shadow-md transition-shadow",
    qwikClass,
    className
  );

  return (
    <div class="themed-content">
      <div 
        class={cardClasses}
        style={style}
        {...rest}
      >
      <div class="p-4">
        <Row alignItems="start" justifyContent="between" class="mb-3">
          <Row alignItems="center" gap="3">
            <div class={`w-10 h-10 rounded-full bg-${typeColors[record.type]}-lighter flex items-center justify-center`}>
              <i class={`${typeIcons[record.type]} text-${typeColors[record.type]}-dark`}></i>
            </div>
            <div>
              <Text as="h3" weight="semibold" size="md">{record.title}</Text>
              <Text as="p" size="sm" color="muted">{record.date}</Text>
            </div>
          </Row>
          
          <Row alignItems="center" gap="2">
            {record.priority && (
              <Badge 
                style={priorityVariants[record.priority] === "error" ? "danger" : priorityVariants[record.priority] === "warning" ? "warning" : "primary"}
                size="sm"
              >
                {record.priority.toUpperCase()}
              </Badge>
            )}
            <Badge 
              style={record.status === "completed" ? "success" : record.status === "pending" ? "warning" : "danger"}
              size="sm"
            >
              {record.status.toUpperCase()}
            </Badge>
          </Row>
        </Row>

        <Text as="p" color="muted" class="mb-3">{record.description}</Text>
        
        <Row alignItems="center" justifyContent="between" class="text-sm text-neutral mb-3">
          <span>Dr. {record.doctor}</span>
          {record.attachments && record.attachments.length > 0 && (
            <Row alignItems="center">
              <Icon icon="link" class="mr-1" />
              {record.attachments.length} attachment{record.attachments.length > 1 ? 's' : ''}
            </Row>
          )}
        </Row>

        {expanded.value && record.attachments && record.attachments.length > 0 && (
          <div class="mb-3">
            <Text as="h4" weight="medium" size="sm" class="mb-2">Attachments:</Text>
            <List variant="none" size="sm">
              {record.attachments.map((attachment, index) => (
                <ListItem key={index} class="flex items-center text-sm text-primary-dark hover:text-primary-darker">
                  <Icon icon="file-text" class="mr-2" />
                  <Button variant="text" color="primary" size="sm" class="hover:underline p-0">{attachment}</Button>
                </ListItem>
              ))}
            </List>
          </div>
        )}

        <Row alignItems="center" justifyContent="between">
          <Button 
            onClick$={toggleExpanded}
            variant="text"
            color="primary"
            size="sm"
            class="font-medium"
          >
            {expanded.value ? 'Show Less' : 'Show More'}
          </Button>
          
          <Row gap="2">
            {onView$ && (
              <Button 
                variant="outlined" 
                size="sm"
                onClick$={() => onView$(record.id)}
              >
                <Icon icon="eye" class="mr-2" />View
              </Button>
            )}
            {onDownload$ && (
              <Button 
                variant="outlined" 
                size="sm"
                onClick$={() => onDownload$(record.id)}
              >
                <Icon icon="download" class="mr-2" />Download
              </Button>
            )}
          </Row>
        </Row>
      </div>
    </div>
    </div>
  );
});

// Appointment Status Component
export interface AppointmentStatus {
  status: "scheduled" | "confirmed" | "in-progress" | "completed" | "cancelled" | "no-show";
  nextAction?: string;
  canReschedule?: boolean;
  canCancel?: boolean;
}

export const AppointmentStatusIndicator = component$<{
  status: AppointmentStatus;
  onReschedule$?: () => void;
  onCancel$?: () => void;
}>(({ status, onReschedule$, onCancel$ }) => {
  const statusConfig = {
    scheduled: { bgClass: "bg-primary-lighter", textClass: "text-primary-dark", icon: "fas fa-calendar", text: "Scheduled" },
    confirmed: { bgClass: "bg-success-lighter", textClass: "text-success-dark", icon: "fas fa-check-circle", text: "Confirmed" },
    "in-progress": { bgClass: "bg-warning-lighter", textClass: "text-warning-dark", icon: "fas fa-clock", text: "In Progress" },
    completed: { bgClass: "bg-success-lighter", textClass: "text-success-dark", icon: "fas fa-check-double", text: "Completed" },
    cancelled: { bgClass: "bg-error-lighter", textClass: "text-error-dark", icon: "fas fa-times-circle", text: "Cancelled" },
    "no-show": { bgClass: "bg-neutral-lighter", textClass: "text-neutral-dark", icon: "fas fa-user-slash", text: "No Show" }
  };

  const config = statusConfig[status.status];

  return (
    <Row alignItems="center" justifyContent="between" class="p-3 bg-neutral-lighter rounded-lg">
      <Row alignItems="center" gap="3">
        <div class={`w-8 h-8 rounded-full ${config.bgClass} flex items-center justify-center`}>
          <i class={`${config.icon} ${config.textClass} text-sm`}></i>
        </div>
        <div>
          <span class="font-medium text-neutral-darker">{config.text}</span>
          {status.nextAction && (
            <Text as="p" size="sm" color="muted">{status.nextAction}</Text>
          )}
        </div>
      </Row>
      
      <Row gap="2">
        {status.canReschedule && onReschedule$ && (
          <Button variant="outlined" size="sm" onClick$={onReschedule$}>
            Reschedule
          </Button>
        )}
        {status.canCancel && onCancel$ && (
          <Button variant="outlined" size="sm" onClick$={onCancel$}>
            Cancel
          </Button>
        )}
      </Row>
    </Row>
  );
});
