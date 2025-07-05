import { component$, Slot } from "@builder.io/qwik";
import type { ComponentSize, Spacing } from "../../../design-system/types";
import { BaseComponentProps, mergeClasses } from "../../../design-system/props";

export type ContainerSize = ComponentSize | "full";

export interface ContainerProps extends Omit<BaseComponentProps<HTMLDivElement>, 'size'> {
  size?: ContainerSize;
  centered?: boolean;
  fluid?: boolean;
  padding?: Spacing;
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

const getContainerClasses = (size: ContainerSize, centered: boolean, fluid: boolean, padding: Spacing, className?: string) => {
  const currentSizeClasses = fluid ? "max-w-none" : sizeClasses[size];
  const centeredClasses = centered ? "mx-auto" : "";
  
  return mergeClasses(
    "w-full",
    currentSizeClasses,
    centeredClasses,
    paddingClasses[padding],
    className
  );
};

export const Container = component$<ContainerProps>((props) => {
  const {
    size = "lg",
    centered = true,
    fluid = false,
    padding = "4",
    class: qwikClass,
    className,
    style,
    ...rest
  } = props;

  const containerClasses = getContainerClasses(size, centered, fluid, padding, mergeClasses(qwikClass, className));

  return (
    <div class={containerClasses} style={style} {...rest}>
      <Slot />
    </div>
  );
});
