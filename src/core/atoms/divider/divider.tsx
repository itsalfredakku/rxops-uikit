import { component$ } from "@builder.io/qwik";
import type { BaseComponentProps } from "../../../design-system/props";
import { mergeClasses } from "../../../design-system/props";

export type DividerOrientation = "horizontal" | "vertical";
export type DividerVariant = "solid" | "dashed" | "dotted";

export interface DividerProps extends BaseComponentProps<HTMLDivElement> {
  orientation?: DividerOrientation;
  variant?: DividerVariant;
  spacing?: "none" | "sm" | "md" | "lg";
  label?: string;
}

export const Divider = component$<DividerProps>((props) => {
  const {
    orientation = "horizontal",
    variant = "solid",
    spacing = "md",
    label,
    class: qwikClass,
    className,
    style,
    testId,
    ...rest
  } = props;
  
  const dividerClasses = mergeClasses(
    "divider-base",
    `divider-${orientation}`,
    `divider-${variant}`,
    `divider-spacing-${spacing}`,
    label && "divider-with-label",
    qwikClass,
    className
  );

  if (label) {
    return (
      <div 
        class={dividerClasses} 
        style={style}
        data-testid={testId}
        {...rest}
      >
        <span class="divider-label">{label}</span>
      </div>
    );
  }

  return (
    <div 
      class={dividerClasses} 
      style={style}
      data-testid={testId}
      {...rest} 
    />
  );
});
