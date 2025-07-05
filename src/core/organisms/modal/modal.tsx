import { component$, Slot, useSignal, $ } from "@builder.io/qwik";
import { Icon } from "../../atoms/icon";
import { Text } from "../../atoms/text/text";
import { Button } from "../../atoms/button/button";
import { BaseComponentProps, mergeClasses } from "../../../design-system/props";
import { Row } from "../../../layouts/row";
import { Column } from "../../../layouts/column";

export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

export interface ModalProps extends Omit<BaseComponentProps<HTMLDivElement>, `on${string}$` | 'size'> {
  open?: boolean;
  size?: ModalSize;
  title?: string;
  closable?: boolean;
  closeOnBackdrop?: boolean;
  showHeader?: boolean;
  showFooter?: boolean;
  onClose$?: () => void;
}

export const Modal = component$<ModalProps>((props) => {
  const {
    open = false,
    size = "md",
    title,
    closable = true,
    closeOnBackdrop = true,
    showHeader = true,
    showFooter = false,
    onClose$,
    class: qwikClass,
    className,
    style,
    ...rest
  } = props;
  
  const isVisible = useSignal(open);

  const handleClose = $(() => {
    isVisible.value = false;
    onClose$?.();
  });

  const handleBackdropClick = $((event: Event) => {
    if (closeOnBackdrop && event.target === event.currentTarget) {
      handleClose();
    }
  });

  const modalClasses = mergeClasses(
    "modal-overlay",
    isVisible.value ? "modal-open" : "modal-closed",
    qwikClass,
    className
  );

  const contentClasses = mergeClasses(
    "modal-content",
    `modal-${size}`
  );

  if (!isVisible.value && !open) {
    return null;
  }

  return (
    <div class={modalClasses} style={style} onClick$={handleBackdropClick} {...rest}>
      <div class={contentClasses} onClick$={(e) => e.stopPropagation()}>
        {showHeader && (
          <Row alignItems="center" justifyContent="between" class="modal-header p-4 border-b border-neutral-200">
            {title && (
              <Text as="h2" class="modal-title">{title}</Text>
            )}
            {closable && (
              <Button
                class="modal-close"
                onClick$={handleClose}
                aria-label="Close modal"
                intent="neutral"
                variant="text"
                size="sm"
              >
                <Icon icon="x-circle" class="w-5 h-5" />
              </Button>
            )}
          </Row>
        )}

        <Column class="modal-body p-4">
          <Slot />
        </Column>

        {showFooter && (
          <Row justifyContent="end" gap="3" class="modal-footer p-4 border-t border-neutral-200 bg-neutral-50">
            <Slot name="footer" />
          </Row>
        )}
      </div>
    </div>
  );
});
