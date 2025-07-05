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

  return (
    <Column 
      ref={dropdownRef}
      class={dropdownClasses}
      style={style}
      {...rest}
    >
      {/* Trigger slot - will be replaced by actual trigger content */}
      <Column onClick$={trigger === "click" ? handleToggle : undefined}>
        <Slot name="trigger" />
      </Column>

      {/* Dropdown Menu */}
      {isOpen.value && (
        <Stack class={menuClasses}>
          {items.map((item) => (
            <Column key={item.id}>
              {item.divider && <Column class="border-t border-neutral-light my-1" />}
              <Button
                type="button"
                class={mergeClasses(
                  "flex items-center w-full px-4 py-2 text-sm text-neutral-darker hover:bg-neutral-lighter hover:text-neutral-darker cursor-pointer transition-colors duration-150",
                  item.disabled && "opacity-50 cursor-not-allowed hover:bg-transparent hover:text-neutral-darker",
                  item.divider && "border-t border-neutral-light mt-1 pt-1"
                )}
                onClick$={() => handleItemClick(item)}
                disabled={item.disabled}
                variant="text"
                size={size}
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
  );
});
