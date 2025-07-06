import { component$, type QRL } from "@builder.io/qwik";
import { BaseComponentProps, mergeClasses } from "../../../design-system/props";
import { Button } from "../../atoms/button/button";
import { Dropdown, type DropdownItem } from "../dropdown/dropdown";
import { Row } from "../../../layouts/row";

export interface SplitButtonProps extends Omit<BaseComponentProps<HTMLDivElement>, `on${string}$`> {
  label: string;
  variant?: "elevated" | "flat" | "outlined" | "text";
  color?: "primary" | "secondary" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  items?: DropdownItem[];
  onClick$?: QRL<() => void>;
  onItemClick$?: QRL<(item: DropdownItem) => void>;
}

export const SplitButton = component$<SplitButtonProps>(({
  label,
  variant = "elevated",
  color = "primary",
  size = "md",
  disabled = false,
  loading = false,
  items = [],
  onClick$,
  onItemClick$,
  class: qwikClass,
  className,
  style,
  ...rest
}) => {
  
  const buttonClass = mergeClasses(
    "rounded-r-none border-r-0"
  );

  const dropdownButtonClass = [
    "rounded-l-none px-2",
    // Let Button component handle the styling via variant + color
  ].filter(Boolean).join(" ");

  return (
    <div class="themed-content">
      <Row 
        class={mergeClasses(qwikClass, className)}
        style={style}
        {...rest}
      >
      {/* Main Button */}
      <Button
        variant={variant}
        color={color}
        size={size}
        disabled={disabled}
        loading={loading}
        onClick$={onClick$}
        class={buttonClass}
      >
        {label}
      </Button>

      {/* Dropdown Button */}
      <Dropdown
        items={items}
        placement="bottom-end"
        onItemSelected={onItemClick$}
        disabled={disabled}
      >
        <Button
          q:slot="trigger"
          variant={variant}
          size={size}
          disabled={disabled}
          class={dropdownButtonClass}
        >
          {/* Chevron Down Icon */}
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </Button>
      </Dropdown>
      </Row>
    </div>
  );
});
