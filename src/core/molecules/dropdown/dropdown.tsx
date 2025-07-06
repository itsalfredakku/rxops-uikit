import { component$, useSignal, useTask$, $, type QRL, Slot } from "@builder.io/qwik";
import { BaseComponentProps, mergeClasses } from "../../../design-system/props";
import { Button } from "../../atoms/button/button";
import { Icon, type IconName } from "../../atoms/icon";
import { Row } from "../../../layouts/row";
import { Column } from "../../../layouts/column";
import { Stack } from "../../../layouts/stack";

export type DropdownPlacement = "bottom-start" | "bottom-end" | "top-start" | "top-end" | "right-start" | "left-start";
export type DropdownSize = "sm" | "md" | "lg";

export interface DropdownItem {
  id: string;
  label: string;
  icon?: IconName;
  disabled?: boolean;
  divider?: boolean;
  onClick$?: QRL<() => void>;
}

export interface DropdownProps extends BaseComponentProps<HTMLDivElement> {
  items?: DropdownItem[];
  placement?: DropdownPlacement;
  size?: DropdownSize;
  disabled?: boolean;
  trigger?: "click" | "hover";
  onItemSelected?: QRL<(item: DropdownItem) => void>;
}

const getPlacementClasses = (placement: DropdownPlacement) => {
  const classes = {
    "bottom-start": "top-full left-0 mt-1",
    "bottom-end": "top-full right-0 mt-1", 
    "top-start": "bottom-full left-0 mb-1",
    "top-end": "bottom-full right-0 mb-1",
    "right-start": "left-full top-0 ml-1",
    "left-start": "right-full top-0 mr-1"
  };
  return classes[placement];
};

const getSizeClasses = (size: DropdownSize) => {
  const classes = {
    sm: "min-w-32",
    md: "min-w-48", 
    lg: "min-w-64"
  };
  return classes[size];
};

export const Dropdown = component$<DropdownProps>((props) => {
  const {
    items = [],
    placement = "bottom-start", 
    size = "md",
    disabled = false,
    trigger = "click",
    onItemSelected,
    class: qwikClass,
    className,
    style,
    ...rest
  } = props;
  
  const isOpen = useSignal(false);
  const dropdownRef = useSignal<HTMLDivElement>();

  const handleToggle = $(() => {
    if (!disabled) {
      isOpen.value = !isOpen.value;
    }
  });

  const handleItemClick = $((item: DropdownItem) => {
    if (!item.disabled) {
      item.onClick$ && item.onClick$();
      onItemSelected && onItemSelected(item);
      isOpen.value = false;
    }
  });

  const handleClickOutside = $((event: Event) => {
    if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
      isOpen.value = false;
    }
  });

  useTask$(({ cleanup }) => {
    if (typeof document !== 'undefined') {
      document.addEventListener('click', handleClickOutside);
      cleanup(() => document.removeEventListener('click', handleClickOutside));
    }
  });

  const dropdownClasses = mergeClasses(
    "relative inline-block",
    disabled && "opacity-50 cursor-not-allowed",
    qwikClass,
    className
  );

  const menuClasses = mergeClasses(
    "absolute z-50 bg-white border border-neutral-light rounded-md shadow-lg py-1 focus:outline-none",
    getPlacementClasses(placement),
    getSizeClasses(size)
  );

  // Enhanced keyboard event handler for medical device dropdown accessibility
  const handleKeyDown$ = $((event: KeyboardEvent) => {
    if (!disabled) {
      switch (event.key) {
        case 'Enter':
        case ' ':
          event.preventDefault();
          handleToggle();
          break;
          
        case 'Escape':
          event.preventDefault();
          if (isOpen.value) {
            isOpen.value = false;
          }
          (event.target as HTMLElement).blur();
          break;
          
        case 'ArrowDown':
          event.preventDefault();
          if (!isOpen.value) {
            handleToggle();
          } else {
            // Focus first menu item
            setTimeout(() => {
              const firstItem = dropdownRef.value?.querySelector('button[role="menuitem"]') as HTMLElement;
              if (firstItem) firstItem.focus();
            }, 0);
          }
          break;
          
        case 'ArrowUp':
          event.preventDefault();
          if (!isOpen.value) {
            handleToggle();
          } else {
            // Focus last menu item
            setTimeout(() => {
              const items = dropdownRef.value?.querySelectorAll('button[role="menuitem"]');
              const lastItem = items?.[items.length - 1] as HTMLElement;
              if (lastItem) lastItem.focus();
            }, 0);
          }
          break;
      }
    }
  });

  // Menu item keyboard navigation
  const handleMenuKeyDown$ = $((event: KeyboardEvent) => {
    const items = Array.from(dropdownRef.value?.querySelectorAll('button[role="menuitem"]:not([disabled])') || []);
    const currentIndex = items.indexOf(event.target as HTMLElement);
    
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        const nextIndex = (currentIndex + 1) % items.length;
        (items[nextIndex] as HTMLElement)?.focus();
        break;
        
      case 'ArrowUp':
        event.preventDefault();
        const prevIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
        (items[prevIndex] as HTMLElement)?.focus();
        break;
        
      case 'Home':
        event.preventDefault();
        (items[0] as HTMLElement)?.focus();
        break;
        
      case 'End':
        event.preventDefault();
        (items[items.length - 1] as HTMLElement)?.focus();
        break;
        
      case 'Escape':
        event.preventDefault();
        isOpen.value = false;
        // Focus trigger
        const trigger = dropdownRef.value?.querySelector('[tabindex="0"]') as HTMLElement;
        if (trigger) trigger.focus();
        break;
    }
  });

  return (
    <div class="themed-content">
      <Column 
        ref={dropdownRef}
        class={dropdownClasses}
        style={style}
        onKeyDown$={handleKeyDown$}
        {...rest}
      >
      {/* Trigger slot - will be replaced by actual trigger content */}
      <Column 
        onClick$={trigger === "click" ? handleToggle : undefined}
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-haspopup="menu"
        aria-expanded={isOpen.value}
        aria-label="Open dropdown menu"
      >
        <Slot name="trigger" />
      </Column>

      {/* Dropdown Menu */}
      {isOpen.value && (
        <Stack 
          class={menuClasses}
          role="menu"
          aria-orientation="vertical"
          onKeyDown$={handleMenuKeyDown$}
        >
          {items.map((item) => (
            <Column key={item.id}>
              {item.divider && <Column class="border-t border-neutral-light my-1" />}
              <Button
                type="button"
                class={mergeClasses(
                  "flex items-center w-full px-4 py-2 text-sm text-neutral-darker hover:bg-neutral-lighter hover:text-neutral-darker cursor-pointer transition-colors duration-150",
                  "focus:ring-4 focus:ring-primary-500/70 focus:ring-offset-2 focus:bg-neutral-lighter",
                  item.disabled && "opacity-50 cursor-not-allowed hover:bg-transparent hover:text-neutral-darker",
                  item.divider && "border-t border-neutral-light mt-1 pt-1"
                )}
                onClick$={() => handleItemClick(item)}
                disabled={item.disabled}
                variant="text"
                size={size}
                role="menuitem"
                tabIndex={-1}
              >
                <Row alignItems="center" gap="3">
                  {item.icon && (
                    <Icon icon={item.icon} class="text-neutral" />
                  )}
                  {item.label}
                </Row>
              </Button>
            </Column>
          ))}
        </Stack>
      )}
      </Column>
    </div>
  );
});
