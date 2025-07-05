import { component$, useSignal, useVisibleTask$, $ } from "@builder.io/qwik";
import { BaseComponentProps, mergeClasses } from "../../../design-system/props";
import { Icon } from '../../atoms/icon';
import { Button } from "../../atoms/button/button";
import { Row } from "../../../layouts/row";
import { Column } from "../../../layouts/column";

export type ToastVariant = "default" | "success" | "warning" | "error" | "info";
export type ToastPosition = "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center";

export interface ToastProps extends Omit<BaseComponentProps<HTMLDivElement>, `on${string}$`> {
  title?: string;
  message: string;
  variant?: ToastVariant;
  position?: ToastPosition;
  duration?: number; // in milliseconds, 0 means persistent
  showIcon?: boolean;
  closable?: boolean;
  onClose$?: () => void;
}

export const Toast = component$<ToastProps>(({
  title,
  message,
  variant = "default",
  position = "top-right",
  duration = 5000,
  showIcon = true,
  closable = true,
  onClose$: _onClose$,
  class: qwikClass,
  className,
  style,
  ...rest
}) => {
  const isVisible = useSignal(true);
  const progress = useSignal(100);

  const handleClose = $(() => {
    isVisible.value = false;
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    if (duration > 0) {
      const interval = setInterval(() => {
        progress.value -= (100 / (duration / 100));
        if (progress.value <= 0) {
          handleClose();
        }
      }, 100);

      cleanup(() => clearInterval(interval));
    }
  });

  const getIcon = () => {
    const iconMap = {
      success: <Icon icon="check-circle" class="w-4 h-4" />,
      warning: <Icon icon="alert-triangle" class="w-4 h-4" />,
      error: <Icon icon="x-circle" class="w-4 h-4" />,
      info: <Icon icon="pen-tool" class="w-4 h-4" />,
      default: <Icon icon="pen-tool" class="w-4 h-4" />
    };
    return iconMap[variant];
  };

  const toastClasses = mergeClasses(
    "toast",
    `toast-${variant}`,
    `toast-${position}`,
    !isVisible.value && "toast-hidden",
    qwikClass,
    className
  );

  if (!isVisible.value) {
    return null;
  }

  return (
    <div 
      class={toastClasses}
      style={style}
      {...rest}
    >
      <Row alignItems="start" gap="3" class="toast-content">
        {showIcon && (
          <Column class="toast-icon">
            {getIcon()}
          </Column>
        )}
        
        <Column class="toast-body flex-1">
          {title && (
            <div class="toast-title font-medium">{title}</div>
          )}
          <div class="toast-message">{message}</div>
        </Column>

        {closable && (
          <Column>
            <Button
              class="toast-close"
              onClick$={handleClose}
              aria-label="Close notification"
              intent="neutral"
              variant="text"
              size="sm"
            >
              <Icon icon="x-circle" class="w-4 h-4" />
            </Button>
          </Column>
        )}
      </Row>

      {duration > 0 && (
        <div class="toast-progress">
          <div 
            class="toast-progress-bar"
            style={{ width: `${progress.value}%` }}
          />
        </div>
      )}
    </div>
  );
});

// Toast Container for managing multiple toasts
export interface ToastContainerProps extends BaseComponentProps<HTMLDivElement> {
  position?: ToastPosition;
  maxToasts?: number;
}

export const ToastContainer = component$<ToastContainerProps>(({
  position = "top-right",
  class: qwikClass,
  className,
  style,
  ...rest
}) => {
  const containerClasses = mergeClasses(
    "toast-container",
    `toast-container-${position}`,
    qwikClass,
    className
  );

  return (
    <div class={containerClasses} style={style} {...rest}>
      {/* Toasts will be dynamically added here */}
    </div>
  );
});
