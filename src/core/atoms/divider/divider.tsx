import { component$, useStore, $ } from "@builder.io/qwik";
import type { BaseComponentProps } from "../../../design-system/props";
import { mergeClasses } from "../../../design-system/props";

export type DividerOrientation = "horizontal" | "vertical";
export type DividerVariant = "solid" | "dashed" | "dotted";

export interface DividerProps extends BaseComponentProps<HTMLDivElement> {
  orientation?: DividerOrientation;
  variant?: DividerVariant;
  spacing?: "none" | "sm" | "md" | "lg";
  label?: string;
  /** Medical device keyboard support with enhanced focus indicators */
  medicalDeviceMode?: boolean;
  /** Enable healthcare workflow shortcuts */
  enableWorkflowShortcuts?: boolean;
  /** Divider context for healthcare applications */
  dividerContext?: 'section' | 'subsection' | 'form-group' | 'data-group' | 'emergency' | 'default';
  /** Whether the divider acts as a navigation landmark */
  navigable?: boolean;
}

export const Divider = component$<DividerProps>((props) => {
  const {
    orientation = "horizontal",
    variant = "solid",
    spacing = "md",
    label,
    medicalDeviceMode = false,
    enableWorkflowShortcuts = false,
    dividerContext = 'default',
    navigable = false,
    class: qwikClass,
    className,
    style,
    testId,
    ...rest
  } = props;

  // Enhanced keyboard state for medical devices
  const keyboardState = useStore({
    hasFocus: false,
    shortcutPressed: false
  });

  // Enhanced keyboard support for medical devices
  const handleKeyDown = $((event: KeyboardEvent) => {
    if (!medicalDeviceMode || !navigable) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        // Announce section information
        if (label || dividerContext !== 'default') {
          event.preventDefault();
          keyboardState.shortcutPressed = true;
          setTimeout(() => keyboardState.shortcutPressed = false, 200);
        }
        break;
      
      case 'Escape':
        // Remove focus from divider
        event.preventDefault();
        (event.target as HTMLElement).blur();
        break;
    }

    // Healthcare workflow shortcuts
    if (enableWorkflowShortcuts && (event.ctrlKey || event.metaKey)) {
      switch (event.key.toLowerCase()) {
        case 'j':
          // Jump to next section
          if (medicalDeviceMode) {
            event.preventDefault();
            keyboardState.shortcutPressed = true;
            setTimeout(() => keyboardState.shortcutPressed = false, 200);
          }
          break;
        case 'k':
          // Jump to previous section
          if (medicalDeviceMode) {
            event.preventDefault();
            keyboardState.shortcutPressed = true;
            setTimeout(() => keyboardState.shortcutPressed = false, 200);
          }
          break;
      }
    }
  });

  const handleFocus = $(() => {
    keyboardState.hasFocus = true;
  });

  const handleBlur = $(() => {
    keyboardState.hasFocus = false;
  });
  
  const dividerClasses = mergeClasses(
    "divider-base",
    `divider-${orientation}`,
    `divider-${variant}`,
    `divider-spacing-${spacing}`,
    label && "divider-with-label",
    // Medical device focus indicators
    medicalDeviceMode && navigable && [
      'focus:outline-none focus:ring-4 focus:ring-primary-500/50 focus:ring-offset-2',
      'focus:shadow-lg focus:z-10'
    ],
    keyboardState.hasFocus && medicalDeviceMode && [
      'ring-4 ring-primary-200 shadow-lg',
      dividerContext !== 'default' && 'ring-info-light'
    ],
    keyboardState.shortcutPressed && 'ring-success-light ring-4',
    medicalDeviceMode && 'medical-device-divider',
    dividerContext !== 'default' && `divider-context-${dividerContext}`,
    qwikClass,
    className
  );

  // Enhanced ARIA attributes for medical contexts
  const ariaLabel = medicalDeviceMode && navigable
    ? `${dividerContext} section divider${label ? `: ${label}` : ''}${enableWorkflowShortcuts ? ' - Press Enter for section info' : ''}`
    : undefined;

  const ariaDescription = [
    medicalDeviceMode && 'Medical device mode enabled',
    enableWorkflowShortcuts && 'Ctrl+J next section, Ctrl+K previous section',
    navigable && 'Section navigation landmark'
  ].filter(Boolean).join('. ');

  if (label) {
    return (
      <div class="themed-content">
        <div 
          class={dividerClasses} 
          style={style}
          onKeyDown$={medicalDeviceMode && navigable ? handleKeyDown : undefined}
          onFocus$={medicalDeviceMode && navigable ? handleFocus : undefined}
          onBlur$={medicalDeviceMode && navigable ? handleBlur : undefined}
          tabIndex={medicalDeviceMode && navigable ? 0 : undefined}
          role={medicalDeviceMode && navigable ? 'separator' : 'separator'}
          aria-label={ariaLabel}
          aria-describedby={ariaDescription ? 'divider-description' : undefined}
          aria-orientation={orientation}
          data-medical-device={medicalDeviceMode}
          data-testid={testId}
          {...rest}
        >
          <span 
            class={mergeClasses(
              "divider-label",
              medicalDeviceMode && keyboardState.hasFocus && "keyboard-focused"
            )}
          >
            {label}
          </span>
          
          {/* Medical device keyboard shortcuts help */}
          {medicalDeviceMode && enableWorkflowShortcuts && keyboardState.hasFocus && (
            <div 
              id="divider-description" 
              class="sr-only"
              aria-live="polite"
            >
              {ariaDescription}
            </div>
          )}

          {/* Shortcut pressed indicator */}
          {medicalDeviceMode && keyboardState.shortcutPressed && (
            <div 
              class="absolute top-1/2 right-2 transform -translate-y-1/2 bg-success-normal/90 backdrop-blur-sm rounded px-2 py-1 text-white text-xs font-medium"
              role="status"
              aria-live="polite"
            >
              Section info
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div class="themed-content">
      <div 
        class={dividerClasses} 
        style={style}
        onKeyDown$={medicalDeviceMode && navigable ? handleKeyDown : undefined}
        onFocus$={medicalDeviceMode && navigable ? handleFocus : undefined}
        onBlur$={medicalDeviceMode && navigable ? handleBlur : undefined}
        tabIndex={medicalDeviceMode && navigable ? 0 : undefined}
        role="separator"
        aria-label={ariaLabel}
        aria-describedby={ariaDescription ? 'divider-description' : undefined}
        aria-orientation={orientation}
        data-medical-device={medicalDeviceMode}
        data-testid={testId}
        {...rest} 
      >
        {/* Medical device keyboard shortcuts help */}
        {medicalDeviceMode && enableWorkflowShortcuts && navigable && keyboardState.hasFocus && (
          <div 
            id="divider-description" 
            class="sr-only"
            aria-live="polite"
          >
            {ariaDescription}
          </div>
        )}

        {/* Shortcut pressed indicator */}
        {medicalDeviceMode && keyboardState.shortcutPressed && (
          <div 
            class="absolute top-1/2 right-2 transform -translate-y-1/2 bg-success-normal/90 backdrop-blur-sm rounded px-2 py-1 text-white text-xs font-medium"
            role="status"
            aria-live="polite"
          >
            Section info
          </div>
        )}
      </div>
    </div>
  );
});
