import { component$, useSignal, Slot, $ } from "@builder.io/qwik";
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

export interface TabsProps extends BaseComponentProps {
  items: TabItem[];
  defaultTab?: string;
  variant?: TabsVariant;
  size?: TabsSize;
  orientation?: TabsOrientation;
  fullWidth?: boolean;
  testId?: string;
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
    "bg-neutral-100 rounded-lg",
    "border border-neutral-200"
  ].join(" "),
  variants: {
    default: "bg-neutral-50 border-neutral-200",
    pills: "bg-neutral-100 rounded-full",
    underline: "bg-transparent border-0 border-b border-neutral-200 rounded-none",
    bordered: "bg-white border border-neutral-300 rounded-lg",
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
      "text-neutral-600 hover:text-neutral-900 hover:bg-white",
      "data-[active=true]:bg-white data-[active=true]:text-primary-600 data-[active=true]:shadow-sm"
    ].join(" "),
    pills: [
      "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200",
      "data-[active=true]:bg-primary-600 data-[active=true]:text-white data-[active=true]:shadow-md"
    ].join(" "),
    underline: [
      "text-neutral-600 hover:text-neutral-900 rounded-none px-4 py-3",
      "border-b-2 border-transparent hover:border-neutral-300",
      "data-[active=true]:text-primary-600 data-[active=true]:border-primary-600"
    ].join(" "),
    bordered: [
      "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50",
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

export const Tabs = component$<TabsProps>(({
  items,
  defaultTab,
  variant = "default",
  size = "md",
  orientation = "horizontal",
  fullWidth = false,
  class: qwikClass,
  className,
  style,
  testId,
  ...rest
}) => {
  const activeTab = useSignal(defaultTab || items[0]?.id || "");

  const handleTabClick = $((tabId: string) => {
    const tab = items.find(item => item.id === tabId);
    if (!tab?.disabled) {
      activeTab.value = tabId;
    }
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
  const _padding = variant === "underline" ? "0" : size === "sm" ? "1" : size === "lg" ? "6" : "4";

  return (
    <Stack 
      class={containerClass}
      style={style}
      data-testid={testId}
      gap="4"
      {...rest}
    >
      <TabListLayout class={tabListClass} role="tablist" gap={gap} alignItems="center">
        {items.map((item) => {
          const isActive = activeTab.value === item.id;
          
          const tabClass = tabTriggerVariants({
            [variant]: true,
            [size]: true,
            fullWidth
          });

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
              onClick$={() => handleTabClick(item.id)}
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
              </Row>
            </button>
          );
        })}
      </TabListLayout>
      
      <div class="tabs-content">
        <Slot />
      </div>
    </Stack>
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
  );
});
