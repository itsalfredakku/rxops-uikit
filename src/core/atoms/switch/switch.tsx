import { component$, useSignal, $ } from "@builder.io/qwik";
import type { ComponentSize } from "../../../design-system/types";
import { BaseComponentProps, mergeClasses } from "../../../design-system/props";

interface SwitchBaseProps {
  label?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  size?: ComponentSize;
  description?: string;
  required?: boolean;
  name?: string;
  id?: string;
  testId?: string;
  onValueChange$?: (checked: boolean) => void;
}

export interface SwitchProps extends SwitchBaseProps, Omit<BaseComponentProps<HTMLDivElement>, keyof SwitchBaseProps | `on${string}$`> {}

const switchSizeClasses: Record<ComponentSize, {
  track: string;
  thumb: string;
  translate: (checked: boolean) => string;
  text: string;
  description: string;
}> = {
  xs: {
    track: "h-4 w-8",
    thumb: "h-2 w-2 mt-1",
    translate: (checked: boolean) => checked ? "translate-x-4" : "translate-x-1",
    text: "text-xs",
    description: "text-xs"
  },
  sm: {
    track: "h-5 w-9",
    thumb: "h-3 w-3 mt-1",
    translate: (checked: boolean) => checked ? "translate-x-5" : "translate-x-1",
    text: "text-sm",
    description: "text-xs"
  },
  md: {
    track: "h-6 w-11",
    thumb: "h-4 w-4 mt-1",
    translate: (checked: boolean) => checked ? "translate-x-6" : "translate-x-1",
    text: "text-base",
    description: "text-sm"
  },
  lg: {
    track: "h-7 w-13",
    thumb: "h-5 w-5 mt-1",
    translate: (checked: boolean) => checked ? "translate-x-7" : "translate-x-1",
    text: "text-lg",
    description: "text-base"
  },
  xl: {
    track: "h-8 w-15",
    thumb: "h-6 w-6 mt-1",
    translate: (checked: boolean) => checked ? "translate-x-8" : "translate-x-1",
    text: "text-xl",
    description: "text-lg"
  }
};

export const Switch = component$<SwitchProps>((props) => {
  const {
    label,
    checked,
    defaultChecked = false,
    disabled = false,
    size = "md",
    description,
    required = false,
    name,
    id,
    class: qwikClass,
    className,
    style,
    testId,
    onValueChange$,
    ...rest
  } = props;
  const internalChecked = useSignal(checked ?? defaultChecked);
  const switchId = id || `switch-${Math.random().toString(36).substr(2, 9)}`;
  const sizeClasses = switchSizeClasses[size];

  const handleToggle = $(() => {
    if (!disabled) {
      const newValue = !internalChecked.value;
      internalChecked.value = newValue;
      onValueChange$?.(newValue);
    }
  });

  const wrapperClasses = mergeClasses(
    "flex items-start gap-3",
    qwikClass,
    className
  );

  return (
    <div 
      class={wrapperClasses} 
      style={style}
      data-testid={testId} 
      {...rest}
    >
      <label 
        for={switchId} 
        class={`flex items-center gap-3 cursor-pointer ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
      >
        <input
          type="checkbox"
          id={switchId}
          name={name}
          checked={internalChecked.value}
          disabled={disabled}
          required={required}
          onChange$={handleToggle}
          class="sr-only"
          aria-describedby={description ? `${switchId}-desc` : undefined}
        />
        
        <span 
          class={`
            relative inline-flex ${sizeClasses.track} cursor-pointer rounded-full 
            transition-all duration-200 ease-in-out
            focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2
            hover:shadow-md hover:scale-105
            ${disabled ? "cursor-not-allowed opacity-50 hover:shadow-none hover:scale-100" : ""}
            ${internalChecked.value ? "bg-primary-dark hover:bg-primary-darker" : "bg-neutral-light hover:bg-neutral-normal"}
          `}
        >
          <span 
            class={`
              inline-block ${sizeClasses.thumb} transform rounded-full bg-white shadow 
              transition-all duration-200 ease-in-out hover:shadow-lg
              ${sizeClasses.translate(internalChecked.value)}
            `}
          />
        </span>
        
        {label && (
          <span class={`font-medium text-neutral-darker ${disabled ? "text-neutral" : ""} ${sizeClasses.text}`}>
            {label}
            {required && <span class="text-error ml-1">*</span>}
          </span>
        )}
      </label>
      
      {description && (
        <p 
          id={`${switchId}-desc`} 
          class={`text-neutral-dark mt-1 ${sizeClasses.description}`}
        >
          {description}
        </p>
      )}
    </div>
  );
});
