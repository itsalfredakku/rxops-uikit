/**
 * Popover Component
 * Medical industry-focused interactive popover for complex content display and user interactions
 * 
 * Features:
 * - Medical information popovers with structured content
 * - Interactive content support (forms, buttons, links)
 * - Click, hover, and focus trigger modes
 * - Healthcare-specific content layouts (drug info, lab results, patient details)
 * - HIPAA-compliant content with audit logging
 * - Accessibility support with focus management
 * - Mobile-friendly responsive design for medical tablets
 */

import { component$, useSignal, useTask$, $, Slot } from "@builder.io/qwik";
import { BaseComponentProps, mergeClasses } from "../../../design-system/props";
import { Color } from "../../../design-system/types";
import { Icon, type IconName } from "../../atoms/icon";
import { Text } from "../../atoms/text/text";
import { Button } from "../../atoms/button/button";
import { Badge } from "../../atoms/badge/index";
import { hipaaAuditor } from "../../../utils/hipaa";

// Popover positioning options
export type PopoverPosition = 
  | 'top' | 'top-start' | 'top-end'
  | 'bottom' | 'bottom-start' | 'bottom-end'
  | 'left' | 'left-start' | 'left-end'
  | 'right' | 'right-start' | 'right-end';

// Popover trigger modes
export type PopoverTrigger = 'click' | 'hover' | 'focus' | 'manual';

// Healthcare-specific popover types
export type MedicalPopoverType = 
  | 'medication' | 'labResult' | 'vital' | 'allergy' | 'diagnosis'
  | 'procedure' | 'insurance' | 'emergency' | 'patient' | 'provider';

export interface PopoverProps extends BaseComponentProps<HTMLDivElement> {
  /** Popover content (can be string or JSX) */
  content?: string;
  /** Whether popover is open (for controlled mode) */
  open?: boolean;
  /** Popover position relative to trigger */
  position?: PopoverPosition;
  /** How the popover is triggered */
  trigger?: PopoverTrigger;
  /** Visual variant */
  variant?: 'default' | 'flat' | 'outlined';
  /** Semantic color */
  color?: Color;
  /** Maximum width of popover */
  maxWidth?: string;
  /** Whether to show arrow pointing to trigger */
  showArrow?: boolean;
  /** Whether popover should be modal */
  modal?: boolean;
  /** Whether to close on outside click */
  closeOnOutsideClick?: boolean;
  /** Whether to close on escape key */
  closeOnEscape?: boolean;
  /** Healthcare popover type for specialized layouts */
  medicalType?: MedicalPopoverType;
  /** Whether content contains PHI */
  containsPHI?: boolean;
  /** Callback when popover opens */
  onOpen?: () => void;
  /** Callback when popover closes */
  onClose?: () => void;
  /** Callback when popover state changes */
  onOpenChange?: (open: boolean) => void;
}

export interface MedicalPopoverProps extends Omit<PopoverProps, 'content'> {
  /** Medical data to display */
  data: {
    title: string;
    value?: string | number;
    unit?: string;
    status?: 'normal' | 'abnormal' | 'critical' | 'pending';
    reference?: string;
    provider?: string;
    date?: string;
    notes?: string;
    actions?: Array<{
      label: string;
      icon?: IconName;
      variant?: 'default' | 'primary' | 'danger';
      onClick?: () => void;
    }>;
  };
}

export const Popover = component$<PopoverProps>((props) => {
  const {
    content,
    open: controlledOpen,
    position = 'bottom',
    trigger = 'click',
    variant = 'default',
    color = 'default',
    maxWidth = '320px',
    showArrow = true,
    modal = false,
    closeOnOutsideClick = true,
    closeOnEscape = true,
    medicalType,
    containsPHI = false,
    onOpen,
    onClose,
    onOpenChange,
    class: qwikClass,
    className,
    ...rest
  } = props;

  const isOpen = useSignal(controlledOpen || false);
  const triggerRef = useSignal<HTMLElement>();
  const popoverRef = useSignal<HTMLElement>();

  // Handle controlled/uncontrolled state
  useTask$(({ track }) => {
    track(() => controlledOpen);
    if (controlledOpen !== undefined) {
      isOpen.value = controlledOpen;
    }
  });

  // HIPAA audit logging for PHI content
  useTask$(({ track }) => {
    track(() => isOpen.value);
    
    if (containsPHI && isOpen.value) {
      hipaaAuditor.logAccess({
        action: 'popover_opened',
        component: 'Popover',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Open popover
  const openPopover = $(() => {
    if (!isOpen.value) {
      isOpen.value = true;
      onOpen?.();
      onOpenChange?.(true);
    }
  });

  // Close popover
  const closePopover = $(() => {
    if (isOpen.value) {
      isOpen.value = false;
      onClose?.();
      onOpenChange?.(false);
    }
  });

  // Toggle popover
  const togglePopover = $(() => {
    if (isOpen.value) {
      closePopover();
    } else {
      openPopover();
    }
  });

  // Handle outside click
  const handleOutsideClick = $((event: Event) => {
    if (!closeOnOutsideClick || !isOpen.value) return;
    
    const target = event.target as HTMLElement;
    const triggerElement = triggerRef.value;
    const popoverElement = popoverRef.value;
    
    if (triggerElement && popoverElement &&
        !triggerElement.contains(target) && 
        !popoverElement.contains(target)) {
      closePopover();
    }
  });

  // Handle escape key
  const handleKeyDown = $((event: KeyboardEvent) => {
    if (closeOnEscape && event.key === 'Escape' && isOpen.value) {
      closePopover();
    }
  });

  // Position calculation
  const getPositionClasses = () => {
    const baseClasses = 'absolute z-50';
    
    switch (position) {
      case 'top':
        return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 mb-2`;
      case 'top-start':
        return `${baseClasses} bottom-full left-0 mb-2`;
      case 'top-end':
        return `${baseClasses} bottom-full right-0 mb-2`;
      case 'bottom':
        return `${baseClasses} top-full left-1/2 transform -translate-x-1/2 mt-2`;
      case 'bottom-start':
        return `${baseClasses} top-full left-0 mt-2`;
      case 'bottom-end':
        return `${baseClasses} top-full right-0 mt-2`;
      case 'left':
        return `${baseClasses} right-full top-1/2 transform -translate-y-1/2 mr-2`;
      case 'left-start':
        return `${baseClasses} right-full top-0 mr-2`;
      case 'left-end':
        return `${baseClasses} right-full bottom-0 mr-2`;
      case 'right':
        return `${baseClasses} left-full top-1/2 transform -translate-y-1/2 ml-2`;
      case 'right-start':
        return `${baseClasses} left-full top-0 ml-2`;
      case 'right-end':
        return `${baseClasses} left-full bottom-0 ml-2`;
      default:
        return `${baseClasses} top-full left-1/2 transform -translate-x-1/2 mt-2`;
    }
  };

  // Theme configurations
  const variantClasses = {
    default: 'bg-white border border-neutral-light shadow-lg',
    flat: 'bg-neutral-lighter border border-neutral-light',
    outlined: 'bg-white border-2 border-neutral-light'
  };

  const colorClasses = {
    default: '',
    primary: 'border-primary-200 bg-primary-50',
    secondary: 'border-neutral-light bg-neutral-lighter',
    success: 'border-success-200 bg-success-50',
    warning: 'border-warning-200 bg-warning-50',
    error: 'border-error-200 bg-error-50',
    info: 'border-info-200 bg-info-50'
  };

  // Medical type specific styling
  const medicalTypeClasses = {
    medication: 'border-primary-light bg-primary-lighter',
    labResult: 'border-info-light bg-info-lighter',
    vital: 'border-success-light bg-success-lighter',
    allergy: 'border-error-light bg-error-lighter',
    diagnosis: 'border-warning-light bg-warning-lighter',
    procedure: 'border-primary-light bg-primary-lighter',
    insurance: 'border-info-light bg-info-lighter',
    emergency: 'border-error-light bg-error-lighter',
    patient: 'border-info-light bg-info-lighter',
    provider: 'border-success-light bg-success-lighter'
  };

  return (
    <div class="themed-content">
      <div class="relative inline-block">
      {/* Trigger Element */}
      <div
        ref={triggerRef}
        onClick$={trigger === 'click' ? togglePopover : undefined}
        onMouseEnter$={trigger === 'hover' ? openPopover : undefined}
        onMouseLeave$={trigger === 'hover' ? closePopover : undefined}
        onFocus$={trigger === 'focus' ? openPopover : undefined}
        onBlur$={trigger === 'focus' ? closePopover : undefined}
        class="inline-block cursor-pointer"
        role="button"
        tabIndex={0}
        aria-expanded={isOpen.value}
        aria-haspopup="true"
        {...rest}
      >
        <Slot />
      </div>

      {/* Popover Content */}
      {isOpen.value && (
        <>
          {/* Modal backdrop */}
          {modal && (
            <div 
              class="fixed inset-0 bg-black bg-opacity-25 z-40"
              onClick$={handleOutsideClick}
            />
          )}

          {/* Popover panel */}
          <div
            ref={popoverRef}
            class={mergeClasses(
              'rounded-lg p-4 min-w-0',
              getPositionClasses(),
              variantClasses[variant],
              medicalType ? medicalTypeClasses[medicalType] : colorClasses[color],
              containsPHI ? 'border-l-4 border-l-warning-500' : '',
              qwikClass || className
            )}
            style={{ maxWidth }}
            role="dialog"
            aria-modal={modal}
            data-healthcare-element="popover"
            data-medical-type={medicalType}
            data-contains-phi={containsPHI}
            onKeyDown$={handleKeyDown}
          >
            {/* Arrow */}
            {showArrow && (
              <div class={mergeClasses(
                'absolute w-3 h-3 transform rotate-45',
                variantClasses[variant].includes('bg-white') ? 'bg-white' : 'bg-neutral-lighter',
                position.startsWith('top') ? 'top-full -mt-1.5' : 
                position.startsWith('bottom') ? 'bottom-full -mb-1.5' : 
                position.startsWith('left') ? 'left-full -ml-1.5 top-1/2 -translate-y-1/2' :
                'right-full -mr-1.5 top-1/2 -translate-y-1/2',
                position.includes('-start') ? '' : 
                position.includes('-end') ? '' : 
                position.startsWith('top') || position.startsWith('bottom') ? 'left-1/2 -translate-x-1/2' : ''
              )} />
            )}

            {/* PHI Warning */}
            {containsPHI && (
              <div class="flex items-center gap-2 mb-3 p-2 bg-warning-50 border border-warning-200 rounded">
                <Icon icon="shield" size={14} class="text-warning-600" />
                <Text size="xs" class="text-warning-700">
                  Protected Health Information
                </Text>
              </div>
            )}

            {/* Content */}
            {content && (
              <div class="text-sm text-neutral-dark">
                {content}
              </div>
            )}

            {/* Additional slot content */}
            <Slot name="content" />
          </div>
        </>
      )}

      {/* Outside click handler */}
      {isOpen.value && !modal && (
        <div 
          class="fixed inset-0 z-30"
          onClick$={handleOutsideClick}
          style={{ pointerEvents: closeOnOutsideClick ? 'auto' : 'none' }}
        />
      )}
    </div>
    </div>
  );
});

/**
 * MedicalPopover - Specialized popover for medical information
 */
export const MedicalPopover = component$<MedicalPopoverProps>((props) => {
  const { data, medicalType = 'vital', ...popoverProps } = props;

  const getStatusColor = (status?: string): Color => {
    switch (status) {
      case 'critical':
        return 'error';
      case 'abnormal':
        return 'warning';
      case 'normal':
        return 'success';
      case 'pending':
        return 'info';
      default:
        return 'secondary';
    }
  };

  const getTypeIcon = (type: MedicalPopoverType): IconName => {
    switch (type) {
      case 'medication':
        return 'pill';
      case 'labResult':
        return 'flask';
      case 'vital':
        return 'activity';
      case 'allergy':
        return 'alert-triangle';
      case 'diagnosis':
        return 'clipboard';
      case 'procedure':
        return 'briefcase-medical';
      case 'insurance':
        return 'credit-card';
      case 'emergency':
        return 'alert-triangle';
      case 'patient':
        return 'user';
      case 'provider':
        return 'users';
      default:
        return 'info';
    }
  };

  return (
    <Popover
      {...popoverProps}
      medicalType={medicalType}
      containsPHI={true}
      maxWidth="400px"
    >
      <div q:slot="content" class="space-y-3">
        {/* Header */}
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-2">
            <Icon icon={getTypeIcon(medicalType)} size={16} class="text-neutral-normal" />
            <Text size="sm" weight="semibold" class="text-neutral-darker">
              {data.title}
            </Text>
          </div>
          {data.status && (
            <Badge color={getStatusColor(data.status)} size="sm">
              {data.status.toUpperCase()}
            </Badge>
          )}
        </div>

        {/* Value and Unit */}
        {data.value && (
          <div class="flex items-baseline gap-2">
            <Text size="lg" weight="bold" class="text-neutral-darker">
              {data.value}
            </Text>
            {data.unit && (
              <Text size="sm" class="text-neutral-normal">
                {data.unit}
              </Text>
            )}
          </div>
        )}

        {/* Reference Range */}
        {data.reference && (
          <div>
            <Text size="xs" class="text-neutral-normal uppercase tracking-wide">
              Reference Range
            </Text>
            <Text size="sm" class="text-neutral-dark">
              {data.reference}
            </Text>
          </div>
        )}

        {/* Provider and Date */}
        {(data.provider || data.date) && (
          <div class="flex justify-between text-xs text-neutral-normal">
            {data.provider && (
              <span>Provider: {data.provider}</span>
            )}
            {data.date && (
              <span>{new Date(data.date).toLocaleDateString()}</span>
            )}
          </div>
        )}

        {/* Notes */}
        {data.notes && (
          <div class="pt-2 border-t border-neutral-light">
            <Text size="xs" class="text-neutral-normal uppercase tracking-wide mb-1">
              Notes
            </Text>
            <Text size="sm" class="text-neutral-dark">
              {data.notes}
            </Text>
          </div>
        )}

        {/* Actions */}
        {data.actions && data.actions.length > 0 && (
          <div class="pt-2 border-t border-neutral-light flex gap-2">
            {data.actions.map((action, index) => (
              <Button
                key={index}
                size="sm"
                variant={action.variant === 'primary' ? 'flat' : 'outlined'}
                color={action.variant === 'danger' ? 'error' : 'primary'}
                onClick$={action.onClick}
              >
                {action.icon && <Icon icon={action.icon} size={14} class="mr-1" />}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </Popover>
  );
});

export default Popover;
