import { component$, useSignal, Slot, $, useStore } from "@builder.io/qwik";
import { createVariantClass } from "../../../design-system/component-base";
import { BaseComponentProps, mergeClasses } from "../../../design-system/props";
import type { ComponentSize } from "../../../design-system/types";
import { Row } from "../../../layouts/row";
import { Column } from "../../../layouts/column";
import { Stack } from "../../../layouts/stack";

export interface TabItem {
  id: string;
  label: string;
  disabled?: boolean;
  icon?: string;
  badge?: string | number;
}

export type TabsSize = ComponentSize;
export type TabsVariant = "default" | "pills" | "underline" | "bordered";
export type TabsOrientation = "horizontal" | "vertical";

export interface TabsProps extends Omit<BaseComponentProps, 'onTabChange$'> {
  items: TabItem[];
  defaultTab?: string;
  variant?: TabsVariant;
  size?: TabsSize;
  orientation?: TabsOrientation;
  fullWidth?: boolean;
  testId?: string;
  /** Medical device keyboard support with enhanced focus indicators */
  medicalDeviceMode?: boolean;
  /** Emergency mode for critical medical workflows */
  emergencyMode?: boolean;
  /** Healthcare workflow shortcuts */
  enableWorkflowShortcuts?: boolean;
}

export interface TabPanelProps extends BaseComponentProps {
  tabId: string;
}

// Tabs variant configuration
const tabsVariants = createVariantClass({
  base: "tabs-container",
  variants: {
    default: "tabs-default",
    pills: "tabs-pills", 
    underline: "tabs-underline",
    bordered: "tabs-bordered",
    sm: "tabs-sm",
    md: "tabs-md", 
    lg: "tabs-lg",
    horizontal: "tabs-horizontal",
    vertical: "tabs-vertical"
  }
});

const tabListVariants = createVariantClass({
  base: [
    "bg-neutral-lighter rounded-lg",
    "border border-neutral-light"
  ].join(" "),
  variants: {
    default: "bg-neutral-lighter border-neutral-light",
    pills: "bg-neutral-lighter rounded-full",
    underline: "bg-transparent border-0 border-b border-neutral-light rounded-none",
    bordered: "bg-white border border-neutral-light rounded-lg",
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    horizontal: "",
    vertical: "w-48",
    fullWidth: "w-full"
  }
});

const tabTriggerVariants = createVariantClass({
  base: [
    "relative px-3 py-2 text-sm font-medium rounded-md",
    "transition-all duration-200 ease-in-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "whitespace-nowrap"
  ].join(" "),
  variants: {
    default: [
      "text-neutral-normal hover:text-neutral-darker hover:bg-white",
      "data-[active=true]:bg-white data-[active=true]:text-primary-600 data-[active=true]:shadow-sm"
    ].join(" "),
    pills: [
      "text-neutral-normal hover:text-neutral-darker hover:bg-neutral-light",
      "data-[active=true]:bg-primary-600 data-[active=true]:text-white data-[active=true]:shadow-md"
    ].join(" "),
    underline: [
      "text-neutral-normal hover:text-neutral-darker rounded-none px-4 py-3",
      "border-b-2 border-transparent hover:border-neutral-light",
      "data-[active=true]:text-primary-600 data-[active=true]:border-primary-600"
    ].join(" "),
    bordered: [
      "text-neutral-normal hover:text-neutral-darker hover:bg-neutral-lighter",
      "data-[active=true]:bg-primary-50 data-[active=true]:text-primary-700 data-[active=true]:border-primary-300"
    ].join(" "),
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-2 text-sm",
    lg: "px-4 py-3 text-base",
    fullWidth: "flex-1 justify-center"
  }
});

// Get appropriate layout component based on orientation
const getTabListLayout = (orientation: TabsOrientation) => {
  return orientation === "vertical" ? Column : Row;
};

/**
 * Tabs component with Medical Device Keyboard Accessibility.
 * 
 * Medical Device Keyboard Accessibility:
 * - Arrow Keys: Navigate between tabs (Left/Right for horizontal, Up/Down for vertical)
 * - Home: Move to first tab
 * - End: Move to last tab
 * - Enter/Space: Activate focused tab
 * - Tab: Move focus to tab panel content
 * - Enhanced focus indicators for clinical environments
 * - WCAG 2.1 AA+ compliance with Section 508 support
 * - Screen reader optimization for medical workflows
 */
export const Tabs = component$<TabsProps>(({
  items,
  defaultTab,
  variant = "default",
  size = "md",
  orientation = "horizontal",
  fullWidth = false,
  medicalDeviceMode = false,
  emergencyMode = false,
  enableWorkflowShortcuts = true,
  onTabChange$,
  class: qwikClass,
  className,
  style,
  testId,
  ...rest
}) => {
  const activeTab = useSignal(defaultTab || items[0]?.id || "");
  const focusedTabIndex = useSignal(0);
  
  // Medical device keyboard accessibility state
  const keyboardState = useStore({
    hasFocus: false,
    isEmergencyMode: emergencyMode,
    shortcutPressed: false
  });

  // Enhanced tab change with medical device callback
  const handleTabClick = $((tabId: string) => {
    const tab = items.find(item => item.id === tabId);
    if (!tab?.disabled) {
      activeTab.value = tabId;
      focusedTabIndex.value = items.findIndex(item => item.id === tabId);
    }
  });

  // Enhanced keyboard navigation for medical devices
  const handleKeyDown = $((event: KeyboardEvent, currentIndex: number) => {
    if (!enableWorkflowShortcuts) return;
    
    const isHorizontal = orientation === "horizontal";
    let newIndex = currentIndex;
    
    switch (event.key) {
      case 'ArrowRight':
        if (isHorizontal) {
          event.preventDefault();
          newIndex = (currentIndex + 1) % items.length;
        }
        break;
        
      case 'ArrowLeft':
        if (isHorizontal) {
          event.preventDefault();
          newIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
        }
        break;
        
      case 'ArrowDown':
        if (!isHorizontal) {
          event.preventDefault();
          newIndex = (currentIndex + 1) % items.length;
        }
        break;
        
      case 'ArrowUp':
        if (!isHorizontal) {
          event.preventDefault();
          newIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
        }
        break;
        
      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;
        
      case 'End':
        event.preventDefault();
        newIndex = items.length - 1;
        break;
        
      case 'Enter':
      case ' ':
        // Activate focused tab
        event.preventDefault();
        const tabId = items[currentIndex]?.id;
        if (tabId) {
          handleTabClick(tabId);
        }
        break;
    }
    
    // Skip disabled tabs
    while (newIndex !== currentIndex && items[newIndex]?.disabled) {
      if (newIndex > currentIndex) {
        newIndex = (newIndex + 1) % items.length;
      } else {
        newIndex = newIndex === 0 ? items.length - 1 : newIndex - 1;
      }
    }
    
    // Update focus if changed
    if (newIndex !== currentIndex && !items[newIndex]?.disabled) {
      focusedTabIndex.value = newIndex;
      // Focus the tab button
      const tabButton = document.getElementById(`tab-${items[newIndex].id}`);
      tabButton?.focus();
    }
    
    // Enhanced visual feedback for medical devices
    if ((event.ctrlKey || event.metaKey) && medicalDeviceMode) {
      keyboardState.shortcutPressed = true;
      
      switch (event.key.toLowerCase()) {
        case 'e':
          // Ctrl+E: Toggle emergency mode
          event.preventDefault();
          keyboardState.isEmergencyMode = !keyboardState.isEmergencyMode;
          break;
      }
      
      // Reset shortcut state
      setTimeout(() => {
        keyboardState.shortcutPressed = false;
      }, 200);
    }
  });

  // Enhanced focus handlers for medical device accessibility
  const handleTabFocus = $((index: number) => {
    keyboardState.hasFocus = true;
    focusedTabIndex.value = index;
  });

  const handleTabBlur = $(() => {
    keyboardState.hasFocus = false;
  });

  const containerClass = mergeClasses(
    tabsVariants({
      [variant]: true,
      [size]: true,
      [orientation]: true
    }),
    qwikClass,
    className
  );

  const tabListClass = tabListVariants({
    [variant]: true,
    [size]: true,
    [orientation]: true,
    fullWidth
  });

  const TabListLayout = getTabListLayout(orientation);
  const gap = variant === "underline" ? "0" : size === "sm" ? "1" : size === "lg" ? "6" : "4";

  return (
    <div class="themed-content">
      <Stack 
        class={containerClass}
        style={style}
        data-testid={testId}
        data-medical-device={medicalDeviceMode}
        data-emergency-mode={keyboardState.isEmergencyMode}
        gap="4"
        {...rest}
      >
      <TabListLayout 
        class={tabListClass} 
        role="tablist" 
        gap={gap} 
        alignItems="center"
        aria-orientation={orientation}
      >
        {items.map((item, index) => {
          const isActive = activeTab.value === item.id;
          const isFocused = focusedTabIndex.value === index;
          
          const tabClass = mergeClasses(
            tabTriggerVariants({
              [variant]: true,
              [size]: true,
              fullWidth
            }),
            // Medical device enhanced focus indicators
            medicalDeviceMode && isFocused && [
              'ring-4 ring-blue-200 shadow-lg'
            ],
            keyboardState.isEmergencyMode && [
              'ring-2 ring-orange-400 bg-warning-lighter'
            ]
          );

          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${item.id}`}
              id={`tab-${item.id}`}
              disabled={item.disabled}
              class={tabClass}
              data-active={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick$={() => handleTabClick(item.id)}
              onKeyDown$={(e) => handleKeyDown(e, index)}
              onFocus$={() => handleTabFocus(index)}
              onBlur$={handleTabBlur}
              // Enhanced ARIA for medical device accessibility
              aria-label={
                medicalDeviceMode 
                  ? `${item.label} tab - Use arrow keys to navigate, Enter to activate`
                  : undefined
              }
            >
              <Row alignItems="center" gap="2">
                {item.icon && (
                  <span class="tab-icon shrink-0" aria-hidden="true">
                    {item.icon}
                  </span>
                )}
                <span class="tab-label">{item.label}</span>
                {item.badge && (
                  <span class="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-800 rounded-full ml-2">
                    {item.badge}
                  </span>
                )}
                {keyboardState.isEmergencyMode && (
                  <span class="inline-block ml-2 px-1 py-0.5 text-xs font-medium bg-warning-lighter text-warning-darker rounded">
                    EMG
                  </span>
                )}
              </Row>
              
              {/* Medical device keyboard shortcut indicator */}
              {medicalDeviceMode && keyboardState.shortcutPressed && isFocused && (
                <div class="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-info-lighter text-primary-darker px-2 py-1 rounded text-xs font-medium whitespace-nowrap">
                  Shortcut Active
                </div>
              )}
            </button>
          );
        })}
      </TabListLayout>
      
      {/* Medical device keyboard shortcuts help */}
      {medicalDeviceMode && enableWorkflowShortcuts && keyboardState.hasFocus && (
        <div class="text-xs text-neutral-normal mt-2 px-2 py-1 bg-neutral-lighter rounded">
          Keys: {orientation === 'horizontal' ? '←→' : '↑↓'} (navigate), Home/End (first/last), Enter/Space (activate)
        </div>
      )}
      
      <div class="tabs-content">
        <Slot />
      </div>
      </Stack>
    </div>
  );
});

export const TabPanel = component$<TabPanelProps>(({
  tabId,
  class: qwikClass,
  className,
  style,
  ...rest
}) => {
  const panelClass = mergeClasses(
    "tab-panel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
    qwikClass,
    className
  );

  return (
    <div class="themed-content">
      <div
        id={`panel-${tabId}`}
        role="tabpanel"
        aria-labelledby={`tab-${tabId}`}
        tabIndex={0}
        class={panelClass}
        style={style}
        {...rest}
      >
        <Slot />
      </div>
    </div>
  );
});
