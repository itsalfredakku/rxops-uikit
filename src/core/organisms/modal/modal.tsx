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

  // Enhanced keyboard event handler for medical device modal accessibility
  const handleKeyDown$ = $((event: KeyboardEvent) => {
    // Escape key to close modal - critical for emergency workflows
    if (event.key === 'Escape' && closable) {
      event.preventDefault();
      handleClose();
    }
    
    // Tab key focus trapping for modal accessibility
    if (event.key === 'Tab') {
      const modal = event.currentTarget as HTMLElement;
      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length === 0) return;
      
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
      
      if (event.shiftKey) {
        // Shift+Tab: backward navigation
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: forward navigation
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
  });

  const modalClasses = mergeClasses("modal-overlay",
    isVisible.value ? "modal-open" : "modal-closed",
    
    // Medical device modal focus for emergency situations
    "focus:outline-none focus:ring-4 focus:ring-primary-500/70 focus:ring-offset-2",
    "focus:shadow-2xl focus:z-50",
    qwikClass,
    className
  );

  const contentClasses = mergeClasses(
    "modal-content",
    `modal-${size}`,
    // Enhanced focus indicators for clinical environments
    "focus-within:ring-4 focus-within:ring-primary-500/70 focus-within:ring-offset-2"
  );

  if (!isVisible.value && !open) {
    return null;
  }

  return (
    <div class="themed-content">
      <div 
        class={modalClasses} 
        style={style} 
        onClick$={handleBackdropClick}
        onKeyDown$={handleKeyDown$}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        aria-describedby="modal-body"
        {...rest}
      >
        <div class={contentClasses} onClick$={(e) => e.stopPropagation()}>
          {showHeader && (
            <Row alignItems="center" justifyContent="between" class="modal-header p-4 border-b border-neutral-light">
              {title && (
                <Text 
                  as="h2" 
                  id="modal-title"
                  class="modal-title text-lg font-semibold text-neutral-darker"
                >
                  {title}
                </Text>
              )}
              {closable && (
                <Button
                  class="modal-close"
                  onClick$={handleClose}
                  aria-label="Close modal"
                  intent="neutral"
                  variant="text"
                  size="sm"
                  tabIndex={0}
                >
                  <Icon icon="x-circle" class="w-5 h-5" />
                </Button>
              )}
            </Row>
          )}

          <Column id="modal-body" class="modal-body p-4" tabIndex={-1}>
            <Slot />
          </Column>

          {showFooter && (
            <Row justifyContent="end" gap="3" class="modal-footer p-4 border-t border-neutral-light bg-neutral-lighter">
              <Slot name="footer" />
            </Row>
          )}
        </div>
      </div>
    </div>
  );
});
