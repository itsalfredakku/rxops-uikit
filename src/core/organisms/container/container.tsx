import { component$, Slot, $, useStore, QRL } from "@builder.io/qwik";
import type { ComponentSize, Spacing } from "../../../design-system/types";
import { BaseComponentProps, mergeClasses } from "../../../design-system/props";

export type ContainerSize = ComponentSize | "full";

export interface ContainerProps extends Omit<BaseComponentProps<HTMLDivElement>, 'size'> {
  size?: ContainerSize;
  centered?: boolean;
  fluid?: boolean;
  padding?: Spacing;
  /** Medical device keyboard support with enhanced focus indicators */
  medicalDeviceMode?: boolean;
  /** Emergency mode for critical medical containers */
  emergencyMode?: boolean;
  /** Container context for healthcare applications */
  containerContext?: 'patient-info' | 'medication-list' | 'vital-signs' | 'emergency-alert' | 'form-section' | 'data-grid' | 'default';
  /** Enable healthcare workflow shortcuts */
  enableWorkflowShortcuts?: boolean;
  /** Scrollable container with enhanced keyboard navigation */
  scrollable?: boolean;
  /** Emergency action callback */
  onEmergency$?: QRL<() => void>;
  /** Quick save callback */
  onSave$?: QRL<() => void>;
}

const sizeClasses: Record<ContainerSize, string> = {
  xs: "max-w-xl",   // ~576px
  sm: "max-w-2xl",  // ~672px
  md: "max-w-4xl",  // ~896px  
  lg: "max-w-6xl",  // ~1152px
  xl: "max-w-7xl",  // ~1280px
  full: "max-w-none"
};

const paddingClasses: Record<Spacing, string> = {
  "0": "",
  "1": "px-1",
  "2": "px-2",
  "3": "px-3",
  "4": "px-4",
  "6": "px-6",
  "8": "px-8",
  "12": "px-12",
  "16": "px-16",
  "20": "px-20",
  "24": "px-24"
};

const getContainerClasses = (
  size: ContainerSize, 
  centered: boolean, 
  fluid: boolean, 
  padding: Spacing, 
  medicalDeviceMode: boolean,
  emergencyMode: boolean,
  containerContext: string,
  scrollable: boolean,
  className?: string
) => {
  const currentSizeClasses = fluid ? "max-w-none" : sizeClasses[size];
  const centeredClasses = centered ? "mx-auto" : "";
  
  return mergeClasses(
    "w-full",
    currentSizeClasses,
    centeredClasses,
    paddingClasses[padding],
    medicalDeviceMode && "medical-device-mode",
    emergencyMode && "emergency-mode",
    containerContext !== 'default' && `container-context-${containerContext}`,
    scrollable && "overflow-auto focus:outline-none",
    className
  );
};

export const Container = component$<ContainerProps>((props) => {
  const {
    size = "lg",
    centered = true,
    fluid = false,
    padding = "4",
    medicalDeviceMode = false,
    emergencyMode = false,
    containerContext = 'default',
    enableWorkflowShortcuts = false,
    scrollable = false,
    onEmergency$,
    onSave$,
    class: qwikClass,
    className,
    style,
    onKeyDown$,
    ...rest
  } = props;

  // Enhanced keyboard state for medical devices
  const keyboardState = useStore({
    emergencyHighlight: false,
    shortcutPressed: false,
    currentFocusIndex: -1
  });

  // Enhanced keyboard support for medical devices
  const handleKeyDown = $((event: KeyboardEvent) => {
    if (event.defaultPrevented) return;

    // Healthcare workflow shortcuts
    if (enableWorkflowShortcuts) {
      const isCtrlOrCmd = event.ctrlKey || event.metaKey;
      
      if (isCtrlOrCmd) {
        switch (event.key.toLowerCase()) {
          case 's':
            // Quick save for medical data
            event.preventDefault();
            onSave$?.();
            keyboardState.shortcutPressed = true;
            setTimeout(() => keyboardState.shortcutPressed = false, 200);
            break;
          case 'e':
            // Emergency action
            if (emergencyMode) {
              event.preventDefault();
              onEmergency$?.();
              keyboardState.emergencyHighlight = true;
              setTimeout(() => keyboardState.emergencyHighlight = false, 1000);
            }
            break;
        }
      }
    }

    // Medical device navigation shortcuts
    if (medicalDeviceMode) {
      switch (event.key) {
        case 'F1':
          if (containerContext === 'emergency-alert') {
            event.preventDefault();
            onEmergency$?.();
          }
          break;
        case 'Home':
          if (scrollable) {
            event.preventDefault();
            (event.target as HTMLElement).scrollTop = 0;
          }
          break;
        case 'End':
          if (scrollable) {
            event.preventDefault();
            const element = event.target as HTMLElement;
            element.scrollTop = element.scrollHeight;
          }
          break;
        case 'PageUp':
          if (scrollable) {
            event.preventDefault();
            const element = event.target as HTMLElement;
            element.scrollTop -= element.clientHeight;
          }
          break;
        case 'PageDown':
          if (scrollable) {
            event.preventDefault();
            const element = event.target as HTMLElement;
            element.scrollTop += element.clientHeight;
          }
          break;
        case 'Escape':
          // Clear emergency highlights
          keyboardState.emergencyHighlight = false;
          break;
      }
    }
  });

  const containerClasses = getContainerClasses(
    size, 
    centered, 
    fluid, 
    padding, 
    medicalDeviceMode,
    emergencyMode,
    containerContext,
    scrollable,
    mergeClasses(
      qwikClass, 
      className,
      keyboardState.emergencyHighlight && "emergency-highlight",
      keyboardState.shortcutPressed && "shortcut-pressed"
    )
  );

  // Enhanced ARIA attributes for medical contexts
  const containerRole = medicalDeviceMode 
    ? (scrollable ? 'region' : 'group')
    : undefined;

  const ariaLabel = medicalDeviceMode 
    ? `${containerContext} container - Medical device mode enabled`
    : undefined;

  const ariaDescription = [
    emergencyMode && 'Emergency container',
    enableWorkflowShortcuts && 'Ctrl+S to save, Ctrl+E for emergency',
    scrollable && 'Scrollable with keyboard navigation'
  ].filter(Boolean).join('. ');

  return (
    <div class="themed-content">
      <div 
        class={containerClasses} 
      style={style}
      onKeyDown$={handleKeyDown}
      role={containerRole}
      aria-label={ariaLabel}
      aria-describedby={ariaDescription ? 'container-description' : undefined}
      tabIndex={medicalDeviceMode && scrollable ? 0 : undefined}
      {...rest}
    >
      <Slot />
      
      {/* Medical device keyboard shortcuts help */}
      {medicalDeviceMode && enableWorkflowShortcuts && (
        <div 
          id="container-description"
          class="sr-only"
          aria-live="polite"
        >
          {ariaDescription}
        </div>
      )}
    </div>
    </div>
  );
});
