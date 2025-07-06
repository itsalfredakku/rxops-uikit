import { component$, Slot, useSignal, useStore, $ } from "@builder.io/qwik";
import type { Position } from "../../../design-system/types";
import type { BaseComponentProps, VariantProps } from "../../../design-system/props";

export type TooltipContext = 
  | 'medication-info'
  | 'dosage-warning'
  | 'interaction-alert'
  | 'procedure-step'
  | 'diagnostic-info'
  | 'patient-data'
  | 'vital-signs'
  | 'emergency-info'
  | 'default';

export interface TooltipProps extends 
  BaseComponentProps<HTMLDivElement>, 
  VariantProps {
  /** Tooltip content text */
  content: string;
  /** Position relative to trigger element */
  position?: Position;
  /** Show delay in milliseconds */
  delay?: number;
  
  // Medical device keyboard accessibility props
  medicalDeviceMode?: boolean;
  enableWorkflowShortcuts?: boolean;
  tooltipContext?: TooltipContext;
  persistOnHover?: boolean;
  audioFeedback?: boolean;
  expandable?: boolean;
  expandedContent?: string;
}

export const Tooltip = component$<TooltipProps>(({
  content,
  position = "top",
  variant = "elevated",
  color = "primary",
  size = "md",
  delay = 300,
  disabled = false,
  
  // Medical device keyboard accessibility props
  medicalDeviceMode = false,
  enableWorkflowShortcuts = false,
  tooltipContext = 'default',
  persistOnHover = false,
  audioFeedback = false,
  expandable = false,
  expandedContent,
  
  class: className,
  className: classNameReact, // React compatibility
  style,
  id,
  testId,
  "data-testid": dataTestId,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedby,
  children: _children,
  ...props
}) => {
  const isVisible = useSignal(false);
  const timeoutRef = useSignal<number | null>(null);
  
  // Medical device keyboard state for enhanced accessibility
  const keyboardState = useStore({
    isExpanded: false,
    isPinned: false,
    lastShortcutTime: 0,
    focusedElement: null as HTMLElement | null
  });

  const showTooltip = $(() => {
    if (disabled) return;
    
    if (timeoutRef.value) {
      clearTimeout(timeoutRef.value);
    }
    
    const showDelay = medicalDeviceMode ? Math.max(delay, 100) : delay; // Faster response in medical mode
    
    timeoutRef.value = setTimeout(() => {
      isVisible.value = true;
      
      if (audioFeedback) {
        console.log(`Tooltip shown: ${tooltipContext} - ${content}`);
      }
    }, showDelay) as unknown as number;
  });

  const hideTooltip = $(() => {
    if (keyboardState.isPinned && medicalDeviceMode) return; // Don't hide pinned tooltips
    
    if (timeoutRef.value) {
      clearTimeout(timeoutRef.value);
    }
    isVisible.value = false;
    keyboardState.isExpanded = false;
  });

  // Enhanced keyboard event handler for medical device tooltip accessibility
  const handleKeyDown$ = $((event: KeyboardEvent) => {
    if (disabled) return;
    
    // Medical device workflow shortcuts
    if (medicalDeviceMode && enableWorkflowShortcuts) {
      const now = Date.now();
      
      // Rate limit shortcuts to prevent accidental activation
      if (now - keyboardState.lastShortcutTime < 500) return;
      
      switch (tooltipContext) {
        case 'medication-info':
          if (event.ctrlKey && event.key === 'm') {
            event.preventDefault();
            keyboardState.lastShortcutTime = now;
            console.log('Medication details opened');
            return;
          }
          break;
        case 'dosage-warning':
          if (event.ctrlKey && event.key === 'd') {
            event.preventDefault();
            keyboardState.lastShortcutTime = now;
            console.log('Dosage calculator opened');
            return;
          }
          break;
        case 'interaction-alert':
          if (event.ctrlKey && event.key === 'i') {
            event.preventDefault();
            keyboardState.lastShortcutTime = now;
            console.log('Interaction checker opened');
            return;
          }
          break;
        case 'procedure-step':
          if (event.ctrlKey && event.key === 'p') {
            event.preventDefault();
            keyboardState.lastShortcutTime = now;
            console.log('Procedure protocol opened');
            return;
          }
          break;
        case 'diagnostic-info':
          if (event.ctrlKey && event.key === 'r') {
            event.preventDefault();
            keyboardState.lastShortcutTime = now;
            console.log('Reference materials opened');
            return;
          }
          break;
        case 'emergency-info':
          if (event.ctrlKey && event.key === 'e') {
            event.preventDefault();
            keyboardState.lastShortcutTime = now;
            console.log('Emergency protocol opened');
            return;
          }
          break;
      }
    }
    
    // Enhanced tooltip control for medical devices
    if (event.key === 'Escape') {
      event.preventDefault();
      keyboardState.isPinned = false;
      keyboardState.isExpanded = false;
      hideTooltip();
      (event.target as HTMLElement).blur();
    }
    
    // Enter/Space to show/pin tooltip for medical devices
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (isVisible.value) {
        if (medicalDeviceMode) {
          keyboardState.isPinned = !keyboardState.isPinned;
          if (audioFeedback) {
            console.log(`Tooltip ${keyboardState.isPinned ? 'pinned' : 'unpinned'}`);
          }
        } else {
          hideTooltip();
        }
      } else {
        showTooltip();
      }
    }
    
    // Tab key to expand tooltip content for medical devices
    if (event.key === 'Tab' && expandable && expandedContent && isVisible.value && medicalDeviceMode) {
      event.preventDefault();
      keyboardState.isExpanded = !keyboardState.isExpanded;
      
      if (audioFeedback) {
        console.log(`Tooltip content ${keyboardState.isExpanded ? 'expanded' : 'collapsed'}`);
      }
    }
  });

  const getTooltipClasses = () => {
    const baseClasses = [
      "relative inline-block",
      "hover:scale-105 transition-transform duration-200 cursor-help",
      // Enhanced focus indicators for medical devices
      medicalDeviceMode && "focus:outline-none focus:ring-4 focus:ring-primary-500/70 focus:ring-offset-4",
      medicalDeviceMode && "focus:shadow-xl focus:border-primary-600",
      // Standard focus indicators for clinical environments  
      !medicalDeviceMode && "focus:outline-none focus:ring-4 focus:ring-primary-500/70 focus:ring-offset-2",
      !medicalDeviceMode && "focus:shadow-lg",
      className,
      classNameReact
    ];

    return baseClasses.filter(Boolean).join(" ");
  };

  const getContentClasses = () => {
    const baseClasses = [
      "absolute z-50 px-2 py-1 text-sm font-medium text-white transition-all duration-200",
      "whitespace-nowrap rounded-md shadow-lg",
      // Enhanced styling for medical devices
      medicalDeviceMode && keyboardState.isPinned && "ring-2 ring-warning-400 ring-offset-2",
      medicalDeviceMode && "pointer-events-auto cursor-default",
      !medicalDeviceMode && "pointer-events-none",
      // Expandable content styling
      expandable && keyboardState.isExpanded && "whitespace-normal max-w-md"
    ];

    // Variant classes (visual style)
    const variantClasses = {
      elevated: "bg-neutral-darker shadow-xl border border-neutral-darker",
      flat: "bg-neutral-darker",
      outlined: "bg-white border-2 border-neutral-light text-neutral-darker shadow-md",
      text: "bg-transparent text-neutral-darker"
    };

    // Color classes (semantic color)
    const colorClasses = {
      primary: variant === "outlined" ? "border-primary-500 text-primary-700" : "bg-primary-600",
      secondary: variant === "outlined" ? "border-secondary-500 text-secondary-700" : "bg-secondary-600", 
      success: variant === "outlined" ? "border-success-500 text-success-700" : "bg-success-600",
      warning: variant === "outlined" ? "border-warning-500 text-warning-700" : "bg-warning-600",
      error: variant === "outlined" ? "border-error-500 text-error-700" : "bg-error-600",
      info: variant === "outlined" ? "border-info-500 text-info-700" : "bg-info-600"
    };

    // Size classes
    const sizeClasses = {
      xs: "px-1.5 py-0.5 text-xs",
      sm: "px-2 py-1 text-sm",
      md: "px-3 py-1.5 text-sm",
      lg: "px-4 py-2 text-base",
      xl: "px-5 py-2.5 text-lg"
    };

    // Position classes
    const positionClasses = {
      top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
      bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2",
      left: "right-full top-1/2 transform -translate-y-1/2 mr-2",
      right: "left-full top-1/2 transform -translate-y-1/2 ml-2",
      "top-start": "bottom-full left-0 mb-2",
      "top-end": "bottom-full right-0 mb-2",
      "bottom-start": "top-full left-0 mt-2",
      "bottom-end": "top-full right-0 mt-2"
    };

    return [
      ...baseClasses,
      variantClasses[variant],
      colorClasses[color],
      sizeClasses[size],
      positionClasses[position]
    ].filter(Boolean).join(" ");
  };

  const getArrowClasses = () => {
    const baseClasses = ["absolute w-2 h-2 transform rotate-45"];
    
    // Arrow position based on tooltip position
    const arrowPositions = {
      top: "top-full left-1/2 transform -translate-x-1/2 -translate-y-1/2",
      bottom: "bottom-full left-1/2 transform -translate-x-1/2 translate-y-1/2", 
      left: "left-full top-1/2 transform -translate-y-1/2 -translate-x-1/2",
      right: "right-full top-1/2 transform -translate-y-1/2 translate-x-1/2",
      "top-start": "top-full left-4 transform -translate-y-1/2",
      "top-end": "top-full right-4 transform -translate-y-1/2",
      "bottom-start": "bottom-full left-4 transform translate-y-1/2",
      "bottom-end": "bottom-full right-4 transform translate-y-1/2"
    };

    // Arrow color based on variant and color
    const arrowColorClasses = {
      elevated: color === "primary" ? "bg-primary-600" : "bg-neutral-darker",
      flat: color === "primary" ? "bg-primary-600" : "bg-neutral-darker", 
      outlined: "bg-white border border-neutral-light",
      text: "bg-transparent"
    };

    return [
      ...baseClasses,
      arrowPositions[position],
      arrowColorClasses[variant]
    ].filter(Boolean).join(" ");
  };

  return (
    <div class="themed-content">
      <div 
        id={id}
        data-testid={testId || dataTestId}
        class={getTooltipClasses()}
        style={style}
        onMouseEnter$={showTooltip}
        onMouseLeave$={hideTooltip}
        onFocus$={showTooltip}
        onBlur$={hideTooltip}
        onKeyDown$={handleKeyDown$}
        tabIndex={0}
        role="button"
        aria-describedby={isVisible.value ? `tooltip-${id || 'default'}` : undefined}
        aria-label={`Show tooltip: ${content}`}
        {...props}
      >
        <div class="tooltip-trigger">
          <Slot />
        </div>
        {isVisible.value && !disabled && (
          <div 
            id={`tooltip-${id || 'default'}`}
            class={getContentClasses()}
            role="tooltip"
            aria-hidden="false"
            aria-label={ariaLabel || content}
            aria-describedby={ariaDescribedby}
            onMouseEnter$={medicalDeviceMode && persistOnHover ? undefined : undefined}
            onMouseLeave$={medicalDeviceMode && persistOnHover ? undefined : hideTooltip}
          >
            <div class="tooltip-content">
              <div class="tooltip-main">
                {content}
                {medicalDeviceMode && keyboardState.isPinned && (
                  <span class="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-warning-100 text-warning-800">
                    📌 Pinned
                  </span>
                )}
              </div>
              
              {/* Expanded content for medical devices */}
              {expandable && expandedContent && keyboardState.isExpanded && (
                <div class="tooltip-expanded mt-2 pt-2 border-t border-white/20 text-xs">
                  {expandedContent}
                </div>
              )}
              
              {/* Medical device controls help */}
              {medicalDeviceMode && isVisible.value && (
                <div class="tooltip-controls mt-2 pt-2 border-t border-white/20 text-xs opacity-75">
                  <div class="flex flex-wrap gap-2">
                    <span><kbd class="px-1 bg-black/20 rounded">Enter</kbd> Pin</span>
                    {expandable && expandedContent && (
                      <span><kbd class="px-1 bg-black/20 rounded">Tab</kbd> Expand</span>
                    )}
                    <span><kbd class="px-1 bg-black/20 rounded">Esc</kbd> Close</span>
                  </div>
                  
                  {/* Context-specific shortcuts */}
                  {enableWorkflowShortcuts && (
                    <div class="mt-1 flex flex-wrap gap-2">
                      {tooltipContext === 'medication-info' && (
                        <span><kbd class="px-1 bg-black/20 rounded">Ctrl+M</kbd> Details</span>
                      )}
                      {tooltipContext === 'dosage-warning' && (
                        <span><kbd class="px-1 bg-black/20 rounded">Ctrl+D</kbd> Calculator</span>
                      )}
                      {tooltipContext === 'interaction-alert' && (
                        <span><kbd class="px-1 bg-black/20 rounded">Ctrl+I</kbd> Checker</span>
                      )}
                      {tooltipContext === 'procedure-step' && (
                        <span><kbd class="px-1 bg-black/20 rounded">Ctrl+P</kbd> Protocol</span>
                      )}
                      {tooltipContext === 'diagnostic-info' && (
                        <span><kbd class="px-1 bg-black/20 rounded">Ctrl+R</kbd> References</span>
                      )}
                      {tooltipContext === 'emergency-info' && (
                        <span><kbd class="px-1 bg-black/20 rounded">Ctrl+E</kbd> Emergency</span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div class={getArrowClasses()} />
          </div>
        )}
      </div>
    </div>
  );
});
